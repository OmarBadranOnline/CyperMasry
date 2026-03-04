import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb } from 'lucide-react'
import { parseWithGlossary } from '../utils/parseWithGlossary'

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
const CWD = '~/recon'
const PROMPT = `${HOSTNAME}:${CWD}$`

const ALL_COMMANDS = [
    'help', 'whoami', 'pwd', 'ls', 'cat', 'whois', 'nslookup', 'ping', 'curl', 'history', 'clear',
    'ifconfig', 'ip', 'netstat', 'traceroute', 'dig', 'theharvester', 'hash-identifier', 'submit_flag'
]

// ─── Guided hints per step ────────────────────────────────────────────────────
const STEP_HINTS: Record<number, string> = {
    1: 'whoami',
    2: 'whois evilcorp.com',
    3: 'nslookup evilcorp.com',
    4: 'curl -I evilcorp.com',
    10: 'dig evilcorp.com any',
    11: 'curl https://blacklist-check.api/evilcorp.com',
    13: 'curl dev.evilcorp.com/flag',
    14: 'theharvester -d evilcorp.com -b all',
    15: 'curl haveibeenpwned.com/api/v3/breachedaccount/admin@evilcorp.com',
    16: 'hash-identifier 5f4dcc3b5aa765d61d8327deb882cf99',
    17: 'submit_flag intel_complete',
}

