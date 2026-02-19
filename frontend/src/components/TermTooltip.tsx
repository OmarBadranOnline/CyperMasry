import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'
import type { GlossaryEntry } from '../data/glossary'

const CATEGORY_COLORS: Record<GlossaryEntry['category'], string> = {
    network: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    crypto: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    web: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10',
    os: 'text-neon-green border-neon-green/30 bg-neon-green/10',
    pentest: 'text-neon-amber border-neon-amber/30 bg-neon-amber/10',
}

interface Props {
    entry: GlossaryEntry
    children: React.ReactNode
}

export default function TermTooltip({ entry, children }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const catColor = CATEGORY_COLORS[entry.category]

    return (
        <span ref={ref} className="relative inline-block">
            {/* Highlighted term */}
            <span
                onClick={(e) => { e.stopPropagation(); setOpen((p) => !p) }}
                className="font-mono text-xs cursor-pointer underline decoration-dotted decoration-neon-amber/60 text-neon-amber/90 hover:text-neon-amber transition-colors"
                title={`Click to define: ${entry.term}`}
            >
                {children}
            </span>

            {/* Popup card */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[200] bottom-full left-0 mb-2 w-72 bg-dark-card border border-neon-amber/40 rounded-xl shadow-2xl"
                        style={{ boxShadow: '0 0 24px rgba(255,191,0,0.15)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-dark-border">
                            <div className="flex items-center gap-2">
                                <BookOpen size={13} className="text-neon-amber flex-shrink-0" />
                                <span className="font-mono text-sm font-bold text-neon-amber leading-none">
                                    {entry.term}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-mono text-xs px-1.5 py-0.5 rounded-full border ${catColor}`}>
                                    {entry.category}
                                </span>
                                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors ml-1">
                                    <X size={13} />
                                </button>
                            </div>
                        </div>

                        {/* English definition */}
                        <div className="px-4 pt-3 pb-2">
                            <p className="font-mono text-xs text-gray-300 leading-relaxed">
                                {entry.definitionEn}
                            </p>
                        </div>

                        {/* Arabic analogy */}
                        <div className="border-t border-dark-border mx-3 mb-3 pt-2">
                            <p className="font-cairo text-xs text-neon-orange/80 italic leading-relaxed">
                                {entry.analogyAr}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    )
}
