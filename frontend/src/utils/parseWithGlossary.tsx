import React from 'react'
import { GLOSSARY_MAP } from '../data/glossary'
import TermTooltip from '../components/TermTooltip'

/**
 * Parses a plain text string and returns React nodes where known glossary terms
 * are wrapped in <TermTooltip> components.
 *
 * Matching is case-insensitive and matches whole words (won't match "DNS" inside "DNSSEC" separately).
 */
export function parseWithGlossary(text: string, key?: string): React.ReactNode {
    if (!text) return text

    // Build a regex from all glossary keys, sorted longest-first to avoid partial matches
    const terms = Object.keys(GLOSSARY_MAP).sort((a, b) => b.length - a.length)

    // Escape special regex characters
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')

    const parts = text.split(pattern)

    return (
        <>
            {parts.map((part, i) => {
                const entry = GLOSSARY_MAP[part.toLowerCase()]
                if (entry) {
                    return (
                        <TermTooltip key={`${key ?? ''}-${i}`} entry={entry}>
                            {part}
                        </TermTooltip>
                    )
                }
                return <React.Fragment key={`${key ?? ''}-${i}`}>{part}</React.Fragment>
            })}
        </>
    )
}
