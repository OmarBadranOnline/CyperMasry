import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { MissionStep } from '../hooks/useMissionProgress'

// ─── Per-step messages keyed by labId ────────────────────────────────────────
const LAB_STEP_MESSAGES: Record<number, Record<number, { ar: string; en: string }>> = {
    1: {
        1: { ar: 'أهلاً يا كابتن! 👋 الخطوة الأولى: اعرف إنت مين. اكتب whoami في التيرمنال.', en: 'Step 1: Identify your user. Type whoami in the Terminal.' },
        2: { ar: 'ممتاز! 🎉 دور على صاحب الدومين. اكتب whois evilcorp.com.', en: 'Step 2: Query the domain registry with whois.' },
        3: { ar: 'كويس! 💪 استخدم nslookup عشان تحوّل الدومين لـ IP.', en: 'Step 3: Resolve the domain to its IP with nslookup.' },
        4: { ar: 'جميل! 🔍 استخدم curl لتشوف الـ HTTP Headers.', en: 'Step 4: Fingerprint the tech stack with HTTP headers.' },
        5: { ar: 'يلا للـ Zoogle! 🔍 اكتب "admin" وشوف ليه البحث العام مش بيجيب حاجة.', en: 'Step 5: Switch to Zoogle and see why broad searches fail.' },
        6: { ar: 'شاطر! 👏 استخدم site:evilcorp.com عشان تحصر البحث.', en: 'Step 6: Use the site: operator to narrow results.' },
        7: { ar: 'تمام! 🎯 اجمع site: و inurl:admin عشان تلاقي لوحة التحكم.', en: 'Step 7: Combine site: and inurl: to find the admin panel.' },
        8: { ar: '🔓 اضغط على الرابط الأخضر وخد الـ flag يا بطل!', en: 'Step 8: Click the green link to capture the flag!' },
    },
    2: {
        1: { ar: 'الـ Nmap بيدق على الـ ports! 🔭 ابدأ بـ nmap 192.168.1.5 عشان تشوف البورتات المفتوحة.', en: 'Step 1: Basic Nmap scan — discover open ports.' },
        2: { ar: 'ناعم! ✅ دلوقتي اعرف version كل service. أضف -sV للأمر.', en: 'Step 2: Add -sV to detect service versions.' },
        3: { ar: 'كويس! 🎯 بدل ما تسكن كل البورتات، حدّد البورتات المهمة بـ -p.', en: 'Step 3: Target specific ports with the -p flag.' },
        4: { ar: '-O بيحدّد نظام التشغيل! 🖥️ أضفه للأمر.', en: 'Step 4: OS fingerprint with -O flag.' },
        5: { ar: '-A يطلع كل حاجة دفعة واحدة! 💥 جرّبه.', en: 'Step 5: Aggressive scan with -A.' },
        6: { ar: '-p- بيسكن كل الـ 65535 port! 🌊 لازم يوقت أكتر.', en: 'Step 6: Full port scan with -p- (all 65535 ports).' },
        7: { ar: 'UDP بيجيب ستتات تانية! 📡 استخدم -sU.', en: 'Step 7: UDP scan — discover UDP services.' },
        8: { ar: '-T4 -F يعمل fast scan! ⚡ مفيد للوقت المحدود.', en: 'Step 8: Fast scan with -T4 -F.' },
        9: { ar: 'NSE scripts! 🔍 --script vuln بيدور على CVEs مباشرة.', en: 'Step 9: Run NSE vuln scripts to find CVEs.' },
        10: { ar: 'Host discovery! 🌐 -sn بيعمل ping sweep للـ subnet كلها.', en: 'Step 10: Ping sweep with -sn to map live hosts.' },
    },
    3: {
        1: { ar: 'Gobuster بيدق على كل path! 📁 ابدأ بـ gobuster dir على الـ target.', en: 'Step 1: Run Gobuster dir scan to find hidden paths.' },
        2: { ar: 'أضف -x php,html عشان تلاقي ملفات مخفية! 🕵️', en: 'Step 2: Add -x to search for file extensions.' },
        3: { ar: 'Wordlist خاصة للـ admin paths! 🔑 جرّب wordlist مختلفة.', en: 'Step 3: Use an admin-specific wordlist.' },
        4: { ar: '-v بيكشف الـ 403 Forbidden! 🚫 اللي بياخد 403 مش فاضي يعني.', en: 'Step 4: Verbose mode shows 403 responses too.' },
        5: { ar: '-t threads بتتحكم في السرعة. سرعة عالية = ضوضاء عالية! 🔊', en: 'Step 5: Threading controls speed — more threads = louder.' },
        6: { ar: 'DNS mode! 🌐 gobuster dns بيلاقي subdomains.', en: 'Step 6: DNS subdomain enumeration with Gobuster.' },
        7: { ar: 'API endpoints! 🔌 /api/ path مهمة جداً في تطبيقات الـ REST.', en: 'Step 7: Enumerate API endpoints.' },
        8: { ar: '.bak files! 💾 ملفات الـ backup ممكن تحتوي source code أو passwords.', en: 'Step 8: Hunt .bak backup files.' },
        9: { ar: '--delay يخليك stealth! 🥷 بتبطّأ الـ requests عشان ما تتلاحقش.', en: 'Step 9: Stealth mode with --delay.' },
        10: { ar: '-o بيحفظ النتايج! 📝 لازم تكون عندك report في نهاية كل pentest.', en: 'Step 10: Save results to a file with -o.' },
    },
    4: {
        1: { ar: 'فلتة واحدة " تكسر كل حاجة! 💉 ابدأ بـ single quote وشوف لو في error.', en: "Step 1: Test with a single quote ' to trigger SQL errors." },
        2: { ar: "OR '1'='1 بيعمل bypass! ✅ الـ WHERE بتاعة الـ SQL دايماً true.", en: "Step 2: Classic auth bypass — OR '1'='1 always true." },
        3: { ar: "admin'-- بيشيل الـ password check بالكامل! 💬 -- تعليق في SQL.", en: "Step 3: Comment injection with admin'-- removes password check." },
        4: { ar: 'ORDER BY بيعدّ الـ columns! 🔢 ارفع الرقم لحد ما يغلط.', en: 'Step 4: ORDER BY — count columns for UNION attack.' },
        5: { ar: 'UNION SELECT بيسرّب data! 📊 version() بيجيب version الـ database.', en: 'Step 5: UNION SELECT — extract version() from the DB.' },
        6: { ar: 'information_schema دليل تليفونات الـ database! 📚 بيجيب كل اسم table.', en: 'Step 6: Query information_schema to list all tables.' },
        7: { ar: 'نسرّب الـ credentials! 🔓 concat بيجمع username و password.', en: 'Step 7: Dump credentials with concat(username,password).' },
        8: { ar: '32 حرف = MD5! 🔓 MD5 مكسور تماماً من 2005.', en: 'Step 8: Measure hash length to identify the algorithm.' },
        9: { ar: 'LOAD_FILE بيقرأ أي ملف على السيرفر! 📄 /etc/passwd كنز من المعلومات.', en: 'Step 9: LOAD_FILE to read files from the server.' },
        10: { ar: 'INTO OUTFILE + PHP shell = RCE! 💀 أخطر سيناريو في SQLi.', en: 'Step 10: Write a PHP web shell via INTO OUTFILE → RCE!' },
    },
    5: {
        1: { ar: 'nc port 80 يجيبلك HTTP banner! 🌐 السيرفر بيحكيلك version بتاعته.', en: 'Step 1: nc port 80 — grab the HTTP server banner.' },
        2: { ar: 'nc port 22 بيكشف OpenSSH version! 🔐 ومعاها CVEs جاهزة.', en: 'Step 2: nc port 22 — SSH banner reveals OpenSSH version + CVEs.' },
        3: { ar: 'nc port 21 FTP! 📁 لو anonymous login شغال = مشكلة كبيرة.', en: 'Step 3: nc port 21 — FTP banner, check for anonymous login.' },
        4: { ar: 'curl -I بيجيب HTTP headers! 🔍 X-Powered-By مش المفروض يكون موجود.', en: 'Step 4: curl -I to inspect HTTP response headers.' },
        5: { ar: 'Telnet في 2026 = كارثة! 📡 كل كلمة سر بتتبعت plaintext.', en: 'Step 5: Telnet sends passwords in plaintext — critical finding.' },
        6: { ar: 'searchsploit apache 2.4.38 يجيبلك CVEs مباشرة! 🔴 CVE-2019-0211 CVSS 7.8.', en: 'Step 6: searchsploit Apache 2.4.38 — find known CVEs.' },
        7: { ar: 'searchsploit openssh يجيب CVE-2018-15473 username enum! ⏱️ timing attack.', en: 'Step 7: searchsploit OpenSSH — username enumeration CVE.' },
        8: { ar: 'nc port 25 SMTP! 📧 VRFY command بيأكد أسماء المستخدمين.', en: 'Step 8: nc port 25 — SMTP VRFY user enumeration.' },
        9: { ar: 'WhatWeb بيشوف كل technology دفعة واحدة! 🔮 CMS + framework + version.', en: 'Step 9: WhatWeb — one-shot web tech fingerprint.' },
        10: { ar: 'Nikto بيعمل فحص شامل! 🏁 phpMyAdmin + backup + phpinfo = كنز.', en: 'Step 10: Nikto — full automated web vulnerability scan.' },
    },
}

