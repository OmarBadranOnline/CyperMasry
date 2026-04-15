import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Terminal, ChevronLeft, CheckCircle, Circle, Loader, Trophy, Zap, ChevronDown, ChevronUp, RotateCcw, Brain } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import FloatingAssistant from '../../components/FloatingAssistant'
import LabCompletionCelebration from '../../components/LabCompletionCelebration'
import AccessTerminal from './AccessTerminal'
import ConnectionChallengePopup from './ConnectionChallengePopup'
import PreLabBriefing from './PreLabBriefing'
import DefenderDebriefPopup from './DefenderDebriefPopup'
import StudentIdentityGate from './StudentIdentityGate'
import ShareScoreCardPopup from './ShareScoreCardPopup'
import { useMissionProgress } from './useMissionProgress'

const LAB06_PROFILE_KEY = 'cybermasry_lab06_profile'
const UTILITY_COMMANDS = new Set(['help', 'history', 'clear', 'bonus_q', 'bonus_answer'])

function normalizeCommand(cmd: string) {
    return cmd.trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function Lab06() {
    const navigate = useNavigate()
    const [reviewingStepId, setReviewingStepId] = useState<number | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [showBriefing, setShowBriefing] = useState(true)
    const [showDefenderDebrief, setShowDefenderDebrief] = useState(false)
    const [autoOpenedDebrief, setAutoOpenedDebrief] = useState(false)
    const [showIdentityGate, setShowIdentityGate] = useState(true)
    const [showShareCard, setShowShareCard] = useState(false)
    const [showChallengePopup, setShowChallengePopup] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentId, setStudentId] = useState('')
    const [stepMistakes, setStepMistakes] = useState<Record<number, number>>({})
    const [wasRestartedFromCompletion, setWasRestartedFromCompletion] = useState(false)
    const {
        steps,
        currentStepId,
        allComplete,
        completedCount,
        maxScore,
        earnedScore,
        bonusEarnedScore,
        penaltySpentScore,
        completeStep,
        addBonusPoints,
        addPenaltyCost,
        resetProgress,
    } = useMissionProgress('lab06')

    const totalSteps = steps.length
    const progressPct = Math.round((completedCount / totalSteps) * 100)
    const score = earnedScore
    const activeChallengeStep = steps.find(
        (s) => s.id === currentStepId && s.type === 'challenge' && !s.completed && Boolean(s.challengeData)
    )
    const phase = currentStepId ?? 10
    const theme =
        phase <= 3
            ? { name: 'Recon Phase', left: '#a855f7', right: '#22d3ee', glow: 'rgba(34,211,238,0.75)' }
            : phase <= 7
                ? { name: 'Intrusion Phase', left: '#ef4444', right: '#d946ef', glow: 'rgba(239,68,68,0.75)' }
                : { name: 'Containment Phase', left: '#14b8a6', right: '#22d3ee', glow: 'rgba(20,184,166,0.75)' }

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LAB06_PROFILE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as { name?: string; studentId?: string }
            if (parsed.name) setStudentName(parsed.name)
            if (parsed.studentId) setStudentId(parsed.studentId)
            if (parsed.name && parsed.studentId) {
                setShowIdentityGate(false)
            }
        } catch {
            // ignore malformed profile cache
        }
    }, [])
    useEffect(() => {
        if (allComplete && !autoOpenedDebrief && !showBriefing) {
            setShowDefenderDebrief(true)
            setAutoOpenedDebrief(true)
        }
    }, [allComplete, autoOpenedDebrief, showBriefing])
    useEffect(() => {
        // Close challenge modal when moving between steps
        setShowChallengePopup(false)
    }, [currentStepId])
    useEffect(() => {
        if (!allComplete) return
        resetProgress()
        setStepMistakes({})
        setWasRestartedFromCompletion(true)
    }, [])

    const handleCelebrationClose = () => {
        setShowCelebration(false)
        if (allComplete && !!studentName && !!studentId) {
            setShowShareCard(true)
        }
    }

    const submitIdentity = (name: string, id: string) => {
        setStudentName(name)
        setStudentId(id)
        localStorage.setItem(LAB06_PROFILE_KEY, JSON.stringify({ name, studentId: id }))
        setShowIdentityGate(false)
    }

    const handleCommandRun = (cmd: string) => {
        const normalized = normalizeCommand(cmd)
        const commandName = normalized.split(' ')[0]
        const activeActionStep = steps.find((s) => s.id === currentStepId && s.type === 'action' && !s.completed)
        const currentMistakes = activeActionStep ? (stepMistakes[activeActionStep.id] ?? 0) : 0

        let matchedStepId: number | null = null
        let exactMatch = false

        if (
            normalized.startsWith('whatweb') &&
            normalized.includes('https://vault.evilcorp.local/login') &&
            !steps[0].completed
        ) {
            matchedStepId = 1
            exactMatch = normalized === 'whatweb https://vault.evilcorp.local/login'
        } else if (
            normalized.startsWith('theharvester') &&
            normalized.includes('-d evilcorp.local') &&
            normalized.includes('-b all') &&
            !steps[1].completed
        ) {
            matchedStepId = 2
            exactMatch = normalized === 'theharvester -d evilcorp.local -b all'
        } else if (
            normalized.startsWith('hydra') &&
            normalized.includes('-l users.txt') &&
            normalized.includes('-p common.txt') &&
            normalized.includes('ssh://10.10.7.23') &&
            !steps[2].completed
        ) {
            matchedStepId = 3
            exactMatch = normalized === 'hydra -l users.txt -p common.txt ssh://10.10.7.23'
        } else if (
            normalized.startsWith('grep') &&
            normalized.includes('stolen_token') &&
            normalized.includes('captured_cookies.txt') &&
            !steps[4].completed
        ) {
            matchedStepId = 5
            exactMatch = normalized === 'grep "stolen_token" captured_cookies.txt'
        } else if (
            normalized.startsWith('curl') &&
            normalized.includes('cookie: session=stolen_token_77') &&
            normalized.includes('vault.evilcorp.local/admin') &&
            !steps[5].completed
        ) {
            matchedStepId = 6
            exactMatch = normalized === 'curl -h "cookie: session=stolen_token_77" https://vault.evilcorp.local/admin'
        } else if (
            (normalized.includes('whoami') || normalized.includes('id')) &&
            !steps[7].completed
        ) {
            matchedStepId = 8
            exactMatch = normalized === 'whoami && id'
        } else if (
            normalized.startsWith('cat') &&
            normalized.includes('/opt/soc/incident-flag.txt') &&
            !steps[8].completed
        ) {
            matchedStepId = 9
            exactMatch = normalized === 'cat /opt/soc/incident-flag.txt'
        } else if (
            normalized.startsWith('submit_flag') &&
            normalized.includes('flag{rapid_access_movie_complete}') &&
            !steps[9].completed
        ) {
            matchedStepId = 10
            exactMatch = normalized === 'submit_flag flag{rapid_access_movie_complete}'
        }

        if (matchedStepId) {
            const step = steps.find((s) => s.id === matchedStepId)
            if (!step) return
            const precisionPenalty = exactMatch ? 0 : 2
            const attemptPenalty = Math.min(4, currentMistakes)
            const awarded = Math.max(2, step.points - precisionPenalty - attemptPenalty)
            completeStep(matchedStepId, awarded)
            setStepMistakes((prev) => ({ ...prev, [matchedStepId]: 0 }))
            if (matchedStepId === 10) {
                setShowCelebration(true)
            }
            return
        }

        if (activeActionStep && !UTILITY_COMMANDS.has(commandName)) {
            const nextMistakes = (stepMistakes[activeActionStep.id] ?? 0) + 1
            setStepMistakes((prev) => ({ ...prev, [activeActionStep.id]: nextMistakes }))
            if (nextMistakes % 3 === 0) {
                const bucket = Math.floor(nextMistakes / 3)
                addPenaltyCost(`mistake-step-${activeActionStep.id}-${bucket}`, 1)
            }
        }
    }

    const handleBonusAward = (awardKey: string, points: number) => {
        addBonusPoints(awardKey, points)
    }

    const handleResetProgress = () => {
        resetProgress()
        setStepMistakes({})
    }

    return (
        <div className="h-screen bg-[#05040a] flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl"
                    style={{ backgroundColor: `${theme.left}22` }}
                    animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
                    style={{ backgroundColor: `${theme.right}22` }}
                    animate={{ x: [0, -16, 0], y: [0, 12, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.06, 0.12, 0.06] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 22px, ${theme.right}18 23px, transparent 24px)`,
                    }}
                />
            </div>

            <Header />
            <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-dark-border">
                <motion.div
                    className="h-full"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ backgroundImage: `linear-gradient(to right, ${theme.left}, ${theme.right})`, boxShadow: `0 0 10px ${theme.glow}` }}
                />
            </div>

            <main className="flex-1 pt-20 flex flex-col lg:flex-row overflow-hidden relative z-10">
                <aside className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-fuchsia-400/20 overflow-y-auto bg-black/20">
                    <div className="p-5">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-cyan-300 transition-colors mb-5 group">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Labs
                        </button>

                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-xs text-gray-400 bg-black/40 border border-fuchsia-400/20 px-2 py-1 rounded-full">Lab 06</span>
                                <span className="font-mono text-xs text-cyan-200/80 bg-cyan-400/10 border border-cyan-300/20 px-2 py-1 rounded-full">Rapid Ops · {maxScore} pts · 10 min</span>
                            </div>
                            <h1 className="font-mono font-black text-2xl text-white">El-Dokhool El-Khafee</h1>
                            <p className="font-mono text-xs text-fuchsia-300 mt-0.5">Rapid Initial Access Simulation · {theme.name}</p>
                            <p className="font-cairo text-xs text-gray-400 italic mt-1">(فيلم مصغر: clue → decision → containment 🎬)</p>
                        </div>

                        <div className="bg-black/40 border border-fuchsia-400/20 rounded-xl p-3 mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs text-gray-400">Mission Progress</span>
                                <span className="font-mono text-xs text-cyan-300 font-bold">{completedCount}/{totalSteps} steps</span>
                            </div>
                            {wasRestartedFromCompletion && (
                                <div className="mb-2 font-cairo text-[11px] text-emerald-200/90 bg-emerald-500/10 border border-emerald-300/25 rounded-md px-2 py-1">
                                    اللاب كان مكتمل قبل كده ✅ وبدأناه من الأول للممارسة مرة تانية.
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs text-fuchsia-200/70">Live score</span>
                                <span className="font-mono text-xs text-fuchsia-200 font-bold">{score}/{maxScore} pts</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-[10px] text-emerald-200/80">Bonus +{bonusEarnedScore}</span>
                                <span className="font-mono text-[10px] text-red-200/80">Accuracy costs -{penaltySpentScore}</span>
                            </div>
                            <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
                            </div>
                            {allComplete && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2">
                                    <Trophy size={14} className="text-cyan-300" />
                                    <span className="font-mono text-xs text-cyan-200 font-bold">Mission Complete! Great rapid-response flow 🎉</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            {steps.map((step) => {
                                const isActive = step.id === currentStepId
                                const isDone = step.completed
                                const isChallenge = step.type === 'challenge'
                                return (
                                    <motion.div
                                        key={step.id}
                                        layout
                                        className={`rounded-xl border p-3 transition-all duration-300 ${isDone ? 'border-cyan-400/40 bg-cyan-400/5' : isActive ? (isChallenge ? 'border-fuchsia-400/50 bg-fuchsia-400/5' : 'border-cyan-400/50 bg-cyan-400/5') : 'border-fuchsia-400/20 bg-black/20 opacity-50'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {isDone ? <CheckCircle size={16} className="text-cyan-300" /> : isActive ? (
                                                    isChallenge
                                                        ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Brain size={16} className="text-fuchsia-300" /></motion.div>
                                                        : <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Loader size={16} className="text-cyan-300" /></motion.div>
                                                ) : <Circle size={16} className="text-gray-700" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-gray-500">#{step.id}</span>
                                                    {isChallenge ? (
                                                        <span className="font-mono text-xs px-1.5 py-0.5 rounded-full text-fuchsia-300/80 bg-fuchsia-400/10">🕵️ Mystery</span>
                                                    ) : (
                                                        <span className="font-mono text-xs px-1.5 py-0.5 rounded-full text-cyan-300/80 bg-cyan-400/10">🎬 Access Scene</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-mono text-xs font-bold ${isDone ? 'text-cyan-200/80' : isActive ? 'text-white' : 'text-gray-600'}`}>{step.title}</p>
                                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                        <span className="font-mono text-[10px] text-amber-200/80 bg-amber-300/10 border border-amber-300/30 px-1.5 py-0.5 rounded-full">
                                                            +{step.points} pts
                                                        </span>
                                                        {isDone && (
                                                            <button
                                                                onClick={() => setReviewingStepId((p) => p === step.id ? null : step.id)}
                                                                className="flex items-center gap-1 font-mono text-xs text-cyan-300/60 hover:text-cyan-300 transition-colors"
                                                            >
                                                                <RotateCcw size={11} />{reviewingStepId === step.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {isChallenge && (
                                                    <div className="mt-2 space-y-2">
                                                        <div className="bg-black/30 border border-fuchsia-400/20 rounded-lg p-2">
                                                            <span className="font-mono text-xs text-fuchsia-300/70">🧩 Popup connection test:</span>
                                                            <p className="font-mono text-xs text-cyan-100/90 mt-1 leading-relaxed">
                                                                {isDone ? 'Challenge solved from popup activity.' : 'راجع آخر نتيجة في التيرمنال وبعدين اضغط زر فتح السؤال.'}
                                                            </p>
                                                        </div>
                                                        {isActive && !isDone && (
                                                            <button
                                                                onClick={() => setShowChallengePopup(true)}
                                                                className="w-full font-cairo text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-300/30 hover:bg-cyan-500/20 rounded-lg py-2 transition-all"
                                                            >
                                                                افتح سؤال الفهم (بعد مراجعة النتيجة)
                                                            </button>
                                                        )}
                                                        {(isActive || (isDone && reviewingStepId === step.id)) && (
                                                            <>
                                                                <div className="bg-black/30 border border-fuchsia-400/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-fuchsia-300/70">🧩 Why this mystery exists:</span>
                                                                    <p className="font-mono text-xs text-cyan-100/90 mt-1 leading-relaxed">{step.explanation}</p>
                                                                </div>
                                                                <div className="bg-black/30 border border-teal-300/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-teal-300/70">✅ Expected decision:</span>
                                                                    <p className="font-mono text-xs text-teal-200/90 mt-1 leading-relaxed">{step.expectedResult}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {!isChallenge && (
                                                    <AnimatePresence>
                                                        {isActive && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                <p className="font-mono text-xs text-gray-400 mt-2 leading-relaxed">{step.objective}</p>
                                                                <div className="mt-2 bg-black/30 border border-fuchsia-400/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-fuchsia-300/70">🧩 Why this step matters:</span>
                                                                    <p className="font-mono text-xs text-cyan-100/90 mt-1 leading-relaxed">{step.explanation}</p>
                                                                </div>
                                                                <div className="mt-2 bg-black/30 border border-cyan-400/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-cyan-300/70">💡 Run in Terminal:</span>
                                                                    <code className="block font-mono text-sm text-fuchsia-200 mt-1 break-all">{step.hint}</code>
                                                                    <p className="font-cairo text-[11px] text-emerald-200/90 mt-1">
                                                                        نشاط إضافي اختياري: <span className="font-mono">bonus_q</span> ثم <span className="font-mono">bonus_answer ...</span> (+5 نقاط)
                                                                    </p>
                                                                    <p className="font-cairo text-[11px] text-amber-200/90 mt-1">
                                                                        خصم الدرجات دلوقتي مرتبط بكثرة المحاولات الخاطئة فقط.
                                                                    </p>
                                                                </div>
                                                                <div className="mt-2 bg-black/30 border border-teal-300/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-teal-300/70">✅ Expected result:</span>
                                                                    <p className="font-mono text-xs text-teal-200/90 mt-1 leading-relaxed">{step.expectedResult}</p>
                                                                </div>
                                                                <p className="font-cairo text-xs text-fuchsia-300/70 italic mt-2">{step.quipAr}</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}

                                                {!isChallenge && (
                                                    <AnimatePresence>
                                                        {isDone && reviewingStepId === step.id && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                <div className="mt-2 pt-2 border-t border-cyan-400/20 space-y-2">
                                                                    <p className="font-mono text-xs text-gray-400 leading-relaxed">{step.objective}</p>
                                                                    <div className="bg-black/30 border border-fuchsia-400/20 rounded-lg p-2">
                                                                        <span className="font-mono text-xs text-fuchsia-300/70">🧩 Why it mattered:</span>
                                                                        <p className="font-mono text-xs text-cyan-100/90 mt-1 leading-relaxed">{step.explanation}</p>
                                                                    </div>
                                                                    <div className="bg-black/30 border border-cyan-400/20 rounded-lg p-2">
                                                                        <span className="font-mono text-xs text-cyan-300/70">✓ Command used:</span>
                                                                        <code className="block font-mono text-sm text-cyan-100 mt-1 break-all">{step.hint}</code>
                                                                    </div>
                                                                    <div className="bg-black/30 border border-teal-300/20 rounded-lg p-2">
                                                                        <span className="font-mono text-xs text-teal-300/70">✅ Expected outcome:</span>
                                                                        <p className="font-mono text-xs text-teal-200/90 mt-1 leading-relaxed">{step.expectedResult}</p>
                                                                    </div>
                                                                    <p className="font-cairo text-xs text-cyan-300/60 italic">{step.quipAr}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        <div className="mt-4">
                            <button onClick={handleResetProgress} className="w-full font-mono text-xs text-gray-500 hover:text-cyan-300 border border-fuchsia-400/20 hover:border-cyan-300/40 rounded-lg py-2 transition-all">
                                ↺ Reset Lab Progress
                            </button>
                            <button
                                onClick={() => setShowDefenderDebrief(true)}
                                className="w-full mt-2 font-cairo text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-300/30 hover:bg-cyan-500/20 rounded-lg py-2 transition-all"
                            >
                                🛡️ Defender Side Brief + Questions
                            </button>
                        </div>

                        <div className="mt-5 border-t border-fuchsia-400/20 pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={14} className="text-gray-500" />
                                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">What you're learning</span>
                            </div>
                            <div className="space-y-1">
                                {[
                                    'Initial access chain thinking under time pressure',
                                    'Credential hygiene and policy-driven failure modes',
                                    'Session token replay impact and containment',
                                    'Privilege validation after compromise',
                                    'Evidence-first incident response workflow',
                                ].map((c) => (
                                    <div key={c} className="flex items-start gap-2">
                                        <Zap size={10} className="text-fuchsia-300/70 mt-1 flex-shrink-0" />
                                        <span className="font-mono text-xs text-gray-400">{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex border-b border-fuchsia-400/20 bg-black/20 flex-shrink-0">
                        <div className="flex items-center gap-2 px-6 py-3 font-mono text-sm border-b-2 border-cyan-300 text-cyan-200 bg-cyan-400/5">
                            <Terminal size={14} />🎬 Rapid Access Terminal
                            <span className="text-xs opacity-60">10 steps</span>
                        </div>
                        <div className="ml-auto flex items-center pr-4 gap-2">
                            <span className="font-mono text-xs text-cyan-300/70">{completedCount}/{totalSteps} done</span>
                            <span className="font-mono text-xs text-emerald-200/90 bg-emerald-500/10 border border-emerald-300/25 px-3 py-1 rounded-full">
                                Live Score: {score}/{maxScore}
                            </span>
                            <span className="font-mono text-xs text-fuchsia-200/70 bg-fuchsia-500/10 border border-fuchsia-300/20 px-3 py-1 rounded-full">⚠ Simulated Attack Story · {theme.name}</span>
                            {activeChallengeStep && (
                                <button
                                    onClick={() => setShowChallengePopup(true)}
                                    className="font-cairo text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-300/30 hover:bg-cyan-500/20 px-3 py-1 rounded-full transition-all"
                                >
                                    افتح السؤال
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
                            <AccessTerminal
                                currentStepId={currentStepId}
                                onCommandRun={handleCommandRun}
                                onBonusAward={handleBonusAward}
                            />
                        </motion.div>
                    </div>
                </div>
            </main>

            <LabCompletionCelebration isOpen={showCelebration} labTitle="El-Dokhool El-Khafee" labNumber="06" points={score} onClose={handleCelebrationClose} />
            <FloatingAssistant currentStepId={currentStepId} steps={steps} allComplete={allComplete} labId="lab06" />
            {showChallengePopup && activeChallengeStep && !showBriefing && !showIdentityGate && (
                <ConnectionChallengePopup
                    step={activeChallengeStep}
                    onComplete={(pointsEarned) => completeStep(activeChallengeStep.id, pointsEarned)}
                />
            )}
            {showIdentityGate && (
                <StudentIdentityGate
                    defaultName={studentName}
                    defaultStudentId={studentId}
                    onSubmit={submitIdentity}
                />
            )}
            {showBriefing && !showIdentityGate && <PreLabBriefing onStart={() => setShowBriefing(false)} />}
            {showDefenderDebrief && !showBriefing && !showIdentityGate && (
                <DefenderDebriefPopup onClose={() => setShowDefenderDebrief(false)} />
            )}
            {showShareCard && allComplete && !!studentName && !!studentId && (
                <ShareScoreCardPopup
                    name={studentName}
                    studentId={studentId}
                    score={score}
                    maxScore={maxScore}
                    onClose={() => setShowShareCard(false)}
                />
            )}
        </div>
    )
}
