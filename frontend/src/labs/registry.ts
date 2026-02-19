/**
 * Lab Registry — AUTO-DISCOVERY via Vite glob
 *
 * Drop a new folder inside src/labs/ with a `meta.ts` file and it will
 * automatically appear on the home page. No manual imports needed.
 *
 * Required folder structure for each lab:
 *   src/labs/labXX/
 *     ├── meta.ts     ← LabMeta default export  (required)
 *     └── Page.tsx    ← React component default export  (required)
 */
import type { LabMeta } from './types'

// Eagerly import every meta.ts inside any immediate subfolder of src/labs/
const metaModules = import.meta.glob('./*/meta.ts', { eager: true }) as Record<
    string,
    { default: LabMeta }
>

// Build the registry: parse, sort by number, export
export const LAB_REGISTRY: LabMeta[] = Object.values(metaModules)
    .map((m) => m.default)
    .sort((a, b) => a.number.localeCompare(b.number))

// Helper to find a single lab by slug
export function findLab(slug: string): LabMeta | undefined {
    return LAB_REGISTRY.find((lab) => lab.slug === slug)
}

// Total available (unlocked) points across all labs
export const TOTAL_POINTS = LAB_REGISTRY.filter((l) => !l.locked).reduce(
    (sum, l) => sum + l.points,
    0
)
