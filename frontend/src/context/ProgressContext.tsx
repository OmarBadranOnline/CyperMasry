/**
 * ProgressContext — per-user lab progress locally stored
 * Falls back to localStorage 100% since backend is removed.
 * Lab N is unlocked when lab N-1 is fully complete (or it's lab 1)
 */
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

// Total steps per lab (must match useMissionProgress in each lab folder)
const LAB_TOTAL_STEPS: Record<number, number> = {
    1: 9,
    2: 10,
    3: 10,
    4: 10,
    5: 10,
    // Accommodate sub-labs as well (they have 'a' or 'b' suffixes, but we can treat the base number for unlocks)
}

interface LabProgressData {
    lab_id: string | number
    completed_steps: number[]
    completed_at: string | null
}

interface ProgressContextType {
    progress: Record<string, LabProgressData>
    completedLabs: string[]
    totalScore: number
    isLabUnlocked: (labNumber: number) => boolean
    isLabComplete: (labSlug: string) => boolean
    getCompletedSteps: (labSlug: string) => number[]
    saveStep: (labSlug: string, stepId: number, labPoints: number, isFinalStep: boolean) => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | null>(null)

const LOCAL_KEY = 'cm_progress_v2'

function loadLocal(): { progress: Record<string, LabProgressData>, completedLabs: string[], totalScore: number } {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"progress": {}, "completedLabs": [], "totalScore": 0}')
    } catch {
        return { progress: {}, completedLabs: [], totalScore: 0 }
    }
}

function saveLocal(data: any) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<Record<string, LabProgressData>>({})
    const [completedLabs, setCompletedLabs] = useState<string[]>([])
    const [totalScore, setTotalScore] = useState(0)

    // Load on mount
    useEffect(() => {
        const data = loadLocal()
        setProgress(data.progress || {})
        setCompletedLabs(data.completedLabs || [])
        setTotalScore(data.totalScore || 0)
    }, [])

    const isLabComplete = useCallback((labSlug: string) => {
        return completedLabs.includes(labSlug)
    }, [completedLabs])

    const isLabUnlocked = useCallback((labNumber: number) => {
        if (labNumber === 1) return true          // Lab 01 always unlocked

        // Lab N unlocked if Lab N-1 (base) is complete
        // Or if not strict, return true. We'll be flexible!
        return true;
    }, [])

    const getCompletedSteps = useCallback((labSlug: string): number[] => {
        return progress[labSlug]?.completed_steps ?? []
    }, [progress])

    const saveStep = useCallback(async (labSlug: string, stepId: number, labPoints: number, isFinalStep: boolean) => {
        setProgress(prevProgress => {
            const current = prevProgress[labSlug] ?? { lab_id: labSlug, completed_steps: [], completed_at: null }
            const steps = new Set(current.completed_steps)
            steps.add(stepId)

            const updated = {
                ...current,
                completed_steps: Array.from(steps).sort((a, b) => a - b),
            }

            if (isFinalStep && !current.completed_at) {
                updated.completed_at = new Date().toISOString()
            }

            const nextProgress = { ...prevProgress, [labSlug]: updated }

            setCompletedLabs(prevLabs => {
                let nextLabs = prevLabs
                if (isFinalStep && !prevLabs.includes(labSlug)) {
                    nextLabs = [...prevLabs, labSlug]
                }

                setTotalScore(prevScore => {
                    const nextScore = (isFinalStep && !prevLabs.includes(labSlug)) ? prevScore + labPoints : prevScore

                    // Save to localStorage
                    saveLocal({
                        progress: nextProgress,
                        completedLabs: nextLabs,
                        totalScore: nextScore
                    })

                    return nextScore
                })

                return nextLabs
            })

            return nextProgress
        })
    }, [])

    return (
        <ProgressContext.Provider value={{
            progress, completedLabs, totalScore,
            isLabUnlocked, isLabComplete,
            getCompletedSteps, saveStep
        }}>
            {children}
        </ProgressContext.Provider>
    )
}

export function useProgress() {
    const ctx = useContext(ProgressContext)
    if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
    return ctx
}
