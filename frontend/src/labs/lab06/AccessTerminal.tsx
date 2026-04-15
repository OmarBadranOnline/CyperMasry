import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Lightbulb, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'

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
    onBonusAward?: (awardKey: string, points: number) => void
}

interface UiSignal {
    kind: 'success' | 'error'
    message: string
}

const PROMPT = 'analyst@soc-warz:~/rapid-access$'
const ALL_COMMANDS = ['help', 'whatweb', 'theharvester', 'hydra', 'grep', 'curl', 'cat', 'whoami', 'id', 'history', 'clear', 'submit_flag', 'bonus_q', 'bonus_answer']

const SIDE_QUESTIONS: Record<number, { question: string; answerHints: string[]; points: number }> = {
    1: {
        question: 'Side Q: Which weak header policy made first access easier?\nسؤال إضافي: أنهي سياسة في الهيدر سهّلت الدخول؟',
        answerHints: ['mfa', 'optional'],
        points: 5,
    },
    3: {
        question: 'Side Q: Why did spraying work quickly here?\nسؤال إضافي: ليه الـ spraying نجح بسرعة هنا؟',
        answerHints: ['weak password', 'reuse', 'credential'],
        points: 5,
    },
    6: {
        question: 'Side Q: What control blocks replayed cookies directly?\nسؤال إضافي: أنهي كنترول بيوقف replay للكوكي مباشرة؟',
        answerHints: ['session', 'invalidate', 'rotate'],
        points: 5,
    },
    9: {
        question: 'Side Q: What is the most important SOC output in this step?\nسؤال إضافي: أهم مخرج من SOC في الخطوة دي إيه؟',
        answerHints: ['evidence', 'flag', 'incident chain'],
        points: 5,
    },
}

const STEP_HINTS: Record<number, string> = {
    1: 'whatweb https://vault.evilcorp.local/login',
    2: 'theHarvester -d evilcorp.local -b all',
    3: 'hydra -L users.txt -P common.txt ssh://10.10.7.23',
    5: 'grep "stolen_token" captured_cookies.txt',
    6: 'curl -H "Cookie: session=stolen_token_77" https://vault.evilcorp.local/admin',
    8: 'whoami && id',
    9: 'cat /opt/soc/incident-flag.txt',
    10: 'submit_flag FLAG{rapid_access_movie_complete}',
}

function resolveTheme(stepId: number | null | undefined) {
    const step = stepId ?? 1
    if (step <= 3) {
        return {
            name: 'Recon',
            primary: '#22d3ee',
            secondary: '#a855f7',
            glow: 'rgba(34,211,238,0.3)',
        }
    }
    if (step <= 7) {
        return {
            name: 'Intrusion',
            primary: '#f43f5e',
            secondary: '#d946ef',
            glow: 'rgba(244,63,94,0.3)',
        }
    }
    return {
        name: 'Containment',
        primary: '#14b8a6',
        secondary: '#22d3ee',
        glow: 'rgba(20,184,166,0.3)',
    }
}

function explainLines(items: Array<{ line: string; ar?: string }>): string[] {
    const out: string[] = []
    for (const item of items) {
        out.push(item.line)
        if (item.ar) out.push(`→ ${item.ar}`)
    }
    return out
}

