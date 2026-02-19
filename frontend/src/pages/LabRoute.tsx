/**
 * LabRoute — Dynamic lazy loader + unlock guard
 * Lab N (number > 1) is only accessible if lab N-1 is fully complete.
 * Unauthenticated users can access Lab 01 freely.
 */
import { lazy, Suspense } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { findLab } from '../labs/registry'
import { useProgress } from '../context/ProgressContext'
import { useAuth } from '../context/AuthContext'

const PAGE_MODULES = import.meta.glob('../labs/*/Page.tsx') as Record<
    string,
    () => Promise<{ default: React.ComponentType }>
>

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
            <div className="font-mono text-neon-amber text-sm animate-pulse">[ Loading Lab… ]</div>
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-neon-amber/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    )
}

function LockedScreen({ labTitle }: { labTitle: string }) {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-6 p-4">
            <div className="text-6xl">🔒</div>
            <div className="text-center">
                <h2 className="font-mono font-black text-2xl text-white mb-2">{labTitle}</h2>

                <p className="font-cairo text-gray-400 text-lg mb-2">اللاب ده لسه مقفل</p>
                <p className="font-mono text-sm text-gray-600">أكمل اللاب اللي قبله الأول عشان تفتحه</p>
            </div>
            <button onClick={() => navigate('/labs')}
                className="font-mono text-sm text-dark-bg bg-neon-amber px-6 py-3 rounded-xl hover:brightness-110 transition-all"
                style={{ boxShadow: '0 0 16px rgba(255,191,0,0.3)' }}>
                ← Back to Labs
            </button>
        </div>
    )
}

export default function LabRoute() {
    const { slug } = useParams<{ slug: string }>()
    const { isLabUnlocked, } = useProgress()
    const { loading: authLoading } = useAuth()

    if (!slug) return <Navigate to="/" replace />

    const meta = findLab(slug)
    if (!meta) return <Navigate to="/" replace />

    // Convert "01" → 1
    const labNumber = parseInt(meta.number, 10)

    // Wait for auth to load before showing lock screen (avoid flash)
    if (authLoading) return <LoadingScreen />

    // Lock check: lab 1 always open; labs 2-5 need previous complete
    if (labNumber > 1 && !isLabUnlocked(labNumber)) {
        return <LockedScreen labTitle={meta.titleEn} />
    }

    const pageKey = `../labs/${slug}/Page.tsx`
    const loader = PAGE_MODULES[pageKey]
    if (!loader) return <Navigate to="/" replace />

    const LazyPage = lazy(loader)

    return (
        <Suspense fallback={<LoadingScreen />}>
            <LazyPage />
        </Suspense>
    )
}
