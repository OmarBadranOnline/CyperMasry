import { useState, useCallback } from 'react'
import { useProgress } from '../../context/ProgressContext'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'zoogle' | 'linkedin'
    title: string
    objective: string
    hint: string
    quipAr: string
    completed: boolean
}

const STORAGE_KEY = 'cybermasry_lab01_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', title: 'Identify Yourself',
        objective: 'Before anything else, confirm your identity and privileges.',
        hint: 'whoami',
        quipAr: 'اعرف إنت مين الأول.. مش زي ما تصحى وتنسى اسمك 😅',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', title: 'Domain Ownership',
        objective: 'Query the public registry to learn who owns the target domain.',
        hint: 'whois evilcorp.com',
        quipAr: 'بص على السجل.. فين صاحب الدومين ده ومتى جدده؟ 🔍',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', title: 'DNS Resolution',
        objective: 'Resolve the domain to its IP address and discover mail servers.',
        hint: 'nslookup evilcorp.com',
        quipAr: 'حول الاسم لعنوان حقيقي.. زي ما GPS بيحول اسم الشارع لإحداثيات 🗺️',
        completed: false,
    },
    {
        id: 4, tool: 'terminal', title: 'HTTP Header Fingerprinting',
        objective: 'Inspect HTTP response headers to identify the tech stack.',
        hint: 'curl -I evilcorp.com',
        quipAr: 'السيرفر بيقولك كل حاجة عن نفسه من غير ما تسأله كتير 😂',
        completed: false,
    },
    {
        id: 5, tool: 'linkedin', title: 'El-Stalker — Social Media OSINT',
        objective: "Browse EvilCorp's IT Manager LinkedIn profile. Find his pet's name — it's part of his password.",
        hint: "Read Karim's posts carefully 👀",
        quipAr: 'الناس بتنشر حياتها كلها على LinkedIn.. وده غلط أمنياً جداً 🕵️',
        completed: false,
    },
    {
        id: 6, tool: 'zoogle', title: 'The Broad Search Trap',
        objective: "Search a generic term and see why it's useless for targeted recon.",
        hint: 'admin',
        quipAr: 'جرب وشوف.. هتفهم ليه البحث العشوائي مش بيجيب حاجة 😵',
        completed: false,
    },
    {
        id: 7, tool: 'zoogle', title: 'Site Operator',
        objective: 'Use site: operator to limit results to evilcorp.com only.',
        hint: 'site:evilcorp.com',
        quipAr: 'كويس! ضيّقنا البحث.. بس لسه ناقص التخصص 💪',
        completed: false,
    },
    {
        id: 8, tool: 'zoogle', title: 'Combined Dork — Target Found',
        objective: 'Combine site: and inurl: operators to locate the admin panel.',
        hint: 'site:evilcorp.com inurl:admin',
        quipAr: 'ده هو! الـ Dork الكامل اللي بيجيب النتيجة 🎯',
        completed: false,
    },
    {
        id: 9, tool: 'zoogle', title: 'Access & Capture Flag',
        objective: 'Click the discovered admin panel link to capture the flag.',
        hint: 'Click the green link',
        quipAr: 'يلا دوس! المهمة خلصت يا وحش 🔥',
        completed: false,
    },
]

function loadProgress(): MissionStep[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return INITIAL_STEPS
        const completedIds: number[] = JSON.parse(raw)
        return INITIAL_STEPS.map((s) => ({ ...s, completed: completedIds.includes(s.id) }))
    } catch {
        return INITIAL_STEPS
    }
}

function saveProgress(steps: MissionStep[]) {
    const completedIds = steps.filter((s) => s.completed).map((s) => s.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds))
}

export function useMissionProgress() {
    const { saveStep } = useProgress()
    const [steps, setSteps] = useState<MissionStep[]>(loadProgress)

    const currentStepId = steps.find((s) => !s.completed)?.id ?? null
    const allComplete = steps.every((s) => s.completed)
    const completedCount = steps.filter((s) => s.completed).length

    const completeStep = useCallback((stepId: number) => {
        setSteps((prev) => {
            const next = prev.map((s) => (s.id === stepId && !s.completed ? { ...s, completed: true } : s))
            if (next !== prev) {
                saveProgress(next) // local storage
                saveStep(1, stepId) // server sync
            }
            return next
        })
    }, [])

    const resetProgress = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setSteps(INITIAL_STEPS)
    }, [])

    return { steps, currentStepId, allComplete, completedCount, completeStep, resetProgress }
}

/** Read-only progress for LabsPage — doesn't need a component mounted */
export function getLabProgress(): { completedCount: number; totalSteps: number; pct: number } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const completedIds: number[] = raw ? JSON.parse(raw) : []
        const total = INITIAL_STEPS.length
        return { completedCount: completedIds.length, totalSteps: total, pct: Math.round((completedIds.length / total) * 100) }
    } catch {
        return { completedCount: 0, totalSteps: INITIAL_STEPS.length, pct: 0 }
    }
}
