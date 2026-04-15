import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Target, ShieldAlert, Film } from 'lucide-react'

interface Props {
    onStart: () => void
}

interface BriefSlide {
    title: string
    subtitle: string
    chips: string[]
    flow: string[]
    icon: 'target' | 'alert' | 'film'
}

const SLIDES: BriefSlide[] = [
    {
        title: 'هدف اللاب',
        subtitle: 'نفهم سيناريو الدخول الأولي بسرعة ووضوح.',
        chips: ['10 دقايق', 'محاكاة 100%', 'Rapid Drill'],
        flow: [
            '🔎 Recon',
            '🔑 Credentials',
            '🍪 Session Replay',
            '🛡️ Containment',
        ],
        icon: 'target',
    },
    {
        title: 'ليه مهم؟',
        subtitle: 'عشان تربط السبب بالنتيجة زي محلل حوادث حقيقي.',
        chips: ['Root Cause', 'Impact', 'Decision'],
        flow: [
            '⚠️ ضعف سياسة الباسورد',
            '➡️ دخول حساب حساس',
            '➡️ خطف Session',
            '➡️ وصول أدمن',
        ],
        icon: 'alert',
    },
    {
        title: 'طريقة اللعب',
        subtitle: 'أمر → نتيجة → Popup سؤال ربط → الخطوة اللي بعدها.',
        chips: ['Popup Questions', 'Visual Effects', 'Final Flag'],
        flow: [
            '⌨️ نفّذ أمر',
            '📊 راقب النتيجة',
            '🧩 جاوب popup',
            '🚩 سلّم الفلاج',
        ],
        icon: 'film',
    },
]

function SlideIcon({ icon }: { icon: BriefSlide['icon'] }) {
    if (icon === 'target') return <Target size={18} className="text-cyan-300" />
    if (icon === 'alert') return <ShieldAlert size={18} className="text-red-300" />
    return <Film size={18} className="text-fuchsia-300" />
}

export default function PreLabBriefing({ onStart }: Props) {
    const [idx, setIdx] = useState(0)
    const current = SLIDES[idx]
    const isLast = idx === SLIDES.length - 1

    return (
        <div className="fixed inset-0 z-[520] bg-[#04030a]/95 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-3xl rounded-2xl border border-fuchsia-400/35 bg-[#0a0713] overflow-hidden shadow-2xl relative"
                style={{ boxShadow: '0 0 50px rgba(217,70,239,0.18)' }}
            >
                <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                <div className="px-5 py-3 border-b border-fuchsia-400/25 bg-fuchsia-500/10 flex items-center gap-2">
                    <SlideIcon icon={current.icon} />
                    <span className="font-cairo text-sm text-fuchsia-200">Brief قبل بداية اللاب</span>
                    <span className="ml-auto font-mono text-xs text-cyan-300">{`Slide ${idx + 1}/${SLIDES.length}`}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="p-6 space-y-5 relative z-10"
                    >
                        <div className="text-center">
                            <h2 className="font-cairo text-3xl text-white font-bold mb-1">{current.title}</h2>
                            <p className="font-cairo text-sm text-gray-300">{current.subtitle}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {current.chips.map((chip) => (
                                <span key={chip} className="font-mono text-xs px-3 py-1 rounded-full border border-cyan-300/25 bg-cyan-500/10 text-cyan-200">
                                    {chip}
                                </span>
                            ))}
                        </div>

                        <div className="rounded-xl border border-fuchsia-400/25 bg-black/25 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                {current.flow.map((item, i) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0.4, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/5 px-3 py-2 text-center"
                                    >
                                        <p className="font-cairo text-xs text-gray-100">{item}</p>
                                        {i < current.flow.length - 1 && (
                                            <p className="font-mono text-cyan-300/70 mt-1">→</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-1.5">
                            {SLIDES.map((_, i) => (
                                <span
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-7 bg-cyan-300' : 'w-2 bg-gray-600'}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="px-5 py-4 border-t border-fuchsia-400/25 flex items-center gap-2 bg-black/20">
                    <button
                        onClick={() => setIdx((p) => Math.max(0, p - 1))}
                        disabled={idx === 0}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dark-border text-gray-300 disabled:opacity-40 hover:border-cyan-300/40"
                    >
                        <ChevronLeft size={14} /> السابق
                    </button>

                    {!isLast ? (
                        <button
                            onClick={() => setIdx((p) => Math.min(SLIDES.length - 1, p + 1))}
                            className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-fuchsia-300/35 text-fuchsia-200 hover:bg-fuchsia-500/10"
                        >
                            التالي <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onStart}
                            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-300 text-black font-cairo font-bold hover:brightness-110"
                        >
                            ابدأ اللاب <Play size={14} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
