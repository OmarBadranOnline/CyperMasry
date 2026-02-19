import { Link, useLocation } from 'react-router-dom'
import { Shield, Terminal, FlaskConical } from 'lucide-react'

export default function Header() {
    const location = useLocation()
    const isLab = location.pathname.startsWith('/lab')
    const isLabs = location.pathname === '/labs'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <Terminal
                            size={28}
                            className="text-neon-amber group-hover:text-neon-orange transition-colors duration-300"
                        />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-mono text-sm font-bold text-white tracking-wider">
                            IT 102 Extra Labs
                        </span>
                        <span className="font-mono text-xs text-neon-amber/70">
                            &lt;Cyber-Masry Edition/&gt;
                        </span>
                    </div>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="/"
                        className={`font-mono text-sm transition-colors duration-200 ${location.pathname === '/'
                                ? 'text-neon-amber'
                                : 'text-gray-400 hover:text-neon-amber'
                            }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/labs"
                        className={`flex items-center gap-1.5 font-mono text-sm transition-colors duration-200 ${isLabs || isLab
                                ? 'text-neon-amber'
                                : 'text-gray-400 hover:text-neon-amber'
                            }`}
                    >
                        <FlaskConical size={14} />
                        Labs
                    </Link>
                </nav>

                {/* Creator Badge */}
                <div className="flex items-center gap-2 bg-neon-amber/10 border border-neon-amber/30 rounded-full px-4 py-1.5">
                    <Shield size={14} className="text-neon-amber" />
                    <span className="font-mono text-xs text-neon-amber font-semibold">
                        By Omar Badran
                    </span>
                </div>
            </div>
        </header>
    )
}
