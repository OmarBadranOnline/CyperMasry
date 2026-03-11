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

const STORAGE_KEY = 'cybermasry_lab05_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', title: 'Banner Grab via Netcat',
        objective: 'Use netcat to connect to port 80 and grab the HTTP server banner.',
        hint: 'nc 192.168.1.5 80',
        quipAr: 'السيرفر بيعرّف عن نفسه لما تسلّم عليه — netcat بيعمل ده بالظبط 👋',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', title: 'SSH Banner Grab',
        objective: 'Grab the SSH service banner on port 22 to get the exact OpenSSH version.',
        hint: 'nc 192.168.1.5 22',
        quipAr: 'SSH بيقولك نسخته قبل ما تدخل — معلومة ذهبية للـ CVE search 🔑',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', title: 'FTP Banner Grab',
        objective: 'Connect to the FTP service and read its banner — check for anonymous login.',
        hint: 'nc 192.168.1.5 21',
        quipAr: 'FTP anonymous login = تدخل من غير password. أكتر من 50% من الـ FTP servers عندها ده! 😱',
        completed: false,
    },
    // ── Challenge 1: FTP Security ──
    {
        id: 4, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: FTP Risks',
        objective: 'Test your understanding of FTP security risks.',
        hint: '', quipAr: 'Anonymous FTP = كارثة أمنية! 🚨',
        completed: false,
        challengeData: {
            question: 'Why is anonymous FTP login considered a critical security finding?',
            options: [
                'Because FTP uses too much bandwidth',
                'Because anyone can access files without credentials, potentially exposing sensitive data',
                'Because FTP is faster than SFTP',
                'Because FTP only works on port 21',
            ],
            correctIndex: 1,
            hint: 'Anonymous login means NO username or password needed. What if config files or source code are on that server?',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 5, tool: 'terminal', type: 'action', title: 'HTTP Header Inspection',
        objective: 'Use curl -I to inspect all HTTP response headers for version leaks.',
        hint: 'curl -I http://192.168.1.5',
        quipAr: 'الـ HTTP headers بتقول جنسية الموقع — Apache ولا Nginx ولا IIS 🕵️',
        completed: false,
    },
    {
        id: 6, tool: 'terminal', type: 'action', title: 'Telnet Banner Grab',
        objective: 'Use telnet to check if port 23 is open — Telnet transmits everything in plaintext!',
        hint: 'telnet 192.168.1.5 23',
        quipAr: 'Telnet في 2026 = جريمة أمنية. كل حاجة بتتبعت plaintext حتى الـ password 😤',
        completed: false,
    },
    {
        id: 7, tool: 'terminal', type: 'action', title: 'CVE Lookup — Apache',
        objective: 'Search the local CVE database for critical Apache 2.4.38 vulnerabilities.',
        hint: 'searchsploit apache 2.4.38',
        quipAr: 'كل version أقدم = قائمة CVEs أطول. searchsploit بيجيب exploits جاهزة 🗃️',
        completed: false,
    },
    {
        id: 8, tool: 'terminal', type: 'action', title: 'CVE Deep Dive — OpenSSH',
        objective: 'Look up OpenSSH 7.9 vulnerabilities and understand the severity scores.',
        hint: 'searchsploit openssh 7.9',
        quipAr: 'CVSS score فوق 9.0 = critical. OpenSSH 7.9 عندها CVEs معروفة 🔴',
        completed: false,
    },
    // ── Challenge 2: CVSS Scores ──
    {
        id: 9, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: CVSS Scores',
        objective: 'Test your understanding of vulnerability severity.',
        hint: '', quipAr: 'مش كل ثغرة زي بعض — CVSS بيقولك الخطورة! 📊',
        completed: false,
        challengeData: {
            question: 'What does a CVSS score of 9.8 mean for a vulnerability?',
            options: [
                'It is a low-risk vulnerability that can be ignored',
                'It is a medium-risk vulnerability needing a patch within 90 days',
                'It is a critical vulnerability — likely remotely exploitable with severe impact, needs immediate patching',
                'It means the vulnerability has been patched already',
            ],
            correctIndex: 2,
            hint: 'CVSS ranges: 0-3.9 = Low, 4-6.9 = Medium, 7-8.9 = High, 9-10 = Critical',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 10, tool: 'terminal', type: 'action', title: 'Check SMTP Banner',
        objective: 'Grab the mail server banner and check if SMTP user enumeration is possible.',
        hint: 'nc 192.168.1.5 25',
        quipAr: 'SMTP VRFY command بيقولك لو user موجود — بتجمع emails من غير إذن 📧',
        completed: false,
    },
    {
        id: 11, tool: 'terminal', type: 'action', title: 'WhatWeb Service Fingerprinting',
        objective: 'Run WhatWeb to automatically identify all web technologies in one shot.',
        hint: 'whatweb http://192.168.1.5',
        quipAr: 'WhatWeb زي magic glass بيشوف كل تكنولوجيا في الموقع بضربة واحدة 🔮',
        completed: false,
    },
    {
        id: 12, tool: 'terminal', type: 'action', title: 'Build CVE Attack Map',
        objective: 'Generate a full vulnerability report matching banners to CVEs.',
        hint: 'nikto -h http://192.168.1.5',
        quipAr: 'Nikto بيعمل scan كامل ويطلع تقرير بكل الثغرات المحتملة — الخطوة الأخيرة قبل الـ exploit 🏁',
        completed: false,
    },
    // ── Challenge 3: Attack Chain ──
    {
        id: 13, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: Attack Chain',
        objective: 'Test your understanding of the exploitation chain.',
        hint: '', quipAr: 'كل خطوة بتوصل للتانية! 🔗',
        completed: false,
        challengeData: {
            question: 'What is the typical attack chain starting from a service banner?',
            options: [
                'Banner → Exploit → Version → CVE',
                'Banner → Version → CVE → Exploit',
                'CVE → Banner → Version → Exploit',
                'Exploit → CVE → Banner → Version',
            ],
            correctIndex: 1,
            hint: 'First you grab the banner to find the version. Then you search for known CVEs for that version. Finally you find an exploit...',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 1: Timing Attacks ---
    {
        id: 14, tool: 'terminal', type: 'action', title: 'Extra: OpenSSH 7.2 Validation',
        objective: 'Verify the OpenSSH banner version.',
        hint: 'nc 192.168.1.5 22',
        quipAr: 'افحص OpenSSH النسخة 7.2.. في مشكلة هنا! 🔐',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', type: 'action', title: 'Extra: User Enum Timing',
        objective: 'Perform the CVE-2018-15473 timing attack.',
        hint: 'python3 ssh_enum.py 192.168.1.5',
        quipAr: 'استخدم أداة قياس التوقيت عند تسجيل الدخول لتحديد المستخدمين. ⏱️',
        completed: false,
    },
    {
        id: 16, tool: 'terminal', type: 'action', title: 'Extra: Verify Username',
        objective: 'Validate the correct username.',
        hint: 'submit_flag "admin_user"',
        quipAr: 'لقيت المستخدم! ادخل خد الفلاج. 🚩',
        completed: false,
    },
    // --- Extra 2: Web Stack ---
    {
        id: 17, tool: 'terminal', type: 'action', title: 'Extra: WhatWeb Scan',
        objective: 'Use WhatWeb against the target.',
        hint: 'whatweb 192.168.1.5',
        quipAr: 'استخدم WhatWeb عشان تجيب ملخص لكل المكونات للموقع. 🔮',
        completed: false,
    },
    {
        id: 18, tool: 'terminal', type: 'action', title: 'Extra: CMS Vuln Scan',
        objective: 'Pivot to analyzing WordPress version vulnerabilities.',
        hint: 'wpscan --url http://192.168.1.5',
        quipAr: 'فيه نسخة WordPress قديمة! استخدم WPScan. ⚠️',
        completed: false,
    },
    {
        id: 19, tool: 'terminal', type: 'action', title: 'Extra: Submit Stack Vulns',
        objective: 'Submit proof of outdated stack.',
        hint: 'submit_flag wp_CVE_detected',
        quipAr: 'وصلت للاستغلال المطلوب. 🎯',
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
                saveStep(labId, stepId, 250, isFinal)
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

export function getLabProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const completedIds: number[] = raw ? JSON.parse(raw) : []
        return { completedCount: completedIds.length, totalSteps: INITIAL_STEPS.length, pct: Math.round((completedIds.length / INITIAL_STEPS.length) * 100) }
    } catch {
        return { completedCount: 0, totalSteps: INITIAL_STEPS.length, pct: 0 }
    }
}
