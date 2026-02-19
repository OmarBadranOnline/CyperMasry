/**
 * Lab 04 — El-Ekhteraq (SQL Injection)
 * Layout: left mission-tracker + right SQLiTerminal
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Terminal, ChevronLeft, CheckCircle, Circle, Loader, Trophy, Zap, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FloatingAssistant from '../../components/FloatingAssistant'
import LabCompletionCelebration from '../../components/LabCompletionCelebration'
import SQLiTerminal from './SQLiTerminal'
import { useMissionProgress } from './useMissionProgress'

export default function Lab04() {
    const navigate = useNavigate()
    const [reviewingStepId, setReviewingStepId] = useState<number | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const { steps, currentStepId, allComplete, completedCount, completeStep, resetProgress } = useMissionProgress()

    const totalSteps = steps.length
    const progressPct = Math.round((completedCount / totalSteps) * 100)

    useEffect(() => { if (allComplete) setShowCelebration(true) }, [allComplete])

    const handleCommandRun = (cmd: string) => {
        const c = cmd.trim().toLowerCase()
        // Step 1: single quote error test
        if (c.includes("--user \"'\"") && !steps[0].completed) { completeStep(1); return }
        // Step 2: OR 1=1 bypass
        if ((c.includes("or '1'='1") || c.includes('or 1=1')) && !steps[1].completed) { completeStep(2); return }
        // Step 3: comment bypass admin'--
        if (c.includes("admin'--") && !steps[2].completed) { completeStep(3); return }
        // Step 4: ORDER BY
        if (c.includes('order by') && !steps[3].completed) { completeStep(4); return }
        // Step 5: UNION SELECT version
        if (c.includes('union select') && c.includes('version()') && !steps[4].completed) { completeStep(5); return }
        // Step 6: information_schema
        if (c.includes('information_schema.tables') && !steps[5].completed) { completeStep(6); return }
        // Step 7: dump users with concat
        if (c.includes('from users') && c.includes('concat') && !steps[6].completed) { completeStep(7); return }
        // Step 8: length(password)
        if (c.includes('length(password)') && !steps[7].completed) { completeStep(8); return }
        // Step 9: LOAD_FILE
        if (c.includes('load_file') && !steps[8].completed) { completeStep(9); return }
        // Step 10: INTO OUTFILE web shell
        if (c.includes('into outfile') && c.includes('shell.php') && !steps[9].completed) { completeStep(10); setShowCelebration(true) }
    }

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <Header />
            <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-dark-border">
                <motion.div className="h-full bg-neon-amber" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} style={{ boxShadow: '0 0 8px #FFBF00' }} />
            </div>
            <main className="flex-1 pt-20 flex flex-col lg:flex-row overflow-hidden">
                <aside className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-dark-border overflow-y-auto">
                    <div className="p-5">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-neon-amber transition-colors mb-5 group">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Labs
                        </button>
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-gray-600 bg-dark-card border border-dark-border px-2 py-1 rounded-full">Lab 04</span>
                                <span className="font-mono text-xs text-neon-amber/70 bg-neon-amber/10 border border-neon-amber/20 px-2 py-1 rounded-full">Intermediate · 200 pts</span>
                            </div>
                            <h1 className="font-mono font-black text-2xl text-white">El-Ekhteraq</h1>
                            <p className="font-mono text-xs text-neon-amber mt-0.5">SQL Injection — Breaking the Login</p>
                            <p className="font-cairo text-xs text-gray-500 italic mt-1">(بتكتب كود في خانة الاسم وبتاخد أكتر مما المبرمج قصد 😈)</p>
                        </div>
                        <div className="bg-dark-card border border-dark-border rounded-xl p-3 mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs text-gray-500">Mission Progress</span>
                                <span className="font-mono text-xs text-neon-amber font-bold">{completedCount}/{totalSteps} steps</span>
                            </div>
                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                                <motion.div className="h-full bg-neon-amber rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
                            </div>
                            {allComplete && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2">
                                    <Trophy size={14} className="text-neon-amber" />
                                    <span className="font-mono text-xs text-neon-amber font-bold">Lab Complete! مبروك يا نقيب 🎉</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {steps.map((step) => {
                                const isActive = step.id === currentStepId
                                const isDone = step.completed
                                return (
                                    <motion.div key={step.id} layout className={`rounded-xl border p-3 transition-all duration-300 ${isDone ? 'border-neon-green/40 bg-neon-green/5' : isActive ? 'border-neon-amber/50 bg-neon-amber/5' : 'border-dark-border bg-dark-card opacity-40'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {isDone ? <CheckCircle size={16} className="text-neon-green" /> : isActive ? (
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Loader size={16} className="text-neon-amber" /></motion.div>
                                                ) : <Circle size={16} className="text-gray-700" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs text-gray-600">#{step.id}</span>
                                                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-full text-red-400/70 bg-red-400/10">💉 SQLi Lab</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-mono text-xs font-bold ${isDone ? 'text-neon-green/70' : isActive ? 'text-white' : 'text-gray-600'}`}>{step.title}</p>
                                                    {isDone && (
                                                        <button onClick={() => setReviewingStepId((p) => p === step.id ? null : step.id)}
                                                            className="flex items-center gap-1 font-mono text-xs text-neon-green/50 hover:text-neon-green transition-colors ml-2 flex-shrink-0">
                                                            <RotateCcw size={11} />{reviewingStepId === step.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                        </button>
                                                    )}
                                                </div>
                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                            <p className="font-mono text-xs text-gray-400 mt-2 leading-relaxed">{step.objective}</p>
                                                            <div className="mt-2 bg-dark-bg border border-neon-amber/20 rounded-lg p-2">
                                                                <span className="font-mono text-xs text-neon-amber/60">💡 Payload to inject:</span>
                                                                <code className="block font-mono text-sm text-neon-green mt-1 break-all">{step.hint}</code>
                                                            </div>
                                                            <p className="font-cairo text-xs text-neon-orange/60 italic mt-2">{step.quipAr}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <AnimatePresence>
                                                    {isDone && reviewingStepId === step.id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                            <div className="mt-2 pt-2 border-t border-neon-green/20 space-y-2">
                                                                <p className="font-mono text-xs text-gray-400 leading-relaxed">{step.objective}</p>
                                                                <div className="bg-dark-bg border border-neon-green/20 rounded-lg p-2">
                                                                    <span className="font-mono text-xs text-neon-green/50">✓ Payload used:</span>
                                                                    <code className="block font-mono text-sm text-neon-green/80 mt-1 break-all">{step.hint}</code>
                                                                </div>
                                                                <p className="font-cairo text-xs text-neon-green/50 italic">{step.quipAr}</p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {isDone && reviewingStepId !== step.id && <p className="font-mono text-xs text-neon-green/40 mt-1">✓ Injected</p>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                        <div className="mt-4">
                            <button onClick={resetProgress} className="w-full font-mono text-xs text-gray-600 hover:text-neon-amber border border-dark-border hover:border-neon-amber/30 rounded-lg py-2 transition-all">
                                ↺ Reset Lab Progress
                            </button>
                        </div>
                        <div className="mt-5 border-t border-dark-border pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={14} className="text-gray-500" />
                                <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">What you're learning</span>
                            </div>
                            <div className="space-y-1">
                                {["Error-based SQLi detection (single quote test)", "Auth bypass: ' OR '1'='1 — always true", "Comment injection: admin'-- removes password check", "ORDER BY — counting columns for UNION attack", "UNION SELECT — extracting data from other tables", "information_schema — the database's own directory", "MD5 hash cracking with hashcat & rainbow tables", "LOAD_FILE → file read, INTO OUTFILE → web shell", "Fix: use parameterized queries (PDO / prepared statements)"].map((c) => (
                                    <div key={c} className="flex items-start gap-2">
                                        <Zap size={10} className="text-neon-amber/50 mt-1 flex-shrink-0" />
                                        <span className="font-mono text-xs text-gray-600">{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex border-b border-dark-border bg-dark-bg flex-shrink-0">
                        <div className="flex items-center gap-2 px-6 py-3 font-mono text-sm border-b-2 border-neon-amber text-neon-amber bg-neon-amber/5">
                            <Terminal size={14} />💉 SQLi Terminal
                            <span className="text-xs opacity-50">10 steps</span>
                        </div>
                        <div className="ml-auto flex items-center pr-4 gap-2">
                            <span className="font-mono text-xs text-neon-amber/60">{completedCount}/{totalSteps} done</span>
                            <span className="font-mono text-xs text-red-400/60 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full">⚠ Simulated</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-5">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
                            <SQLiTerminal currentStepId={currentStepId} onCommandRun={handleCommandRun} />
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
            <LabCompletionCelebration isOpen={showCelebration} labTitle="El-Ekhteraq" labNumber="04" points={200} onClose={() => setShowCelebration(false)} />
            <FloatingAssistant currentStepId={currentStepId} steps={steps} allComplete={allComplete} labId={4} />
        </div>
    )
}