const COMMANDS: Record<string, (args: string[]) => CommandOutput> = {
    help: () => ({
        lines: explainLines([
            { line: '╔══════════════════════════════════════════════════════════════╗' },
            { line: '║ CYBER-MASRY RAPID ACCESS CINEMA TERMINAL                   ║', ar: 'ده اسم بيئة التمرين اللي شغالين عليها.' },
            { line: '║ [SIMULATED TRAINING ENV · ETHICAL USE ONLY]                ║', ar: 'اللعبة تعليمية بالكامل ومش هجوم حقيقي.' },
            { line: '║ [KALI-STYLED COMMANDS · NO REAL NETWORK EXECUTION]         ║', ar: 'الأوامر بشكل أدوات Kali لكن التنفيذ آمن ومحاكى 100%.' },
            { line: '╚══════════════════════════════════════════════════════════════╝' },
            { line: '' },
            { line: 'Available:', ar: 'دي الأوامر الأساسية اللي هتستخدمها.' },
            { line: '  whatweb <url>                                 Web fingerprint recon', ar: 'فحص بصمة الخدمة بشكل محاكى.' },
            { line: '  theHarvester -d <domain> -b all               Username discovery sim', ar: 'استخراج usernames محتملة بشكل آمن.' },
            { line: '  hydra -L users.txt -P common.txt ssh://<ip>   Controlled spray sim', ar: 'لاختبار كلمات سر ضعيفة بشكل محاكى.' },
            { line: '  grep "stolen_token" captured_cookies.txt      Token artifact filtering', ar: 'تصفية التوكنات الخطرة من ملف الأدلة.' },
            { line: '  cat <file>                                    Read evidence artifact', ar: 'لقراءة أدلة الحادثة من الملفات.' },
            { line: '  whoami && id                                  Privilege check', ar: 'لمعرفة هوية الحساب وصلاحياته.' },
            { line: '  submit_flag FLAG{...}                         Mission completion', ar: 'لتسليم الفلاج وإنهاء السيناريو.' },
            { line: '  bonus_q                                       Optional side question (+pts)', ar: 'سؤال إضافي اختياري لنقاط بونص.' },
            { line: '  bonus_answer <text>                           Answer side question', ar: 'جاوب السؤال الإضافي.' },
            { line: '  history                                       Show command history', ar: 'لمراجعة تسلسل الأوامر.' },
            { line: '  clear                                         Clear screen', ar: 'لمسح الشاشة.' },
        ]),
        tipAr: '→ دي أوامر اللاب السريع. امشي خطوة خطوة وما تستعجلش عشان تفهم سلسلة الاختراق.',
    }),
    history: () => ({
        lines: explainLines([
            { line: 'History is shown in terminal scrollback above.', ar: 'راجع اللي فوق عشان تشوف ترتيب خطوات السيناريو.' },
        ]),
        tipAr: '→ كل الأوامر اللي كتبتها فوق، راجعها وشوف ترتيب الهجوم كان ماشي إزاي.',
    }),
    clear: () => ({ lines: [] }),
    whoami: () => ({
        lines: explainLines([
            { line: 'svc-backup-admin', ar: 'ده اسم الحساب الحالي اللي تم الوصول له.' },
        ]),
        tipEn: 'Compromised identity appears to have elevated service permissions.',
        tipAr: '→ الحساب ده Service Account؛ غالباً بيكون عنده صلاحيات حساسة أكتر من اليوزر العادي.',
    }),
    id: () => ({
        lines: explainLines([
            { line: 'uid=1002(svc-backup-admin) gid=1002(svc-backup-admin) groups=1002,27(sudo),112(vault-admin)', ar: 'group sudo و vault-admin معناهم صلاحيات خطيرة.' },
        ]),
        tipEn: 'Membership in sudo/vault-admin groups indicates privileged blast radius.',
        tipAr: '→ وجوده في sudo و vault-admin يعني لو الحساب ده اتسرق فـ التأثير كبير جداً.',
    }),
    whatweb: (args) => {
        const raw = args.join(' ')
        const lower = raw.toLowerCase()
        if (lower.includes('vault.evilcorp.local/login')) {
            return {
                lines: explainLines([
                    { line: '[whatweb][sim] target: https://vault.evilcorp.local/login', ar: 'فحص WhatWeb بشكل محاكى بالكامل.' },
                    { line: 'server[nginx/1.22.1]', ar: 'نوع السيرفر وإصداره.' },
                    { line: 'x-auth-stack[legacy-sso]', ar: 'وجود stack قديم محتاج تحديث.' },
                    { line: 'x-rate-limit[20/min]', ar: 'معدل المحاولات محدود لكن مش قوي.' },
                    { line: 'x-mfa-policy[optional]', ar: 'الـ MFA اختياري وده نقطة ضعف مهمة.' },
                    { line: '' },
                    { line: '[intel] Simulated fingerprint indicates weak identity controls.', ar: 'التحليل المحاكى بيأكد ضعف ضوابط الهوية.' },
                ]),
                tipAr: '→ دي بصمة خدمة محاكية للتعلم فقط، بدون أي اتصال هجومي حقيقي.',
            }
        }
        return { lines: ['whatweb: simulated target not recognized.'], isError: true }
    },
    theharvester: (args) => {
        const raw = args.join(' ').toLowerCase()
        if (raw.includes('-d') && raw.includes('evilcorp.local') && raw.includes('-b') && raw.includes('all')) {
            return {
                lines: explainLines([
                    { line: '[theHarvester][sim] collecting public identity patterns...', ar: 'جمع أسماء بشكل محاكى من مصادر عامة.' },
                    { line: '[sim] usernames: omar.ops, sarah.it, mohamed.fin, admin.backup', ar: 'نتائج أسماء مستخدمين محتملة.' },
                    { line: '[sim] users.txt generated (4 entries)', ar: 'تم إنشاء users.txt بشكل آمن داخل اللاب.' },
                ]),
                tipAr: '→ نفس فكرة أدوات Kali لكن بدون أي خروج لشبكة خارجية.',
            }
        }
        return { lines: ['theHarvester: use -d evilcorp.local -b all in this simulation.'], isError: true }
    },
    curl: (args) => {
        const raw = args.join(' ')
        const lower = raw.toLowerCase()
        if (lower.includes('-h') && lower.includes('cookie:') && lower.includes('vault.evilcorp.local/admin')) {
            return {
                lines: explainLines([
                    { line: 'HTTP/2 200', ar: 'الطلب نجح وتم قبول الوصول.' },
                    { line: 'x-session-state: replay-accepted', ar: 'السيرفر قبل إعادة استخدام التوكن.' },
                    { line: 'x-user: omar.ops', ar: 'الجلسة الممسوكة تخص المستخدم ده.' },
                    { line: '' },
                    { line: '{"panel":"admin","status":"granted","scope":"finance,ops,secrets"}', ar: 'النتيجة بتأكد إن الوصول كان على لوحة الأدمن.' },
                    { line: '' },
                    { line: '[alert] Session replay success — unauthorized admin access simulated.', ar: 'دي محاكاة واضحة لحالة Account Takeover.' },
                ]),
                tipEn: 'Token replay worked because session binding/rotation controls are weak.',
                tipAr: '→ نجاح replay معناه الـ session متربطتش بجهاز أو IP، فالتوكن المسروق قدر يفتح الأدمن.',
            }
        }

        return { lines: ['curl: simulated target not recognized. Use help for mission commands.'], isError: true }
    },
    hydra: (args) => {
        const raw = args.join(' ').toLowerCase()
        if (raw.includes('-l users.txt') && raw.includes('-p common.txt') && raw.includes('ssh://10.10.7.23')) {
            return {
                lines: explainLines([
                    { line: '[SIM] Launching controlled credential spray...', ar: 'بدأ اختبار كلمات المرور بشكل محاكى.' },
                    { line: '[22][ssh] host: 10.10.7.23 login: omar.ops password: Winter2026!', ar: 'تم العثور على بيانات دخول صحيحة.' },
                    { line: '[SIM] 1 valid pair recovered; account has elevated role.', ar: 'الحساب المكتشف له صلاحيات مرتفعة.' },
                ]),
                tipEn: 'One weak password can be enough for full compromise when role design is weak.',
                tipAr: '→ Password واحدة ضعيفة على حساب مهم ممكن تفتح سلسلة اختراق كاملة.',
            }
        }
        return { lines: ['hydra: unsupported syntax for this simulation step.'], isError: true }
    },
    grep: (args) => {
        const query = args.join(' ').toLowerCase()
        if (query.includes('stolen_token') && query.includes('captured_cookies.txt')) {
            return {
                lines: explainLines([
                    { line: 'cookie_1=session=stolen_token_77; user=omar.ops; source=phish-kit', ar: 'توكن مسروق من حملة تصيد ومازال مهم.' },
                    { line: '[soc] token_77 still active for admin route.', ar: 'الـ token 77 لسه فعال ويقدر يفتح أدمن.' },
                ]),
                tipEn: 'Active stolen sessions can bypass password controls entirely.',
                tipAr: '→ طول ما التوكن شغال، المهاجم مش محتاج باسورد أصلاً.',
            }
        }
        return { lines: ['grep: use grep "stolen_token" captured_cookies.txt in this step.'], isError: true }
    },
    cat: (args) => {
        const target = args.join(' ').trim()
        if (target === '/opt/soc/incident-flag.txt') {
            return {
                lines: explainLines([
                    { line: '=== FORENSIC EVIDENCE ===', ar: 'ده ملف الدليل الجنائي الرسمي.' },
                    { line: 'Incident chain validated: weak creds -> token replay -> admin access', ar: 'السلسلة اتأكدت بالكامل من أول ضعف لحد وصول الأدمن.' },
                    { line: 'FLAG{rapid_access_movie_complete}', ar: 'ده الفلاج النهائي اللي لازم يتسلم.' },
                ]),
                tipAr: '→ الدليل الجنائي أكد السلسلة كاملة: كلمة سر ضعيفة ثم خطف session ثم وصول أدمن.',
            }
        }
        return { lines: [`cat: ${target}: No such simulated file`], isError: true }
    },
    submit_flag: (args) => {
        const value = args.join(' ').trim()
        if (value === 'FLAG{rapid_access_movie_complete}') {
            return {
                lines: explainLines([
                    { line: '[accepted] Mission flag validated. Excellent incident-analysis flow.', ar: 'تم قبول الفلاج وإغلاق المهمة بنجاح.' },
                ]),
                tipAr: '→ ممتاز! كده أنت قفلت السيناريو صح وفهمت تسلسل الحادثة بالكامل.',
            }
        }
        return {
            lines: explainLines([
                { line: '[rejected] Wrong flag format or value.', ar: 'الفلاج المدخل مش مطابق للمطلوب.' },
            ]),
            isError: true,
            tipAr: '→ الفلاج غلط. راجع خطوة الدليل الجنائي وانسخ الفلاج بنفس الصيغة.',
        }
    },
}

