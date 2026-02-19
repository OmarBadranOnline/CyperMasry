/**
 * NmapTerminal — Lab 02 local terminal simulator
 *
 * Same visual shell as TerminalSimulator (Lab 01) but with Nmap-focused
 * commands: nmap, nmap -sV, nmap -p, nmap -O, nmap -A, nmap -sU, etc.
 * Architecture mirrors src/labs/lab01/ZoogleSearch.tsx pattern.
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const HOSTNAME = 'student@cybermasry'
const CWD = '~/scanning'
const PROMPT = `${HOSTNAME}:${CWD}$`
const TARGET_IP = '192.168.1.5'

const ALL_COMMANDS = [
    'help', 'nmap', 'ping', 'netstat', 'ip', 'ifconfig', 'clear', 'history',
]

// ─── Guided step hints ────────────────────────────────────────────────────────
const STEP_HINTS: Record<number, string> = {
    1: `nmap ${TARGET_IP}`,
    2: `nmap -sV ${TARGET_IP}`,
    3: `nmap -p 22,80,3306,8080 ${TARGET_IP}`,
    4: `nmap -O ${TARGET_IP}`,
    5: `nmap -A ${TARGET_IP}`,
    6: `nmap -p- ${TARGET_IP}`,
    7: `nmap -sU ${TARGET_IP}`,
    8: `nmap -T4 -F ${TARGET_IP}`,
    9: `nmap --script vuln ${TARGET_IP}`,
    10: `nmap -sn 192.168.1.0/24`,
}

// ─── Command definitions ──────────────────────────────────────────────────────
const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: [
            '╔═══════════════════════════════════════════════════════╗',
            '║      Cyber-Masry Scanning Toolkit  –  Help Menu       ║',
            '║   [SIMULATED ENVIRONMENT · EDUCATIONAL USE ONLY]      ║',
            '╚═══════════════════════════════════════════════════════╝',
            '',
            '  Command                                  Flag Meaning',
            '  ───────────────────────────────────────────────────────',
            `  nmap <ip>                                Default TCP SYN scan`,
            `  nmap -sV <ip>                            Version detection`,
            `  nmap -p <ports> <ip>                     Scan specific ports`,
            `  nmap -O <ip>                             OS fingerprinting`,
            `  nmap -A <ip>                             Aggressive (all-in-one)`,
            `  nmap -sU <ip>                            UDP scan`,
            `  nmap -sn <network>                       Ping sweep (host discovery)`,
            `  nmap --script vuln <ip>                  Run vulnerability scripts`,
            `  ping <ip>                                ICMP host check`,
            `  netstat -tuln                            Local open ports`,
            `  ip addr                                  Network interfaces`,
            `  clear                                    Clear terminal`,
            '',
            `  📋 Mission target: ${TARGET_IP}`,
            `     Start with:  nmap ${TARGET_IP}`,
        ],
    }),

    nmap: (args) => {
        const flags = args.filter((a) => a.startsWith('-'))
        const target = args.find((a) => !a.startsWith('-')) ?? TARGET_IP

        // Step 1: basic scan → nmap 192.168.1.5
        if (flags.length === 0 && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( https://nmap.org )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0036s latency).`,
                    `Not shown: 996 closed tcp ports (reset)`,
                    ``,
                    `PORT      STATE    SERVICE`,
                    `22/tcp    open     ssh`,
                    `80/tcp    open     http`,
                    `443/tcp   closed   https`,
                    `3306/tcp  open     mysql`,
                    ``,
                    `Nmap done: 1 IP address (1 host up) scanned in 2.87 seconds`,
                    ``,
                    `[!] 3 open ports found: 22 (SSH), 80 (HTTP), 3306 (MySQL)`,
                ],
                tipEn: 'A basic Nmap SYN scan (-sS is the default) sends a TCP SYN packet and waits for a SYN-ACK response. An "open" port replies. "Closed" means the host replied with RST. "Filtered" means a firewall dropped the packet silently. MySQL on 3306 should NEVER be exposed like this — it means the admin made a serious mistake.',
                tipAr: 'MySQl بيبان على الإنترنت؟ ده خطأ فادح! قاعدة البيانات مفروش تبقى ورا firewall دايماً 🔥',
            }
        }

        // Step 2: version detection → nmap -sV
        if (flags.includes('-sV') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( version detection mode )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0041s latency).`,
                    ``,
                    `PORT      STATE  SERVICE  VERSION`,
                    `22/tcp    open   ssh      OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)`,
                    `80/tcp    open   http     Apache httpd 2.4.38 ((Debian))`,
                    `3306/tcp  open   mysql    MySQL 5.7.32-log`,
                    ``,
                    `Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel`,
                    ``,
                    `Nmap done: 1 IP address (1 host up) scanned in 8.23 seconds`,
                    ``,
                    `[!] OpenSSH 7.9 — check for known CVEs`,
                    `[!] Apache 2.4.38 — outdated, CVE-2019-0211 exists`,
                    `[!] MySQL 5.7.32 — End-of-life in Oct 2023, unpatched vulnerabilities`,
                ],
                tipEn: 'Version detection (-sV) sends service-specific probes to identify the exact software version. Apache 2.4.38 has a known privilege escalation CVE (CVE-2019-0211). MySQL 5.7 reached End-of-Life in October 2023 — it no longer receives security patches. This is a goldmine for an attacker.',
                tipAr: 'Apache 2.4.38 عندها CVE معروف للـ privilege escalation.. وMySQL 5.7 مكنتش بتاخد updates من 2023 😱',
            }
        }

        // Step 3: specific ports → nmap -p
        if (flags.some((f) => f === '-p') && target === TARGET_IP) {
            const portArg = args[args.indexOf('-p') + 1] ?? '22,80,3306,8080'
            const ports = portArg.split(',').map((p) => parseInt(p.trim()))
            const portMap: Record<number, { state: string; service: string }> = {
                22: { state: 'open', service: 'ssh' },
                80: { state: 'open', service: 'http' },
                443: { state: 'closed', service: 'https' },
                3306: { state: 'open', service: 'mysql' },
                8080: { state: 'filtered', service: 'http-alt' },
                8443: { state: 'filtered', service: 'https-alt' },
                21: { state: 'closed', service: 'ftp' },
                25: { state: 'filtered', service: 'smtp' },
            }
            const rows = ports.map((p) => {
                const info = portMap[p] ?? { state: 'closed', service: 'unknown' }
                const pad = ' '.repeat(Math.max(0, 9 - `${p}/tcp`.length))
                return `${p}/tcp${pad}${info.state.padEnd(9)}${info.service}`
            })
            return {
                lines: [
                    `Starting Nmap 7.94 ( scanning specific ports )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up.`,
                    ``,
                    `PORT      STATE     SERVICE`,
                    ...rows,
                    ``,
                    `Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds`,
                    ``,
                    `[!] Port 8080 filtered — possible internal admin panel behind a firewall`,
                ],
                tipEn: 'Scanning specific ports is faster and stealthier than a full scan. "Filtered" means a firewall is blocking the port but not actively refusing — meaning the service might be there but protected. Port 8080 is a common alternate HTTP port and often hosts admin panels or internal apps.',
                tipAr: 'port 8080 filtered يعني فيه حاجة ورا الـ firewall.. ممكن يكون admin panel محمي 🛡️',
            }
        }

        // Step 4: OS detection → nmap -O
        if (flags.includes('-O') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( OS detection mode — requires root )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0039s latency).`,
                    ``,
                    `OS detection performed. Please report any incorrect results.`,
                    ``,
                    `Device type: general purpose`,
                    `Running: Linux 4.X|5.X`,
                    `OS CPE: cpe:/o:linux:linux_kernel:4  cpe:/o:linux:linux_kernel:5`,
                    `OS details: Linux 4.15 - 5.6`,
                    ``,
                    `Network Distance: 1 hop`,
                    ``,
                    `OS and Service detection performed.`,
                    `Nmap done: 1 IP address (1 host up) scanned in 15.37 seconds`,
                    ``,
                    `[!] Linux kernel 4-5 detected — check kernel vulnerabilities`,
                    `[!] OS fingerprinting = valuable intel for exploit selection`,
                ],
                tipEn: 'OS detection works by analyzing differences in TCP/IP stack implementation between operating systems — things like IP TTL, TCP window size, and specific TCP option ordering. Knowing the OS lets an attacker select OS-specific exploits. This is why hardened systems randomize these values.',
                tipAr: 'معرفة الـ OS = اختيار الـ exploit الصح. Linux kernel قديم = exploits كتير جاهزة 🐧',
            }
        }

        // Step 5: aggressive scan → nmap -A
        if (flags.includes('-A') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( AGGRESSIVE SCAN: -sV -O -sC --traceroute )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0038s latency).`,
                    ``,
                    `PORT      STATE  SERVICE  VERSION`,
                    `22/tcp    open   ssh      OpenSSH 7.9p1 Debian`,
                    `| ssh-hostkey:`,
                    `|   2048 aa:bb:cc:dd:ee:ff... (RSA)`,
                    `|_  256 11:22:33:44:55... (ECDSA)`,
                    `80/tcp    open   http     Apache 2.4.38 (Debian)`,
                    `| http-title: EvilCorp Intranet Portal`,
                    `|_http-server-header: Apache/2.4.38 (Debian)`,
                    `3306/tcp  open   mysql    MySQL 5.7.32`,
                    `| mysql-info:`,
                    `|   Protocol: 10  Capability flags: 65535`,
                    `|_  Status: Autocommit`,
                    ``,
                    `OS details: Linux 4.15 - 5.6`,
                    ``,
                    `TRACEROUTE (using port 443/tcp)`,
                    `HOP  RTT    ADDRESS`,
                    `1    0.80   192.168.1.1`,
                    `2    3.71   ${TARGET_IP}`,
                    ``,
                    `Nmap done: 1 IP address (1 host up) scanned in 32.14 seconds`,
                    ``,
                    `[!] CRITICAL: Page title "EvilCorp Intranet Portal" — public-facing!`,
                    `[!] MySQL autocommit on — weak config`,
                    `[!] -A scan leaves heavy logs. Use in authorized engagements only!`,
                ],
                tipEn: 'The -A flag combines: version detection (-sV), OS detection (-O), default scripts (-sC), and traceroute. The Nmap Scripting Engine (NSE) scripts probe for known vulnerabilities, leaked info in banners, and misconfigurations. CRITICAL WARNING: -A is very loud and will almost certainly trigger IDS/IPS alerts in a real network.',
                tipAr: '-A ده السلاح النووي بتاع Nmap.. بيعمل كل حاجة مع بعض. بس اتحذر: بيعمل ضجة كبيرة وبيتحس بيه الـ IDS 🚨',
            }
        }

        // UDP scan
        if (flags.includes('-sU') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( UDP scan — slow, requires root )`,
                    `Note: UDP scanning is much slower than TCP...`,
                    ``,
                    `PORT     STATE          SERVICE`,
                    `53/udp   open           domain (DNS)`,
                    `123/udp  open           ntp`,
                    `161/udp  open|filtered  snmp`,
                    ``,
                    `Nmap done: 1 IP address scanned in 58.14 seconds`,
                    ``,
                    `[!] SNMP 161/udp — often misconfigured with default community string "public"`,
                    `[!] DNS 53/udp — check for zone transfer vulnerability`,
                ],
                tipEn: 'UDP ports are often overlooked. SNMP (161) with default community string "public" allows an attacker to enumerate the entire device config. UDP scanning is much slower because there\'s no TCP handshake to confirm the port is open — Nmap has to wait for timeouts.',
                tipAr: 'SNMP بـ "public" ده زي ما تسيب باب مفتوح مكتوب عليه "ادخل".. شائع جداً كـ misconfiguration 🚪',
            }
        }

        // Ping sweep
        if (flags.includes('-sn')) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( Ping sweep — no port scan )`,
                    `Scanning 192.168.1.0/24 (256 hosts)...`,
                    ``,
                    `Nmap scan report for 192.168.1.1   [router]     Host is up`,
                    `Nmap scan report for 192.168.1.5   [target]     Host is up ← هدفنا`,
                    `Nmap scan report for 192.168.1.10  [printer]    Host is up`,
                    `Nmap scan report for 192.168.1.20  [workstation] Host is up`,
                    `Nmap scan report for 192.168.1.105 [your machine] Host is up`,
                    ``,
                    `Nmap done: 256 IP addresses, 5 hosts up, scanned in 4.21 seconds`,
                    ``,
                    `[!] 5 live hosts found on the subnet`,
                    `[!] Ping sweep = host discovery without port scanning`,
                ],
                tipEn: 'A ping sweep (-sn) discovers which hosts are alive without scanning any ports. This is the first step in internal network enumeration. Attackers use this to map the network before choosing targets. In enterprise networks, always do host discovery before port scanning — it saves time and reduces noise.',
                tipAr: 'الـ ping sweep زي أشعة X للشبكة.. بيكشف مين شغال ومين مش شغال 🏥',
            }
        }

        // NSE vuln scan
        if (args.includes('--script') && args.includes('vuln') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( NSE vulnerability scan )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    ``,
                    `PORT     STATE SERVICE`,
                    `22/tcp   open  ssh`,
                    `| ssh-auth-methods:`,
                    `|_  Supported: publickey password`,
                    `80/tcp   open  http`,
                    `| http-vuln-cve2017-5638:`,
                    `|   VULNERABLE: Apache Struts RCE CVE-2017-5638`,
                    `|   State: LIKELY VULNERABLE (not confirmed)`,
                    `|   IDs: CVE:CVE-2017-5638`,
                    `|   Disclosure date: 2017-03-07`,
                    `3306/tcp open  mysql`,
                    `| mysql-empty-password:`,
                    `|   VULNERABLE: MySQL anonymous login allowed!`,
                    `|_  WARNING: No password on MySQL root account`,
                    ``,
                    `Nmap done: 1 IP address (1 host up) scanned in 24.67 seconds`,
                    ``,
                    `[!] CRITICAL: MySQL root with NO password!`,
                    `[!] Possible CVE-2017-5638 on port 80`,
                ],
                tipEn: 'Nmap Scripting Engine (NSE) can automatically test for known vulnerabilities, default credentials, and misconfigurations. MySQL with no root password is a catastrophic misconfiguration — anyone who can reach port 3306 has full database access. CVE-2017-5638 (Apache Struts) is the same vulnerability that caused the Equifax breach affecting 147 million people.',
                tipAr: 'MySQL بدون password على الـ root = كارثة! وCVE-2017-5638 هي نفس ثغرة Equifax اللي كشفت بيانات 147 مليون شخص 😱',
            }
        }

        // Step 6: full port scan → nmap -p-
        if ((flags.includes('-p-') || args.includes('-p-')) && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( FULL PORT SCAN: all 65535 ports )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0041s latency).`,
                    ``,
                    `PORT       STATE     SERVICE`,
                    `22/tcp     open      ssh`,
                    `80/tcp     open      http`,
                    `1099/tcp   open      rmiregistry`,
                    `3306/tcp   open      mysql`,
                    `5432/tcp   open      postgresql`,
                    `8009/tcp   open      ajp13`,
                    `8080/tcp   open      http-alt`,
                    `8443/tcp   filtered  https-alt`,
                    ``,
                    `Nmap done: 1 IP address, 65535 ports scanned in 127.42 seconds`,
                    ``,
                    `[!] 3 NEW ports found vs. default scan: 1099, 5432, 8009`,
                    `[!] PostgreSQL 5432 — second database exposed`,
                    `[!] AJP 8009 — CVE-2020-1938 (Ghostcat) — read any file on server`,
                    `[!] Java RMI 1099 — remote code execution vector`,
                ],
                tipEn: 'The default Nmap scan only checks the top 1000 most common ports. A -p- scan checks ALL 65535 — here we found 3 extra services the default missed: PostgreSQL, Java RMI, and Apache AJP. CVE-2020-1938 (Ghostcat) on AJP/8009 lets an attacker read any file on the server — it was ignored for years because AJP is rarely mapped. Always do a full port scan on important targets!',
                tipAr: 'الـ default scan بيفوّت 64535 port! الـ AJP على 8009 بيها Ghostcat — ثغرة بتخليك تقرأ أي ملف على السيرفر. لو مكنتش عملت -p- ما كنتش هتعرف 👻',
            }
        }

        // Step 8: fast scan → nmap -T4 -F
        if (flags.some(f => f.toUpperCase() === '-T4') && flags.some(f => f.toUpperCase() === '-F') && target === TARGET_IP) {
            return {
                lines: [
                    `Starting Nmap 7.94 ( FAST SCAN: T4 timing + top 100 ports )`,
                    `Nmap scan report for ${TARGET_IP}`,
                    `Host is up (0.0031s latency).`,
                    ``,
                    `PORT     STATE  SERVICE`,
                    `22/tcp   open   ssh`,
                    `80/tcp   open   http`,
                    `3306/tcp open   mysql`,
                    ``,
                    `Nmap done: 1 IP address, 100 ports scanned in 0.41 seconds`,
                    ``,
                    `[!] T4 = aggressive timing (faster packet rate)`,
                    `[!] -F = top 100 ports only (10× faster than default)`,
                    `[!] Trade-off: speed vs. coverage. Missing ports 1099, 5432, 8009!`,
                ],
                tipEn: 'Nmap timing templates: T0 (paranoid/slowest) → T5 (insane/fastest). T4 is the sweet spot for most authorized scans — fast enough to be practical, unlikely to overwhelm most networks. -F limits to the top 100 ports. Use T4 -F for a quick reconnaissance snapshot; use -p- when thoroughness matters.',
                tipAr: 'T4 زي قيادة بسرعة عالية — أسرع بس ممكن IDS يحس بيك. T0 = سلحفاة 🐢 و T5 = انتحاري 💥 وT4 هو الـ sweet spot',
            }
        }

        // Generic nmap on wrong target
        return {

            lines: [
                `Starting Nmap 7.94...`,
                `Nmap scan report for ${target}`,
                `Host is up.`,
                `Note: No open ports found on ${target}.`,
                ``,
                `[!] Hint: scan our target at ${TARGET_IP}`,
            ],
        }
    },

    ping: (args) => {
        const host = args[0] ?? TARGET_IP
        return {
            lines: [
                `PING ${host} (${host}) 56(84) bytes of data.`,
                `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.42 ms`,
                `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.38 ms`,
                `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.41 ms`,
                ``,
                `--- ${host} ping statistics ---`,
                `3 packets transmitted, 3 received, 0% packet loss`,
                `rtt min/avg/max/mdev = 0.38/0.40/0.42/0.02 ms`,
                ``,
                `[!] TTL=64 → Linux host confirmed`,
                `[!] Host is reachable — proceed with port scanning`,
            ],
            tipEn: 'Before scanning, always confirm the host is alive with ping. TTL=64 is the default for Linux/Unix systems. If ping fails, the host might be blocking ICMP (firewalled) but still have open ports — so a live check failure does NOT mean the host is dead.',
            tipAr: 'TTL=64 = Linux مؤكد. لو ping فشل مش معناه الهوست وقع — ممكن بس blocking ICMP 🧱',
        }
    },

    netstat: (args) => {
        const hasTuln = args.some((a) => a.includes('t') || a.includes('u') || a.includes('l'))
        return {
            lines: hasTuln
                ? [
                    'Active Internet connections (only servers)',
                    'Proto  Local Address        State',
                    'tcp    0.0.0.0:22           LISTEN   (SSH)',
                    'tcp    0.0.0.0:80           LISTEN   (HTTP → Apache)',
                    'tcp    0.0.0.0:3306         LISTEN   (MySQL ← DANGER)',
                    'tcp    127.0.0.1:6379       LISTEN   (Redis — localhost only)',
                    '',
                    '[!] MySQL exposed on 0.0.0.0 = reachable from any IP',
                ]
                : ['Try: netstat -tuln   (show listening TCP/UDP ports)'],
            tipEn: 'netstat -tuln shows all listening services. Binding to 0.0.0.0 means "accept connections from any IP" — this is why MySQL on 3306 is dangerous when exposed. Redis is safer here (bound to 127.0.0.1 only), but if someone gets a shell, it becomes their next pivot.',
            tipAr: '0.0.0.0 يعني "اقبل من أي حد".. ده زي ما تفتح بابك وتقول "اتفضل" للكل 🚪',
        }
    },

    ip: (args) => ({
        lines: args[0] === 'addr'
            ? [
                '1: lo: <LOOPBACK,UP>',
                '   inet 127.0.0.1/8',
                '2: eth0: <BROADCAST,MULTICAST,UP>',
                '   inet 192.168.1.105/24 brd 192.168.1.255',
                '',
                '[!] Your IP: 192.168.1.105 — same subnet as target 192.168.1.5',
            ]
            : ['Usage: ip addr'],
        tipEn: 'You are on 192.168.1.105 and the target is 192.168.1.5 — both on the /24 subnet 192.168.1.0. Same subnet means no routing hops between you and target — your traffic goes directly. This makes scanning faster and makes it harder for the target to block your source IP via upstream routing.',
        tipAr: 'إنت والـ target في نفس الـ subnet.. يعني مفيش router بينكم والـ traffic هيوصل بشكل مباشر 🎯',
    }),

    ifconfig: () => ({
        lines: [
            'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>',
            '      inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255',
            '',
            'lo:   flags=73<UP,LOOPBACK,RUNNING>',
            '      inet 127.0.0.1  netmask 255.0.0.0',
        ],
        tipEn: 'Same-subnet scan: your machine (192.168.1.105) can directly reach the target (192.168.1.5) without a gateway. ARP-based scanning works here — faster than routed scans.',
        tipAr: 'نفس الـ subnet = ARP scan مباشر وأسرع بكتير من الـ scan عبر router 🚀',
    }),

    history: () => ({
        lines: [
            '    1  ping 192.168.1.5',
            '    2  nmap 192.168.1.5',
            '    3  nmap -sV 192.168.1.5',
            '    4  nmap -p 22,80,3306,8080 192.168.1.5',
            '    5  nmap -O 192.168.1.5',
            '    6  nmap -A 192.168.1.5',
            '    7  nmap -sU 192.168.1.5',
            '    8  nmap --script vuln 192.168.1.5',
            '    9  history',
        ],
        tipEn: 'A disciplined pentester follows a methodical progression: host discovery → basic port scan → version detection → targeted port scan → OS fingerprinting → aggressive scan. Notice how each step gives more detail but also more noise.',
        tipAr: 'البنتستر المحترف بيمشي خطوة خطوة.. مش بيقفز على -A من الأول عشان مش يتحس بيه 🥷',
    }),

    clear: () => ({ lines: ['__CLEAR__'] }),
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function NmapTerminal({ currentStepId, onCommandRun }: Props) {
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
                lines: [
                    `${cmd}: command not found`,
                    "Type 'help' to see available commands.",
                ],
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
        <div
            className="terminal-window h-full flex flex-col"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Header bar */}
            <div className="terminal-header flex-shrink-0">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-400" />
                <div className="terminal-dot bg-green-500" />
                <span className="font-mono text-xs text-gray-500 ml-2">
                    {HOSTNAME}:{CWD} — bash
                </span>
                <span className="ml-auto font-mono text-xs text-neon-amber/50 bg-neon-amber/5 px-2 py-0.5 rounded">
                    SIMULATED
                </span>
            </div>

            {/* Guided step hint banner */}
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
                            <code
                                className="text-neon-green cursor-pointer hover:underline"
                                onClick={() => setInput(stepHint)}
                            >
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
                    <div className="font-mono text-xs text-neon-green/70">
                        Cyber-Masry Nmap Scanner v1.0 — Educational Simulation
                    </div>
                    <div className="font-mono text-xs text-gray-600">
                        ═════════════════════════════════════════════════════
                    </div>
                    <div className="font-mono text-xs text-gray-500">
                        ⚠  100% SIMULATED — No real network requests made
                    </div>
                    <div className="font-mono text-xs text-gray-600">
                        ═════════════════════════════════════════════════════
                    </div>
                    <div className="font-mono text-xs text-neon-amber/70 pt-1">
                        Target: <span className="text-neon-orange">{TARGET_IP}</span>
                        {'  ·  '}Type{' '}
                        <span
                            className="text-neon-amber cursor-pointer hover:underline"
                            onClick={() => { setInput('help'); setTimeout(() => runCommand('help'), 50) }}
                        >
                            help
                        </span>{' '}
                        to see all Nmap commands.
                    </div>
                    <div className="font-cairo text-xs text-gray-600 italic pt-0.5">
                        يلا ابدأ التفتيش يا نقيب 🔭
                    </div>
                </div>

                {/* History */}
                <AnimatePresence initial={false}>
                    {history.map((entry, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3"
                        >
                            {/* Prompt line */}
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="neon-text-green font-mono text-xs">{PROMPT}</span>
                                <span className="text-neon-amber font-mono text-xs ml-1">{entry.input}</span>
                            </div>

                            {/* Output lines */}
                            {entry.output && (
                                <div className="mt-1 ml-2">
                                    {entry.output.lines.map((line, li) => (
                                        <div
                                            key={li}
                                            className={`font-mono text-xs leading-5 whitespace-pre-wrap ${entry.output?.isError
                                                ? 'text-red-400'
                                                : line.includes('open') && !line.includes('SIMULATED')
                                                    ? 'text-neon-green'
                                                    : line.includes('closed')
                                                        ? 'text-red-400/60'
                                                        : line.includes('filtered')
                                                            ? 'text-yellow-400/70'
                                                            : line.startsWith('[!')
                                                                ? 'text-neon-amber/70'
                                                                : 'text-gray-300'
                                                }`}
                                        >
                                            {line || '\u00A0'}
                                        </div>
                                    ))}

                                    {/* Tip toggle */}
                                    {(entry.output.tipEn || entry.output.tipAr) && (
                                        <div className="mt-2">
                                            <button
                                                onClick={() => toggleTip(idx)}
                                                className="flex items-center gap-1 font-mono text-xs text-neon-amber/60 hover:text-neon-amber transition-colors"
                                            >
                                                <Info size={12} />
                                                <span>{entry.showTip ? '▾ Hide' : '▸ Show'} 💡 Explanation</span>
                                            </button>
                                            <AnimatePresence>
                                                {entry.showTip && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {entry.output.tipEn && (
                                                            <div className="bg-neon-amber/5 border-l-2 border-neon-amber/40 pl-3 pr-2 py-2 mt-1 rounded-r font-mono text-xs text-gray-300 leading-relaxed">
                                                                {entry.output.tipEn}
                                                            </div>
                                                        )}
                                                        {entry.output.tipAr && (
                                                            <div className="tip-box mt-1">
                                                                {entry.output.tipAr}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Active input line */}
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
                            aria-label="Nmap terminal input"
                        />
                    </div>
                    <span className="terminal-cursor flex-shrink-0" />
                </div>
            </div>

            {/* Keyboard hints bar */}
            <div className="border-t border-dark-border px-3 py-2 flex gap-4 flex-shrink-0 flex-wrap">
                {[['↑↓', 'history'], ['Tab', 'autocomplete'], ['Enter', 'run'], ['click hint', 'fill']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1">
                        <kbd className="font-mono text-xs bg-dark-border px-1.5 py-0.5 rounded text-neon-amber/70">
                            {key}
                        </kbd>
                        <span className="font-mono text-xs text-gray-600">{label}</span>
                    </div>
                ))}
                <div className="ml-auto font-cairo text-xs text-gray-700 italic">
                    محاكاة · مفيش اتصال حقيقي
                </div>
            </div>
        </div>
    )
}
