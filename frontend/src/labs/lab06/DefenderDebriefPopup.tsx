import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react'

interface Props {
    onClose: () => void
}

interface Option {
    text: string
    explain: string
    correct: boolean
}

interface Slide {
    title: string
    focus: string
    question: string
    options: Option[]
}

const SLIDES: Slide[] = [
    {
        title: 'مسؤولية الثغرة',
        focus: 'Account compromise حصل بسبب weak credential controls.',
        question: 'مين المسؤول الأساسي عن الثغرة دي؟',
        options: [
            {
                text: 'فريق IAM / Security Policy (المالك الأساسي)',
                explain: 'الإجابة الأدق: سياسة كلمات السر + MFA + session policy تقع أساساً تحت IAM/security governance.',
                correct: true,
            },
            {
                text: 'المطورين فقط',
                explain: 'المطورين لهم دور، لكن دي مش مسؤوليتهم وحدهم لأن السياسات الهووية مؤسسية.',
                correct: false,
            },
            {
                text: 'SOC فقط',
                explain: 'SOC يكتشف ويستجيب، لكنه مش صاحب تصميم سياسة الهوية من البداية.',
                correct: false,
            },
            {
                text: 'المستخدم النهائي فقط',
                explain: 'وعي المستخدم مهم، لكن المشكلة هنا نظامية وسياساتية أكثر من كونها فردية.',
                correct: false,
            },
        ],
    },
    {
        title: 'منع Session Replay',
        focus: 'التوكن المسروق اتقبل على admin endpoint.',
        question: 'أنهي إجراء دفاعي كان هيمنع replay ده بشكل مباشر؟',
        options: [
            {
                text: 'Session binding + token rotation + short TTL',
                explain: 'صح: ربط الجلسة بسياق الجهاز + تدوير التوكن يقلل replay بشكل قوي.',
                correct: true,
            },
            {
                text: 'تغيير لون واجهة البورتال',
                explain: 'ده تحسين بصري فقط ومش كنترول أمني.',
                correct: false,
            },
            {
                text: 'إغلاق logs لتقليل الضوضاء',
                explain: 'العكس: logs مهمة جداً للكشف والتحقيق.',
                correct: false,
            },
            {
                text: 'رفع timeout الجلسة لوقت أطول',
                explain: 'ده بيزود فرصة استغلال التوكن المسروق مش العكس.',
                correct: false,
            },
        ],
    },
    {
        title: 'أول قرار وقت الحادثة',
        focus: 'عندنا شك قوي في account takeover.',
        question: 'أول حركة containment لازم تكون إيه؟',
        options: [
            {
                text: 'Invalidate all active sessions + force re-auth',
                explain: 'صح: دي أسرع خطوة تقفل وصول المهاجم فوراً وتقلل blast radius.',
                correct: true,
            },
            {
                text: 'انتظار يوم إضافي عشان نتأكد',
                explain: 'التأخير بيوسع الضرر أثناء استمرار المهاجم.',
                correct: false,
            },
            {
                text: 'تغيير SSL certificate فقط',
                explain: 'مش كفاية لو التوكن المسروق لسه صالح.',
                correct: false,
            },
            {
                text: 'إيقاف التنبيهات مؤقتاً',
                explain: 'ده بيقلل الرؤية الدفاعية في أسوأ وقت.',
                correct: false,
            },
        ],
    },
]

export default function DefenderDebriefPopup({ onClose }: Props) {
    const [idx, setIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const current = SLIDES[idx]
    const picked = answers[idx]
    const chosen = picked !== undefined ? current.options[picked] : null
    const allAnswered = useMemo(() => Object.keys(answers).length === SLIDES.length, [answers])

    const choose = (i: number) => {
        setAnswers((prev) => ({ ...prev, [idx]: i }))
    }

    return (
        <div className="fixed inset-0 z-[530] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-3xl rounded-2xl border border-cyan-300/30 bg-[#090813] overflow-hidden"
                style={{ boxShadow: '0 0 45px rgba(34,211,238,0.2)' }}
            >
                <div className="px-5 py-3 border-b border-cyan-300/25 bg-cyan-500/10 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-cyan-300" />
                    <span className="font-cairo text-sm text-cyan-200">Defender Side — Prevent the same attack</span>
                    <span className="ml-auto font-mono text-xs text-fuchsia-300">{`Q ${idx + 1}/${SLIDES.length}`}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        className="p-5 space-y-4"
                    >
                        <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-3">
                            <p className="font-cairo text-lg text-white font-bold">{current.title}</p>
                            <p className="font-mono text-xs text-fuchsia-200/80 mt-1">{current.focus}</p>
                        </div>

                        <p className="font-cairo text-base text-cyan-100">{current.question}</p>

                        <div className="space-y-2">
                            {current.options.map((op, i) => {
                                const isPicked = picked === i
                                return (
                                    <button
                                        key={op.text}
                                        onClick={() => choose(i)}
                                        className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${isPicked
                                            ? op.correct
                                                ? 'border-emerald-400/55 bg-emerald-500/15 text-emerald-100'
                                                : 'border-red-400/55 bg-red-500/15 text-red-100'
                                            : 'border-dark-border bg-black/30 text-gray-200 hover:border-cyan-300/40'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isPicked ? (op.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />) : <span className="text-cyan-300">→</span>}
                                            <span className="font-cairo text-sm">{op.text}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {chosen && (
                            <div className={`rounded-lg border p-3 ${chosen.correct ? 'border-emerald-300/30 bg-emerald-500/10' : 'border-red-300/30 bg-red-500/10'}`}>
                                <p className="font-cairo text-sm text-gray-100">{chosen.explain}</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="px-5 py-4 border-t border-cyan-300/25 bg-black/20 flex items-center gap-2">
                    <button
                        onClick={() => setIdx((p) => Math.max(0, p - 1))}
                        disabled={idx === 0}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dark-border text-gray-300 disabled:opacity-40"
                    >
                        <ChevronLeft size={14} /> السابق
                    </button>

                    {idx < SLIDES.length - 1 ? (
                        <button
                            onClick={() => setIdx((p) => Math.min(SLIDES.length - 1, p + 1))}
                            className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-cyan-300/35 text-cyan-200 hover:bg-cyan-500/10"
                        >
                            التالي <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-fuchsia-300/35 text-fuchsia-200 hover:bg-fuchsia-500/10"
                        >
                            {allAnswered ? 'إنهاء Defender Brief' : 'إغلاق العرض'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