// ─── Command definitions ──────────────────────────────────────────────────────
const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: [
            '╔═══════════════════════════════════════════════════════╗',
            '║      Cyber-Masry Recon Toolkit  –  Help Menu          ║',
            '║   [SIMULATED ENVIRONMENT · EDUCATIONAL USE ONLY]      ║',
            '╚═══════════════════════════════════════════════════════╝',
            '',
            '  Command               Description',
            '  ───────────────────────────────────────────────────────',
            '  whoami                Print current user & role',
            '  pwd                   Print working directory',
            '  ls [-la]              List directory contents',
            '  cat <file>            Read a file',
            '  whois <domain>        Domain registration lookup',
            '  nslookup <domain>     DNS A/MX record lookup',
            '  dig <domain>          Detailed DNS enumeration',
            '  ping <host>           ICMP reachability check',
            '  curl <url>            Transfer a URL (try -I for headers)',
            '  traceroute <host>     Trace network path to host',
            '  netstat -tuln         Active network connections',
            '  ip addr               Show network interfaces',
            '  theharvester          Email and subdomain scraper',
            '  hash-identifier       Identify hash types',
            '  submit_flag <flag>    Submit discovered flags',
            '  history               Show command history',
            '  clear                 Clear terminal',
            '',
            '  📋 Mission Steps 1–4 use this terminal.',
            '     Start with:  whoami',
        ],
    }),

    whoami: () => ({
        lines: ['student'],
        tipEn:
            'Before any operation, you must know your privilege level. "student" means a standard unprivileged user — you cannot read root-owned files or bind to ports below 1024. In a real pentest, knowing your access level defines your entire attack surface.',
        tipAr: 'معرفة مين إنت ده أول حاجة.. مش زي ما تبدأ تعمل حاجة وانت مش عارف صلاحياتك 😅',
    }),

    pwd: () => ({
        lines: ['/home/student/recon'],
        tipEn:
            'Always confirm your working directory before running scripts or saving files. A wrong directory can overwrite important data or run commands on the wrong target.',
        tipAr: 'اعرف إنت فين الأول.. مش زي اللي بيتوه في المول 🗺️',
    }),

    ls: (args) => {
        const detailed = args.some((a) => a.startsWith('-') && (a.includes('l') || a.includes('a')))
        return {
            lines: detailed
                ? [
                    'total 28',
                    'drwxr-xr-x  4 student student 4096 Feb 19 00:32 .',
                    'drwxr-xr-x 18 student student 4096 Feb 19 00:30 ..',
                    '-rw-------  1 student student  220 Feb 19 00:30 .bash_history',
                    '-rw-r--r--  1 student student 3526 Feb 19 00:30 .bashrc',
                    '-rw-r--r--  1 student student  807 Feb 19 00:30 .profile',
                    'drwxr-xr-x  2 student student 4096 Feb 19 00:32 target_notes/',
                    '-rw-r--r--  1 student student  512 Feb 19 00:31 recon_plan.txt',
                    '-rw-r--r--  1 student student  128 Feb 19 00:31 scope.txt',
                    '-rw-------  1 root    root      64 Feb 19 00:00 flag.txt',
                ]
                : ['target_notes/  recon_plan.txt  scope.txt'],
            tipEn: detailed
                ? 'File permission format: [type][owner][group][others]. "-rw-------" means only the owner can read/write. "flag.txt" is owned by root — you\'d need privilege escalation to read it. The dot-files are hidden by default and often contain sensitive config or history.'
                : 'ls without flags hides dotfiles and permission details. Always use `ls -la` during recon — you\'ll see hidden files, symlinks, and who owns what.',
            tipAr: detailed
                ? 'flag.txt بتاعة root.. يعني محتاج privesc عشان تقراها 🔐 دي مهارة لاحقة'
                : 'جرب `ls -la` عشان تشوف المخفي.. زي ما تشغّل الـ night mode 👀',
        }
    },

    cat: (args) => {
        const file = args[0]
        if (!file)
            return { lines: ['cat: missing file operand', 'Usage: cat <filename>'], isError: true }

        if (file === 'flag.txt')
            return {
                lines: ['cat: flag.txt: Permission denied'],
                tipEn:
                    "You are running as an unprivileged user. In real CTFs and pentests, 'Permission denied' on root-owned files means you need privilege escalation (sudo misconfigs, SUID binaries, kernel exploits). For now — go complete the Zoogle mission first!",
                tipAr: 'مش هتاخد الـ flag بالسهل! روح خلّص الـ Zoogle الأول 😏',
                isError: true,
            }

        if (file === 'recon_plan.txt')
            return {
                lines: [
                    '# EvilCorp Recon Plan',
                    '========================',
                    'Target:   evilcorp.com',
                    'Scope:    Web application + public IPs',
                    '',
                    'Step 1: Passive OSINT   → whois, nslookup, dig',
                    'Step 2: Google Dorks    → site:, inurl:, filetype:',
                    'Step 3: Header Analysis → curl -I',
                    'Step 4: Port Scanning   → nmap (Lab 02)',
                    'Step 5: Find admin page → Document everything',
                ],
                tipEn:
                    'A structured recon plan prevents scope creep and keeps you organized. Always define the target, enumerate public-facing services, then move to active probing. Jumping straight to exploitation without recon is like surgery without an X-ray.',
                tipAr: 'الخطة زي الـ GPS.. من غيرها هتتوه وتعمل حاجات برة الـ scope 🗺️',
            }

        if (file === 'scope.txt')
            return {
                lines: [
                    'PENTEST SCOPE — EvilCorp',
                    '========================',
                    'IN SCOPE:',
                    '  evilcorp.com       (web app)',
                    '  203.0.113.42       (primary server IP)',
                    '  203.0.113.43       (CDN edge IP)',
                    '',
                    'OUT OF SCOPE:',
                    '  *.thirdparty.com   (not our problem)',
                    '  Internal network   (not authorized)',
                    '',
                    'Authorized by: EvilCorp CISO — Feb 2025',
                ],
                tipEn:
                    'NEVER hack without a defined scope and written authorization. In a real engagement, going out-of-scope can get you arrested even if your intent was good. The scope document is your legal shield.',
                tipAr: 'من بره الـ scope = مشاكل قانونية.. حتى لو نيتك كانت كويسة 🚔',
            }

        return { lines: [`cat: ${file}: No such file or directory`], isError: true }
    },

    whois: (args) => {
        const domain = args[0] || 'evilcorp.com'
        return {
            lines: [
                `   Domain Name: ${domain.toUpperCase()}`,
                `   Registry Domain ID: D12345678-LROR`,
                `   Registrar: FakeRegistrar LLC`,
                `   Registrar URL: http://www.fakeregistrar.com`,
                `   Updated Date: 2024-11-15T08:30:00Z`,
                `   Creation Date: 2018-03-22T12:00:00Z`,
                `   Expiry Date: 2026-03-22T12:00:00Z`,
                `   Registrant Org: EvilCorp International Ltd.`,
                `   Registrant State: Delaware`,
                `   Registrant Country: US`,
                `   Name Server: ns1.evilcorp-dns.com`,
                `   Name Server: ns2.evilcorp-dns.com`,
                `   DNSSEC: unsigned`,
                ``,
                `>>> Last update of WHOIS database: 2025-02-19T00:00:00Z <<<`,
                ``,
                `[!] Key findings: Registrar exposed, No DNSSEC, Expires 2026`,
            ],
            tipEn:
                'WHOIS reveals domain ownership, registrar, nameservers, and key dates — all from a public database with zero footprint on the target. "No DNSSEC" means the domain is vulnerable to DNS spoofing. Note the expiry: domains close to expiry can be squatted.',
            tipAr: 'ده زي الـ Linkedin بتاع الدومين.. معلومات عامة بس مفيدة جداً 💼',
        }
    },

    nslookup: (args) => {
        const domain = args[0] || 'evilcorp.com'
        return {
            lines: [
                `Server:    8.8.8.8`,
                `Address:   8.8.8.8#53`,
                ``,
                `Non-authoritative answer:`,
                `Name:    ${domain}`,
                `Address: 203.0.113.42`,
                `Name:    ${domain}`,
                `Address: 203.0.113.43`,
                ``,
                `${domain}  mail exchanger = 10 mail.${domain}`,
                ``,
                `[!] Two A records found — possible load balancer or CDN`,
                `[!] MX record reveals: mail.${domain}`,
            ],
            tipEn:
                'Two IP addresses usually mean load balancing or a CDN sitting in front of the real server. The MX record reveals the mail server — a separate attack surface for phishing or SMTP enumeration. All of this from a completely passive query.',
            tipAr: 'IP تانية يعني في CDN أو Load Balancer.. والـ MX بيديك target للـ phishing 🎣',
        }
    },

    dig: (args) => {
        const domain = args[0] || 'evilcorp.com'
        return {
            lines: [
                `; <<>> DiG 9.18.1 <<>> ${domain}`,
                `; (1 server found)`,
                `;; ANSWER SECTION:`,
                `${domain}.    300  IN  A     203.0.113.42`,
                `${domain}.    300  IN  A     203.0.113.43`,
                ``,
                `;; ADDITIONAL DNS RECORDS:`,
                `${domain}.    300  IN  MX    10 mail.${domain}.`,
                `${domain}.    300  IN  TXT   "v=spf1 include:mailprovider.com ~all"`,
                `${domain}.    300  IN  NS    ns1.evilcorp-dns.com.`,
                `${domain}.    300  IN  NS    ns2.evilcorp-dns.com.`,
                ``,
                `;; Query time: 24 msec`,
                ``,
                `[!] SPF record found — mail provider exposed: mailprovider.com`,
            ],
            tipEn:
                'dig gives more detail than nslookup. The TXT SPF record reveals which email provider EvilCorp uses — useful for spear phishing campaigns. TTL of 300 seconds means records change frequently, which is harder to cache for attackers.',
            tipAr: 'الـ TXT record بيكشف mail provider.. معلومة ذهبية للـ phishing 📧',
        }
    },

    ping: (args) => {
        const host = args[0] || 'evilcorp.com'
        return {
            lines: [
                `PING ${host} (203.0.113.42) 56(84) bytes of data.`,
                `64 bytes from 203.0.113.42: icmp_seq=1 ttl=54 time=23.4 ms`,
                `64 bytes from 203.0.113.42: icmp_seq=2 ttl=54 time=24.1 ms`,
                `64 bytes from 203.0.113.42: icmp_seq=3 ttl=54 time=22.9 ms`,
                `64 bytes from 203.0.113.42: icmp_seq=4 ttl=54 time=23.7 ms`,
                ``,
                `--- ${host} ping statistics ---`,
                `4 packets transmitted, 4 received, 0% packet loss`,
                `rtt min/avg/max/mdev = 22.9/23.5/24.1/0.4 ms`,
                ``,
                `[!] TTL=54 → Likely Linux/Unix server`,
            ],
            tipEn:
                'TTL fingerprinting: Linux/Mac starts at 64 (arrives as ~54 after hops), Windows starts at 128. This tells you the OS without an active scan. Many hardened servers block ICMP — silence doesn\'t mean the host is down.',
            tipAr: 'TTL=54 يعني Linux.. لو كان 128 كان Windows. ده OS fingerprinting المجاني 🐧',
        }
    },

    traceroute: (args) => {
        const host = args[0] || 'evilcorp.com'
        return {
            lines: [
                `traceroute to ${host} (203.0.113.42), 30 hops max`,
                ` 1  gateway (192.168.1.1)        1.2 ms`,
                ` 2  isp-hop1.example.net          8.4 ms`,
                ` 3  isp-core.example.net         14.9 ms`,
                ` 4  cloudflare-edge1.net          18.2 ms`,
                ` 5  cloudflare-edge2.net          19.1 ms`,
                ` 6  * * *   (filtered)`,
                ` 7  203.0.113.42                 23.4 ms`,
                ``,
                `[!] Hop 4–5: Cloudflare CDN detected`,
                `[!] Hop 6: Firewall dropping ICMP`,
            ],
            tipEn:
                'Traceroute reveals the network path between you and the target. Cloudflare CDN hops mean the real server IP is hidden behind a CDN — direct IP targeting would hit Cloudflare, not the origin. The firewall at hop 6 is deliberately blocking traceroute probes.',
            tipAr: 'شوف Cloudflare في الـ path؟ يعني الـ IP الحقيقي مخبي ورا CDN 🛡️',
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
                    'tcp    0.0.0.0:80           LISTEN   (HTTP)',
                    'tcp    0.0.0.0:443          LISTEN   (HTTPS)',
                    'tcp    127.0.0.1:3306       LISTEN   (MySQL - localhost only)',
                    'tcp    127.0.0.1:6379       LISTEN   (Redis - localhost only)',
                    '',
                    '[!] MySQL & Redis exposed on localhost — potential pivot point',
                ]
                : ['Try: netstat -tuln   (show listening TCP/UDP ports)'],
            tipEn:
                'Open ports reveal running services. MySQL on 3306 and Redis on 6379 bound to localhost mean they\'re not directly reachable from the internet — but if you get a shell, they become your next target. SSH on 22 is a remote login service.',
            tipAr: 'MySQL وRedis على localhost يعني لو دخلت الجهاز هيبقى في targets تانية جاهزة 🎯',
        }
    },

    ip: (args) => {
        const sub = args[0]
        return {
            lines:
                sub === 'addr'
                    ? [
                        '1: lo: <LOOPBACK,UP>',
                        '   inet 127.0.0.1/8',
                        '2: eth0: <BROADCAST,MULTICAST,UP>',
                        '   inet 192.168.1.105/24 brd 192.168.1.255',
                        '   inet6 fe80::1a2b:3c4d:5e6f:7a8b/64',
                        '',
                        '[!] Your IP: 192.168.1.105 (private — behind NAT)',
                    ]
                    : ['Usage: ip addr   (show network interfaces and addresses)'],
            tipEn:
                'Knowing your own IP is essential for setting up reverse shells and listeners in later attack phases. The private address (192.168.x.x) means you\'re behind NAT — any incoming connection would need port forwarding or a relay.',
            tipAr: 'IP بتاعك مهم في الـ reverse shell.. بس لو ورا NAT محتاج ngrok أو relay 🔄',
        }
    },

    ifconfig: () => ({
        lines: [
            'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>',
            '      inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255',
            '      inet6 fe80::1a2b:3c4d:5e6f:7a8b  prefixlen 64',
            '      ether aa:bb:cc:dd:ee:ff  txqueuelen 1000',
            '',
            'lo: flags=73<UP,LOOPBACK,RUNNING>',
            '      inet 127.0.0.1  netmask 255.0.0.0',
        ],
        tipEn:
            'ifconfig is the older network interface command (replaced by `ip addr` in modern Linux). It shows your MAC address, IP, and subnet. The MAC address can sometimes be used to identify device vendors.',
        tipAr: 'ifconfig قديمة.. بس لسه شغالة وكتير من المقابلات بتسألها 👴',
    }),

    curl: (args) => {
        const fullArgs = args.join(' ')
        if (fullArgs.includes('blacklist-check.api')) {
            return {
                lines: [
                    '[{"ip": "203.0.113.42", "blacklist": "Spamhaus ZEN", "status": "LISTED"}, {"ip": "203.0.113.42", "blacklist": "Barracuda BRBL", "status": "CLEAN"}]',
                    '',
                    '[!] Target IP is listed on Spamhaus ZEN.'
                ],
                tipEn: 'Checking threat intel blacklists helps determine if the web server is already compromised or has a poor reputation.',
                tipAr: 'لو كان في البلاك ليست، ممكن يكون السيرفر ده بيتلعب فيه من بدري 🚯'
            }
        }
        if (fullArgs.includes('dev.evilcorp.com/flag')) {
            return {
                lines: [
                    '{ "status": "200 OK", "flag": "flag{d3v_3nv_3xp0s3d_2025}" }'
                ],
                tipEn: 'Development subdomains often leak sensitive data or flags because they lack the security hardening of production systems.',
                tipAr: 'بيئة التطوير دايماً مليانة مشاكل أمنية سهلة.. مبيأمنوهاش زي الأساسي 🛠️'
            }
        }
        if (fullArgs.includes('haveibeenpwned.com')) {
            return {
                lines: [
                    '[{"Name": "LinkedIn", "Domain": "linkedin.com", "BreachDate": "2012-05-05", "PwnCount": 164611595, "DataClasses": ["Email addresses", "Passwords"]}]',
                    '',
                    '[!] Found breach data for admin@evilcorp.com!'
                ],
                tipEn: 'Cross-referencing leaked emails with data breaches allows attackers to perform credential stuffing or password re-use attacks.',
                tipAr: 'نفس الباسورد في كل مكان؟ شكراً، هتتجاب من هنا 🔓'
            }
        }
        if (fullArgs.includes('-I') || fullArgs.includes('-i')) {
            return {
                lines: [
                    'HTTP/1.1 200 OK',
                    'Server: Apache/2.4.41 (Ubuntu)',
                    'X-Powered-By: PHP/7.4.3',
                    'Set-Cookie: PHPSESSID=e1c2d3a4b5f6; path=/',
                    'Connection: close',
                    '',
                    '[!] Tech stack fingerprint: Apache 2.4.41, PHP 7.4.3 (Ubuntu)'
                ],
                tipEn: '-I fetches only the headers. Banners like "X-Powered-By" openly reveal the technology stack, giving attackers a blueprint for exploits.',
                tipAr: 'الـ Hedears دي كنز بصري.. السيرفر بيقولك أنا بستخدم إيه بالظبط 🧠'
            }
        }
        return {
            lines: [
                '<!DOCTYPE html>',
                '<html><head><title>Access Denied</title></head>',
                '<body><h1>403 Forbidden</h1></body></html>'
            ],
            tipEn: 'By default curl performs a GET request and prints the response body.',
            tipAr: 'curl بيجيب محتوى الـ HTML بتاع الصفحة، بس احنا محتاجين معلومات أدق.'
        }
    },

    theharvester: () => ({
        lines: [
            '*******************************************************************',
            '*  theHarvester 4.4.4',
            '*  Program for gathering public emails, subdomains, and names.',
            '*******************************************************************',
            '[*] Target: evilcorp.com',
            '[*] Searching Google...',
            '[*] Searching LinkedIn...',
            '[*] Searching Bing...',
            '',
            '[+] Emails found:',
            'admin@evilcorp.com',
            'support@evilcorp.com',
            'karim.it@evilcorp.com',
            '',
            '[+] Hosts found:',
            '203.0.113.42: www.evilcorp.com',
            '203.0.113.43: dev.evilcorp.com',
        ],
        tipEn: 'theHarvester automates OSINT data collection across multiple search engines. Finding emails is critical for phishing and credential brute-forcing.',
        tipAr: 'الحصادة دي بتلم الإيميلات والسيرفرات من الـ Google وغيره أوتوماتيك 🌾'
    }),

    'hash-identifier': (args) => {
        const hash = args[0] || '5f4dcc3b5aa765d61d8327deb882cf99'
        return {
            lines: [
                '   #########################################################################',
                '   #     __  __                     __           ______    _____           #',
                '   #    /\\ \\/\\ \\                   /\\ \\         /\\__  _\\  /\\  _ `\\         #',
                '   #    \\ \\ \\_\\ \\     __      ____ \\ \\ \\___     \\/_/\\ \\/  \\ \\ \\/\\ \\        #',
                '   #     \\ \\  _  \\  /\'__`\\   / ,__\\ \\ \\  _ `\\      \\ \\ \\   \\ \\ \\ \\ \\       #',
                '   #      \\ \\ \\ \\ \\/\\ \\_\\ \\_/\\__, `\\ \\ \\ \\ \\ \\      \\_\\ \\__ \\ \\ \\_\\ \\      #',
                '   #       \\ \\_\\ \\_\\ \\___ \\_\\/\\____/  \\ \\_\\ \\_\\     /\\_____\\ \\ \\____/      #',
                '   #        \\/_/\\/_/\\/__/\\/_/\\/___/    \\/_/\\/_/     \\/_____/  \\/___/       #',
                '   #                                                                       #',
                '   #########################################################################',
                '',
                `Analyzing: ${hash}`,
                '[+] Possible Hashs:',
                '[+] MD5',
                '[+] Domain Cached Credentials - MD4(MD4(($pass)).(strtolower($username)))'
            ],
            tipEn: 'Knowing the hash algorithm is the first step to cracking it. MD5 is extremely weak and fast to crack.',
            tipAr: 'عشان تكسر الـ Hash لازم تعرف نوعه الأول.. الـ MD5 ده ضعيف جداً 🔨'
        }
    },

    submit_flag: (args) => {
        const flag = args[0]
        if (flag) {
            return {
                lines: [
                    '[=====================================================]',
                    ` Validating flag submission: ${flag}`,
                    '[=====================================================]',
                    '',
                    '[+] Success! Flag accepted. Mission objective verified.',
                ],
                tipEn: 'Flag submitted successfully!',
                tipAr: 'عاش! الـ Flag صح وتم الإرسال 🏆'
            }
        }
        return {
            lines: ['Usage: submit_flag <flag_value>'],
            isError: true
        }
    },

    history: () => ({
        lines: [
            '    1  whoami',
            '    2  pwd',
            '    3  ls -la',
            '    4  cat recon_plan.txt',
            '    5  cat scope.txt',
            '    6  whois evilcorp.com',
            '    7  nslookup evilcorp.com',
            '    8  dig evilcorp.com',
            '    9  ping evilcorp.com',
            '   10  traceroute evilcorp.com',
            '   11  netstat -tuln',
            '   12  curl -I evilcorp.com',
            '   13  cat flag.txt',
            '   14  history',
        ],
        tipEn:
            'Bash saves every command in ~/.bash_history. During a forensic investigation, this file is one of the first places analysts look. After a real pentest, always clear it: `history -c && history -w` — or better, use a dedicated ops environment.',
        tipAr: 'الـ history زي الـ chat history.. بيفضح! امسحه بعد كل engagement 🫣',
    }),

    clear: () => ({ lines: ['__CLEAR__'] }),
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TerminalSimulator({ currentStepId, onCommandRun }: Props) {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [cmdHistory, setCmdHistory] = useState<string[]>([])
    const [historyIdx, setHistoryIdx] = useState(-1)
    const [autoHint, setAutoHint] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const terminalBodyRef = useRef<HTMLDivElement>(null)

    // Scroll terminal body (not the page) to bottom after each command
    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
        }
    }, [history])

    // Autocomplete from all known commands
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

        // Notify parent of command run (for mission step tracking)
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

    // Current step hint (from mission tracker)
    const stepHint = currentStepId ? STEP_HINTS[currentStepId] : null

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
                        Cyber-Masry Recon Terminal v1.0 — Educational Simulation
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
                        Target: <span className="text-neon-orange">evilcorp.com</span>
                        {'  ·  '}Type{' '}
                        <span
                            className="text-neon-amber cursor-pointer hover:underline"
                            onClick={() => { setInput('help'); setTimeout(() => runCommand('help'), 50) }}
                        >
                            help
                        </span>{' '}
                        to see all commands.
                    </div>
                    <div className="font-cairo text-xs text-gray-600 italic pt-0.5">
                        يلا ابدأ التحقيق يا مسيو 🕵️
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
                                                : line.startsWith('[!')
                                                    ? 'text-neon-amber/70'
                                                    : 'text-gray-300'
                                                }`}
                                        >
                                            {parseWithGlossary(line, `${idx}-${li}`)}
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
                                                                {parseWithGlossary(entry.output.tipEn, `tip-${idx}`)}
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
                            aria-label="Terminal input"
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
