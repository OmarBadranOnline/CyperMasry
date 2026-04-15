import { useState, useCallback } from 'react'
import { useProgress } from '../../context/ProgressContext'
import type { ChallengeData } from '../../components/ChallengeStep'

export interface MissionStep {
    id: number
    tool: 'terminal' | 'quiz'
    type: 'action' | 'challenge'
    points: number
    title: string
    objective: string
    explanation: string
    expectedResult: string
    hint: string
    quipAr: string
    completed: boolean
    challengeData?: ChallengeData
}

const STORAGE_KEY = 'cybermasry_lab06_progress'

interface SavedMissionProgress {
    completedIds: number[]
    stepScores: Record<string, number>
    bonusAwards?: Record<string, number>
    penaltyCosts?: Record<string, number>
}

const BONUS_MAX_POINTS = 20

const INITIAL_STEPS: MissionStep[] = [
    {
        id: 1, tool: 'terminal', type: 'action', points: 10, title: 'Clue 01: Find the exposed login endpoint',
        objective: 'Run a safe simulated Kali recon using WhatWeb on the login endpoint.',
        explanation: 'You start with passive recon to understand authentication posture before touching credentials. In this lab, WhatWeb output is fully simulated and offline-safe.',
        expectedResult: 'You should observe metadata showing legacy auth stack and optional MFA policy.',
        hint: 'whatweb https://vault.evilcorp.local/login',
        quipAr: 'كل فيلم اختراق يبدأ بـ recon محترم. بص على الـ headers الأول 👀',
        completed: false,
    },
    {
        id: 2, tool: 'terminal', type: 'action', points: 10, title: 'Clue 02: Enumerate likely usernames',
        objective: 'Run a safe simulated Kali OSINT pass with theHarvester.',
        explanation: 'Attackers reduce guessing space by generating valid usernames from public naming conventions. Here, theHarvester results are classroom-safe simulation only.',
        expectedResult: 'A curated users.txt list should be generated with realistic candidate accounts.',
        hint: 'theHarvester -d evilcorp.local -b all',
        quipAr: 'الـ username الصح نص الطريق. OSINT بيوفر وقت كتير 🧠',
        completed: false,
    },
    {
        id: 3, tool: 'terminal', type: 'action', points: 10, title: 'Clue 03: Controlled credential test',
        objective: 'Run a controlled password-spray simulation to identify weak credentials.',
        explanation: 'Password spraying tests one common password across multiple usernames to avoid lockouts. In weak identity environments, this often finds one valid low-friction entry point.',
        expectedResult: 'One valid username/password pair should be recovered in the simulated output.',
        hint: 'hydra -L users.txt -P common.txt ssh://10.10.7.23',
        quipAr: 'محاولة منظمة ومصرح بيها داخل اللاب — الهدف التعلم مش الإيذاء 🔒',
        completed: false,
    },
    {
        id: 4, tool: 'quiz', type: 'challenge', points: 20, title: '🕵️ Mystery 01: Why did the spray succeed?',
        objective: 'Explain the core weakness that enabled access.',
        explanation: 'This checkpoint forces students to identify root cause, not just celebrate tool output. The key learning is that policy weakness is usually the breach enabler.',
        expectedResult: 'Correctly selecting password policy + credential reuse as the root issue.',
        hint: '',
        quipAr: 'الغز مش في الأداة... الغز في سياسة الأمن نفسها.',
        completed: false,
        challengeData: {
            question: 'Connection test: Which cause → effect chain best explains initial access?\nاختبار ربط: أنهي سبب → نتيجة يفسر الدخول الأولي؟',
            options: [
                'Zero-day kernel exploit → instant admin shell without credentials\nثغرة Zero-day في الكيرنل → شِل أدمن فوري بدون بيانات دخول',
                'Weak password policy + reused credentials → valid login from spraying\nسياسة باسورد ضعيفة + إعادة استخدام كلمات السر → دخول صحيح من الـ spraying',
                'Broken TLS certificate chain → automatic account creation\nمشكلة في TLS certificate → إنشاء حساب تلقائي',
                'Hardware side-channel attack → cookie replay in browser\nهجوم عتادي جانبي → إعادة استخدام كوكي في المتصفح',
            ],
            correctIndex: 1,
            hint: 'Connect identity weakness to the observed valid credentials result.\nاربط ضعف الهوية بالنتيجة اللي ظهرت: valid credentials.',
            points: 20,
            hintPenalty: 5,
        },
    },
    {
        id: 5, tool: 'terminal', type: 'action', points: 10, title: 'Clue 04: Investigate captured session artifacts',
        objective: 'Filter suspicious tokens from simulated telemetry using grep.',
        explanation: 'Compromised sessions can bypass MFA and password checks. Reviewing artifact files helps analysts decide whether account takeover happened via token theft.',
        expectedResult: 'You should find an active stolen token linked to a privileged user session.',
        hint: 'grep "stolen_token" captured_cookies.txt',
        quipAr: 'الكوكي ممكن تبقى تذكرة دخول لو السيستم مش عامل binding للجهاز 🍪',
        completed: false,
    },
    {
        id: 6, tool: 'terminal', type: 'action', points: 10, title: 'Clue 05: Replay a stolen session token',
        objective: 'Use token replay simulation to validate session hijack impact.',
        explanation: 'Token replay demonstrates lateral movement without needing another password. If replay works, session rotation/binding controls are weak and incident severity jumps.',
        expectedResult: 'Admin route access should return granted, confirming takeover blast radius.',
        hint: 'curl -H "Cookie: session=stolen_token_77" https://vault.evilcorp.local/admin',
        quipAr: 'Session hijack بيبان بسيط... لكنه أخطر من كلمة سر ضعيفة أحياناً 🎭',
        completed: false,
    },
    {
        id: 7, tool: 'quiz', type: 'challenge', points: 20, title: '🕵️ Mystery 02: Best immediate containment',
        objective: 'Choose the best first containment action after token hijack.',
        explanation: 'During real incidents, response quality depends on first actions. Immediate containment should reduce attacker persistence fast while preserving investigation signal.',
        expectedResult: 'Choosing forced session invalidation and re-authentication as the first move.',
        hint: '',
        quipAr: 'وقت الحادثة، القرار السريع الصح يفرق.',
        completed: false,
        challengeData: {
            question: 'Connection test: Which response action → security outcome is correct first containment?\nاختبار ربط: أنهي إجراء دفاعي → نتيجة أمنية هو الصح كأول containment؟',
            options: [
                'Ignore activity for 24h → attacker sessions naturally expire\nنتجاهل النشاط 24 ساعة → جلسات المهاجم هتنتهي لوحدها',
                'Rotate TLS cert only → stolen session becomes invalid instantly\nنغير TLS cert بس → الجلسة المسروقة هتتبطل فورًا',
                'Invalidate active sessions + force re-authentication → token replay access is cut immediately\nإلغاء كل الجلسات + فرض إعادة تسجيل الدخول → قطع replay فورًا',
                'Change portal theme color → users detect attacker activity faster\nتغيير ألوان البورتال → المستخدمين يكتشفوا الهجوم أسرع',
            ],
            correctIndex: 2,
            hint: 'Pick the action that directly kills already-stolen session tokens.\nاختار الإجراء اللي بيبطل التوكنات المسروقة مباشرة.',
            points: 20,
            hintPenalty: 5,
        },
    },
    {
        id: 8, tool: 'terminal', type: 'action', points: 10, title: 'Clue 06: Verify privilege level',
        objective: 'Check whether the compromised account has elevated privileges.',
        explanation: 'Privilege validation determines business impact and escalation urgency. A compromised low-privilege user differs massively from a service admin account.',
        expectedResult: 'Identity/group output should reveal elevated privileges (sudo/vault-admin).',
        hint: 'whoami && id',
        quipAr: 'عرفنا دخلنا... دلوقتي السؤال: دخلنا بصلاحيات قد إيه؟',
        completed: false,
    },
    {
        id: 9, tool: 'terminal', type: 'action', points: 10, title: 'Clue 07: Capture forensic proof',
        objective: 'Read the simulated evidence file generated by SOC.',
        explanation: 'Incident handling is incomplete without reproducible evidence. This step reinforces evidence collection before closure and reporting.',
        expectedResult: 'The SOC artifact should confirm the full attack chain and expose the mission flag.',
        hint: 'cat /opt/soc/incident-flag.txt',
        quipAr: 'أي عملية Incident Response لازم تنتهي بـ evidence واضح 📁',
        completed: false,
    },
    {
        id: 10, tool: 'terminal', type: 'action', points: 10, title: 'Finale: Submit mission flag',
        objective: 'Submit the final flag to close the mission successfully.',
        explanation: 'Final validation proves students understood sequence and impact, not isolated commands. It simulates analyst sign-off after chain reconstruction.',
        expectedResult: 'Flag accepted message confirming mission completion and scoring.',
        hint: 'submit_flag FLAG{rapid_access_movie_complete}',
        quipAr: 'ستايل سينمائي، خطوات مركزة، وتعليم سريع قبل المحاضرة 🚩',
        completed: false,
    },
]

