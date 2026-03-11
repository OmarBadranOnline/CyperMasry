import { useState, useCallback } from 'react'
import { useProgress } from '../../context/ProgressContext'
import type { ChallengeData } from '../../components/ChallengeStep'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'zoogle' | 'linkedin'
    type: 'action' | 'challenge'
    title: string
    objective: string
    hint: string
    quipAr: string
    completed: boolean
    challengeData?: ChallengeData
}

const STORAGE_KEY = 'cybermasry_lab01_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', title: 'Identify Yourself',
        objective: 'Before anything else, confirm your identity and privileges.',
        hint: 'whoami',
        quipAr: 'اعرف إنت مين الأول.. مش زي ما تصحى وتنسى اسمك 😅',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', title: 'Domain Ownership',
        objective: 'Query the public registry to learn who owns the target domain.',
        hint: 'whois evilcorp.com',
        quipAr: 'بص على السجل.. فين صاحب الدومين ده ومتى جدده؟ 🔍',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', title: 'DNS Resolution',
        objective: 'Resolve the domain to its IP address and discover mail servers.',
        hint: 'nslookup evilcorp.com',
        quipAr: 'حول الاسم لعنوان حقيقي.. زي ما GPS بيحول اسم الشارع لإحداثيات 🗺️',
        completed: false,
    },
    {
        id: 4, tool: 'terminal', type: 'action', title: 'HTTP Header Fingerprinting',
        objective: 'Inspect HTTP response headers to identify the tech stack.',
        hint: 'curl -I evilcorp.com',
        quipAr: 'السيرفر بيقولك كل حاجة عن نفسه من غير ما تسأله كتير 😂',
        completed: false,
    },
    // ── Challenge 1: OSINT Basics ──
    {
        id: 5, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: OSINT Basics',
        objective: 'Test your understanding of passive reconnaissance.',
        hint: '', quipAr: 'فكّر كويس قبل ما تجاوب! 🤔',
        completed: false,
        challengeData: {
            question: 'What is the main risk of leaving Server headers exposed in HTTP responses?',
            options: [
                'It slows down the website performance',
                'It reveals the tech stack, making it easier to find known CVEs',
                'It allows attackers to modify the headers remotely',
                'It encrypts the connection automatically',
            ],
            correctIndex: 1,
            hint: 'Think about what an attacker can do once they know the exact software version...',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 6, tool: 'linkedin', type: 'action', title: 'El-Stalker — Social Media OSINT',
        objective: "Browse EvilCorp's IT Manager LinkedIn profile. Find his pet's name — it's part of his password.",
        hint: "Read Karim's posts carefully 👀",
        quipAr: 'الناس بتنشر حياتها كلها على LinkedIn.. وده غلط أمنياً جداً 🕵️',
        completed: false,
    },
    {
        id: 7, tool: 'zoogle', type: 'action', title: 'The Broad Search Trap',
        objective: "Search a generic term and see why it's useless for targeted recon.",
        hint: 'admin',
        quipAr: 'جرب وشوف.. هتفهم ليه البحث العشوائي مش بيجيب حاجة 😵',
        completed: false,
    },
    {
        id: 8, tool: 'zoogle', type: 'action', title: 'Site Operator',
        objective: 'Use site: operator to limit results to evilcorp.com only.',
        hint: 'site:evilcorp.com',
        quipAr: 'كويس! ضيّقنا البحث.. بس لسه ناقص التخصص 💪',
        completed: false,
    },
    {
        id: 9, tool: 'zoogle', type: 'action', title: 'Combined Dork — Target Found',
        objective: 'Combine site: and inurl: operators to locate the admin panel.',
        hint: 'site:evilcorp.com inurl:admin',
        quipAr: 'ده هو! الـ Dork الكامل اللي بيجيب النتيجة 🎯',
        completed: false,
    },
    {
        id: 10, tool: 'zoogle', type: 'action', title: 'Access & Capture Flag',
        objective: 'Click the discovered admin panel link to capture the flag.',
        hint: 'Click the green link',
        quipAr: 'يلا دوس! المهمة خلصت يا وحش 🔥',
        completed: false,
    },
    // ── Challenge 2: Google Dorking ──
    {
        id: 11, tool: 'zoogle', type: 'challenge', title: '🧠 Challenge: Google Dorking',
        objective: 'Test your understanding of search operators.',
        hint: '', quipAr: 'الـ Dork الصح بيفرق! 🎯',
        completed: false,
        challengeData: {
            question: 'Why does the site: operator make reconnaissance more effective than a broad search?',
            options: [
                'It blocks the target from seeing your searches',
                'It limits results to a specific domain, reducing noise significantly',
                'It automatically finds admin panels',
                'It encrypts your search queries',
            ],
            correctIndex: 1,
            hint: 'Compare the results you got from searching "admin" vs "site:evilcorp.com"...',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 1: Advanced Lookup ---
    {
        id: 12, tool: 'terminal', type: 'action', title: 'Extra: Historical DNS (dig)',
        objective: 'Use dig to check for historical DNS records of the target.',
        hint: 'dig evilcorp.com any',
        quipAr: 'التاريخ مبتنسيش! 📜',
        completed: false,
    },
    {
        id: 13, tool: 'terminal', type: 'action', title: 'Extra: Blacklist Check',
        objective: 'Check if the IP is listed on any blacklists.',
        hint: 'curl https://blacklist-check.api/evilcorp.com',
        quipAr: 'شوف بقى لو هما في بلاك ليست! 🚫',
        completed: false,
    },
    {
        id: 14, tool: 'zoogle', type: 'action', title: 'Extra: Certificate Transparency',
        objective: 'Hunt for subdomains using crt.sh query.',
        hint: 'site:crt.sh evilcorp.com',
        quipAr: 'دور على Subdomains من خلال cert.sh 🔒',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', type: 'action', title: 'Extra: Capture CT Flag',
        objective: 'Access the discovered dev subdomain flag.',
        hint: 'curl dev.evilcorp.com/flag',
        quipAr: 'يلا نجيب الـ Flag! 🎯',
        completed: false,
    },
    // ── Challenge 3: Certificate Transparency ──
    {
        id: 16, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Subdomain Intel',
        objective: 'Test your understanding of Certificate Transparency Logs.',
        hint: '', quipAr: 'الشهادات بتفضح الـ subdomains! 🔐',
        completed: false,
        challengeData: {
            question: 'What is Certificate Transparency (CT) and why is it useful for reconnaissance?',
            options: [
                'A tool that encrypts all traffic between client and server',
                'A public log of SSL certificates that reveals subdomains an organization owns',
                'A method to hide your IP address during scanning',
                'A browser extension that blocks tracking cookies',
            ],
            correctIndex: 1,
            hint: 'Think about what crt.sh showed you — every SSL cert is publicly logged...',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 2: Corporate Intel ---
    {
        id: 17, tool: 'terminal', type: 'action', title: 'Extra: Email Scraping',
        objective: 'Run theHarvester to scrape email addresses for the domain.',
        hint: 'theHarvester -d evilcorp.com -b all',
        quipAr: 'البيانات المسربة كنز! 💎',
        completed: false,
    },
    {
        id: 18, tool: 'terminal', type: 'action', title: 'Extra: Breach Check',
        objective: 'Check harvested emails against HaveIBeenPwned.',
        hint: 'curl haveibeenpwned.com/api/v3/breachedaccount/admin@evilcorp.com',
        quipAr: 'بص على قاعدة بيانات الاختراقات (HaveIBeenPwned). 💥',
        completed: false,
    },
    {
        id: 19, tool: 'terminal', type: 'action', title: 'Extra: Hash Analysis',
        objective: 'Analyze the pattern of leaked password hashes.',
        hint: 'hash-identifier 5f4dcc3b5aa765d61d8327deb882cf99',
        quipAr: 'جمّع الباسوردات المتسربة وقارن الأنماط. 🧩',
        completed: false,
    },
    {
        id: 20, tool: 'terminal', type: 'action', title: 'Extra: Claim Intel Flag',
        objective: 'Submit the findings to claim the final Intel flag.',
        hint: 'submit_flag intel_complete',
        quipAr: 'عاش! 🏆 خد الفلاج.',
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

export function useMissionProgress(labId: string) {
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
                const completedCnt = next.filter((s) => s.completed).length
                const isFinal = completedCnt === next.length
                saveStep(labId, stepId, 100, isFinal) // server sync
            }
            return next
        })
    }, [labId, saveStep])

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
