import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Flag, Trophy } from 'lucide-react'
import { useState } from 'react'

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    flag: string
}

export default function SuccessModal({ isOpen, onClose, flag }: SuccessModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(flag)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative z-10 w-full max-w-md bg-dark-card border border-neon-amber/50 rounded-xl overflow-hidden"
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{ boxShadow: '0 0 40px rgba(255, 191, 0, 0.3)' }}
                    >
                        {/* Confetti particles */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full pointer-events-none"
                                style={{
                                    background: i % 3 === 0 ? '#FFBF00' : i % 3 === 1 ? '#FF8C00' : '#00ff41',
                                    left: `${Math.random() * 100}%`,
                                    top: 0,
                                }}
                                initial={{ y: 0, opacity: 1 }}
                                animate={{ y: [0, -30, 80], opacity: [1, 1, 0], x: [(Math.random() - 0.5) * 60] }}
                                transition={{ duration: 1.5, delay: i * 0.05 }}
                            />
                        ))}

                        {/* Header bar */}
                        <div className="bg-neon-amber/10 border-b border-neon-amber/30 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy size={20} className="text-neon-amber" />
                                <span className="font-mono text-sm text-neon-amber font-bold">
                                    FLAG CAPTURED!
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-center space-y-5">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="text-5xl"
                            >
                                🎉
                            </motion.div>

                            {/* English headline, Arabic celebration sprinkled in */}
                            <div>
                                <h2 className="font-mono text-2xl font-bold text-neon-amber mb-1">
                                    You found it!
                                </h2>
                                <p className="font-mono text-sm text-gray-300">
                                    Admin panel located. Intel secured. Mission complete.
                                </p>
                                <p className="font-cairo text-base text-neon-orange mt-2 font-bold">
                                    مبروك عليك يا بطل! 🔥
                                </p>
                                <p className="font-mono text-xs text-gray-500 mt-1 italic">
                                    (That's "congrats, champ!" — in case you were wondering 😄)
                                </p>
                            </div>

                            {/* Flag Box */}
                            <div className="bg-black border border-neon-green/40 rounded-lg p-4 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flag size={14} className="text-neon-green" />
                                    <span className="font-mono text-xs text-neon-green/70">YOUR FLAG</span>
                                </div>
                                <div className="font-mono text-sm text-neon-green break-all">
                                    {flag}
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 bg-neon-amber/10 hover:bg-neon-amber/20 border border-neon-amber/40 hover:border-neon-amber text-neon-amber font-mono text-sm py-3 rounded-lg transition-all duration-200 font-bold"
                            >
                                {copied ? (
                                    <><CheckCircle size={16} /> Copied! يلا!</>
                                ) : (
                                    <><Copy size={16} /> Copy Flag</>
                                )}
                            </button>

                            <div className="font-mono text-xs text-gray-600">
                                +100 points · Lab 01 Complete ✓
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