function clampScore(raw: number, max: number): number {
    if (!Number.isFinite(raw)) return 0
    return Math.max(0, Math.min(max, Math.round(raw)))
}

function sumValues(values: Record<string, number> | Record<number, number>): number {
    return Object.values(values).reduce((sum, value) => sum + value, 0)
}

function loadProgress(): {
    steps: MissionStep[]
    stepScores: Record<number, number>
    bonusAwards: Record<string, number>
    penaltyCosts: Record<string, number>
} {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { steps: INITIAL_STEPS, stepScores: {}, bonusAwards: {}, penaltyCosts: {} }
        const parsed = JSON.parse(raw) as SavedMissionProgress | number[]
        const completedIds = Array.isArray(parsed)
            ? parsed
            : (Array.isArray(parsed.completedIds) ? parsed.completedIds : [])
        const savedScores = Array.isArray(parsed)
            ? {}
            : (parsed.stepScores ?? {})
        const bonusAwards = Array.isArray(parsed) ? {} : (parsed.bonusAwards ?? {})
        const penaltyCosts = Array.isArray(parsed) ? {} : (parsed.penaltyCosts ?? {})
        const steps = INITIAL_STEPS.map((s) => ({ ...s, completed: completedIds.includes(s.id) }))
        const stepScores = steps.reduce<Record<number, number>>((acc, step) => {
            if (!step.completed) return acc
            const saved = clampScore(Number(savedScores[String(step.id)] ?? step.points), step.points)
            acc[step.id] = saved
            return acc
        }, {})
        return { steps, stepScores, bonusAwards, penaltyCosts }
    } catch {
        return { steps: INITIAL_STEPS, stepScores: {}, bonusAwards: {}, penaltyCosts: {} }
    }
}

