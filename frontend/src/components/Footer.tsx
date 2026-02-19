import { Heart } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-dark-border bg-dark-bg py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left — credits */}
                <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
                    <span>Made with</span>
                    <Heart size={14} className="text-neon-amber fill-neon-amber" />
                    <span>by</span>
                    <span className="text-neon-amber font-bold">Omar Badran</span>
                    <span className="text-gray-600 ml-1">· Zewail City IT 102</span>
                </div>

                {/* Center — Egyptian flavor */}
                <div className="font-mono text-sm text-gray-600 italic">
                    "If you're not learning, you're AFK." — مثل مصري قديم
                </div>

                {/* Right — tag */}
                <div className="font-mono text-xs text-gray-600">
                    <span className="text-neon-amber/40">[</span>
                    <span> Ethical Hacking · 2025 </span>
                    <span className="text-neon-amber/40">]</span>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-dark-border/50 text-center">
                <p className="font-mono text-xs text-gray-600">
                    ⚠️ 100% simulated environment · No real network calls · For educational use in IT 102 only ·{' '}
                    <span className="text-neon-amber/50">مفيش هاكينج حقيقي هنا يا عم 😄</span>
                </p>
            </div>
        </footer>
    )
}
