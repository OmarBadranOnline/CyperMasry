import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Confetti particle ────────────────────────────────────────────────────────
const COLORS = [
    '#FFBF00', // neon-amber
    '#00FF41', // neon-green
    '#FF6B2B', // neon-orange
    '#60A5FA', // blue
    '#F472B6', // pink
    '#34D399', // emerald
    '#A78BFA', // violet
]

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a)
}

interface Particle {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    rotation: number
    rotationSpeed: number
    shape: 'rect' | 'circle' | 'star'
    opacity: number
}

function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: randomBetween(10, 90),
        y: randomBetween(-20, 20),
        vx: randomBetween(-3, 3),
        vy: randomBetween(2, 7),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: randomBetween(6, 16),
        rotation: randomBetween(0, 360),
        rotationSpeed: randomBetween(-5, 5),
        shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
        opacity: 1,
    }))
}

// ── Canvas confetti animation ────────────────────────────────────────────────
function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>(generateParticles(180))
    const rafRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        // Capture in a narrowed const so the tick closure below sees a non-null canvas
        const c = canvas
        c.width = window.innerWidth
        c.height = window.innerHeight

        function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
            ctx.beginPath()
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
                const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2 + (2 * Math.PI) / 10
                if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
                else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
                ctx.lineTo(x + (r * 0.4) * Math.cos(outerAngle), y + (r * 0.4) * Math.sin(outerAngle))
            }
            ctx.closePath()
            ctx.fill()
        }

        function tick() {
            ctx.clearRect(0, 0, c.width, c.height)
            particlesRef.current = particlesRef.current
                .map((p) => ({
                    ...p,
                    x: p.x + p.vx * 0.3,
                    y: p.y + p.vy * 0.4,
                    rotation: p.rotation + p.rotationSpeed,
                    vy: p.vy + 0.05, // gravity
                    opacity: p.y > 110 ? Math.max(0, p.opacity - 0.015) : p.opacity,
                }))
                .filter((p) => p.opacity > 0)

            for (const p of particlesRef.current) {
                ctx.save()
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color
                ctx.translate((p.x / 100) * c.width, (p.y / 100) * c.height)
                ctx.rotate((p.rotation * Math.PI) / 180)
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
                } else if (p.shape === 'circle') {
                    ctx.beginPath()
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    drawStar(ctx, 0, 0, p.size / 2)
                }
                ctx.restore()
            }

            if (particlesRef.current.length > 0) {
                rafRef.current = requestAnimationFrame(tick)
            }
        }

        rafRef.current = requestAnimationFrame(tick)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1000]"
        />
    )
}

// ── Main celebration component ────────────────────────────────────────────────
interface Props {
    isOpen: boolean
    labTitle: string
    labNumber: string
    points: number
    onClose: () => void
}

export default function LabCompletionCelebration({ isOpen, labTitle, labNumber, points, onClose }: Props) {
    const [showConfetti, setShowConfetti] = useState(false)
    const triggerSound = useRef(false)

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true)
            triggerSound.current = true
            // Auto-dismiss confetti after 5s
            const t = setTimeout(() => setShowConfetti(false), 6000)
            return () => clearTimeout(t)
        } else {
            setShowConfetti(false)
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Confetti canvas */}
                    {showConfetti && <Confetti />}

                    {/* Dim backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.5, y: 60 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="fixed inset-0 z-[600] flex items-center justify-center px-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-md bg-dark-card border-2 border-neon-amber/60 rounded-3xl p-8 text-center relative overflow-hidden"
                            style={{ boxShadow: '0 0 60px rgba(255,191,0,0.25), 0 0 120px rgba(255,191,0,0.08)' }}
                        >
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-neon-amber/10 via-transparent to-neon-green/5 pointer-events-none" />

                            {/* Trophy */}
                            <motion.div
                                animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-8xl mb-4 inline-block"
                            >
                                🏆
                            </motion.div>

                            {/* Lab badge */}
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="font-mono text-xs text-gray-500 bg-dark-bg border border-dark-border px-3 py-1 rounded-full">
                                    Lab {labNumber}
                                </span>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="font-mono text-xs text-neon-green bg-neon-green/10 border border-neon-green/40 px-3 py-1 rounded-full"
                                >
                                    ✓ Complete
                                </motion.span>
                            </div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="font-mono font-black text-3xl text-white mb-1"
                            >
                                {labTitle}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="font-mono text-sm text-gray-400 mb-5"
                            >
                                Mission accomplished, hacker.
                            </motion.p>

                            {/* Arabic hype */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="font-cairo text-xl text-neon-amber font-bold mb-6"
                            >
                                مبروووك يا وحش! 🎉 إنت دلوقتي ريكون ماستر
                            </motion.p>

                            {/* Points burst */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                                className="inline-flex items-center gap-2 bg-neon-amber text-black font-mono font-black text-2xl px-8 py-3 rounded-2xl mb-6"
                                style={{ boxShadow: '0 0 30px rgba(255,191,0,0.4)' }}
                            >
                                +{points} pts
                                <motion.span
                                    animate={{ rotate: [0, 20, -20, 0] }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    ⚡
                                </motion.span>
                            </motion.div>

                            {/* What you learned pills */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-6"
                            >
                                <p className="font-mono text-xs text-gray-600 mb-2">Skills unlocked:</p>
                                <div className="flex flex-wrap justify-center gap-1.5">
                                    {['OSINT', 'WHOIS', 'DNS', 'HTTP Headers', 'Social Media Intel', 'Google Dorks'].map((skill, i) => (
                                        <motion.span
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.55 + i * 0.05 }}
                                            className="font-mono text-xs text-neon-green/80 bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded-full"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 font-mono text-sm bg-dark-bg border border-dark-border text-gray-400 py-3 rounded-xl hover:border-neon-amber/30 hover:text-gray-200 transition-all"
                                >
                                    Continue Lab
                                </button>
                                <motion.a
                                    href="/labs"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 font-mono text-sm bg-neon-amber text-black font-bold py-3 rounded-xl hover:bg-neon-amber/90 transition-all text-center"
                                    style={{ boxShadow: '0 0 20px rgba(255,191,0,0.3)' }}
                                >
                                    View All Labs →
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