const GENERAL_TIPS = [
    { ar: 'تذكر: كل حاجة هنا محاكاة للتعليم بس. مفيش اتصال حقيقي بأي سيرفر. 🛡️', en: 'Tip: this is 100% simulated — no real connections.' },
    { ar: 'لو نسيت أمر، اضغط على hint في الأسفل أو افتح الـ assistant! 😄', en: 'Forgot a command? Check the hint banner or open me!' },
    { ar: 'في الـ CTF الحقيقية الـ flag بيكون زي FLAG{...}. اتعود على الشكل ده. 🚩', en: 'In real CTFs, flags follow the FLAG{...} format.' },
    { ar: 'الـ OSINT هو أهم مرحلة في الـ pentest. معلومة كويسة بتوفر وقت كتير. 🕵️', en: 'OSINT is the most valuable recon phase — information saves time.' },
    { ar: 'سجّل كل حاجة بتعملها — التقرير هو نص الـ pentest كمان! 📝', en: "Document everything — the report is half of pentesting's value." },
]

interface Props {
    currentStepId: number | null
    steps: MissionStep[]
    allComplete: boolean
    labId?: number
}

export default function FloatingAssistant({ currentStepId, steps, allComplete, labId = 1 }: Props) {
    const [open, setOpen] = useState(false)
    const [tipIdx, setTipIdx] = useState(0)
    const [showBubble, setShowBubble] = useState(true)
    const [tipsExpanded, setTipsExpanded] = useState(false)
    const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>()

    // Current contextual message — looks up the per-lab, per-step table
    const labMessages = LAB_STEP_MESSAGES[labId] ?? LAB_STEP_MESSAGES[1]
    const currentMsg = currentStepId
        ? labMessages[currentStepId]
        : allComplete
            ? {
                ar: 'مبروووك! 🏆 أنهيت المهمة يا وحش! اللاب خلص والـ points اتحسبت.',
                en: 'Mission complete! Well done — lab finished.',
            }
            : GENERAL_TIPS[tipIdx]

    // Auto pop-up the bubble when step changes
    useEffect(() => {
        setShowBubble(true)
        clearTimeout(bubbleTimerRef.current)
        bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 6000)
        return () => clearTimeout(bubbleTimerRef.current)
    }, [currentStepId])

    // Rotate tips when no active step
    useEffect(() => {
        if (currentStepId) return
        const t = setInterval(() => setTipIdx((i) => (i + 1) % GENERAL_TIPS.length), 8000)
        return () => clearInterval(t)
    }, [currentStepId])

    const completedSteps = steps.filter((s) => s.completed)

    return (
        <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-3">

            {/* Auto-pop attention bubble */}
            <AnimatePresence>
                {showBubble && !open && currentMsg && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="max-w-[260px] bg-dark-card border border-neon-amber/50 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl cursor-pointer select-none"
                        style={{ boxShadow: '0 0 20px rgba(255,191,0,0.15)' }}
                        onClick={() => { setOpen(true); setShowBubble(false) }}
                    >
                        <p className="font-cairo text-xs text-neon-amber/90 leading-relaxed">{currentMsg.ar}</p>
                        <p className="font-mono text-xs text-gray-600 mt-1">{currentMsg.en}</p>
                        <p className="font-mono text-xs text-gray-700 mt-1.5">↗ Click for more details</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-80 bg-dark-card border border-neon-amber/40 rounded-2xl shadow-2xl overflow-hidden"
                        style={{ boxShadow: '0 0 30px rgba(255,191,0,0.12)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border bg-neon-amber/5">
                            <div className="w-8 h-8 rounded-full bg-neon-amber/20 border border-neon-amber/40 flex items-center justify-center text-base flex-shrink-0">
                                🤖
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-mono text-xs font-bold text-neon-amber">Cyber-Masry Bot</p>
                                <p className="font-cairo text-xs text-gray-500 truncate">مساعدك الذكي في الـ Lab 🕵️</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <X size={13} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

                            {/* Current step / tip message */}
                            {currentMsg && (
                                <div className="bg-neon-amber/5 border border-neon-amber/20 rounded-xl p-3">
                                    <p className="font-cairo text-sm text-neon-amber/90 leading-relaxed">{currentMsg.ar}</p>
                                    <p className="font-mono text-xs text-gray-500 mt-1.5 leading-relaxed">{currentMsg.en}</p>
                                </div>
                            )}

                            {/* Quick tips list (collapsible) */}
                            <div>
                                <button
                                    onClick={() => setTipsExpanded((p) => !p)}
                                    className="flex items-center gap-1.5 font-mono text-xs text-gray-500 hover:text-neon-amber transition-colors"
                                >
                                    {tipsExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    Quick reminders
                                </button>
                                <AnimatePresence>
                                    {tipsExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-2 space-y-1.5">
                                                {GENERAL_TIPS.map((tip, i) => (
                                                    <div key={i} className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2">
                                                        <p className="font-cairo text-xs text-gray-400 leading-relaxed">{tip.ar}</p>
                                                        <p className="font-mono text-xs text-gray-600 mt-0.5">{tip.en}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Completed steps badges */}
                            {completedSteps.length > 0 && (
                                <div className="border-t border-dark-border pt-3">
                                    <p className="font-mono text-xs text-gray-500 mb-2">
                                        ✅ {completedSteps.length} step{completedSteps.length > 1 ? 's' : ''} complete
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {completedSteps.map((s) => (
                                            <span
                                                key={s.id}
                                                className="font-mono text-xs bg-neon-green/10 border border-neon-green/30 text-neon-green/70 px-2 py-0.5 rounded-full"
                                                title={s.objective}
                                            >
                                                #{s.id} {s.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                onClick={() => { setOpen((p) => !p); setShowBubble(false) }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-dark-card border-2 border-neon-amber/60 flex items-center justify-center text-2xl shadow-2xl relative"
                style={{ boxShadow: '0 0 20px rgba(255,191,0,0.2)' }}
                aria-label="Open assistant"
            >
                {open ? '✕' : '🤖'}
                {/* Unread dot when bubble is waiting */}
                {!open && showBubble && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-orange border-2 border-dark-bg"
                    />
                )}
            </motion.button>
        </div>
    )
}
