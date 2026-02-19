import { useState, useCallback } from 'react'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'zoogle' | 'linkedin' | 'quiz' | 'login'
    title: string
    objective: string     // English instruction
    hint: string          // the command/query to type
    quipAr: string        // Egyptian Arabic flavor
    completed: boolean
}

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1,
        tool: 'terminal',
        title: 'Identify Yourself',
        objective: 'Before anything else, confirm your identity and privileges.',
        hint: 'whoami',
        quipAr: 'اعرف إنت مين الأول.. مش زي ما تصحى وتنسى اسمك 😅',
        completed: false,
    },
    {
        id: 2,
        tool: 'terminal',
        title: 'Domain Ownership',
        objective: 'Query the public registry to learn who owns the target domain.',
        hint: 'whois evilcorp.com',
        quipAr: 'بص على السجل.. فين صاحب الدومين ده ومتى جدده؟ 🔍',
        completed: false,
    },
    {
        id: 3,
        tool: 'terminal',
        title: 'DNS Resolution',
        objective: 'Resolve the domain to its IP address and discover mail servers.',
        hint: 'nslookup evilcorp.com',
        quipAr: 'حول الاسم لعنوان حقيقي.. زي ما GPS بيحول اسم الشارع لإحداثيات 🗺️',
        completed: false,
    },
    {
        id: 4,
        tool: 'terminal',
        title: 'HTTP Header Fingerprinting',
        objective: 'Inspect HTTP response headers to identify the tech stack.',
        hint: 'curl -I evilcorp.com',
        quipAr: 'السيرفر بيقولك كل حاجة عن نفسه من غير ما تسأله كتير 😂',
        completed: false,
    },
    {
        id: 5,
        tool: 'linkedin',
        title: 'El-Stalker — Social Media OSINT',
        objective: "Browse EvilCorp's IT Manager LinkedIn profile. Find his pet's name — it's part of his password.",
        hint: "Read Karim's posts carefully 👀",
        quipAr: 'الناس بتنشر حياتها كلها على LinkedIn.. وده غلط أمنياً جداً 🕵️',
        completed: false,
    },
    {
        id: 6,
        tool: 'zoogle',
        title: 'The Broad Search Trap',
        objective: "Search a generic term and see why it's useless for targeted recon.",
        hint: 'admin',
        quipAr: 'جرب وشوف.. هتفهم ليه البحث العشوائي مش بيجيب حاجة 😵',
        completed: false,
    },
    {
        id: 7,
        tool: 'zoogle',
        title: 'Site Operator',
        objective: 'Use site: operator to limit results to evilcorp.com only.',
        hint: 'site:evilcorp.com',
        quipAr: 'كويس! ضيّقنا البحث.. بس لسه ناقص التخصص 💪',
        completed: false,
    },
    {
        id: 8,
        tool: 'zoogle',
        title: 'Combined Dork — Target Found',
        objective: 'Combine site: and inurl: operators to locate the admin panel.',
        hint: 'site:evilcorp.com inurl:admin',
        quipAr: 'ده هو! الـ Dork الكامل اللي بيجيب النتيجة 🎯',
        completed: false,
    },
    {
        id: 9,
        tool: 'zoogle',
        title: 'Access & Capture Flag',
        objective: 'Click the discovered admin panel link to capture the flag.',
        hint: 'Click the green link',
        quipAr: 'يلا دوس! المهمة خلصت يا وحش 🔥',
        completed: false,
    },
]

export function useMissionProgress() {
    const [steps, setSteps] = useState<MissionStep[]>(INITIAL_STEPS)

    const currentStepId = steps.find((s) => !s.completed)?.id ?? null
    const allComplete = steps.every((s) => s.completed)
    const completedCount = steps.filter((s) => s.completed).length

    const completeStep = useCallback((stepId: number) => {
        setSteps((prev) =>
            prev.map((s) => (s.id === stepId && !s.completed ? { ...s, completed: true } : s))
        )
    }, [])

    return { steps, currentStepId, allComplete, completedCount, completeStep }
}
