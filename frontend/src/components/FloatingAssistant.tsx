import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { MissionStep } from '../hooks/useMissionProgress'

// ─── Per-step messages ────────────────────────────────────────────────────────
const STEP_MESSAGES: Record<number, { ar: string; en: string }> = {
    1: {
        ar: 'أهلاً يا كابتن! 👋 الخطوة الأولى: اعرف إنت مين. اكتب whoami في التيرمنال وشوف إنت بتشتغل بصلاحيات إيه.',
        en: 'Step 1: Identify your user. Type whoami in the Terminal.',
    },
    2: {
        ar: 'ممتاز! 🎉 دلوقتي دور على صاحب الدومين. اكتب whois evilcorp.com عشان تشوف بيانات التسجيل.',
        en: 'Step 2: Query the domain registry with whois.',
    },
    3: {
        ar: 'كويس أوي! 💪 دلوقتي بدّل الاسم لعنوان IP. استخدم nslookup عشان تعرف سيرفراتهم.',
        en: 'Step 3: Resolve the domain to its IP with nslookup.',
    },
    4: {
        ar: 'جميل! 🔍 الخطوة دي مهمة جداً. استخدم curl لتشوف الـ HTTP Headers اللي بتكشف تكنولوجيا السيرفر.',
        en: 'Step 4: Finger-print the tech stack with HTTP headers.',
    },
    5: {
        ar: 'يلا ننتقل للـ Zoogle! 🔍 اكتب فقط "admin" وشوف ليه البحث العام مش بيجيب حاجة مفيدة.',
        en: 'Step 5: Switch to Zoogle and see why broad searches fail.',
    },
    6: {
        ar: 'شاطر! 👏 دلوقتي استخدم site:evilcorp.com عشان تحصر البحث في الدومين بتاعنا بس.',
        en: 'Step 6: Use the site: operator to narrow results.',
    },
    7: {
        ar: 'تمام! 🎯 الآن جمّع الـ operators. اكتب site:evilcorp.com inurl:admin عشان تلاقي لوحة التحكم.',
        en: 'Step 7: Combine site: and inurl: to find the admin panel.',
    },
    8: {
        ar: '🔓 اضغط على الرابط الأخضر اللي فوق! اللي عليه قفل مفتوح. روح خدّ الـ flag يا بطل!',
        en: 'Step 8: Click the green link to capture the flag!',
    },
}

const GENERAL_TIPS = [
    { ar: 'تذكر: كل حاجة هنا محاكاة للتعليم بس. مفيش اتصال حقيقي بأي سيرفر. 🛡️', en: 'Tip: this is 100% simulated — no real connections.' },
    { ar: 'لو نسيت أمر، دوس على hint في الأسفل أو افتح الـ assistant! 😄', en: 'Forgot a command? Check the hint banner or open me!' },
    { ar: 'الـ Google Dorks دي مش هاكينج — دي بحث عادي بـ operators خاصة. 100% قانوني. ✅', en: 'Google Dorks are just advanced searches — perfectly legal.' },
    { ar: 'في الـ CTF الحقيقية الـ flag بيكون زي FLAG{...}. اتعود على الشكل ده. 🚩', en: 'In real CTFs, flags follow the FLAG{...} format.' },
    { ar: 'الـ OSINT هو أهم مرحلة في الـ pentest. معلومة كويسة بتوفر وقت كتير. 🕵️', en: 'OSINT is the most valuable recon phase — information saves time.' },
]

interface Props {
    currentStepId: number | null
    steps: MissionStep[]
    allComplete: boolean
}

export default function FloatingAssistant({ currentStepId, steps, allComplete }: Props) {
    const [open, setOpen] = useState(false)
    const [tipIdx, setTipIdx] = useState(0)
    const [showBubble, setShowBubble] = useState(true)
    const [tipsExpanded, setTipsExpanded] = useState(false)
    const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>()

    // Current contextual message
    const currentMsg = currentStepId
        ? STEP_MESSAGES[currentStepId]
        : allComplete
            ? {
                ar: 'مبروووك! 🏆 أنهيت المهمة يا وحش! إنت دلوقتي عارف أساسيات الـ Recon.',
                en: 'Mission complete! You nailed the recon basics.',
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
