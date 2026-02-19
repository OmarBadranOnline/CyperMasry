import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LabCompletionCelebration from '../../components/LabCompletionCelebration'
import {
    BookOpen,
    Terminal,
    ChevronLeft,
    CheckCircle,
    Circle,
    Loader,
    Trophy,
    Zap,
    ChevronDown,
    ChevronUp,
    RotateCcw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ZoogleSearch from './ZoogleSearch'
import TerminalSimulator from '../../components/TerminalSimulator'
import FakeLinkedIn from './FakeLinkedIn'
import FloatingAssistant from '../../components/FloatingAssistant'
import { useMissionProgress } from './useMissionProgress'

type ActiveTab = 'zoogle' | 'terminal' | 'linkedin'

export default function Lab01Page() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<ActiveTab>('terminal')
    const [reviewingStepId, setReviewingStepId] = useState<number | null>(null)
    const [celebrationOpen, setCelebrationOpen] = useState(false)
    const { steps, currentStepId, allComplete, completedCount, completeStep } = useMissionProgress()

    // Fire celebration exactly once when all steps complete
    useEffect(() => {
        if (allComplete) {
            // Small delay so the last step's animation settles first
            const t = setTimeout(() => setCelebrationOpen(true), 800)
            return () => clearTimeout(t)
        }
    }, [allComplete])

    const totalSteps = steps.length
    const progressPct = Math.round((completedCount / totalSteps) * 100)

    // Auto-switch tab when the current step changes tool
    const currentStep = steps.find((s) => s.id === currentStepId)
    const switchToTool = (tool: 'terminal' | 'zoogle' | 'linkedin') => {
        if (tool !== activeTab) setActiveTab(tool)
    }

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <Header />

            {/* Top progress bar */}
            <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-dark-border">
                <motion.div
                    className="h-full bg-neon-amber"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ boxShadow: '0 0 8px #FFBF00' }}
                />
            </div>

            <main className="flex-1 pt-20 flex flex-col lg:flex-row overflow-hidden">
                {/* ── Left: Mission Tracker ──────────────────────────────── */}
                <aside className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-dark-border overflow-y-auto">
                    <div className="p-5">
                        {/* Back */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-neon-amber transition-colors mb-5 group"
                        >
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Labs
                        </button>

                        {/* Header */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-gray-600 bg-dark-card border border-dark-border px-2 py-1 rounded-full">
                                    Lab 01
                                </span>
                                <span className="font-mono text-xs text-neon-amber/70 bg-neon-amber/10 border border-neon-amber/20 px-2 py-1 rounded-full">
                                    Beginner · 100 pts
                                </span>
                            </div>
                            <h1 className="font-mono font-black text-2xl text-white">El-Taqassi</h1>
                            <p className="font-mono text-xs text-neon-amber mt-0.5">
                                Passive Reconnaissance &amp; Google Dorking
                            </p>
                            <p className="font-cairo text-xs text-gray-500 italic mt-1">
                                (يعني تجسس بالشرع وبدون ما حد يحس بيك 🕵️)
                            </p>
                        </div>

                        {/* Progress summary */}
                        <div className="bg-dark-card border border-dark-border rounded-xl p-3 mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs text-gray-500">Mission Progress</span>
                                <span className="font-mono text-xs text-neon-amber font-bold">
                                    {completedCount}/{totalSteps} steps
                                </span>
                            </div>
                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-neon-amber rounded-full"
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                            {allComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 mt-2"
                                >
                                    <Trophy size={14} className="text-neon-amber" />
                                    <span className="font-mono text-xs text-neon-amber font-bold">
                                        Lab Complete! مبروك يا وحش 🎉
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Step list */}
                        <div className="space-y-2">
                            {steps.map((step) => {
                                const isActive = step.id === currentStepId
                                const isDone = step.completed
                                const isLocked = !isDone && step.id > (currentStepId ?? totalSteps + 1)

                                return (
                                    <motion.div
                                        key={step.id}
                                        layout
                                        className={`rounded-xl border p-3 transition-all duration-300 ${isDone
                                            ? 'border-neon-green/40 bg-neon-green/5'
                                            : isActive
                                                ? 'border-neon-amber/50 bg-neon-amber/5'
                                                : 'border-dark-border bg-dark-card opacity-40'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-0.5">
                                                {isDone ? (
                                                    <CheckCircle size={16} className="text-neon-green" />
                                                ) : isActive ? (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <Loader size={16} className="text-neon-amber" />
                                                    </motion.div>
                                                ) : (
                                                    <Circle size={16} className="text-gray-700" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-gray-600">#{step.id}</span>
                                                    {/* Tool badge */}
                                                    <span
                                                        className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${step.tool === 'terminal'
                                                            ? 'text-neon-green/70 bg-neon-green/10'
                                                            : step.tool === 'linkedin'
                                                                ? 'text-blue-400/70 bg-blue-400/10'
                                                                : 'text-neon-amber/70 bg-neon-amber/10'
                                                            }`}
                                                    >
                                                        {step.tool === 'terminal' ? '💻 Terminal' : step.tool === 'linkedin' ? '🔎 LinkedIn' : '🔍 Zoogle'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className={`font-mono text-xs font-bold ${isDone ? 'text-neon-green/70' : isActive ? 'text-white' : 'text-gray-600'
                                                        }`}>
                                                        {step.title}
                                                    </p>

                                                    {/* Review toggle for completed steps */}
                                                    {isDone && (
                                                        <button
                                                            onClick={() =>
                                                                setReviewingStepId((p) =>
                                                                    p === step.id ? null : step.id
                                                                )
                                                            }
                                                            className="flex items-center gap-1 font-mono text-xs text-neon-green/50 hover:text-neon-green transition-colors ml-2 flex-shrink-0"
                                                            title="Review this step"
                                                        >
                                                            <RotateCcw size={11} />
                                                            {reviewingStepId === step.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Active step detail */}
                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="font-mono text-xs text-gray-400 mt-2 leading-relaxed">
                                                                {step.objective}
                                                            </p>

                                                            {/* Hint box */}
                                                            <div className="mt-2 bg-dark-bg border border-neon-amber/20 rounded-lg p-2">
                                                                <span className="font-mono text-xs text-neon-amber/60">
                                                                    💡 Type in the{' '}
                                                                    <span
                                                                        className="text-neon-amber underline cursor-pointer"
                                                                        onClick={() => switchToTool(step.tool)}
                                                                    >
                                                                        {step.tool === 'terminal' ? 'Terminal' : step.tool === 'linkedin' ? 'LinkedIn' : 'Zoogle'}
                                                                    </span>:
                                                                </span>
                                                                <code className="block font-mono text-sm text-neon-green mt-1 break-all">
                                                                    {step.hint}
                                                                </code>
                                                            </div>

                                                            {/* Arabic quip */}
                                                            <p className="font-cairo text-xs text-neon-orange/60 italic mt-2">
                                                                {step.quipAr}
                                                            </p>

                                                            {/* Switch tab button */}
                                                            {step.tool !== activeTab && (
                                                                <button
                                                                    onClick={() => switchToTool(step.tool)}
                                                                    className="mt-2 w-full font-mono text-xs bg-neon-amber/10 border border-neon-amber/30 text-neon-amber py-1.5 rounded-lg hover:bg-neon-amber/20 transition-all"
                                                                >
                                                                    Switch to {step.tool === 'terminal' ? '💻 Terminal' : step.tool === 'linkedin' ? '🔎 LinkedIn' : '🔍 Zoogle'} →
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* ── Review panel for completed steps ── */}
                                                <AnimatePresence>
                                                    {isDone && reviewingStepId === step.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-2 pt-2 border-t border-neon-green/20 space-y-2">
                                                                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                                                                    {step.objective}
                                                                </p>
                                                                <div className="bg-dark-bg border border-neon-green/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-neon-green/50">✓ Command used:</span>
                                                                    <code className="block font-mono text-sm text-neon-green/80 mt-1 break-all">
                                                                        {step.hint}
                                                                    </code>
                                                                </div>
                                                                <p className="font-cairo text-xs text-neon-green/50 italic">
                                                                    {step.quipAr}
                                                                </p>
                                                                <button
                                                                    onClick={() => {
                                                                        switchToTool(step.tool)
                                                                        setReviewingStepId(null)
                                                                    }}
                                                                    className="w-full font-mono text-xs bg-neon-green/5 border border-neon-green/20 text-neon-green/60 py-1.5 rounded-lg hover:bg-neon-green/10 transition-all"
                                                                >
                                                                    Go to {step.tool === 'terminal' ? '💻 Terminal' : step.tool === 'linkedin' ? '🔎 LinkedIn' : '🔍 Zoogle'} →
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {isDone && reviewingStepId !== step.id && (
                                                    <p className="font-mono text-xs text-neon-green/40 mt-1">✓ Complete</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Concept recap */}
                        <div className="mt-5 border-t border-dark-border pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={14} className="text-gray-500" />
                                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                                    What you're learning
                                </span>
                            </div>
                            <div className="space-y-1">
                                {[
                                    'OSINT — passive intel with no footprint',
                                    'WHOIS — domain ownership records',
                                    'DNS — resolving names to IPs',
                                    'HTTP Headers — tech stack fingerprinting',
                                    'Social Media OSINT — people leak data online',
                                    'Google Dorks — advanced search operators',
                                ].map((concept) => (
                                    <div key={concept} className="flex items-start gap-2">
                                        <Zap size={10} className="text-neon-amber/50 mt-1 flex-shrink-0" />
                                        <span className="font-mono text-xs text-gray-600">{concept}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Right: Simulators ──────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Tabs */}
                    <div className="flex border-b border-dark-border bg-dark-bg flex-shrink-0">
                        {[
                            { id: 'terminal' as ActiveTab, label: '💻 Terminal', steps: '1–4' },
                            { id: 'linkedin' as ActiveTab, label: '🔎 LinkedIn', steps: '5' },
                            { id: 'zoogle' as ActiveTab, label: '🔍 Zoogle', steps: '6–9' },
                        ].map(({ id, label, steps: s }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-6 py-3 font-mono text-sm border-b-2 transition-all duration-200 ${activeTab === id
                                    ? 'border-neon-amber text-neon-amber bg-neon-amber/5'
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                    }`}
                            >
                                {label}
                                <span className="text-xs opacity-50">steps {s}</span>
                            </button>
                        ))}
                        <div className="ml-auto flex items-center pr-4 gap-2">
                            <span className="font-mono text-xs text-neon-amber/60">
                                {completedCount}/{totalSteps} done
                            </span>
                            <span className="font-mono text-xs text-gray-700 bg-dark-card border border-dark-border/50 px-3 py-1 rounded-full">
                                ⚠ Simulated
                            </span>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden p-5">
                        <AnimatePresence mode="wait">
                            {activeTab === 'terminal' && (
                                <motion.div
                                    key="terminal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    <TerminalSimulator
                                        currentStepId={currentStepId}
                                        onCommandRun={(cmd) => {
                                            const c = cmd.trim().toLowerCase()
                                            // Typo-tolerant matching — students often mis-spell the domain
                                            if (c === 'whoami') {
                                                completeStep(1)
                                            } else if (c.startsWith('whois')) {
                                                completeStep(2)
                                            } else if (c.startsWith('nslookup')) {
                                                completeStep(3)
                                            } else if (c.startsWith('curl')) {
                                                completeStep(4)
                                            }
                                        }}
                                    />
                                </motion.div>
                            )}
                            {activeTab === 'linkedin' && (
                                <motion.div
                                    key="linkedin"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    <FakeLinkedIn onPetNameFound={() => completeStep(5)} />
                                </motion.div>
                            )}
                            {activeTab === 'zoogle' && (
                                <motion.div
                                    key="zoogle"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    <ZoogleSearch
                                        currentStepId={currentStepId}
                                        onSearchRun={(query) => {
                                            const q = query.trim().toLowerCase()
                                            if (q.includes('site:evilcorp.com') && q.includes('inurl:admin')) {
                                                completeStep(8)
                                            } else if (q.includes('site:evilcorp.com')) {
                                                completeStep(7)
                                            } else if (q.includes('admin') || q.includes('login')) {
                                                completeStep(6)
                                            }
                                        }}
                                        onFlagCaptured={() => completeStep(9)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Floating smart assistant */}
            <FloatingAssistant
                currentStepId={currentStepId}
                steps={steps}
                allComplete={allComplete}
            />

            {/* Lab completion celebration */}
            <LabCompletionCelebration
                isOpen={celebrationOpen}
                labTitle="El-Taqassi"
                labNumber="01"
                points={100}
                onClose={() => setCelebrationOpen(false)}
            />
        </div>
    )
}
