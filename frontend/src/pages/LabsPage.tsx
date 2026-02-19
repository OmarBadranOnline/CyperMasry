import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Lock, ChevronRight, Trophy, Zap, Clock, Star,
    CheckCircle2, BarChart2, Target, RefreshCw,
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MatrixBackground from '../components/MatrixBackground'
import { LAB_REGISTRY, TOTAL_POINTS } from '../labs/registry'
import type { LabMeta } from '../labs/types'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'

const LAB_TOTAL_STEPS: Record<string, number> = {
    lab01: 9, lab02: 10, lab03: 10, lab04: 10, lab05: 10,
}

// ── Difficulty color helper ──────────────────────────────────────────────────
function difficultyStyle(d: LabMeta['difficulty']) {
    if (d === 'Beginner') return 'text-neon-green/80 bg-neon-green/10 border-neon-green/25'
    if (d === 'Intermediate') return 'text-neon-amber/80 bg-neon-amber/10 border-neon-amber/25'
    return 'text-red-400/80 bg-red-400/10 border-red-400/25'
}

// ── Lab Card ─────────────────────────────────────────────────────────────────
function LabCard({ lab, index }: { lab: LabMeta; index: number }) {
    const navigate = useNavigate()
    const { getCompletedSteps, isLabUnlocked } = useProgress()
    const { user } = useAuth()

    const labNumber = parseInt(lab.number, 10)
    const totalSteps = LAB_TOTAL_STEPS[lab.slug] ?? 10
    const completedArr = getCompletedSteps(labNumber)
    const completed = completedArr.length
    const pct = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0
    const progress = { completed, total: totalSteps, pct }

    // Dynamically locked: lab > 1 needs previous complete AND user logged in
    const dynamicallyLocked = labNumber > 1 && !isLabUnlocked(labNumber)
    const effectiveLocked = lab.locked || dynamicallyLocked

    const isDone = pct === 100
    const hasStarted = completed > 0 && !isDone

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={!effectiveLocked ? { y: -4, scale: 1.01 } : {}}
            onClick={() => !effectiveLocked && navigate(`/lab/${lab.slug}`)}
            className={`group relative rounded-2xl border bg-dark-card overflow-hidden transition-all duration-300 ${effectiveLocked
                ? 'border-dark-border opacity-60 cursor-not-allowed'
                : isDone
                    ? 'border-neon-green/40 cursor-pointer hover:border-neon-green/70'
                    : hasStarted
                        ? 'border-neon-amber/40 cursor-pointer hover:border-neon-amber/70'
                        : 'border-dark-border/80 cursor-pointer hover:border-neon-amber/40'
                }}`}
            style={
                isDone
                    ? { boxShadow: '0 0 20px rgba(0,255,65,0.07)' }
                    : hasStarted
                        ? { boxShadow: '0 0 20px rgba(255,191,0,0.06)' }
                        : undefined
            }
        >
            {/* Completed banner */}
            {isDone && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-green via-neon-amber to-neon-green" />
            )}

            {/* In-progress bar top */}
            {hasStarted && !isDone && (
                <div className="absolute top-0 left-0 h-0.5 bg-neon-amber/70" style={{ width: `${pct}%` }} />
            )}

            {/* Dynamic lock overlay tooltip */}
            {dynamicallyLocked && !lab.locked && (
                <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center">
                        <div className="text-3xl mb-1">🔒</div>
                        <p className="font-cairo text-xs text-gray-500">{user ? 'أكمل اللاب اللي قبله الأول' : 'سجّل دخولك عشان تفتح الـ labs'}</p>
                        {!user && <p className="font-mono text-xs text-neon-amber mt-1 underline cursor-pointer" onClick={e => { e.stopPropagation(); navigate('/login') }}>Login →</p>}
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                        className={`text-5xl flex-shrink-0 select-none ${effectiveLocked ? 'grayscale opacity-40' : ''}`}
                    >
                        {isDone ? '🏆' : lab.icon}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Row 1: badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-mono text-xs text-gray-600">Lab {lab.number}</span>

                            {lab.isNew && (
                                <span className="font-mono text-xs text-neon-green/90 bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full animate-pulse">
                                    New!
                                </span>
                            )}

                            <span className={`font-mono text-xs border px-2 py-0.5 rounded-full ${difficultyStyle(lab.difficulty)}`}>
                                {lab.difficulty}
                            </span>

                            <span className="font-mono text-xs text-neon-amber/70 bg-neon-amber/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Zap size={10} /> +{lab.points} pts
                            </span>

                            <span className="font-mono text-xs text-gray-600 flex items-center gap-1">
                                <Clock size={10} /> {lab.estimatedTime}
                            </span>

                            {isDone && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="font-mono text-xs text-neon-green bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    <CheckCircle2 size={10} /> Completed
                                </motion.span>
                            )}

                            {effectiveLocked && (
                                <span className="font-mono text-xs text-gray-600 flex items-center gap-1">
                                    <Lock size={10} /> {dynamicallyLocked && !lab.locked ? 'Complete prev lab' : 'Locked'}
                                </span>
                            )}
                        </div>

                        {/* Title + subtitle */}
                        <h2 className={`font-mono text-xl font-black mb-0.5 transition-colors ${effectiveLocked ? 'text-gray-600' : isDone ? 'text-neon-green' : 'text-white group-hover:text-neon-amber'
                            }`}>
                            {lab.titleEn}
                        </h2>
                        <p className="font-mono text-sm text-gray-500 mb-2">{lab.subtitleEn}</p>
                        <p className="font-cairo text-xs text-neon-orange/60 italic mb-3">{lab.quipAr}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {lab.tags.map((tag) => (
                                <span key={tag} className="font-mono text-xs text-gray-700 bg-dark-bg border border-dark-border/50 px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Progress */}
                        {!effectiveLocked && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-xs text-gray-600">
                                        {isDone ? 'All steps done 🎉' : hasStarted ? `${completed}/${totalSteps} steps` : 'Not started yet'}
                                    </span>
                                    <span className={`font-mono text-xs font-bold ${isDone ? 'text-neon-green' : 'text-neon-amber/70'}`}>
                                        {pct}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${isDone ? 'bg-neon-green' : 'bg-neon-amber'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        {!effectiveLocked && (
                            <div className={`mt-4 flex items-center gap-2 font-mono text-sm font-bold transition-colors ${isDone ? 'text-neon-green/70' : 'text-neon-amber/70 group-hover:text-neon-amber'
                                }`}>
                                {isDone ? (
                                    <>
                                        <RefreshCw size={14} /> Review Lab
                                    </>
                                ) : hasStarted ? (
                                    <>
                                        <Target size={14} /> Continue Mission <ChevronRight size={14} />
                                    </>
                                ) : (
                                    <>
                                        <ChevronRight size={14} /> Start Mission
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right arrow */}
                    {!effectiveLocked && (
                        <div className="flex-shrink-0 self-center">
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ChevronRight size={22} className={isDone ? 'text-neon-green/50' : 'text-neon-amber/50 group-hover:text-neon-amber'} />
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
    const { completedLabs, totalScore, getCompletedSteps } = useProgress()
    const completedCount = completedLabs.length
    const totalPct = LAB_REGISTRY.length > 0 ? Math.round((completedCount / LAB_REGISTRY.length) * 100) : 0
    const earnedPts = totalScore

    const stats = [
        { icon: <BarChart2 size={16} />, value: `${LAB_REGISTRY.filter(l => !l.locked).length}`, label: 'Available Labs' },
        { icon: <Star size={16} />, value: `${earnedPts} / ${TOTAL_POINTS}`, label: 'Points Earned' },
        { icon: <Trophy size={16} />, value: `${totalPct}%`, label: 'Overall Progress' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col sm:flex-row gap-4 mb-8"
        >
            {stats.map(({ icon, value, label }, i) => (
                <div key={label} className={`flex-1 flex items-center gap-3 ${i > 0 ? 'sm:border-l sm:border-dark-border sm:pl-4' : ''}`}>
                    <div className="text-neon-amber">{icon}</div>
                    <div>
                        <div className="font-mono text-xl font-black text-white">{value}</div>
                        <div className="font-mono text-xs text-gray-500">{label}</div>
                    </div>
                </div>
            ))}

            {/* Overall progress bar */}
            <div className="flex-1 flex flex-col justify-center sm:border-l sm:border-dark-border sm:pl-4">
                <div className="flex justify-between mb-1">
                    <span className="font-mono text-xs text-gray-500">Platform Progress</span>
                    <span className="font-mono text-xs text-neon-amber font-bold">{totalPct}%</span>
                </div>
                <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-neon-amber to-neon-green rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LabsPage() {
    const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'in-progress'>('all')

    const { isLabUnlocked, getCompletedSteps, isLabComplete } = useProgress()

    const filtered = LAB_REGISTRY.filter((lab) => {
        if (filter === 'all') return true
        const labNumber = parseInt(lab.number, 10)
        if (filter === 'available') return !lab.locked && isLabUnlocked(labNumber)
        if (filter === 'completed') return isLabComplete(labNumber)
        if (filter === 'in-progress') {
            const steps = getCompletedSteps(labNumber)
            return steps.length > 0 && !isLabComplete(labNumber)
        }
        return true
    })

    const filterOptions = [
        { id: 'all', label: 'All Labs' },
        { id: 'available', label: 'Unlocked' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
    ] as const

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <MatrixBackground />
            <Header />

            <main className="flex-1 pt-24 pb-16 relative z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">

                    {/* Page header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            className="inline-flex items-center gap-2 bg-neon-amber/10 border border-neon-amber/30 rounded-full px-4 py-1.5 mb-4"
                        >
                            <Target size={14} className="text-neon-amber" />
                            <span className="font-mono text-xs text-neon-amber tracking-wider uppercase">Mission Control</span>
                        </motion.div>

                        <h1 className="font-mono font-black text-4xl md:text-5xl text-white mb-2">
                            Cyber Labs
                        </h1>
                        <p className="font-mono text-sm text-gray-400 mb-2">
                            Select your mission. Learn real skills. Leave no trace.
                        </p>
                        <p className="font-cairo text-sm text-neon-amber/60 italic">
                            اختار المهمة — كل لاب بيعلمك حاجة جديدة 🎯
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <StatsBar />

                    {/* Filter bar */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {filterOptions.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={`font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200 ${filter === id
                                    ? 'bg-neon-amber text-black border-neon-amber font-bold'
                                    : 'bg-dark-card border-dark-border text-gray-400 hover:border-neon-amber/40 hover:text-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Lab cards */}
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? (
                            <div className="space-y-4">
                                {filtered.map((lab, i) => (
                                    <LabCard key={lab.slug} lab={lab} index={i} />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-16"
                            >
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="font-mono text-sm text-gray-500">No labs match this filter yet.</p>
                                <p className="font-cairo text-xs text-gray-600 mt-1 italic">بص على الفلتر التاني 😅</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Coming soon teaser */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 border border-dashed border-dark-border rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="font-mono text-sm text-gray-500">More labs coming soon.</p>
                        <p className="font-cairo text-xs text-gray-600 mt-1 italic">
                            ترتيب الـ labs الجاية — شبكات، كلمات مرور، و أكتر
                        </p>
                        <div className="flex justify-center gap-3 mt-4">
                            {['🌐 Network Scanning', '🔐 Password Cracking', '🎭 Phishing Sim'].map((t) => (
                                <span key={t} className="font-mono text-xs text-gray-700 bg-dark-card border border-dark-border px-3 py-1.5 rounded-full">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