export default function AccessTerminal({ currentStepId, onCommandRun, onBonusAward }: Props) {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<HistoryEntry[]>([
        {
            input: '',
            showTip: false,
            output: {
                lines: [
                    'SOC War-Room // Rapid Access Simulation',
                    'Type `help` to view commands. This lab is fully simulated.',
                ],
            },
        },
    ])
    const [commandHistory, setCommandHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState<number | null>(null)
    const [uiSignal, setUiSignal] = useState<UiSignal | null>(null)
    const [commandPulse, setCommandPulse] = useState(0)
    const [answeredSideQuestions, setAnsweredSideQuestions] = useState<Record<number, true>>({})
    const scrollRef = useRef<HTMLDivElement>(null)
    const theme = resolveTheme(currentStepId)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history])

    useEffect(() => {
        if (!uiSignal) return
        const timeout = setTimeout(() => setUiSignal(null), 1500)
        return () => clearTimeout(timeout)
    }, [uiSignal])

    const runCommand = (raw: string) => {
        const cmd = raw.trim()
        if (!cmd) return
        onCommandRun?.(cmd)
        setCommandHistory((prev) => [...prev, cmd])
        setHistoryIndex(null)

        const parts = cmd.split(/\s+/)
        const name = parts[0].toLowerCase()
        const args = parts.slice(1)

        if (name === 'clear') {
            setHistory([])
            setInput('')
            return
        }

        const sideQuestion = currentStepId ? SIDE_QUESTIONS[currentStepId] : undefined
        let output: CommandOutput

        if (name === 'bonus_q') {
            if (!currentStepId || !sideQuestion) {
                output = { lines: ['No optional side question for this step yet.'], isError: true }
            } else if (answeredSideQuestions[currentStepId]) {
                output = {
                    lines: explainLines([
                        { line: '[bonus] Side question already solved in this step.', ar: 'السؤال الإضافي اتحل بالفعل في الخطوة دي.' },
                    ]),
                }
            } else {
                output = {
                    lines: explainLines([
                        { line: `[bonus +${sideQuestion.points}] ${sideQuestion.question}` },
                        { line: 'Use: bonus_answer <your short answer>', ar: 'اكتب إجابة قصيرة بعد الأمر bonus_answer.' },
                    ]),
                    tipAr: '→ فرصة نقاط إضافية: جاوب صح قبل ما تكمّل الخطوة.',
                }
            }
        } else if (name === 'bonus_answer') {
            if (!currentStepId || !sideQuestion) {
                output = { lines: ['bonus_answer: no active side question in this step.'], isError: true }
            } else if (answeredSideQuestions[currentStepId]) {
                output = { lines: ['bonus_answer: this side question is already completed.'], isError: true }
            } else {
                const attempt = args.join(' ').toLowerCase()
                const isCorrect = sideQuestion.answerHints.some((hint) => attempt.includes(hint))
                if (!isCorrect) {
                    output = {
                        lines: explainLines([
                            { line: '[bonus] Not quite. Try linking your answer to the core security root cause.', ar: 'لسه مش دقيقة. اربط إجابتك بسبب الأمان الأساسي.' },
                        ]),
                        isError: true,
                    }
                } else {
                    output = {
                        lines: explainLines([
                            { line: `[bonus accepted] +${sideQuestion.points} pts awarded.`, ar: 'إجابة صحيحة! اتضافت نقاط إضافية.' },
                        ]),
                        tipAr: '→ ممتاز! دي نقاط نشاط إضافي فوق نقاط الخطوات الأساسية.',
                    }
                    setAnsweredSideQuestions((prev) => ({ ...prev, [currentStepId]: true }))
                    onBonusAward?.(`side-question-step-${currentStepId}`, sideQuestion.points)
                }
            }
        } else {
            const handler = COMMANDS[name]
            output = handler
                ? handler(args)
                : { lines: [`${name}: command not found. Type help.`], isError: true }
        }

        if (output.isError && !output.tipAr) {
            output = {
                ...output,
                tipAr: '→ الأمر ده مش مناسب للخطوة الحالية. استخدم التلميح اللي فوق أو اكتب help.',
            }
        }
        setCommandPulse((p) => p + 1)
        setUiSignal(
            output.isError
                ? { kind: 'error', message: 'Command failed in simulation context.' }
                : { kind: 'success', message: 'Command executed and output captured.' }
        )

        setHistory((prev) => [
            ...prev,
            { input: cmd, output, showTip: Boolean(output.tipEn || output.tipAr) },
        ])
        setInput('')
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') runCommand(input)
        if (e.key === 'ArrowUp' && commandHistory.length > 0) {
            e.preventDefault()
            const next = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
            setHistoryIndex(next)
            setInput(commandHistory[next])
        }
        if (e.key === 'ArrowDown' && commandHistory.length > 0) {
            e.preventDefault()
            if (historyIndex === null) return
            const next = Math.min(commandHistory.length, historyIndex + 1)
            if (next === commandHistory.length) {
                setHistoryIndex(null)
                setInput('')
            } else {
                setHistoryIndex(next)
                setInput(commandHistory[next])
            }
        }
        if (e.key === 'Tab') {
            e.preventDefault()
            const candidates = ALL_COMMANDS.filter((c) => c.startsWith(input.toLowerCase()))
            if (candidates.length === 1) setInput(candidates[0])
        }
    }

    const currentHint = currentStepId ? STEP_HINTS[currentStepId] : undefined

    return (
        <motion.div
            className="h-full bg-[#08070f] relative"
            animate={{
                boxShadow: `inset 0 0 80px ${theme.glow}`,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl"
                    style={{ backgroundColor: `${theme.secondary}24` }}
                    animate={{ x: [0, 24, 0], y: [0, -12, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
                    style={{ backgroundColor: `${theme.primary}22` }}
                    animate={{ x: [0, -18, 0], y: [0, 14, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    key={commandPulse}
                    className="absolute inset-0"
                    initial={{ opacity: 0.22 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ background: `radial-gradient(circle at 50% 50%, ${theme.primary}33 0%, transparent 60%)` }}
                />
            </div>

            <div className="relative h-full flex flex-col border border-fuchsia-400/20">
                <div className="px-4 py-2 border-b border-fuchsia-400/20 bg-black/30 flex items-center justify-between">
                    <span className="font-mono text-xs text-fuchsia-300">Rapid Access Console</span>
                    <span className="font-mono text-xs text-cyan-300">{`SIMULATION // ${theme.name.toUpperCase()} DRILL`}</span>
                </div>

                <AnimatePresence>
                    {uiSignal && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className={`px-4 py-2 border-b text-xs font-mono flex items-center gap-2 ${uiSignal.kind === 'success'
                                ? 'bg-emerald-500/10 border-emerald-300/20 text-emerald-200'
                                : 'bg-red-500/10 border-red-300/20 text-red-200'
                                }`}
                        >
                            {uiSignal.kind === 'success' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            <span>{uiSignal.message}</span>
                            <Sparkles size={11} className="ml-auto opacity-70" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {currentHint && (
                    <div className="px-4 py-2 border-b border-cyan-400/20 bg-cyan-500/5">
                        <div className="flex items-start gap-2">
                            <Lightbulb size={12} className="text-cyan-300 mt-0.5" />
                            <div>
                                <p className="font-mono text-xs text-cyan-200/90">Suggested command</p>
                                <code className="font-mono text-xs text-fuchsia-200 break-all">{currentHint}</code>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                    {history.map((entry, idx) => (
                        <div key={idx} className="space-y-2">
                            {entry.input && (
                                <div className="text-cyan-300">
                                    <span className="text-fuchsia-300">{PROMPT}</span> {entry.input}
                                </div>
                            )}
                            {entry.output && (
                                <motion.div
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={entry.output.isError ? 'text-red-400' : 'text-cyan-100'}
                                >
                                    {entry.output.lines.map((line, i) => (
                                        <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
                                    ))}
                                    {entry.output.tipAr && (
                                        <div className={`mt-1 font-cairo text-xs ${entry.output.isError ? 'text-red-300/90' : 'text-cyan-300/90'}`}>
                                            {entry.output.tipAr}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            <AnimatePresence>
                                {entry.showTip && entry.output?.tipEn && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/5 p-2"
                                    >
                                        <div className="flex items-start gap-2">
                                            <Info size={12} className="text-fuchsia-300 mt-0.5" />
                                            <div>
                                                <p className="font-mono text-xs text-fuchsia-200">{entry.output.tipEn}</p>
                                                {entry.output.tipAr && (
                                                    <p className="font-cairo text-xs text-cyan-300/80 mt-1">{entry.output.tipAr}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="border-t border-fuchsia-400/20 p-3 bg-black/40">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-fuchsia-300">{PROMPT}</span>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            className="flex-1 bg-transparent outline-none font-mono text-sm text-cyan-100 placeholder:text-gray-600"
                            placeholder="type command..."
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
