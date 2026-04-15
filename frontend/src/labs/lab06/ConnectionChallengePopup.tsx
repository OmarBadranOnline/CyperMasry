import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, CheckCircle2, XCircle, Lightbulb, Trophy } from 'lucide-react'
import type { MissionStep } from './useMissionProgress'

interface Props {
    step: MissionStep
    onComplete: (pointsEarned: number) => void
}

export default function ConnectionChallengePopup({ step, onComplete }: Props) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [wrongIndex, setWrongIndex] = useState<number | null>(null)
    const [showHint, setShowHint] = useState(false)
    const [wrongAttempts, setWrongAttempts] = useState(0)
    const challenge = step.challengeData

    if (!challenge) return null

    const currentPoints = Math.max(
        5,
        challenge.points - (showHint ? challenge.hintPenalty : 0) - (wrongAttempts * 3)
    )
    const options = useMemo(() => challenge.options, [challenge.options])

    const handlePick = (idx: number) => {
        if (selectedIndex !== null) return
        if (idx === challenge.correctIndex) {
            setSelectedIndex(idx)
            setTimeout(() => onComplete(currentPoints), 500)
            return
        }
        setWrongIndex(idx)
        setWrongAttempts((prev) => prev + 1)
        setTimeout(() => setWrongIndex(null), 650)
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-2xl rounded-2xl border border-fuchsia-400/35 bg-[#0b0813] shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 0 40px rgba(217,70,239,0.2)' }}
                >
                    <div className="px-5 py-3 border-b border-fuchsia-400/25 bg-fuchsia-500/10 flex items-center gap-2">
                        <Link2 size={14} className="text-fuchsia-300" />
                        <span className="font-mono text-sm text-fuchsia-200">Connection Challenge</span>
                        <span className="ml-auto font-mono text-xs text-cyan-300">Step #{step.id}</span>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="bg-black/30 border border-cyan-400/20 rounded-lg p-3">
                            <p className="font-mono text-sm text-cyan-100 whitespace-pre-line">{challenge.question}</p>
                            <p className="font-cairo text-xs text-fuchsia-300/80 mt-2">
                                اختبر فهمك من خلال ربط السبب بالنتيجة الصحيحة.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border text-cyan-300/85 bg-cyan-400/10 border-cyan-300/20">
                                <Trophy size={10} /> {currentPoints} pts
                            </span>
                            {!showHint && (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="inline-flex items-center gap-1 font-mono text-xs text-fuchsia-300/80 hover:text-fuchsia-200"
                                >
                                    <Lightbulb size={11} /> Show hint (-{challenge.hintPenalty})
                                </button>
                            )}
                            {wrongAttempts > 0 && (
                                <span className="font-mono text-xs text-red-300/85">
                                    Wrong tries: {wrongAttempts} (-{wrongAttempts * 3})
                                </span>
                            )}
                        </div>

                        {showHint && (
                            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                                <p className="font-mono text-xs text-yellow-200">{challenge.hint}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {options.map((opt, idx) => {
                                const isCorrect = selectedIndex === idx
                                const isWrong = wrongIndex === idx
                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={() => handlePick(idx)}
                                        animate={isWrong ? { x: [0, -6, 6, 0] } : {}}
                                        transition={{ duration: 0.35 }}
                                        className={`w-full text-left rounded-lg border px-3 py-2.5 font-mono text-sm transition-all ${isCorrect
                                            ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                            : isWrong
                                                ? 'border-red-400/60 bg-red-500/15 text-red-200'
                                                : 'border-dark-border bg-black/30 text-gray-300 hover:border-fuchsia-400/45 hover:bg-fuchsia-500/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isCorrect ? <CheckCircle2 size={14} /> : isWrong ? <XCircle size={14} /> : <span className="text-cyan-300/80">→</span>}
                                            <span className="whitespace-pre-line">{opt}</span>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>

                        <p className="font-cairo text-xs text-gray-400">
                            لازم تحل سؤال الربط عشان تكمل النشاط العملي.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
