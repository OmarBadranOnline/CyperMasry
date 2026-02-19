import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Shield, Terminal, FlaskConical, LogOut, LayoutDashboard, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'

export default function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { totalScore } = useProgress()

    const isLab = location.pathname.startsWith('/lab')
    const isLabs = location.pathname === '/labs'

    const handleLogout = () => {
        logout()
        navigate('/')
    }

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
                    {user?.is_admin && (
                        <Link to="/admin" className={`flex items-center gap-1.5 font-mono text-sm transition-colors duration-200 ${location.pathname === '/admin' ? 'text-neon-amber' : 'text-gray-400 hover:text-neon-amber'}`}>
                            <LayoutDashboard size={14} /> Admin
                        </Link>
                    )}
                </nav>

                {/* Right side: user chip OR creator badge */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* Score badge */}
                            <div className="hidden sm:flex items-center gap-1.5 bg-dark-card border border-dark-border rounded-full px-3 py-1.5">
                                <Trophy size={12} className="text-neon-amber" />
                                <span className="font-mono text-xs text-neon-amber font-bold">{user.is_admin ? '∞' : totalScore} pts</span>
                            </div>
                            {/* Username chip */}
                            <div className="flex items-center gap-2 bg-neon-amber/10 border border-neon-amber/30 rounded-full px-3 py-1.5">
                                <div className="w-5 h-5 rounded-full bg-neon-amber/20 flex items-center justify-center font-mono text-xs font-bold text-neon-amber">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <span className="font-mono text-xs text-neon-amber font-semibold max-w-[100px] truncate">{user.username}</span>
                                {user.is_admin && <Shield size={11} className="text-neon-amber" />}
                            </div>
                            {/* Logout */}
                            <button onClick={handleLogout} title="Logout"
                                className="p-2 rounded-full border border-dark-border text-gray-500 hover:text-red-400 hover:border-red-400/40 transition-colors">
                                <LogOut size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="font-mono text-xs text-gray-400 hover:text-neon-amber transition-colors">Login</Link>
                            <Link to="/signup" className="font-mono text-xs text-dark-bg bg-neon-amber hover:brightness-110 px-3 py-1.5 rounded-full transition-all">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
