import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Terminal, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const result = await login(username.trim(), password)
        setLoading(false)
        if (!result.ok) {
            setError(result.error || 'Login failed')
        } else {
            navigate('/labs')
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-neon-amber/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-neon-amber/10 border-2 border-neon-amber/40 flex items-center justify-center mb-4"
                        style={{ boxShadow: '0 0 24px rgba(255,191,0,0.2)' }}>
                        <Shield size={28} className="text-neon-amber" />
                    </div>
                    <h1 className="font-mono font-black text-3xl text-white tracking-tight">Cyber-Masry</h1>
                    <p className="font-cairo text-sm text-gray-500 mt-1">سايبر مصري — المنصة التعليمية</p>
                </div>

                {/* Card */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-8"
                    style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                    <h2 className="font-mono font-bold text-xl text-white mb-1">Welcome back</h2>
                    <p className="font-cairo text-sm text-gray-500 mb-6">اتفضل يا كابتن، سجّل دخولك 👋</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                        >
                            <p className="font-mono text-sm text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block font-mono text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <Terminal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-white placeholder-gray-700 focus:outline-none focus:border-neon-amber/60 transition-colors"
                                    required
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-mono text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-4 pr-11 py-3 font-mono text-sm text-white placeholder-gray-700 focus:outline-none focus:border-neon-amber/60 transition-colors"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-neon-amber transition-colors"
                                >
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl font-mono font-bold text-sm text-dark-bg bg-neon-amber hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                            style={{ boxShadow: '0 0 20px rgba(255,191,0,0.3)' }}
                        >
                            {loading ? <><Loader size={14} className="animate-spin" /> جاري الدخول...</> : '🔐 Sign In'}
                        </motion.button>
                    </form>

                    <p className="font-mono text-xs text-gray-600 text-center mt-5">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-neon-amber hover:underline">Sign up here</Link>
                    </p>
                </div>

                {/* Hint for admin */}

            </motion.div>
        </div>
    )
}
