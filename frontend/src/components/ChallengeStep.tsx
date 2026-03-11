/**
 * ChallengeStep — Interactive MCQ challenge card for labs
 *
 * Renders inline in the mission tracker as a quiz question.
 * Features: 4 options, points badge, hint button (-50% points),
 * correct/wrong animations via Framer Motion.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, Lightbulb, Trophy, Brain } from 'lucide-react'

export interface ChallengeData {
    question: string
    options: string[]
    correctIndex: number
    hint: string
    points: number
    hintPenalty: number
}

interface ChallengeStepProps {
    data: ChallengeData
    isActive: boolean
    isDone: boolean
    onComplete: (earnedPoints: number) => void
}

export default function ChallengeStep({ data, isActive, isDone, onComplete }: ChallengeStepProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [showHint, setShowHint] = useState(false)
    const [wrongIndex, setWrongIndex] = useState<number | null>(null)
    const [answered, setAnswered] = useState(false)

    const currentPoints = showHint ? data.points - data.hintPenalty : data.points

    const handleAnswer = (index: number) => {
        if (answered || isDone) return
        setSelectedIndex(index)

        if (index === data.correctIndex) {
            setAnswered(true)
            // Small delay for the green animation to play
            setTimeout(() => onComplete(currentPoints), 600)
        } else {
            setWrongIndex(index)
            setTimeout(() => setWrongIndex(null), 800)
            setSelectedIndex(null)
        }
    }

    const handleHint = () => {
        if (!showHint && !answered && !isDone) {
            setShowHint(true)
        }
    }

    if (!isActive && !isDone) return null

    return (
        <AnimatePresence>
            {(isActive || isDone) && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="mt-2 space-y-3">
                        {/* Question */}
                        <div className="flex items-start gap-2">
                            <Brain size={14} className={isDone ? 'text-neon-green/60' : 'text-purple-400'} />
                            <p className={`font-mono text-xs leading-relaxed ${isDone ? 'text-neon-green/60' : 'text-gray-300'}`}>
                                {data.question}
                            </p>
                        </div>

                        {/* Points badge */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border ${
                                isDone
                                    ? 'text-neon-green/70 bg-neon-green/10 border-neon-green/20'
                                    : 'text-purple-400/80 bg-purple-400/10 border-purple-400/20'
                            }`}>
                                <Trophy size={10} />
                                {isDone ? `+${currentPoints} pts earned` : `${currentPoints} pts`}
                            </span>
                            {showHint && !isDone && (
                                <span className="font-mono text-xs text-red-400/60">
                                    (−{data.hintPenalty} hint penalty)
                                </span>
                            )}
                        </div>

                        {/* Options — only show when active */}
                        {isActive && !isDone && (
                            <div className="space-y-2">
                                {data.options.map((option, i) => {
                                    const isCorrectAnswer = answered && i === data.correctIndex
                                    const isWrong = wrongIndex === i

                                    return (
                                        <motion.button
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            disabled={answered}
                                            animate={
                                                isWrong
                                                    ? { x: [0, -6, 6, -4, 4, 0] }
                                                    : isCorrectAnswer
                                                        ? { scale: [1, 1.03, 1] }
                                                        : {}
                                            }
                                            transition={{ duration: 0.4 }}
                                            className={`w-full text-left font-mono text-xs px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                                                isCorrectAnswer
                                                    ? 'border-neon-green/60 bg-neon-green/15 text-neon-green'
                                                    : isWrong
                                                        ? 'border-red-400/60 bg-red-400/15 text-red-400'
                                                        : 'border-dark-border bg-dark-bg/60 text-gray-400 hover:border-purple-400/40 hover:text-gray-200 hover:bg-purple-400/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                                                    isCorrectAnswer
                                                        ? 'border-neon-green/60 text-neon-green'
                                                        : isWrong
                                                            ? 'border-red-400/60 text-red-400'
                                                            : 'border-gray-600 text-gray-600'
                                                }`}>
                                                    {isCorrectAnswer ? (
                                                        <CheckCircle size={12} />
                                                    ) : isWrong ? (
                                                        <XCircle size={12} />
                                                    ) : (
                                                        String.fromCharCode(65 + i)
                                                    )}
                                                </span>
                                                <span className="flex-1">{option}</span>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Completed answer display */}
                        {isDone && (
                            <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-2">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle size={12} className="text-neon-green/60" />
                                    <span className="font-mono text-xs text-neon-green/60">
                                        ✓ {data.options[data.correctIndex]}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Hint button & hint content */}
                        {isActive && !isDone && (
                            <div>
                                {!showHint ? (
                                    <button
                                        onClick={handleHint}
                                        className="flex items-center gap-1.5 font-mono text-xs text-purple-400/60 hover:text-purple-400 transition-colors group"
                                    >
                                        <Lightbulb size={12} className="group-hover:text-yellow-400 transition-colors" />
                                        Show Hint (−{data.hintPenalty} pts)
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-2"
                                    >
                                        <div className="flex items-start gap-1.5">
                                            <Lightbulb size={12} className="text-yellow-400/60 mt-0.5 flex-shrink-0" />
                                            <span className="font-mono text-xs text-yellow-400/70">{data.hint}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
