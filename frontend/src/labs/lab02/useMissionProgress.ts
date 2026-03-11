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

const STORAGE_KEY = 'cybermasry_lab02_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', title: 'Basic Port Scan',
        objective: 'Run the default Nmap scan against the target. Discover all open TCP ports and services.',
        hint: 'nmap 192.168.1.5',
        quipAr: 'خبط على الباب الأول.. نمب هيعمل الشغل 🔭',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', title: 'Version Detection',
        objective: 'Use the -sV flag to identify exact software versions on each open port.',
        hint: 'nmap -sV 192.168.1.5',
        quipAr: 'دلوقتي عايزين نعرف كل سيرفر شغال بنسخة إيه.. عشان نلاقي الثغرات 🎯',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', title: 'Targeted Port Scan',
        objective: 'Scan only specific ports of interest: SSH, HTTP, MySQL, and the alternate HTTP port.',
        hint: 'nmap -p 22,80,3306,8080 192.168.1.5',
        quipAr: 'بدل ما تفتش كل الأبواب، فتش اللي إنت عارف إنها مهمة 🚪',
        completed: false,
    },
    {
        id: 4, tool: 'terminal', type: 'action', title: 'OS Fingerprinting',
        objective: 'Identify the operating system of the target host using the -O flag.',
        hint: 'nmap -O 192.168.1.5',
        quipAr: 'عايزين نعرف إيه نظام التشغيل.. عشان نختار الـ exploit المناسب 🐧',
        completed: false,
    },
    {
        id: 5, tool: 'terminal', type: 'action', title: 'Aggressive All-In-One Scan',
        objective: 'Run the aggressive scan mode — combines version detection, OS fingerprinting, scripts, and traceroute.',
        hint: 'nmap -A 192.168.1.5',
        quipAr: '-A ده السلاح النووي.. بيعمل كل حاجة بضربة واحدة 💥',
        completed: false,
    },
    // ── Challenge 1: Basic Scans ──
    {
        id: 6, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Scan Stealth',
        objective: 'Test your understanding of scan aggressiveness.',
        hint: '', quipAr: 'فكّر في الفرق بين الصوت العالي والمنخفض في الشبكة! 🤫',
        completed: false,
        challengeData: {
            question: 'Why is the -A flag considered "loud" in a real penetration test engagement?',
            options: [
                'It sends packets too slowly and wastes time',
                'It combines multiple scan types, generating lots of traffic that IDS/IPS can detect',
                'It only works on Linux systems',
                'It requires root privileges which is illegal',
            ],
            correctIndex: 1,
            hint: 'Think about how much network traffic -A generates compared to a simple -sV scan...',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 7, tool: 'terminal', type: 'action', title: 'Full Port Scan',
        objective: 'Scan ALL 65535 TCP ports — the default scan only covers 1000. Find hidden services.',
        hint: 'nmap -p- 192.168.1.5',
        quipAr: 'الـ default scan بيفوّت كتير! دلوقتي هنفتح كل الأبواب 🔑',
        completed: false,
    },
    {
        id: 8, tool: 'terminal', type: 'action', title: 'UDP Port Scan',
        objective: 'Run a UDP scan to discover services that don\'t use TCP — like DNS, SNMP, and NTP.',
        hint: 'nmap -sU 192.168.1.5',
        quipAr: 'UDP زي الجار اللي بيوصّل رسايل بدون ما يطلب receipt — بيتنسى دايماً 📨',
        completed: false,
    },
    {
        id: 9, tool: 'terminal', type: 'action', title: 'Fast Scan with Timing',
        objective: 'Use T4 timing with -F (fast mode) to scan the top 100 ports in under 1 second.',
        hint: 'nmap -T4 -F 192.168.1.5',
        quipAr: 'لما وقتك ضيق — T4 وF بيديك نتيجة سريعة. بس مش كاملة! ⚡',
        completed: false,
    },
    // ── Challenge 2: Advanced Scans ──
    {
        id: 10, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Scan Tradeoffs',
        objective: 'Test your understanding of scanning tradeoffs.',
        hint: '', quipAr: 'السرعة ولّا الدقة — لازم تختار! ⚖️',
        completed: false,
        challengeData: {
            question: 'What is the tradeoff between using -T4 -F (fast scan) vs a full -p- scan?',
            options: [
                '-T4 -F is more accurate but takes longer',
                '-p- only scans UDP ports while -T4 -F scans TCP',
                '-T4 -F is fast but only scans ~100 ports, missing services on non-standard ports',
                'There is no difference, they produce the same results',
            ],
            correctIndex: 2,
            hint: 'Remember that -F scans only the top 100 ports, but services can run on ANY of the 65535 ports...',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 11, tool: 'terminal', type: 'action', title: 'NSE Vulnerability Scan',
        objective: 'Run Nmap Scripting Engine (NSE) vulnerability scripts to auto-detect known CVEs.',
        hint: 'nmap --script vuln 192.168.1.5',
        quipAr: 'NSE زي كاشف الكذب.. بيبحث عن الثغرات أوتوماتيك 🤥',
        completed: false,
    },
    {
        id: 12, tool: 'terminal', type: 'action', title: 'Network Host Discovery',
        objective: 'Sweep the entire /24 subnet to find all live hosts — without scanning any ports.',
        hint: 'nmap -sn 192.168.1.0/24',
        quipAr: 'قبل ما تصطاد سمكة، لازم تعرف في فين السمك في البحيرة 🎣',
        completed: false,
    },
    // ── Challenge 3: Host Discovery ──
    {
        id: 13, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Recon Strategy',
        objective: 'Test your understanding of host discovery.',
        hint: '', quipAr: 'الترتيب مهم في الهجوم! 🎯',
        completed: false,
        challengeData: {
            question: 'Why would you run -sn (host discovery) before doing a full port scan on a network?',
            options: [
                'Because -sn scans are required by law before port scanning',
                'To identify which hosts are alive first, so you only port-scan live targets and save time',
                'Because -sn provides more detailed port information',
                'To encrypt the scan traffic for stealth',
            ],
            correctIndex: 1,
            hint: 'Scanning all 65535 ports on 254 hosts is slow. What if only 5 hosts are actually alive?',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 1: Deep UDP ---
    {
        id: 14, tool: 'terminal', type: 'action', title: 'Extra: Full UDP scan',
        objective: 'UDP is slow but important. Scan full range.',
        hint: 'nmap -sU -p- 192.168.1.5',
        quipAr: 'استخدم -sU لعمل مسح كامل للـ UDP. 📡',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', type: 'action', title: 'Extra: SNMP Enumeration',
        objective: 'Look for easily exploitable services like SNMP on port 161.',
        hint: 'nmap -sU -p 161 --script snmp-brute 192.168.1.5',
        quipAr: 'دور على خدمات مخفية زي SNMP. 🕵️‍♂️',
        completed: false,
    },
    {
        id: 16, tool: 'terminal', type: 'action', title: 'Extra: Capture UDP Flag',
        objective: 'Extract the configuration file flag via retrieved protocol.',
        hint: 'curl tftp://192.168.1.5/flag.txt',
        quipAr: 'هات الـ Flag! 🚩',
        completed: false,
    },
    // --- Extra 2: Vulnerability Triage ---
    {
        id: 17, tool: 'terminal', type: 'action', title: 'Extra: Run NSE scripts',
        objective: 'Run Nmap vulnerability scripts (--script vuln).',
        hint: 'nmap --script vuln 192.168.1.5',
        quipAr: 'اسكريبتات Nmap كنز! 📜 اكتب --script vuln للبحث عن الثغرات.',
        completed: false,
    },
    {
        id: 18, tool: 'terminal', type: 'action', title: 'Extra: Analyze CVE',
        objective: 'Analyze the identified CVE output.',
        hint: 'searchsploit CVE-2023-XXXX',
        quipAr: 'لقينا ثغرة! اقرأ تفاصيل الـ CVE بدقة. 💥',
        completed: false,
    },
    {
        id: 19, tool: 'terminal', type: 'action', title: 'Extra: Submit Vulnerability Report',
        objective: 'Submit the target vulnerability proof.',
        hint: 'submit_flag vuln_report',
        quipAr: 'اربط معلومات الثغرة ببيئة السيرفر واعمل تقريرك. 📝',
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
                saveStep(labId, stepId, 150, isFinal)
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
