import { useState, useCallback } from 'react'
import { useProgress } from '../../context/ProgressContext'
import type { ChallengeData } from '../../components/ChallengeStep'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'zoogle' | 'linkedin' | 'quiz' | 'login'
    type: 'action' | 'challenge'
    title: string
    objective: string
    hint: string
    quipAr: string
    completed: boolean
    challengeData?: ChallengeData
}

const STORAGE_KEY = 'cybermasry_lab03_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', title: 'Basic Directory Scan',
        objective: 'Run a basic Gobuster dir scan on the target to discover hidden directories.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt',
        quipAr: 'كأنك بتجرب كل مفتاح في الابواب — Gobuster بيعمل ده أسرع مليون مرة 🔑',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', title: 'Scan with Extensions',
        objective: 'Search for specific file types: PHP, HTML, and TXT backup files.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -x php,html,txt',
        quipAr: 'مش بس مجلدات — جوّبستر كمان بيدور على ملفات زي backup.php اللي بينسوها 😱',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', title: 'Find the Admin Panel',
        objective: 'Use a targeted admin wordlist to find the admin panel path.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/admin-paths.txt',
        quipAr: 'كل موقع فيه admin panel — السؤال: فين بالظبط؟ 🎯',
        completed: false,
    },
    {
        id: 4, tool: 'terminal', type: 'action', title: 'Verbose Mode (Status Codes)',
        objective: 'Run with -v flag to see all HTTP status codes including 403 Forbidden paths.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -v',
        quipAr: '403 Forbidden مش معناه مفيش حاجة — معناه فيه حاجة محمية! 🔐',
        completed: false,
    },
    // ── Challenge 1: Status Codes ──
    {
        id: 5, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Status Codes',
        objective: 'Test your understanding of HTTP status codes in enumeration.',
        hint: '', quipAr: '403 مش زي 404.. الفرق مهم! 🔐',
        completed: false,
        challengeData: {
            question: 'A 403 Forbidden response means the path doesn\'t exist. True or False?',
            options: [
                'True — 403 means the page was not found',
                'False — 403 means the path EXISTS but access is denied, which is even more interesting',
                'True — 403 and 404 mean the same thing',
                'False — 403 means the server is offline',
            ],
            correctIndex: 1,
            hint: 'A 404 means "not found". A 403 means "you can\'t access this" — which confirms it exists!',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 6, tool: 'terminal', type: 'action', title: 'Dirbuster with Threads',
        objective: 'Speed it up! Use 50 concurrent threads to scan faster.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -t 50',
        quipAr: 'بدل خيط واحد — 50 خيط بيشتغلوا مع بعض. أسرع بكتير! 🧵💨',
        completed: false,
    },
    {
        id: 7, tool: 'terminal', type: 'action', title: 'DNS Subdomain Enumeration',
        objective: 'Switch Gobuster to DNS mode to discover hidden subdomains.',
        hint: 'gobuster dns -d evilcorp.com -w /usr/share/wordlists/subdomains.txt',
        quipAr: 'مش بس directories — Gobuster كمان يجيب subdomains زي dev.evilcorp.com 🌐',
        completed: false,
    },
    {
        id: 8, tool: 'terminal', type: 'action', title: 'Scan API Endpoints',
        objective: 'Hunt for hidden API endpoints by scanning common API patterns.',
        hint: 'gobuster dir -u http://192.168.1.5/api -w /usr/share/wordlists/api-paths.txt -x json',
        quipAr: 'الـ API endpoints المخفية دي كنز! /api/users بدون auth = بياناتك في إيد أي حد 💀',
        completed: false,
    },
    // ── Challenge 2: API Security ──
    {
        id: 9, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: API Risks',
        objective: 'Test your understanding of API endpoint risks.',
        hint: '', quipAr: 'الـ API المفتوح خطر كبير! 🔓',
        completed: false,
        challengeData: {
            question: 'Why are undocumented API endpoints a security risk?',
            options: [
                'They use too much bandwidth',
                'They may lack authentication and expose sensitive data like user records',
                'They are always encrypted so no one can find them',
                'They only work on mobile devices',
            ],
            correctIndex: 1,
            hint: 'Think about /api/v2/users without any login required — what data could leak?',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 10, tool: 'terminal', type: 'action', title: 'Find Backup Files',
        objective: 'Specifically hunt for backup and config files that developers forget to remove.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -x bak,old,zip,sql',
        quipAr: 'database.sql.bak على الويب = الكارثة بعينها! 💣 Devs دايماً بينسوا ينضفوا',
        completed: false,
    },
    {
        id: 11, tool: 'terminal', type: 'action', title: 'Full Stealth Scan',
        objective: 'Add random delay between requests to avoid WAF detection.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt --delay 200ms',
        quipAr: 'الـ WAF بيحس بيك لو بعتت requests بسرعة كبيرة — delay صغير بيخليك تعدي زي الريح 💨',
        completed: false,
    },
    {
        id: 12, tool: 'terminal', type: 'action', title: 'Full Recon Report',
        objective: 'Save the full scan output to a file for your pentest report.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -o /tmp/gobuster-report.txt',
        quipAr: 'الـ pentester المحترف بيحفظ كل حاجة — التقرير جزء من الشغل يا بطل 📋',
        completed: false,
    },
    // ── Challenge 3: Reporting ──
    {
        id: 13, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Pentest Reports',
        objective: 'Test your understanding of report documentation.',
        hint: '', quipAr: 'التقرير مش رفاهية — ده جزء من الشغل! 📝',
        completed: false,
        challengeData: {
            question: 'Why should pentesters always save scan output to a report file?',
            options: [
                'To make the scan run faster',
                'Because scans are illegal without documentation',
                'To have evidence, track findings, and produce professional deliverables for the client',
                'To encrypt the results automatically',
            ],
            correctIndex: 2,
            hint: 'Think about what happens after the scan — how do you communicate findings to the client?',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 1: Deep APIs ---
    {
        id: 14, tool: 'terminal', type: 'action', title: 'Extra: Fuzz API versions',
        objective: 'Fuzz for hidden API endpoints using Gobuster dir mode.',
        hint: 'gobuster dir -u http://192.168.1.5/api/ -w /usr/share/wordlists/api.txt',
        quipAr: 'خلينا ندور على مسارات الـ API المخفية. 🔌',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', type: 'action', title: 'Extra: Check /v2/ leaked data',
        objective: 'Enumerate API version paths.',
        hint: 'curl http://192.168.1.5/api/v2/users',
        quipAr: 'احياناً بيكون في مسار /v2/ فيه تسريب معلومات. 🔍',
        completed: false,
    },
    {
        id: 16, tool: 'terminal', type: 'action', title: 'Extra: Extract JSON payload',
        objective: 'Capture the exposed JSON data.',
        hint: 'curl http://192.168.1.5/api/v2/users | jq',
        quipAr: 'افحص استجابة الخادم للملفات. 📄',
        completed: false,
    },
    // --- Extra 2: Virtual Hosts ---
    {
        id: 17, tool: 'terminal', type: 'action', title: 'Extra: VHost Fuzzing',
        objective: 'Run gobuster vhost against the current IP.',
        hint: 'gobuster vhost -u http://192.168.1.5 -w /usr/share/wordlists/subdomains.txt',
        quipAr: 'استخدم gobuster vhost لاكتشاف المواقع الموازية على نفس الاي بي. 🌐',
        completed: false,
    },
    {
        id: 18, tool: 'terminal', type: 'action', title: 'Extra: Target VHost',
        objective: 'Found internal development subdomain.',
        hint: 'curl -H "Host: dev.evilcorp.local" http://192.168.1.5',
        quipAr: 'بص على الدومين الداخلي dev.evilcorp.local! 🏢',
        completed: false,
    },
    {
        id: 19, tool: 'terminal', type: 'action', title: 'Extra: Access Platform Flag',
        objective: 'Access the VHost platform.',
        hint: 'submit_flag vhost_dev',
        quipAr: 'هنا الـ Flag الحقيقي. 🎯',
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
                saveProgress(next)
                const completedCnt = next.filter((s) => s.completed).length
                const isFinal = completedCnt === next.length
                saveStep(labId, stepId, 175, isFinal)
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
