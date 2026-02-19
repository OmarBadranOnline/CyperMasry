/**
 * ProgressContext — per-user lab progress
 * Syncs with backend POST /api/progress and GET /api/progress
 * Falls back to localStorage when server is offline
 * Lab N is unlocked when lab N-1 is fully complete (or it's lab 1)
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'

import { API_URL as API } from '../config'

// Total steps per lab (must match useMissionProgress in each lab folder)
const LAB_TOTAL_STEPS: Record<number, number> = {
    1: 9,
    2: 10,
    3: 10,
    4: 10,
    5: 10,
}

interface LabProgressData {
    lab_id: number
    completed_steps: number[]
    completed_at: string | null
}

interface ProgressContextType {
    progress: Record<number, LabProgressData>
    completedLabs: number[]
    totalScore: number
    isLabUnlocked: (labNumber: number) => boolean
    isLabComplete: (labNumber: number) => boolean
    getCompletedSteps: (labNumber: number) => number[]
    saveStep: (labId: number, stepId: number) => Promise<void>
    reloadProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | null>(null)

const LOCAL_KEY = 'cm_progress'

function loadLocal(): Record<number, LabProgressData> {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') }
    catch { return {} }
}

function saveLocal(p: Record<number, LabProgressData>) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(p))
}

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth()
    const [progress, setProgress] = useState<Record<number, LabProgressData>>(loadLocal)
    const [completedLabs, setCompletedLabs] = useState<number[]>([])
    const [totalScore, setTotalScore] = useState(0)

    const authHeader = useCallback(() =>
        token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : null,
        [token])

    const reloadProgress = useCallback(async () => {
        const headers = authHeader()
        if (!headers) {
            // Offline/not-logged-in: use localStorage
            setProgress(loadLocal())
            return
        }
        try {
            const res = await fetch(`${API}/api/progress`, {
                headers,
                signal: AbortSignal.timeout(4000),
            })
            if (!res.ok) return
            const data = await res.json()
            // data.progress is {lab_id: LabProgressData}
            const progressMap: Record<number, LabProgressData> = {}
            for (const [lid, val] of Object.entries(data.progress)) {
                progressMap[Number(lid)] = val as LabProgressData
            }
            setProgress(progressMap)
            setCompletedLabs(data.completed_labs || [])
            setTotalScore(data.total_score || 0)
            saveLocal(progressMap)
        } catch {
            // Offline fallback
            setProgress(loadLocal())
        }
    }, [authHeader])

    // Reload when user changes
    useEffect(() => { reloadProgress() }, [reloadProgress, user?.id])

    const isLabComplete = useCallback((labNumber: number) => {
        const total = LAB_TOTAL_STEPS[labNumber] ?? 10
        const prog = progress[labNumber]
        if (!prog) return false
        return prog.completed_steps.length >= total
    }, [progress])

    const isLabUnlocked = useCallback((labNumber: number) => {
        if (labNumber === 1) return true          // Lab 01 always unlocked
        if (!user) return false                   // Must be logged in for labs 2-5
        return isLabComplete(labNumber - 1)       // Unlock lab N when N-1 complete
    }, [user, isLabComplete])

    const getCompletedSteps = useCallback((labNumber: number): number[] => {
        return progress[labNumber]?.completed_steps ?? []
    }, [progress])

    const saveStep = useCallback(async (labId: number, stepId: number) => {
        // Optimistic local update
        setProgress(prev => {
            const current = prev[labId] ?? { lab_id: labId, completed_steps: [], completed_at: null }
            const steps = new Set(current.completed_steps)
            steps.add(stepId)
            const updated = {
                ...current,
                completed_steps: Array.from(steps).sort((a, b) => a - b),
            }
            const next = { ...prev, [labId]: updated }
            saveLocal(next)
            return next
        })

        // Attempt server sync
        const headers = authHeader()
        if (!headers) return
        try {
            const res = await fetch(`${API}/api/progress`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ lab_id: labId, step_id: stepId }),
                signal: AbortSignal.timeout(5000),
            })
            if (res.ok) {
                const data = await res.json()
                if (data.lab_completed) {
                    setCompletedLabs(prev => [...new Set([...prev, labId])])
                    setTotalScore(data.new_total_score)
                }
            }
        } catch {
            // Offline — local update already done, that's fine
        }
    }, [authHeader])

    return (
        <ProgressContext.Provider value={{
            progress, completedLabs, totalScore,
            isLabUnlocked, isLabComplete,
            getCompletedSteps, saveStep, reloadProgress,
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
