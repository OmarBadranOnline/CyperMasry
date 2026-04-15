/**
 * LabRoute — Dynamic lazy loader.
 */
import { lazy, Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { findLab } from '../labs/registry'

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

export default function LabRoute() {
    const { slug } = useParams<{ slug: string }>()

    if (!slug) return <Navigate to="/" replace />

    const meta = findLab(slug)
    if (!meta) return <Navigate to="/" replace />

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
