import { useState, useCallback } from 'react'
import { useProgress } from '../../context/ProgressContext'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'zoogle' | 'linkedin' | 'quiz' | 'login'
    title: string
    objective: string
    hint: string
    quipAr: string
    completed: boolean
}

const STORAGE_KEY = 'cybermasry_lab03_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1,
        tool: 'terminal',
        title: 'Basic Directory Scan',
        objective: 'Run a basic Gobuster dir scan on the target to discover hidden directories.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt',
        quipAr: 'كأنك بتجرب كل مفتاح في الابواب — Gobuster بيعمل ده أسرع مليون مرة 🔑',
        completed: false,
    },
    {
        id: 2,
        tool: 'terminal',
        title: 'Scan with Extensions',
        objective: 'Search for specific file types: PHP, HTML, and TXT backup files.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -x php,html,txt',
        quipAr: 'مش بس مجلدات — جوّبستر كمان بيدور على ملفات زي backup.php اللي بينسوها 😱',
        completed: false,
    },
    {
        id: 3,
        tool: 'terminal',
        title: 'Find the Admin Panel',
        objective: 'Use a targeted admin wordlist to find the admin panel path.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/admin-paths.txt',
        quipAr: 'كل موقع فيه admin panel — السؤال: فين بالظبط؟ 🎯',
        completed: false,
    },
    {
        id: 4,
        tool: 'terminal',
        title: 'Verbose Mode (Status Codes)',
        objective: 'Run with -v flag to see all HTTP status codes including 403 Forbidden paths.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -v',
        quipAr: '403 Forbidden مش معناه مفيش حاجة — معناه فيه حاجة محمية! 🔐',
        completed: false,
    },
    {
        id: 5,
        tool: 'terminal',
        title: 'Dirbuster with Threads',
        objective: 'Speed it up! Use 50 concurrent threads to scan faster.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -t 50',
        quipAr: 'بدل خيط واحد — 50 خيط بيشتغلوا مع بعض. أسرع بكتير! 🧵💨',
        completed: false,
    },
    {
        id: 6,
        tool: 'terminal',
        title: 'DNS Subdomain Enumeration',
        objective: 'Switch Gobuster to DNS mode to discover hidden subdomains.',
        hint: 'gobuster dns -d evilcorp.com -w /usr/share/wordlists/subdomains.txt',
        quipAr: 'مش بس directories — Gobuster كمان يجيب subdomains زي dev.evilcorp.com 🌐',
        completed: false,
    },
    {
        id: 7,
        tool: 'terminal',
        title: 'Scan API Endpoints',
        objective: 'Hunt for hidden API endpoints by scanning common API patterns.',
        hint: 'gobuster dir -u http://192.168.1.5/api -w /usr/share/wordlists/api-paths.txt -x json',
        quipAr: 'الـ API endpoints المخفية دي كنز! /api/users بدون auth = بياناتك في إيد أي حد 💀',
        completed: false,
    },
    {
        id: 8,
        tool: 'terminal',
        title: 'Find Backup Files',
        objective: 'Specifically hunt for backup and config files that developers forget to remove.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -x bak,old,zip,sql',
        quipAr: 'database.sql.bak على الويب = الكارثة بعينها! 💣 Devs دايماً بينسوا ينضفوا',
        completed: false,
    },
    {
        id: 9,
        tool: 'terminal',
        title: 'Full Stealth Scan',
        objective: 'Add random delay between requests to avoid WAF detection.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt --delay 200ms',
        quipAr: 'الـ WAF بيحس بيك لو بعتت requests بسرعة كبيرة — delay صغير بيخليك تعدي زي الريح 💨',
        completed: false,
    },
    {
        id: 10,
        tool: 'terminal',
        title: 'Full Recon Report',
        objective: 'Save the full scan output to a file for your pentest report.',
        hint: 'gobuster dir -u http://192.168.1.5 -w /usr/share/wordlists/common.txt -o /tmp/gobuster-report.txt',
        quipAr: 'الـ pentester المحترف بيحفظ كل حاجة — التقرير جزء من الشغل يا بطل 📋',
        completed: false,
    },
    // --- Extra 1: Deep APIs ---
    {
        id: 11, tool: 'terminal', title: 'Extra: Fuzz API versions',
        objective: 'Fuzz for hidden API endpoints using Gobuster dir mode.',
        hint: 'gobuster dir -u http://192.168.1.5/api/ -w /usr/share/wordlists/api.txt',
        quipAr: 'خلينا ندور على مسارات الـ API المخفية. 🔌',
        completed: false,
    },
    {
        id: 12, tool: 'terminal', title: 'Extra: Check /v2/ leaked data',
        objective: 'Enumerate API version paths.',
        hint: 'curl http://192.168.1.5/api/v2/users',
        quipAr: 'احياناً بيكون في مسار /v2/ فيه تسريب معلومات. 🔍',
        completed: false,
    },
    {
        id: 13, tool: 'terminal', title: 'Extra: Extract JSON payload',
        objective: 'Capture the exposed JSON data.',
        hint: 'curl http://192.168.1.5/api/v2/users | jq',
        quipAr: 'افحص استجابة الخادم للملفات. 📄',
        completed: false,
    },
    // --- Extra 2: Virtual Hosts ---
    {
        id: 14, tool: 'terminal', title: 'Extra: VHost Fuzzing',
        objective: 'Run gobuster vhost against the current IP.',
        hint: 'gobuster vhost -u http://192.168.1.5 -w /usr/share/wordlists/subdomains.txt',
        quipAr: 'استخدم gobuster vhost لاكتشاف المواقع الموازية على نفس الاي بي. 🌐',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', title: 'Extra: Target VHost',
        objective: 'Found internal development subdomain.',
        hint: 'curl -H "Host: dev.evilcorp.local" http://192.168.1.5',
        quipAr: 'بص على الدومين الداخلي dev.evilcorp.local! 🏢',
        completed: false,
    },
    {
        id: 16, tool: 'terminal', title: 'Extra: Access Platform Flag',
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
