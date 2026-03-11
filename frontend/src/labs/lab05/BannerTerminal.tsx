/**
 * BannerTerminal — Lab 05 Banner Grabbing & CVE simulator
 * netcat, telnet, curl, WhatWeb, Nikto, searchsploit
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb } from 'lucide-react'

interface CommandOutput {
    lines: string[]
    tipEn?: string
    tipAr?: string
    isError?: boolean
}

interface HistoryEntry {
    input: string
    output: CommandOutput | null
    showTip: boolean
}

interface Props {
    currentStepId?: number | null
    onCommandRun?: (cmd: string) => void
}

const HOSTNAME = 'student@cybermasry'
const CWD = '~/banner-lab'
const PROMPT = `${HOSTNAME}:${CWD}$`
const TARGET = '192.168.1.5'

const ALL_COMMANDS = ['help', 'nc', 'netcat', 'curl', 'telnet', 'searchsploit', 'whatweb', 'nikto', 'clear', 'history']

const STEP_HINTS: Record<number, string> = {
    1: `nc ${TARGET} 80`,
    2: `nc ${TARGET} 22`,
    3: `nc ${TARGET} 21`,
    4: `curl -I http://${TARGET}`,
    5: `telnet ${TARGET} 23`,
    6: `searchsploit apache 2.4.38`,
    7: `searchsploit openssh 7.9`,
    8: `nc ${TARGET} 25`,
    9: `whatweb http://${TARGET}`,
    10: `nikto -h http://${TARGET}`,
}

const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: [
            '╔═══════════════════════════════════════════════════════╗',
            '║  Cyber-Masry Banner Grabbing Lab  –  Help Menu        ║',
            '║   [SIMULATED ENVIRONMENT · EDUCATIONAL USE ONLY]      ║',
            '╚═══════════════════════════════════════════════════════╝',
            '',
            '  Command                          Description',
            '  ──────────────────────────────────────────────────────',
            `  nc <ip> <port>                   Netcat banner grab`,
            `  curl -I http://<ip>              HTTP header inspection`,
            `  telnet <ip> <port>               Telnet banner grab`,
            `  searchsploit <service> <version> Search exploit database`,
            `  whatweb http://<ip>              Web technology fingerprint`,
            `  nikto -h http://<ip>             Full web vulnerability scan`,
            '',
            `  📋 Target: ${TARGET}`,
        ],
    }),

    nc: (args) => {
        const ip = args[0]
        const port = parseInt(args[1])
        if (!ip || isNaN(port)) return { lines: ['Usage: nc <ip> <port>'], isError: true }

        // Port 80 — HTTP
        if (port === 80) {
            return {
                lines: [
                    `Connecting to ${ip}:80...`,
                    ``,
                    `HTTP/1.1 200 OK`,
                    `Date: Thu, 19 Feb 2026 17:09:00 GMT`,
                    `Server: Apache/2.4.38 (Debian)`,
                    `X-Powered-By: PHP/7.4.3`,
                    `Last-Modified: Mon, 01 Jan 2024 00:00:00 GMT`,
                    `Content-Type: text/html; charset=UTF-8`,
                    `X-Frame-Options: SAMEORIGIN`,
                    ``,
                    `[+] Banner captured!`,
                    `[!] Apache/2.4.38 — CVE-2019-0211 (CVSS 7.8) — Local privilege escalation`,
                    `[!] PHP/7.4.3 — EOL since Nov 2022, no more security patches`,
                    `[!] Server header leaks software + version — should be hidden`,
                ],
                tipEn: "The HTTP Server header reveals exact software and version. Apache 2.4.38 has CVE-2019-0211, a local privilege escalation where a CGI script can escalate from www-data to root. PHP 7.4.3 reached End-of-Life in November 2022 — any vulnerability discovered after that date is unpatched forever.",
                tipAr: 'HTTP Server header بيكشف Apache/2.4.38 — ده معلومة تكفي تلاقي CVEs مباشرة! الـ Server header المفروض يتشال أو يتغير في الـ production 🕵️',
            }
        }

        // Port 22 — SSH
        if (port === 22) {
            return {
                lines: [
                    `Connecting to ${ip}:22...`,
                    ``,
                    `SSH-2.0-OpenSSH_7.9p1 Debian-10+deb10u2`,
                    ``,
                    `[+] SSH banner captured!`,
                    `[+] Version: OpenSSH 7.9p1`,
                    `[+] OS fingerprint: Debian 10 (Buster)`,
                    ``,
                    `[!] OpenSSH 7.9 — multiple CVEs:`,
                    `[!] CVE-2018-15473 (CVSS 5.3): Username enumeration`,
                    `[!] CVE-2019-6111 (CVSS 5.9): scp path traversal`,
                    `[!] CVE-2023-38408: Remote code execution via ssh-agent (CVSS 9.8!)`,
                    ``,
                    `[*] Use: searchsploit openssh 7.9`,
                ],
                tipEn: "OpenSSH 7.9 leaks the Debian OS version through its banner. CVE-2018-15473 allows attackers to enumerate valid usernames even without credentials — a user query with invalid username returns 'Invalid user' while a valid username causes a timing difference. CVE-2023-38408 is a critical RCE in the ssh-agent component.",
                tipAr: 'SSH banner بيكشف OpenSSH version وحتى distro الـ Linux! CVE-2023-38408 CVSS 9.8 يعني critical RCE — لازم update فوراً 🔴',
            }
        }

        // Port 21 — FTP
        if (port === 21) {
            return {
                lines: [
                    `Connecting to ${ip}:21...`,
                    ``,
                    `220 (vsFTPd 3.0.3)`,
                    `331 Please specify the password.`,
                    ``,
                    `Testing anonymous login...`,
                    `> USER anonymous`,
                    `> PASS anonymous@`,
                    `230 Login successful.`,
                    `> LIST`,
                    `drwxr-xr-x    2 0    0    4096 Jan 01 2024 pub`,
                    `-rw-r--r--    1 0    0    1842 Jan 01 2024 backup.zip`,
                    `-rw-r--r--    1 0    0     512 Jan 01 2024 readme.txt`,
                    ``,
                    `[+] vsFTPd 3.0.3 banner captured`,
                    `[+] ANONYMOUS LOGIN ENABLED!`,
                    `[!] backup.zip in public FTP — possible source code leak`,
                    `[!] CVE-2011-2523: vsFTPd 2.3.4 backdoor (famous!). This is 3.0.3 so safe.`,
                ],
                tipEn: "vsFTPd 2.3.4 in 2011 had a backdoor inserted by a hacker — connecting with a username containing a smiley face :-) opened a root shell on port 6200. This is one of the most famous security incidents. Anonymous FTP is enabled here — the backup.zip could contain source code or database dumps.",
                tipAr: 'Anonymous FTP login = أي حد يقدر يدخل! vsFTPd 2.3.4 كانت باب خلفي شهير — المخترق حط backdoor في الـ source code اللي اتنزّل مليون مرة قبل ما يتاكشف 😱',
            }
        }

        // Port 25 — SMTP (step 8)
        if (port === 25) {
            return {
                lines: [
                    `Connecting to ${ip}:25...`,
                    ``,
                    `220 evilcorp.com ESMTP Postfix (Ubuntu)`,
                    `EHLO cybermasry`,
                    `250-evilcorp.com`,
                    `250-PIPELINING`,
                    `250 AUTH LOGIN PLAIN`,
                    ``,
                    `Testing VRFY command (user enumeration):`,
                    `VRFY admin`,
                    `252 2.0.0 admin`,
                    `VRFY omar.badran`,
                    `252 2.0.0 omar.badran`,
                    `VRFY nonexistent`,
                    `550 5.1.1 nonexistent: Recipient address rejected`,
                    ``,
                    `[+] Postfix banner captured!`,
                    `[!] VRFY command enabled — username enumeration possible!`,
                    `[!] Confirmed users: admin, omar.badran`,
                ],
                tipEn: "SMTP VRFY (verify) command checks if a user exists. When enabled, attackers can enumerate all valid email addresses on the server without credentials. These addresses can then be used for targeted phishing. Best practice: disable VRFY with 'disable_vrfy_command = yes' in Postfix, or return the same response for all usernames.",
                tipAr: 'SMTP VRFY بيأكدلك لو user موجود! ده بيفيد في جمع emails للـ phishing. الحل: تعطيل VRFY في إعدادات Postfix 📧',
            }
        }

        return {
            lines: [
                `Connecting to ${ip}:${port}...`,
                `Connection established.`,
                ``,
                `[*] No banner received on port ${port}`,
                `[*] Service may use SSL/TLS — try: openssl s_client -connect ${ip}:${port}`,
            ],
        }
    },

    netcat: (args) => COMMANDS.nc(args),

    curl: (args) => {
        const hasI = args.includes('-I') || args.includes('-i')
        if (!hasI) return { lines: ['Try: curl -I http://192.168.1.5  (headers only)'], isError: false }
        return {
            lines: [
                `HTTP/1.1 200 OK`,
                `Date: Thu, 19 Feb 2026 17:09:00 GMT`,
                `Server: Apache/2.4.38 (Debian)`,
                `X-Powered-By: PHP/7.4.3`,
                `Content-Type: text/html; charset=UTF-8`,
                `X-Frame-Options: SAMEORIGIN`,
                `X-Content-Type-Options: nosniff`,
                ``,
                `[+] HTTP headers captured`,
                `[!] Reveals: Apache/2.4.38, PHP/7.4.3, Debian`,
                `[!] Missing security headers: Content-Security-Policy, HSTS`,
                `[!] X-Powered-By should be removed (leaks PHP version)`,
            ],
            tipEn: "HTTP response headers often reveal too much. Server and X-Powered-By should be removed in production. Missing security headers like Content-Security-Policy (CSP) and Strict-Transport-Security (HSTS) leave the site vulnerable to XSS and protocol downgrade attacks. This is often scored as an 'Informational' finding in pentest reports — but the version leaks are Medium/High.",
            tipAr: 'X-Powered-By: PHP/7.4.3 مش المفروض يظهر! بيكشف version كاملة للـ PHP وده بيساعد في البحث عن vulnerabilities مباشرة 🔍',
        }
    },

    telnet: (args) => {
        const ip = args[0]
        const port = parseInt(args[1])
        if (port === 23) {
            return {
                lines: [
                    `Trying ${ip}...`,
                    `Connected to ${ip}.`,
                    `Escape character is '^]'.`,
                    ``,
                    `EvilCorp Internal System`,
                    `Telnet Server v1.0`,
                    ``,
                    `login: `,
                    ``,
                    `[!] TELNET IS RUNNING ON THIS SERVER!`,
                    `[!] Telnet transmits ALL data in plaintext — including passwords`,
                    `[!] Any Wireshark user on the network can capture your credentials`,
                    `[!] Replace Telnet with SSH immediately`,
                    `[!] CVSS: Running Telnet on production = automatic critical finding`,
                ],
                tipEn: "Telnet sends every keystroke as plaintext. In 1980 this was fine — no one was sniffing. In 2024, if someone runs Wireshark on the same network segment, they see your username and password in real-time. SSH (Secure SHell) was created in 1995 specifically to replace Telnet with encryption. Finding Telnet in a pentest is an automatic critical finding.",
                tipAr: 'Telnet بيبعت الـ password plaintext! أي حد على نفس الـ network ويشغل Wireshark شايف كل حاجة. SSH استبدله من 1995 — مفيش excuse لـ Telnet في 2026 🚨',
            }
        }
        return {
            lines: [
                `Trying ${ip}:${port ?? 23}...`,
                `telnet: Unable to connect to remote host: Connection refused`,
                `[*] Port ${port ?? 23} is closed — good!`,
            ],
        }
    },

    searchsploit: (args) => {
        const query = args.join(' ').toLowerCase()

        if (query.includes('apache') && (query.includes('2.4') || query.includes('2.4.38'))) {
            return {
                lines: [
                    `Exploit Database — searchsploit results for: Apache 2.4.x`,
                    ``,
                    `───────────────────────────────────────────────────────────────────`,
                    `  Title                                          | Path`,
                    `───────────────────────────────────────────────────────────────────`,
                    `  Apache 2.4.17 < 2.4.38 - HTTP/2 DoS           | linux/dos/46521.py`,
                    `  Apache 2.4.x - mod_rewrite Open Redirect       | multiple/webapps/47689.txt`,
                    `  Apache 2.4.38 - 'local' privilege escalation   | linux/local/51193.sh`,
                    `  (CVE-2019-0211)`,
                    `  Apache 2.4.29/2.4.38 - Mod_auth_digest bypass  | multiple/remote/47898.txt`,
                    `───────────────────────────────────────────────────────────────────`,
                    ``,
                    `[+] 4 exploits found`,
                    `[!] CVE-2019-0211 (CVSS 7.8): Local privilege escalation`,
                    `    If attacker has shell as www-data, can escalate to root`,
                    `[+] To copy exploit: searchsploit -m linux/local/51193.sh`,
                ],
                tipEn: "searchsploit queries the Exploit-DB local mirror — same database as exploit-db.com but offline. CVE-2019-0211 affects Apache 2.4.17-2.4.38 — if an attacker has a web shell running as www-data, they can escalate to root using this exploit. This is why web servers must be updated regularly and run with minimal privileges.",
                tipAr: 'CVE-2019-0211 بيرقي صلاحية www-data لـ root! لو عندنا web shell من قبل، دلوقتي عندنا root access على السيرفر كامل 🔴',
            }
        }

        if (query.includes('openssh') || query.includes('ssh')) {
            const ver = query.includes('7.9') ? '7.9' : '7.x'
            return {
                lines: [
                    `Exploit Database — searchsploit results for: OpenSSH ${ver}`,
                    ``,
                    `───────────────────────────────────────────────────────────────────`,
                    `  Title                                          | Path`,
                    `───────────────────────────────────────────────────────────────────`,
                    `  OpenSSH 7.7 < 7.9 - Username Enumeration      | linux/remote/45939.py`,
                    `  (CVE-2018-15473)`,
                    `  OpenSSH < 7.9 - PAM Privilege Separation       | multiple/local/45233.c`,
                    `  OpenSSH 7.9 - scp Client Escape Characters     | unix/remote/46193.txt`,
                    `  (CVE-2019-6111)`,
                    `───────────────────────────────────────────────────────────────────`,
                    ``,
                    `[+] 3 exploits found`,
                    `[!] CVE-2018-15473 (CVSS 5.3): Username enumeration`,
                    `    Script: python3 45939.py 192.168.1.5 -u users.txt`,
                    `[!] Recommended: Upgrade to OpenSSH 9.x immediately`,
                ],
                tipEn: "CVE-2018-15473 is a timing attack — when you try to login with a VALID username, SSH takes slightly longer to respond than with an INVALID username. By measuring response times, attackers can enumerate all valid usernames without triggering alarm bells. A list of valid usernames is then used for targeted brute-force attacks.",
                tipAr: 'CVE-2018-15473 timing attack! Valid username = response أبطأ بـ milliseconds. بتقيس الوقت وبتعرف اسم المستخدم بدون ما تكتب password 🕐',
            }
        }

        return {
            lines: [`searchsploit: Searching for "${args.join(' ')}"...`, '', `[*] No specific exploits found for this query.`, `[*] Try: searchsploit apache 2.4.38  or  searchsploit openssh 7.9`],
        }
    },

    whatweb: (args) => {
        const url = args[0] ?? `http://${TARGET}`
        return {
            lines: [
                `WhatWeb v0.5.5 — Network: ${url}`,
                ``,
                `http://${TARGET} [200 OK]`,
                `  Apache[2.4.38]`,
                `  PHP[7.4.3]`,
                `  WordPress[5.8.1]`,
                `  jQuery[3.5.1]`,
                `  Bootstrap[4.6.0]`,
                `  CMS: WordPress v5.8.1`,
                `  Country: EGYPT`,
                `  IP: 192.168.1.5`,
                `  Email: admin@evilcorp.com`,
                ``,
                `[+] Full fingerprint complete!`,
                `[!] WordPress 5.8.1 — Latest: 6.4.2 (MANY security patches missed!)`,
                `[!] jQuery 3.5.1 — CVE-2020-11022/11023 (XSS via HTML)`,
                `[!] admin email found: admin@evilcorp.com (use for phishing)`,
            ],
            tipEn: "WhatWeb combines multiple techniques: HTTP headers, HTML meta tags, JavaScript files, cookie names, and URL patterns to fingerprint web technologies. WordPress 5.8.1 is very old — there have been dozens of CVEs since then. jQuery 3.5.1 has an XSS vulnerability. This single WhatWeb run gives us a complete attack surface map.",
            tipAr: 'WhatWeb بيشوف كل حاجة دفعة واحدة! WordPress 5.8.1 قديمة جداً — في كتير من CVEs من بعدها. jQuery 3.5.1 عندها XSS vulnerability معروفة 🔮',
        }
    },

    nikto: (args) => {
        if (!args.includes('-h')) return { lines: ['Usage: nikto -h http://192.168.1.5'], isError: true }
        return {
            lines: [
                `Nikto v2.1.6 — Web Vulnerability Scanner`,
                `Target: http://${TARGET}`,
                ``,
                `- Server: Apache/2.4.38 (Debian)`,
                `+ Server leaks inodes via ETags, inode: 1234, size: 2847`,
                `+ The anti-clickjacking X-Frame-Options header is not set`,
                `+ No CGI Directories found (use '-C all' to force check all)`,
                `+ OSVDB-3092: /phpmyadmin/: phpMyAdmin was found`,
                `+ OSVDB-3268: /backup/: Directory indexing found`,
                `+ /phpinfo.php: PHP info file found`,
                `+ OSVDB-3092: /install.php: PHP installer is present`,
                `+ OSVDB-3233: /icons/README: Apache default file found`,
                `+ /wp-login.php: WordPress login page found`,
                `+ /admin/login: Admin login page found`,
                `+ Apache/2.4.38 appears to be outdated (current: 2.4.57)`,
                `+ PHP/7.4.3 appears to be outdated (current: 8.2)`,
                ``,
                `+ 11 items reported on remote host`,
                `+ End Time: 0:02:31 (11 items found)`,
                ``,
                `🏁 FLAG{Banner_Grab_CVE_Master}`,
                `[+] Lab complete! Full vulnerability map built.`,
            ],
            tipEn: "Nikto is an automated web scanner that checks for 6700+ potentially dangerous files/programs. It finds phpMyAdmin, WordPress login pages, outdated software, and exposed configuration files. Unlike Gobuster which only does path enumeration, Nikto also checks HTTP headers, HTTP methods, and known vulnerability signatures. Always the last step before manual exploitation.",
            tipAr: 'Nikto فحص كل حاجة دفعة واحدة! phpMyAdmin مكشوف + WordPress login + phpinfo.php + backup/ — ده تقرير كامل بالثغرات جاهز للاستغلال 🏁',
        }
    },

    history: () => ({
        lines: [
            `    1  nc ${TARGET} 80`,
            `    2  nc ${TARGET} 22`,
            `    3  nc ${TARGET} 21`,
            `    4  curl -I http://${TARGET}`,
            `    5  telnet ${TARGET} 23`,
            `    6  searchsploit apache 2.4.38`,
            `    7  searchsploit openssh 7.9`,
            `    8  nc ${TARGET} 25`,
            `    9  whatweb http://${TARGET}`,
            `   10  nikto -h http://${TARGET}`,
        ],
    }),

    clear: () => ({ lines: ['__CLEAR__'] }),
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function BannerTerminal({ currentStepId, onCommandRun }: Props) {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [cmdHistory, setCmdHistory] = useState<string[]>([])
    const [historyIdx, setHistoryIdx] = useState(-1)
    const [autoHint, setAutoHint] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const terminalBodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (terminalBodyRef.current) terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }, [history])

    useEffect(() => {
        if (input.length < 2) { setAutoHint(''); return }
        const base = input.split(' ')[0]
        const match = ALL_COMMANDS.find((c) => c.startsWith(base) && c !== base)
        setAutoHint(match && input === base ? match.slice(base.length) : '')
    }, [input])

    const runCommand = (raw: string) => {
        const trimmed = raw.trim()
        if (!trimmed) return
        const parts = trimmed.split(/\s+/)
        const cmd = parts[0].toLowerCase()
        const args = parts.slice(1)
        let output: CommandOutput | null = COMMANDS[cmd] ? COMMANDS[cmd](args) : { lines: [`${cmd}: command not found`, "Type 'help' to see available commands."], isError: true }
        if (output?.lines[0] === '__CLEAR__') { setHistory([]); setCmdHistory((p) => [...p, trimmed]); setHistoryIdx(-1); setInput(''); return }
        setHistory((p) => [...p, { input: trimmed, output, showTip: false }])
        setCmdHistory((p) => [...p, trimmed])
        setHistoryIdx(-1)
        setInput('')
        onCommandRun?.(trimmed)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { runCommand(input) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); const idx = Math.min(historyIdx + 1, cmdHistory.length - 1); setHistoryIdx(idx); setInput(cmdHistory[cmdHistory.length - 1 - idx] || '') }
        else if (e.key === 'ArrowDown') { e.preventDefault(); const idx = Math.max(historyIdx - 1, -1); setHistoryIdx(idx); setInput(idx === -1 ? '' : cmdHistory[cmdHistory.length - 1 - idx] || '') }
        else if (e.key === 'Tab') { e.preventDefault(); if (autoHint) setInput(input + autoHint) }
    }

    const toggleTip = (idx: number) => setHistory((p) => p.map((e, i) => (i === idx ? { ...e, showTip: !e.showTip } : e)))
    const stepHint = currentStepId && STEP_HINTS[currentStepId] ? STEP_HINTS[currentStepId] : null

    return (
        <div className="terminal-window h-full flex flex-col" onClick={() => inputRef.current?.focus()}>
            {/* Header bar removed to sit flush with tab bar */}
            <AnimatePresence>
                {stepHint && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="bg-neon-amber/10 border-b border-neon-amber/30 px-4 py-2 flex items-center gap-3 flex-shrink-0">
                        <Lightbulb size={14} className="text-neon-amber flex-shrink-0" />
                        <span className="font-mono text-xs text-neon-amber/80">
                            Next: <code className="text-neon-green cursor-pointer hover:underline" onClick={() => setInput(stepHint)}>{stepHint}</code>
                            <span className="text-neon-amber/40 ml-2">— click to fill, Enter to run</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={terminalBodyRef} className="terminal-body flex-1 overflow-y-auto select-text">
                <div className="mb-4 space-y-0.5">
                    <div className="font-mono text-xs text-neon-green/70">Cyber-Masry Banner Grabbing Lab — Educational Simulation</div>
                    <div className="font-mono text-xs text-gray-600">════════════════════════════════════════════════════</div>
                    <div className="font-mono text-xs text-gray-500">100% Simulated — No real network connections made</div>
                    <div className="font-mono text-xs text-neon-amber/70 pt-1">
                        Target: <span className="text-neon-orange">{TARGET}</span>{'  ·  '}
                        Type <span className="text-neon-amber cursor-pointer hover:underline" onClick={() => { setInput('help'); setTimeout(() => runCommand('help'), 50) }}>help</span> to begin.
                    </div>
                    <div className="font-cairo text-xs text-gray-600 italic">السيرفر بيتكلم — إنت بس لازم تسمعه يا نقيب 🏷️</div>
                </div>
                <div className="history-container">
                    {history.map((entry, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="neon-text-green font-mono text-xs">{PROMPT}</span>
                                <span className="text-neon-amber font-mono text-xs ml-1">{entry.input}</span>
                            </div>
                            {entry.output && (
                                <div className="mt-1 ml-2">
                                    {entry.output.lines.map((line, li) => (
                                        <div key={li} className={`font-mono text-xs leading-5 whitespace-pre-wrap ${entry.output?.isError ? 'text-red-400'
                                                : line.includes('FLAG{') ? 'text-neon-amber font-bold'
                                                    : line.includes('[+]') ? 'text-neon-green'
                                                        : line.includes('[!]') ? 'text-neon-amber/70'
                                                            : 'text-gray-300'
                                            }`}>{line || '\u00A0'}</div>
                                    ))}
                                    {(entry.output.tipEn || entry.output.tipAr) && (
                                        <div className="mt-2">
                                            <button onClick={() => toggleTip(idx)} className="flex items-center gap-1 font-mono text-xs text-neon-amber/60 hover:text-neon-amber transition-colors">
                                                <Info size={12} /><span>{entry.showTip ? '▾ Hide' : '▸ Show'} 💡 Explanation</span>
                                            </button>
                                            <AnimatePresence>
                                                {entry.showTip && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        {entry.output.tipEn && <div className="bg-neon-amber/5 border-l-2 border-neon-amber/40 pl-3 pr-2 py-2 mt-1 rounded-r font-mono text-xs text-gray-300 leading-relaxed">{entry.output.tipEn}</div>}
                                                        {entry.output.tipAr && <div className="tip-box mt-1">{entry.output.tipAr}</div>}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <span className="neon-text-green font-mono text-xs flex-shrink-0">{PROMPT}</span>
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute inset-0 font-mono text-xs text-gray-600 pointer-events-none flex items-center"><span className="invisible">{input}</span><span>{autoHint}</span></div>
                        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                            className="w-full bg-transparent font-mono text-xs text-gray-200 outline-none caret-neon-green relative z-10"
                            spellCheck={false} autoComplete="off" aria-label="Banner terminal input" />
                    </div>
                    <span className="terminal-cursor flex-shrink-0" />
                </div>
            </div>
            <div className="border-t border-dark-border px-3 py-2 flex gap-4 flex-shrink-0 flex-wrap">
                {[['↑↓', 'history'], ['Tab', 'autocomplete'], ['Enter', 'run'], ['click hint', 'fill']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1">
                        <kbd className="font-mono text-xs bg-dark-border px-1.5 py-0.5 rounded text-neon-amber/70">{key}</kbd>
                        <span className="font-mono text-xs text-gray-600">{label}</span>
                    </div>
                ))}
                <div className="ml-auto font-cairo text-xs text-gray-700 italic">محاكاة · مفيش اتصال حقيقي</div>
            </div>
        </div>
    )
}
