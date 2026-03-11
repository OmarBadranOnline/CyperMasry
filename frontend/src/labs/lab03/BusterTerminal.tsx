/**
 * BusterTerminal — Lab 03 local terminal simulator
 * Gobuster-focused directory & subdomain enumeration simulator
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
const CWD = '~/web-recon'
const PROMPT = `${HOSTNAME}:${CWD}$`
const TARGET_URL = 'http://192.168.1.5'

const ALL_COMMANDS = ['help', 'gobuster', 'curl', 'ping', 'clear', 'history']

const STEP_HINTS: Record<number, string> = {
    1: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt`,
    2: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -x php,html,txt`,
    3: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/admin-paths.txt`,
    4: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -v`,
    5: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -t 50`,
    6: `gobuster dns -d evilcorp.com -w /usr/share/wordlists/subdomains.txt`,
    7: `gobuster dir -u ${TARGET_URL}/api -w /usr/share/wordlists/api-paths.txt -x json`,
    8: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -x bak,old,zip,sql`,
    9: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt --delay 200ms`,
    10: `gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -o /tmp/gobuster-report.txt`,
}

// ─── Command definitions ──────────────────────────────────────────────────────
const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: [
            '╔════════════════════════════════════════════════════════╗',
            '║   Cyber-Masry Web Recon Toolkit  –  Help Menu          ║',
            '║   [SIMULATED ENVIRONMENT · EDUCATIONAL USE ONLY]       ║',
            '╚════════════════════════════════════════════════════════╝',
            '',
            '  Command                                   Description',
            '  ─────────────────────────────────────────────────────────',
            `  gobuster dir -u <url> -w <wordlist>       Directory bruteforce`,
            `  gobuster dir ... -x php,html,txt          File extension filter`,
            `  gobuster dir ... -t <threads>             Set thread count`,
            `  gobuster dir ... -v                       Verbose (show 403s)`,
            `  gobuster dir ... --delay <ms>             Delay between requests`,
            `  gobuster dir ... -o <file>                Save output to file`,
            `  gobuster dns -d <domain> -w <wordlist>    DNS subdomain scan`,
            `  curl <url>                                Fetch HTTP response`,
            '',
            `  📋 Mission target: ${TARGET_URL}`,
            `     Start with:  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt`,
        ],
    }),

    gobuster: (args) => {
        const mode = args[0] // dir or dns
        const raw = args.join(' ').toLowerCase()
        const hasFlag = (f: string) => raw.includes(f.toLowerCase())
        const url = args[args.indexOf('-u') + 1] ?? TARGET_URL
        const wordlist = args[args.indexOf('-w') + 1] ?? 'common.txt'
        const isTargetUrl = url.includes('192.168.1.5')

        // DNS subdomain mode
        if (mode === 'dns') {
            return {
                lines: [
                    `Gobuster v3.6  by OJ Reeves`,
                    `[+] Domain:     evilcorp.com`,
                    `[+] Threads:    10`,
                    `[+] Wordlist:   ${wordlist}`,
                    ``,
                    `===============================================================`,
                    `Starting gobuster in DNS enumeration mode`,
                    `===============================================================`,
                    `Found: www.evilcorp.com`,
                    `Found: mail.evilcorp.com`,
                    `Found: dev.evilcorp.com        ← 🔥 Development server!`,
                    `Found: staging.evilcorp.com    ← 🔥 Staging env (often less secure)`,
                    `Found: admin.evilcorp.com      ← ⚠️  Admin subdomain!`,
                    `Found: api.evilcorp.com`,
                    `Found: vpn.evilcorp.com`,
                    ``,
                    `===============================================================`,
                    `Finished: 7 subdomains found in 4.23s`,
                    ``,
                    `[!] dev.evilcorp.com — dev servers often skip security`,
                    `[!] staging.evilcorp.com — staging may have production DB creds`,
                    `[!] admin.evilcorp.com — admin panel on a subdomain!`,
                ],
                tipEn: 'Subdomain enumeration reveals the full attack surface. "dev" and "staging" environments are notoriously insecure — developers often use real credentials and disable security features. The Equifax breach involved an unpatched server on a forgotten subdomain. Always enumerate ALL subdomains, not just www.',
                tipAr: 'بيئة الـ dev والـ staging غالباً أمانها أقل بكتير من الـ production. ثغرة Equifax كانت على subdomain منسي 😅',
            }
        }

        if (mode !== 'dir') {
            return { lines: [`gobuster: unknown mode '${mode}'. Use 'dir' or 'dns'.`], isError: true }
        }

        // Step 1: basic scan
        if (!hasFlag('-x') && !hasFlag('-v') && !hasFlag('-t') && !hasFlag('--delay') && !hasFlag('-o') && !raw.includes('/api') && !raw.includes('admin') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  by OJ Reeves`,
                    `[+] Url:         ${TARGET_URL}`,
                    `[+] Threads:     10`,
                    `[+] Wordlist:    ${wordlist}`,
                    `[+] Status codes: 200,204,301,302,307,401,403`,
                    ``,
                    `===============================================================`,
                    `Starting gobuster in DIR enumeration mode`,
                    `===============================================================`,
                    `/images               (Status: 301) [Size: 178]`,
                    `/uploads              (Status: 301) [Size: 181]`,
                    `/admin                (Status: 403) [Size: 288]   ← Interesting!`,
                    `/backup               (Status: 301) [Size: 179]   ← Interesting!`,
                    `/config               (Status: 403) [Size: 291]   ← Interesting!`,
                    `/server-status        (Status: 403) [Size: 298]`,
                    `/phpmyadmin           (Status: 200) [Size: 10531] ← 🚨 CRITICAL`,
                    ``,
                    `===============================================================`,
                    `Finished: 8 results found`,
                    ``,
                    `[!] /phpmyadmin exposed! Try default creds: root / (empty)`,
                    `[!] /backup — might contain database dumps or source code`,
                    `[!] /admin returns 403, but path confirmed to exist`,
                ],
                tipEn: "Gobuster works by trying every word in a wordlist and checking the HTTP response code. 200=found, 301=redirect, 403=forbidden (but EXISTS!), 404=not found. The biggest finding here is /phpmyadmin — this database tool should NEVER be publicly accessible. Thousands of servers are owned every year through exposed phpMyAdmin.",
                tipAr: 'phpMyAdmin مكشوف = كارثة! ده بوابة للـ database بالكامل. ولو password افتراضي = game over 🎮',
            }
        }

        // Step 2: with extensions
        if (hasFlag('-x') && isTargetUrl && !raw.includes('bak') && !raw.includes('admin')) {
            const exts = args[args.indexOf('-x') + 1] ?? 'php,html,txt'
            return {
                lines: [
                    `Gobuster v3.6  by OJ Reeves`,
                    `[+] Extensions: ${exts}`,
                    ``,
                    `===============================================================`,
                    `/index.html            (Status: 200) [Size: 2847]`,
                    `/index.php             (Status: 200) [Size: 3012]`,
                    `/config.php            (Status: 200) [Size: 0]     ← Config file!`,
                    `/backup.txt            (Status: 200) [Size: 1842]  ← 🚨 FOUND`,
                    `/readme.txt            (Status: 200) [Size: 512]`,
                    `/admin.php             (Status: 302) [Redirect: /login.php]`,
                    `/install.php           (Status: 200) [Size: 4230]  ← Installer!`,
                    `/phpinfo.php           (Status: 200) [Size: 89432] ← 🚨 CRITICAL`,
                    ``,
                    `Finished: scanning ${exts} extensions`,
                    ``,
                    `[!] backup.txt — download and read it immediately`,
                    `[!] phpinfo.php — leaks PHP version, server config, env vars`,
                    `[!] install.php — web app installer still accessible!`,
                ],
                tipEn: "phpinfo.php leaks everything: PHP version, loaded modules, server OS, configuration values, and even environment variables that may contain database passwords. install.php left on production means an attacker can re-install the application and set their own admin credentials. Always delete installer files!",
                tipAr: 'phpinfo.php دي كنز معلومات للـ hacker! بيكشف PHP version والـ configs وأحياناً database passwords 😱',
            }
        }

        // Step 3: admin paths
        if (raw.includes('admin') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  by OJ Reeves`,
                    `[+] Wordlist: admin-paths.txt (specialized admin wordlist)`,
                    ``,
                    `===============================================================`,
                    `/admin                 (Status: 403) [Size: 288]`,
                    `/admin/login           (Status: 200) [Size: 4821]  ← 🎯 LOGIN PAGE`,
                    `/admin/dashboard       (Status: 302) → /admin/login`,
                    `/admin/users           (Status: 403) [Size: 291]`,
                    `/admin/config          (Status: 403) [Size: 291]`,
                    `/administrator         (Status: 301) [Size: 189]`,
                    `/wp-admin              (Status: 200) [Size: 7420]  ← WordPress!`,
                    `/manager               (Status: 302) → /manager/html`,
                    `/manager/html          (Status: 401) [Size: 2047]  ← Tomcat!`,
                    ``,
                    `Finished: Admin panel located!`,
                    ``,
                    `[!] /admin/login found! Try default creds: admin/admin, admin/password`,
                    `[!] Tomcat /manager/html — default creds: tomcat/tomcat`,
                    `[!] WordPress admin panel accessible`,
                ],
                tipEn: "A dedicated admin wordlist finds panels that generic wordlists miss. Tomcat Manager at /manager/html is notorious — CVE-2010-4172 and many others exploit this. The default credentials (tomcat/tomcat) still work on thousands of servers. Apache Tomcat is used by enterprise Java apps — if you own the manager, you can deploy a WAR file and get remote code execution.",
                tipAr: 'Tomcat Manager بالـ default creds = RCE (Remote Code Execution) مباشرة! بتعمل deploy لـ WAR file وبتتحكم في السيرفر 🎮',
            }
        }

        // Step 4: verbose
        if (hasFlag('-v') && isTargetUrl && !hasFlag('-t') && !hasFlag('--delay') && !hasFlag('-o')) {
            return {
                lines: [
                    `Gobuster v3.6  (Verbose mode — showing all results including 403)`,
                    ``,
                    `===============================================================`,
                    `/images         (Status: 301)`,
                    `/css            (Status: 301)`,
                    `/js             (Status: 301)`,
                    `/admin          (Status: 403) ← FORBIDDEN but EXISTS!`,
                    `/config         (Status: 403) ← FORBIDDEN but EXISTS!`,
                    `/backup         (Status: 301)`,
                    `/phpmyadmin     (Status: 200) ← OPEN!`,
                    `/server-status  (Status: 403) ← Apache mod_status`,
                    `/wp-content     (Status: 301) ← WordPress!`,
                    `/.htaccess      (Status: 403) ← Apache config`,
                    `/.git           (Status: 301) ← 🚨 GIT REPO EXPOSED`,
                    ``,
                    `Finished: 11 paths`,
                    ``,
                    `[!] /.git exposed! Run: git-dumper http://192.168.1.5 ./dumped-repo`,
                    `[!] 403 ≠ empty! /admin and /config exist but are protected`,
                ],
                tipEn: "Verbose mode shows every response including 403 Forbidden. The most critical finding here is /.git — when a Git repository is exposed on a web server, you can download the entire source code history, including old credentials that were committed and then deleted. The deletion is in git history! Tools like git-dumper automate this.",
                tipAr: '.git مكشوف = source code كامل بتاريخه! حتى لو حذفوا الـ password من الكود، بيفضل في git history 🕵️',
            }
        }

        // Step 5: threads
        if (hasFlag('-t') && isTargetUrl) {
            const threads = args[args.indexOf('-t') + 1] ?? '50'
            return {
                lines: [
                    `Gobuster v3.6  (${threads} concurrent threads)`,
                    ``,
                    `Progress: [====================================] 100%`,
                    ``,
                    `/images               (Status: 301)`,
                    `/uploads              (Status: 301)`,
                    `/admin                (Status: 403)`,
                    `/backup               (Status: 301)`,
                    `/phpmyadmin           (Status: 200)`,
                    ``,
                    `===============================================================`,
                    `Finished in 0.89 seconds  (vs 9.2s with 1 thread)`,
                    ``,
                    `[!] ${threads} threads = ${Math.round(parseInt(threads) / 10)}x faster`,
                    `[!] High threads may trigger rate limiting or IDS alerts`,
                    `[!] Recommended: 10-50 for authorized scans`,
                ],
                tipEn: `With ${threads} threads, Gobuster sends ${threads} requests simultaneously instead of sequentially. This is dramatically faster but also noisier — rate limiters and WAFs will likely flag this. In authorized pentests, 10-50 threads is the standard. In bug bounties, check the rules before going high.`,
                tipAr: `${threads} thread = ${threads} request في نفس الوقت. أسرع بكتير بس بيعمل ضجة. الـ WAF هيحس بيك لو عديت الحد المسموح 🚨`,
            }
        }

        // Step 7: API endpoints
        if (raw.includes('/api') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  (API endpoint enumeration)`,
                    `[+] Url: ${TARGET_URL}/api`,
                    `[+] Extensions: json`,
                    ``,
                    `===============================================================`,
                    `/api/users             (Status: 200) [Size: 4821]  ← 🚨 USER DATA`,
                    `/api/users/1           (Status: 200) [Size: 312]   ← Admin profile!`,
                    `/api/admin             (Status: 403)`,
                    `/api/config            (Status: 200) [Size: 891]   ← Config exposed!`,
                    `/api/debug             (Status: 200) [Size: 12043] ← Debug endpoint!`,
                    `/api/v1/login          (Status: 200)`,
                    `/api/v2/login          (Status: 200)`,
                    `/api/internal          (Status: 200) [Size: 2341]  ← Internal API!`,
                    ``,
                    `Finished: 8 API endpoints found`,
                    ``,
                    `[!] /api/users returns full user list without auth!`,
                    `[!] /api/debug leaks internal system info`,
                    `[!] /api/internal — internal API should not be public`,
                ],
                tipEn: "Exposed API endpoints without authentication are one of the most common vulnerabilities (OWASP API Top 10). /api/users returning all users without a token is a Broken Object Level Authorization (BOLA) flaw — the #1 API vulnerability. /api/debug endpoints often leak stack traces, env vars, and database queries.",
                tipAr: '/api/users بدون auth = BOLA vulnerability (الأولى في OWASP API Top 10). بتجيب بيانات كل المستخدمين بدون ما تسجل دخول 😱',
            }
        }

        // Step 8: backup extensions
        if (hasFlag('-x') && raw.includes('bak') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  (Hunting backup and config files)`,
                    `[+] Extensions: bak,old,zip,sql`,
                    ``,
                    `===============================================================`,
                    `/database.sql          (Status: 200) [Size: 845230] ← 🚨 FULL DB DUMP`,
                    `/config.old            (Status: 200) [Size: 2401]   ← Old config!`,
                    `/backup.zip            (Status: 200) [Size: 1024000] ← Source code!`,
                    `/wp-config.bak         (Status: 200) [Size: 3012]   ← DB creds!`,
                    `/users.sql             (Status: 200) [Size: 245120]  ← User hashes!`,
                    ``,
                    `Finished: 5 backup files found`,
                    ``,
                    `[!] CRITICAL: database.sql — full database dump publicly accessible!`,
                    `[!] wp-config.bak — contains DB_USER and DB_PASSWORD in plaintext`,
                    `[!] users.sql — all user password hashes downloadable`,
                ],
                tipEn: "Finding a .sql database dump on a public web server is one of the most catastrophic discovers in a pentest. One real-world breach exposed 140 million records because a developer uploaded database.sql to the web root for 'debugging'. The wp-config.bak file is a WordPress backup that contains database credentials in plaintext.",
                tipAr: 'database.sql على الويب! ده حدث فعلاً وكشف 140 مليون record. أحياناً devs بيعملوا upload للـ database للـ debugging وبينسوا يمسحوه 🤦',
            }
        }

        // Step 9: delay / stealth
        if (hasFlag('--delay') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  (Stealth mode — 200ms delay between requests)`,
                    ``,
                    `[*] Slow scan mode enabled. This will take longer.`,
                    `[*] WAF evasion: random delay between 200-400ms`,
                    ``,
                    `/images               (Status: 301)`,
                    `/uploads              (Status: 301)`,
                    `/admin                (Status: 403)`,
                    `/backup               (Status: 301)`,
                    `/phpmyadmin           (Status: 200)`,
                    ``,
                    `Finished in 47.3 seconds (vs 0.89s without delay)`,
                    ``,
                    `[!] Slow but much less likely to trigger WAF/rate-limit`,
                    `[!] Good for bug bounty programs with strict rules`,
                    `[!] Consider --delay for authorized production scans`,
                ],
                tipEn: "Web Application Firewalls (WAFs) detect brute-force scanning by counting requests per second from a single IP. Adding a delay of 200-500ms spreads requests over time, mimicking human browsing behavior. Some advanced WAFs use machine learning to detect even slow scans — real pentesters rotate source IPs using Tor or proxies.",
                tipAr: 'الـ WAF بيحسب requests في الثانية. لو عديت الحد بيبلوكك. الـ delay بيخليك تبان زي بني آدم عادي بيتصفح 🕵️‍♂️',
            }
        }

        // Step 10: output to file
        if (hasFlag('-o') && isTargetUrl) {
            return {
                lines: [
                    `Gobuster v3.6  (Output saved to file)`,
                    ``,
                    `[+] Output file: /tmp/gobuster-report.txt`,
                    ``,
                    `===============================================================`,
                    `/images               (Status: 301)`,
                    `/uploads              (Status: 301)`,
                    `/admin                (Status: 403)`,
                    `/backup               (Status: 301)`,
                    `/phpmyadmin           (Status: 200)`,
                    ``,
                    `Finished. Writing results to /tmp/gobuster-report.txt...`,
                    `[+] Results saved: 5 findings written`,
                    ``,
                    `[!] Professional pentests require written evidence`,
                    `[!] Combine with: nmap -oX, nikto -o, etc.`,
                    `[!] Tools: pentest-tools.com, Metasploit db_export`,
                ],
                tipEn: "Professional penetration testing requires evidence. Every tool you run should be saved to a file — findings without screenshots or logs are unchallengeable in a court of law. Most pentest frameworks (Metasploit, Cobalt Strike) log everything automatically. Get in the habit of: -o output.txt for every scan.",
                tipAr: 'البنتستر المحترف بيحفظ كل حاجة. التقرير النهائي بيحتاج screenshots وlogs. مش كفاية "أنا شفته" — محتاج دليل 📋',
            }
        }

        // Generic fallback
        return {
            lines: [
                `Gobuster v3.6`,
                `Running scan against ${url}...`,
                ``,
                `[*] Hint: Try the target at ${TARGET_URL}`,
                `[*] Type 'help' to see all available commands`,
            ],
        }
    },

    curl: (args) => {
        const url = args.find(a => !a.startsWith('-')) ?? TARGET_URL
        const hasI = args.includes('-I') || args.includes('-i')
        return {
            lines: hasI ? [
                `HTTP/1.1 200 OK`,
                `Date: Thu, 19 Feb 2026 17:09:00 GMT`,
                `Server: Apache/2.4.38 (Debian)`,
                `X-Powered-By: PHP/7.4.3`,
                `Content-Type: text/html; charset=UTF-8`,
                `X-Frame-Options: SAMEORIGIN`,
                ``,
                `[!] Server: Apache 2.4.38 — check CVEs`,
                `[!] X-Powered-By leaks PHP 7.4.3 version`,
            ] : [
                `<!DOCTYPE html>`,
                `<html>`,
                `  <head><title>EvilCorp Intranet</title></head>`,
                `  <body>`,
                `    <h1>Welcome to EvilCorp Intranet</h1>`,
                `    <!-- TODO: remove debug endpoint before go-live -->`,
                `    <!-- /api/debug is accessible at /api/debug -->`,
                `  </body>`,
                `</html>`,
                ``,
                `[!] HTML comment leaks /api/debug endpoint!`,
            ],
            tipEn: 'Curl is useful for both header inspection (-I flag) and reading HTML source. Developers often leave TODO comments in production HTML that reveal hidden paths. Always read the page source!',
            tipAr: 'Comments في الـ HTML مرئية للكل! الـ devs بينسوا يشيلوا الملاحظات الداخلية من الـ production 🤫',
        }
    },

    ping: () => ({
        lines: [
            `PING ${TARGET_URL.replace('http://', '')} 56(84) bytes of data.`,
            `64 bytes from 192.168.1.5: icmp_seq=1 ttl=64 time=0.38ms`,
            `[!] Host is up — proceed with web enumeration`,
        ],
    }),

    history: () => ({
        lines: [
            `    1  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt`,
            `    2  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -x php,html,txt`,
            `    3  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/admin-paths.txt`,
            `    4  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -v`,
            `    5  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -t 50`,
            `    6  gobuster dns -d evilcorp.com -w /usr/share/wordlists/subdomains.txt`,
            `    7  gobuster dir -u ${TARGET_URL}/api -w /usr/share/wordlists/api-paths.txt -x json`,
            `    8  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -x bak,old,zip,sql`,
            `    9  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt --delay 200ms`,
            `   10  gobuster dir -u ${TARGET_URL} -w /usr/share/wordlists/common.txt -o /tmp/gobuster-report.txt`,
        ],
    }),

    clear: () => ({ lines: ['__CLEAR__'] }),
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function BusterTerminal({ currentStepId, onCommandRun }: Props) {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [cmdHistory, setCmdHistory] = useState<string[]>([])
    const [historyIdx, setHistoryIdx] = useState(-1)
    const [autoHint, setAutoHint] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const terminalBodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
        }
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

        let output: CommandOutput | null = COMMANDS[cmd]
            ? COMMANDS[cmd](args)
            : {
                lines: [`${cmd}: command not found`, "Type 'help' to see available commands."],
                isError: true,
            }

        if (output?.lines[0] === '__CLEAR__') {
            setHistory([])
            setCmdHistory((p) => [...p, trimmed])
            setHistoryIdx(-1)
            setInput('')
            return
        }

        setHistory((p) => [...p, { input: trimmed, output, showTip: false }])
        setCmdHistory((p) => [...p, trimmed])
        setHistoryIdx(-1)
        setInput('')
        onCommandRun?.(trimmed)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            runCommand(input)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            const idx = Math.min(historyIdx + 1, cmdHistory.length - 1)
            setHistoryIdx(idx)
            setInput(cmdHistory[cmdHistory.length - 1 - idx] || '')
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            const idx = Math.max(historyIdx - 1, -1)
            setHistoryIdx(idx)
            setInput(idx === -1 ? '' : cmdHistory[cmdHistory.length - 1 - idx] || '')
        } else if (e.key === 'Tab') {
            e.preventDefault()
            if (autoHint) setInput(input + autoHint)
        }
    }

    const toggleTip = (idx: number) =>
        setHistory((p) => p.map((e, i) => (i === idx ? { ...e, showTip: !e.showTip } : e)))

    const stepHint = currentStepId && STEP_HINTS[currentStepId] ? STEP_HINTS[currentStepId] : null

    return (
        <div className="terminal-window h-full flex flex-col" onClick={() => inputRef.current?.focus()}>
            {/* Header bar removed to sit flush with tab bar */}

            {/* Step hint banner */}
            <AnimatePresence>
                {stepHint && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-neon-amber/10 border-b border-neon-amber/30 px-4 py-2 flex items-center gap-3 flex-shrink-0"
                    >
                        <Lightbulb size={14} className="text-neon-amber flex-shrink-0" />
                        <span className="font-mono text-xs text-neon-amber/80">
                            Next:{' '}
                            <code className="text-neon-green cursor-pointer hover:underline" onClick={() => setInput(stepHint)}>
                                {stepHint}
                            </code>
                            <span className="text-neon-amber/40 ml-2">— click to fill, then Enter</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Body */}
            <div ref={terminalBodyRef} className="terminal-body flex-1 overflow-y-auto select-text">
                {/* Welcome */}
                <div className="mb-4 space-y-0.5">
                    <div className="font-mono text-xs text-neon-green/70">Cyber-Masry Gobuster Toolkit v1.0 — Educational Simulation</div>
                    <div className="font-mono text-xs text-gray-600">═══════════════════════════════════════════════════</div>
                    <div className="font-mono text-xs text-gray-500">⚠  100% SIMULATED — No real network requests made</div>
                    <div className="font-mono text-xs text-gray-600">═══════════════════════════════════════════════════</div>
                    <div className="font-mono text-xs text-neon-amber/70 pt-1">
                        Target: <span className="text-neon-orange">{TARGET_URL}</span>
                        {'  ·  '}Type{' '}
                        <span className="text-neon-amber cursor-pointer hover:underline" onClick={() => { setInput('help'); setTimeout(() => runCommand('help'), 50) }}>help</span>{' '}
                        to see all Gobuster commands.
                    </div>
                    <div className="font-cairo text-xs text-gray-600 italic pt-0.5">يلا ابدأ تفتيش الموقع يا نقيب 📁</div>
                </div>

                {/* History */}
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
                                                : line.includes('🚨') || line.includes('CRITICAL') ? 'text-red-400'
                                                    : line.includes('←') || line.includes('Found:') ? 'text-neon-green'
                                                        : line.includes('[!]') ? 'text-neon-amber/70'
                                                            : line.includes('Status: 200') ? 'text-neon-green'
                                                                : line.includes('Status: 403') ? 'text-yellow-400/70'
                                                                    : line.includes('Status: 301') || line.includes('Status: 302') ? 'text-blue-400/70'
                                                                        : 'text-gray-300'
                                            }`}>
                                            {line || '\u00A0'}
                                        </div>
                                    ))}
                                    {(entry.output.tipEn || entry.output.tipAr) && (
                                        <div className="mt-2">
                                            <button onClick={() => toggleTip(idx)} className="flex items-center gap-1 font-mono text-xs text-neon-amber/60 hover:text-neon-amber transition-colors">
                                                <Info size={12} />
                                                <span>{entry.showTip ? '▾ Hide' : '▸ Show'} 💡 Explanation</span>
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

                {/* Active input */}
                <div className="flex items-center gap-1">
                    <span className="neon-text-green font-mono text-xs flex-shrink-0">{PROMPT}</span>
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute inset-0 font-mono text-xs text-gray-600 pointer-events-none flex items-center">
                            <span className="invisible">{input}</span>
                            <span>{autoHint}</span>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent font-mono text-xs text-gray-200 outline-none caret-neon-green relative z-10"
                            spellCheck={false}
                            autoComplete="off"
                            aria-label="Gobuster terminal input"
                        />
                    </div>
                    <span className="terminal-cursor flex-shrink-0" />
                </div>
            </div>

            {/* Keyboard hints */}
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
