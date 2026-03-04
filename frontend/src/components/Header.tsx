import { Link, useLocation } from 'react-router-dom'
import { Terminal, FlaskConical, Trophy } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'

export default function Header() {
    const location = useLocation()
    const { totalScore } = useProgress()

    const isLab = location.pathname.startsWith('/lab')
    const isLabs = location.pathname === '/labs'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <Terminal size={28} className="text-neon-amber group-hover:text-neon-orange transition-colors duration-300" />
                    <div className="flex flex-col leading-tight">
                        <span className="font-mono text-sm font-bold text-white tracking-wider">IT 102 Extra Labs</span>
                        <span className="font-mono text-xs text-neon-amber/70">&lt;Cyber-Masry Edition/&gt;</span>
                    </div>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className={`font-mono text-sm transition-colors duration-200 ${location.pathname === '/' ? 'text-neon-amber' : 'text-gray-400 hover:text-neon-amber'}`}>
                        Home
                    </Link>
                    <Link to="/labs" className={`flex items-center gap-1.5 font-mono text-sm transition-colors duration-200 ${isLabs || isLab ? 'text-neon-amber' : 'text-gray-400 hover:text-neon-amber'}`}>
                        <FlaskConical size={14} /> Labs
                    </Link>
                </nav>

                {/* Right side: score */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-dark-card border border-dark-border rounded-full px-3 py-1.5">
                        <Trophy size={12} className="text-neon-amber" />
                        <span className="font-mono text-xs text-neon-amber font-bold">{totalScore} pts</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
