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
- 🤖 A **floating smart assistant** — step-aware guidance at every stage of the mission
- 🚩 **CTF-style flag capture** — complete all steps to reveal the flag

---

## 🎮 Lab 01 — El-Taqassi (التقصي)
**Passive Reconnaissance & Google Dorking**

Students take on the role of a penetration tester performing OSINT on a fictional company: **EvilCorp**.

| Step | Tool | Objective |
|------|------|-----------|
| 1 | 💻 Terminal | `whoami` — Identify user & privileges |
| 2 | 💻 Terminal | `whois evilcorp.com` — Domain ownership |
| 3 | 💻 Terminal | `nslookup evilcorp.com` — DNS resolution |
| 4 | 💻 Terminal | `curl -I evilcorp.com` — HTTP header fingerprinting |
| 5 | 🔎 LinkedIn | **El-Stalker** — Find the IT Manager's pet name from social media posts |
| 6 | 🔍 Zoogle | Broad search trap — why generic queries fail |
| 7 | 🔍 Zoogle | `site:evilcorp.com` — Site operator narrowing |
| 8 | 🔍 Zoogle | `site:evilcorp.com inurl:admin` — Combined Google Dork |
| 9 | 🔍 Zoogle | Click the target link → capture the `FLAG{...}` |

---

## 🏗️ Project Architecture

```
Cyber-Masry/
├── frontend/                    # React + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── TerminalSimulator.tsx   # Linux terminal with 12+ commands
│       │   ├── ZoogleSearch.tsx        # Google Dork simulator
│       │   ├── FakeLinkedIn.tsx        # OSINT social media challenge
│       │   ├── FloatingAssistant.tsx   # Step-aware guidance bot
│       │   ├── TermTooltip.tsx         # Glossary popup component
│       │   ├── SuccessModal.tsx        # Flag capture celebration
│       │   ├── MatrixBackground.tsx    # Animated canvas effect
│       │   └── Header / Footer
│       ├── hooks/
│       │   └── useMissionProgress.ts   # 9-step mission state machine
│       ├── data/
│       │   └── glossary.ts             # 22 technical terms with Arabic analogies
│       ├── utils/
│       │   └── parseWithGlossary.tsx   # Inline term highlighter
│       └── pages/
│           ├── LandingPage.tsx
│           └── Lab01.tsx               # 3-tab lab layout
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

---

## 🛠️ Terminal Commands Available

Students can run these in the lab terminal (all simulated, no real network calls):

| Command | Description |
|---------|-------------|
| `whoami` | Current user + privilege level |
| `whois evilcorp.com` | Domain ownership & registrar data |
| `nslookup evilcorp.com` | DNS A/MX/NS records |
| `dig evilcorp.com` | Detailed DNS query breakdown |
| `curl -I evilcorp.com` | HTTP response headers |
| `traceroute evilcorp.com` | Network hop tracing |
| `netstat -an` | Active connections |
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