function saveProgress(
    steps: MissionStep[],
    stepScores: Record<number, number>,
    bonusAwards: Record<string, number>,
    penaltyCosts: Record<string, number>,
) {
    const completedIds = steps.filter((s) => s.completed).map((s) => s.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedIds, stepScores, bonusAwards, penaltyCosts }))
}

export function useMissionProgress(labId: string) {
    const { saveStep } = useProgress()
    const loaded = loadProgress()
    const [steps, setSteps] = useState<MissionStep[]>(loaded.steps)
    const [stepScores, setStepScores] = useState<Record<number, number>>(loaded.stepScores)
    const [bonusAwards, setBonusAwards] = useState<Record<string, number>>(loaded.bonusAwards)
    const [penaltyCosts, setPenaltyCosts] = useState<Record<string, number>>(loaded.penaltyCosts)

    const currentStepId = steps.find((s) => !s.completed)?.id ?? null
    const allComplete = steps.every((s) => s.completed)
    const completedCount = steps.filter((s) => s.completed).length
    const baseMaxScore = steps.reduce((sum, step) => sum + step.points, 0)
    const maxScore = baseMaxScore + BONUS_MAX_POINTS
    const stepEarnedScore = sumValues(stepScores)
    const bonusEarnedScore = sumValues(bonusAwards)
    const penaltySpentScore = sumValues(penaltyCosts)
    const earnedScore = Math.max(0, stepEarnedScore + bonusEarnedScore - penaltySpentScore)

    const completeStep = useCallback((stepId: number, pointsOverride?: number) => {
        setSteps((prev) => {
            const step = prev.find((s) => s.id === stepId)
            if (!step || step.completed) return prev
            const next = prev.map((s) => (s.id === stepId && !s.completed ? { ...s, completed: true } : s))
            if (next !== prev) {
                setStepScores((prevScores) => {
                    const awardedPoints = clampScore(pointsOverride ?? step.points, step.points)
                    const nextScores = { ...prevScores, [stepId]: awardedPoints }
                    saveProgress(next, nextScores, bonusAwards, penaltyCosts)
                    const completedCnt = next.filter((s) => s.completed).length
                    const isFinal = completedCnt === next.length
                    const totalEarned = Math.max(0, sumValues(nextScores) + sumValues(bonusAwards) - sumValues(penaltyCosts))
                    saveStep(labId, stepId, totalEarned, isFinal)
                    return nextScores
                })
            }
            return next
        })
    }, [bonusAwards, penaltyCosts, labId, saveStep])

    const addBonusPoints = useCallback((awardKey: string, points: number) => {
        const safePoints = clampScore(points, 50)
        if (safePoints <= 0) return
        setBonusAwards((prev) => {
            if (prev[awardKey]) return prev
            const next = { ...prev, [awardKey]: safePoints }
            saveProgress(steps, stepScores, next, penaltyCosts)
            return next
        })
    }, [penaltyCosts, stepScores, steps])

    const addPenaltyCost = useCallback((penaltyKey: string, points: number) => {
        const safePoints = clampScore(points, 50)
        if (safePoints <= 0) return
        setPenaltyCosts((prev) => {
            if (prev[penaltyKey]) return prev
            const next = { ...prev, [penaltyKey]: safePoints }
            saveProgress(steps, stepScores, bonusAwards, next)
            return next
        })
    }, [bonusAwards, stepScores, steps])

    const resetProgress = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setSteps(INITIAL_STEPS)
        setStepScores({})
        setBonusAwards({})
        setPenaltyCosts({})
    }, [])

    return {
        steps,
        currentStepId,
        allComplete,
        completedCount,
        maxScore,
        earnedScore,
        bonusEarnedScore,
        penaltySpentScore,
        completeStep,
        addBonusPoints,
        addPenaltyCost,
        resetProgress,
    }
}

