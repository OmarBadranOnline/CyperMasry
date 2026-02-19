/**
 * Lab 02 — El-Tafteesh (Port Scanning with Nmap)
 *
 * Layout identical to pages/Lab01.tsx:
 *  • Left panel  → mission tracker (step list, progress, concepts)
 *  • Right panel → NmapTerminal simulator (terminal-only, no tabs)
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import FloatingAssistant from '../../components/FloatingAssistant'
import LabCompletionCelebration from '../../components/LabCompletionCelebration'
import NmapTerminal from './NmapTerminal'
import { useMissionProgress } from './useMissionProgress'

export default function Lab02() {
    const navigate = useNavigate()
    const [reviewingStepId, setReviewingStepId] = useState<number | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const { steps, currentStepId, allComplete, completedCount, completeStep, resetProgress } =
        useMissionProgress()

    const totalSteps = steps.length
    const progressPct = Math.round((completedCount / totalSteps) * 100)

    /* ── Show celebration when all complete ─────────────────────────────── */
    useEffect(() => {
        if (allComplete) setShowCelebration(true)
    }, [allComplete])

    /* ── Command → step mapping ────────────────────────────────────────────────── */
    const handleCommandRun = (cmd: string) => {
        const c = cmd.trim().toLowerCase()
        const parts = c.split(/\s+/)
        const flags = parts.filter((p) => p.startsWith('-'))
        const hasFlag = (f: string) => flags.some((fl) => fl === f.toLowerCase())

        // Step 1: basic nmap scan
        if (c === 'nmap 192.168.1.5' && !steps[0].completed) { completeStep(1); return }

        // Step 2: version detection (-sV or -sv)
        if (hasFlag('-sv') && c.includes('192.168.1.5') && !steps[1].completed) { completeStep(2); return }

        // Step 3: targeted port scan (-p flag, not -p-)
        if (hasFlag('-p') && !c.includes('-p-') && c.includes('192.168.1.5') && !steps[2].completed) { completeStep(3); return }

        // Step 4: OS fingerprinting (-O)
        if (hasFlag('-o') && c.includes('192.168.1.5') && !steps[3].completed) { completeStep(4); return }

        // Step 5: aggressive scan (-A)
        if (hasFlag('-a') && !hasFlag('-t4') && c.includes('192.168.1.5') && !steps[4].completed) { completeStep(5); return }

        // Step 6: full port scan (-p-)
        if (c.includes('-p-') && c.includes('192.168.1.5') && !steps[5].completed) { completeStep(6); return }

        // Step 7: UDP scan (-sU or -su)
        if (hasFlag('-su') && c.includes('192.168.1.5') && !steps[6].completed) { completeStep(7); return }

        // Step 8: fast scan (-T4 -F)
        if (hasFlag('-t4') && hasFlag('-f') && c.includes('192.168.1.5') && !steps[7].completed) { completeStep(8); return }

        // Step 9: NSE vuln scripts
        if (c.includes('--script') && c.includes('vuln') && c.includes('192.168.1.5') && !steps[8].completed) { completeStep(9); return }

        // Step 10: host discovery ping sweep
        if (hasFlag('-sn') && (c.includes('192.168.1.0') || c.includes('/24')) && !steps[9].completed) {
            completeStep(10)
            setShowCelebration(true)
        }
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
                                    Lab 02
                                </span>
                                <span className="font-mono text-xs text-neon-amber/70 bg-neon-amber/10 border border-neon-amber/20 px-2 py-1 rounded-full">
                                    Intermediate · 150 pts
                                </span>
                            </div>
                            <h1 className="font-mono font-black text-2xl text-white">El-Tafteesh</h1>
                            <p className="font-mono text-xs text-neon-amber mt-0.5">
                                Active Port Scanning with Nmap
                            </p>
                            <p className="font-cairo text-xs text-gray-500 italic mt-1">
                                (يعني تطق على كل باب وتشوف مين بيفتح 🔭)
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
                                        Lab Complete! مبروك يا نقيب 🎉
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
                                                    {/* Tool badge — always terminal */}
                                                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-full text-neon-green/70 bg-neon-green/10">
                                                        💻 Terminal
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
                                                            {reviewingStepId === step.id
                                                                ? <ChevronUp size={11} />
                                                                : <ChevronDown size={11} />
                                                            }
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
                                                                    <span className="text-neon-amber">Terminal</span>:
                                                                </span>
                                                                <code className="block font-mono text-sm text-neon-green mt-1 break-all">
                                                                    {step.hint}
                                                                </code>
                                                            </div>

                                                            {/* Arabic quip */}
                                                            <p className="font-cairo text-xs text-neon-orange/60 italic mt-2">
                                                                {step.quipAr}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Review panel for completed steps */}
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

                        {/* Reset */}
                        <div className="mt-4">
                            <button
                                onClick={resetProgress}
                                className="w-full font-mono text-xs text-gray-600 hover:text-neon-amber border border-dark-border hover:border-neon-amber/30 rounded-lg py-2 transition-all"
                            >
                                ↺ Reset Lab Progress
                            </button>
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
                                    'Nmap — the go-to port scanning tool',
                                    '-sV — version detection for CVE hunting',
                                    '-p — targeted scans for speed & stealth',
                                    '-O — OS fingerprinting via TCP/IP stack',
                                    '-A — aggressive full-scan (loud!)',
                                    'open / closed / filtered — port states',
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

                {/* ── Right: Nmap Terminal ─────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Tab bar — single tab, mirrors Lab 01 style */}
                    <div className="flex border-b border-dark-border bg-dark-bg flex-shrink-0">
                        <div
                            className="flex items-center gap-2 px-6 py-3 font-mono text-sm border-b-2 border-neon-amber text-neon-amber bg-neon-amber/5"
                        >
                            <Terminal size={14} />
                            💻 Terminal
                            <span className="text-xs opacity-50">steps 1–5</span>
                        </div>
                        <div className="ml-auto flex items-center pr-4 gap-2">
                            <span className="font-mono text-xs text-neon-amber/60">
                                {completedCount}/{totalSteps} done
                            </span>
                            <span className="font-mono text-xs text-gray-700 bg-dark-card border border-dark-border/50 px-3 py-1 rounded-full">
                                ⚠ Simulated
                            </span>
                        </div>
                    </div>

                    {/* Terminal panel */}
                    <div className="flex-1 overflow-hidden p-5">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full"
                        >
                            <NmapTerminal
                                currentStepId={currentStepId}
                                onCommandRun={handleCommandRun}
                            />
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Completion celebration */}
            <LabCompletionCelebration
                isOpen={showCelebration}
                labTitle="El-Tafteesh"
                labNumber="02"
                points={150}
                onClose={() => setShowCelebration(false)}
            />

            {/* Floating smart assistant */}
            <FloatingAssistant
                currentStepId={currentStepId}
                steps={steps}
                allComplete={allComplete}
            />
        </div>
    )
}
