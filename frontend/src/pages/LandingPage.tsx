import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Shield, Terminal, ChevronRight, Lock } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MatrixBackground from '../components/MatrixBackground'
import { LAB_REGISTRY, TOTAL_POINTS } from '../labs/registry'



export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-dark-bg relative">
            <MatrixBackground />
            <Header />

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
                {/* Course badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 bg-neon-amber/10 border border-neon-amber/30 rounded-full px-4 py-2 mb-8"
                >
                    <Terminal size={14} className="text-neon-amber" />
                    <span className="font-mono text-xs text-neon-amber">
                        IT 102 · Ethical Hacking · Zewail City
                    </span>
                </motion.div>

                {/* Main headline — English */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-4"
                >
                    <h1 className="font-mono font-black text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-3">
                        From Zero to{' '}
                        <span
                            className="neon-text-amber"
                            style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
                        >
                            Hero.
                        </span>
                    </h1>
                    <h2 className="font-mono font-bold text-xl md:text-2xl text-gray-400">
                        No walls hit. No BS. Just real hacking skills.
                    </h2>
                </motion.div>

                {/* Arabic quip — the "honey" */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22 }}
                    className="font-cairo text-lg text-neon-orange/80 mb-4 italic"
                >
                    (من غير ما تلبس في الحيط.. تقريباً 😄)
                </motion.p>

                {/* Subtext — English */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="font-mono text-base text-gray-500 max-w-xl mb-10"
                >
                    An interactive hacking lab for IT 102 students at Zewail City.
                    Learn Reconnaissance, Scanning & more — in a safe, fully simulated environment.
                </motion.p>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.35, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/lab/${LAB_REGISTRY[0]?.slug ?? 'lab01'}`)}
                    className="group relative overflow-hidden bg-neon-amber text-black font-mono font-black text-xl md:text-2xl px-10 py-5 rounded-2xl transition-all duration-300 mb-3"
                    style={{ boxShadow: '0 0 30px rgba(255, 191, 0, 0.4)' }}
                >
                    <span className="relative z-10 flex items-center gap-3">
                        Start Hacking
                        <Zap size={24} className="group-hover:animate-bounce" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </motion.button>

                {/* Arabic hype below button */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="font-cairo text-sm text-gray-600 italic"
                >
                    يلا نبدأ يا وحش! 💪
                </motion.p>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-8 mt-14"
                >
                    {[
                        { value: String(LAB_REGISTRY.length), label: 'Labs' },
                        { value: String(TOTAL_POINTS), label: 'Points' },
                        { value: '100%', label: 'Simulated' },
                    ].map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="font-mono text-2xl font-bold text-neon-amber">{value}</div>
                            <div className="font-mono text-xs text-gray-600 mt-1">{label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 8, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 font-mono text-xs text-gray-700"
                >
                    ↓ scroll to explore labs
                </motion.div>
            </section>

            {/* ── Labs Section ────────────────────────────────────────── */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="font-mono text-neon-amber/60 text-sm mb-2">// available_labs</div>
                        <h2 className="font-mono font-bold text-3xl text-white">Available Labs</h2>
                        <p className="font-mono text-sm text-gray-600 mt-2">
                            Complete in order. Each lab unlocks new skills.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {LAB_REGISTRY.map((lab, i) => (
                            <motion.div
                                key={lab.slug}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => !lab.locked && navigate(`/lab/${lab.slug}`)}
                                className={`cyber-card p-6 flex items-center gap-6 ${lab.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                            >
                                <div className="text-4xl flex-shrink-0">{lab.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <span className="font-mono text-xs text-gray-600">Lab {lab.number}</span>
                                        {lab.isNew && (
                                            <span className="font-mono text-xs text-neon-green/80 bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full animate-pulse">
                                                New!
                                            </span>
                                        )}
                                        <span className="font-mono text-xs text-neon-amber/70 bg-neon-amber/10 px-2 py-0.5 rounded-full">
                                            {lab.difficulty}
                                        </span>
                                        <span className="font-mono text-xs text-neon-green/70 bg-neon-green/10 px-2 py-0.5 rounded-full">
                                            +{lab.points} pts
                                        </span>
                                        <span className="font-mono text-xs text-gray-600">
                                            ⏱ {lab.estimatedTime}
                                        </span>
                                    </div>
                                    <h3 className="font-mono text-lg font-bold text-white">{lab.titleEn}</h3>
                                    <p className="font-mono text-sm text-gray-500 mt-0.5">{lab.subtitleEn}</p>
                                    <p className="font-cairo text-xs text-neon-orange/60 mt-1.5 italic">
                                        {lab.quipAr}
                                    </p>
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {lab.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="font-mono text-xs text-gray-700 bg-dark-bg border border-dark-border/50 px-1.5 py-0.5 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {lab.locked ? (
                                        <Lock size={20} className="text-gray-600" />
                                    ) : (
                                        <ChevronRight size={20} className="text-neon-amber" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why Section ─────────────────────────────────────────── */}
            <section className="relative z-10 py-16 px-6 border-t border-dark-border">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-mono font-bold text-2xl text-white mb-2">
                            Why this platform is different
                        </h2>
                        <p className="font-cairo text-sm text-gray-500 italic mb-10">
                            ليه دي مش زي أي كورس تاني؟
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <Shield size={28} className="text-neon-amber" />,
                                    titleEn: '100% Safe',
                                    descEn: 'Fully simulated environment. No real servers touched.',
                                    quipAr: 'مفيش حبس هنا يا عم 😂',
                                },
                                {
                                    icon: <Zap size={28} className="text-neon-orange" />,
                                    titleEn: 'Learn by Doing',
                                    descEn: 'Real commands, fake targets. Muscle memory that sticks.',
                                    quipAr: 'أحسن من إنك تحفظ سلايدات 💀',
                                },
                                {
                                    icon: <Terminal size={28} className="text-neon-green" />,
                                    titleEn: 'Egyptian Flavor',
                                    descEn: 'Technical content with relatable commentary.',
                                    quipAr: 'بالعربي المصري الصح ☕',
                                },
                            ].map(({ icon, titleEn, descEn, quipAr }) => (
                                <div key={titleEn} className="cyber-card p-6 text-center">
                                    <div className="flex justify-center mb-4">{icon}</div>
                                    <h3 className="font-mono font-bold text-lg text-white mb-1">{titleEn}</h3>
                                    <p className="font-mono text-sm text-gray-500 mb-2">{descEn}</p>
                                    <p className="font-cairo text-xs text-neon-orange/60 italic">{quipAr}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
