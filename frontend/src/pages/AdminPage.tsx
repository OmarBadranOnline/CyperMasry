/**
 * AdminPage — Cyber-Masry Admin Dashboard
 * Three tabs: Dashboard stats · Participants table · Create/Edit account
 * Requires is_admin=true (redirect otherwise)
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Users, BarChart3, UserPlus, Shield, Trash2, Edit3, Eye, EyeOff,
    RefreshCw, ChevronDown, ChevronUp, Search, X, CheckCircle, Clock,
    Trophy, Hash, Mail, Loader, AlertTriangle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

import { API_URL as API } from '../config'

interface AdminUser {
    id: number; username: string; student_id: string; email: string
    is_admin: boolean; total_score: number; created_at: string; last_active: string | null
    progress: Array<{ lab_id: number; completed_steps: number[]; completed_at: string | null }>
    solves: Array<{ lab_id: number }>
}

interface Stats {
    total_users: number; total_solves: number
    lab_stats: Array<{ lab_id: number; title: string; solves: number; points: number }>
}

type Tab = 'dashboard' | 'participants' | 'create'

const LAB_TOTAL: Record<number, number> = { 1: 9, 2: 10, 3: 10, 4: 10, 5: 10 }

export default function AdminPage() {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState<Tab>('dashboard')
    const [users, setUsers] = useState<AdminUser[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState<number | null>(null)

    // Edit state
    const [editId, setEditId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<AdminUser & { password: string }>>({})
    const [editLoading, setEditLoading] = useState(false)

    // Create form state
    const [createData, setCreateData] = useState({ username: '', student_id: '', email: '', password: '', is_admin: false })
    const [createError, setCreateError] = useState('')
    const [createOk, setCreateOk] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)

    // Delete confirmation
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const authH = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token])

    // Redirect non-admins
    useEffect(() => {
        if (!user) return
        if (!user.is_admin) navigate('/')
    }, [user, navigate])

    const loadData = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const [uRes, sRes] = await Promise.all([
                fetch(`${API}/api/admin/users`, { headers: authH() }),
                fetch(`${API}/api/admin/stats`, { headers: authH() }),
            ])
            if (uRes.ok) setUsers(await uRes.json())
            if (sRes.ok) setStats(await sRes.json())
        } catch { }
        setLoading(false)
    }, [token, authH])

    useEffect(() => { loadData() }, [loadData])

    // ── Delete user ──────────────────────────────────────────────────────────
    const deleteUser = async (id: number) => {
        setDeleteLoading(true)
        try {
            await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: authH() })
            setUsers(prev => prev.filter(u => u.id !== id))
            setDeleteId(null)
        } catch { }
        setDeleteLoading(false)
    }

    // ── Save edit ────────────────────────────────────────────────────────────
    const saveEdit = async () => {
        if (!editId) return
        setEditLoading(true)
        try {
            const res = await fetch(`${API}/api/admin/users/${editId}`, {
                method: 'PUT',
                headers: authH(),
                body: JSON.stringify(editData),
            })
            if (res.ok) {
                const updated = await res.json()
                setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...updated } : u))
                setEditId(null)
            }
        } catch { }
        setEditLoading(false)
    }

    // ── Create user ──────────────────────────────────────────────────────────
    const createUser = async () => {
        setCreateError(''); setCreateOk(false)
        if (!createData.username || !createData.student_id || !createData.email || !createData.password)
            return setCreateError('All fields are required')
        setCreateLoading(true)
        try {
            const res = await fetch(`${API}/api/admin/users`, {
                method: 'POST',
                headers: authH(),
                body: JSON.stringify(createData),
            })
            const data = await res.json()
            if (!res.ok) setCreateError(data.error || 'Creation failed')
            else {
                setCreateOk(true)
                setCreateData({ username: '', student_id: '', email: '', password: '', is_admin: false })
                await loadData()
            }
        } catch { setCreateError('Server error') }
        setCreateLoading(false)
    }

    // ── Reset progress ──────────────────────────────────────────────────────
    const resetProgress = async (id: number) => {
        await fetch(`${API}/api/admin/users/${id}/reset-progress`, { method: 'POST', headers: authH() })
        await loadData()
    }

    const filtered = users.filter(u =>
        !u.is_admin &&
        (u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.student_id.includes(search) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
    )

    if (!user?.is_admin) return null

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <Header />
            <main className="flex-1 pt-20 flex">
                {/* Sidebar */}
                <aside className="w-56 flex-shrink-0 border-r border-dark-border bg-dark-card hidden lg:block">
                    <div className="p-4 border-b border-dark-border">
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-neon-amber" />
                            <span className="font-mono text-sm font-bold text-neon-amber">Admin Panel</span>
                        </div>
                        <p className="font-cairo text-xs text-gray-600 mt-1">مسؤول النظام</p>
                    </div>
                    <nav className="p-3 space-y-1">
                        {([
                            { id: 'dashboard', icon: BarChart3, label: 'Dashboard', ar: 'لوحة التحكم' },
                            { id: 'participants', icon: Users, label: 'Participants', ar: 'المشاركون' },
                            { id: 'create', icon: UserPlus, label: 'Add Account', ar: 'إضافة حساب' },
                        ] as const).map(item => (
                            <button key={item.id} onClick={() => setTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${tab === item.id
                                    ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/20'
                                    : 'text-gray-500 hover:text-white hover:bg-dark-border/50'
                                    }`}>
                                <item.icon size={14} />
                                <div className="text-left">
                                    <div>{item.label}</div>
                                    <div className="font-cairo text-gray-600 text-xs">{item.ar}</div>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-6xl mx-auto">
                        {/* Mobile tab bar */}
                        <div className="flex lg:hidden gap-2 mb-6">
                            {(['dashboard', 'participants', 'create'] as Tab[]).map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`flex-1 py-2 rounded-lg font-mono text-xs capitalize transition-all ${tab === t ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/30' : 'bg-dark-card border border-dark-border text-gray-500'
                                        }`}>{t}</button>
                            ))}
                        </div>

                        {/* DASHBOARD TAB */}
                        <AnimatePresence mode="wait">
                            {tab === 'dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h1 className="font-mono font-black text-2xl text-white">Dashboard</h1>
                                            <p className="font-cairo text-sm text-gray-500">إحصائيات المنصة</p>
                                        </div>
                                        <button onClick={loadData} className="flex items-center gap-2 text-gray-500 hover:text-neon-amber font-mono text-xs transition-colors">
                                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
                                        </button>
                                    </div>

                                    {/* Stat cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: 'Students', value: stats?.total_users ?? '—', icon: Users, color: 'text-neon-amber' },
                                            { label: 'Total Solves', value: stats?.total_solves ?? '—', icon: Trophy, color: 'text-neon-green' },
                                            { label: 'Total Labs', value: 5, icon: BarChart3, color: 'text-blue-400' },
                                            { label: 'Max Points', value: 875, icon: Hash, color: 'text-purple-400' },
                                        ].map(s => (
                                            <div key={s.label} className="bg-dark-card border border-dark-border rounded-xl p-4">
                                                <s.icon size={18} className={`${s.color} mb-2`} />
                                                <div className={`font-mono font-black text-2xl ${s.color}`}>{loading ? '…' : s.value}</div>
                                                <div className="font-mono text-xs text-gray-500 mt-1">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Lab solve stats */}
                                    {stats && (
                                        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                                            <h3 className="font-mono font-bold text-sm text-white mb-4">Solves per Lab</h3>
                                            <div className="space-y-3">
                                                {stats.lab_stats.map(lab => {
                                                    const pct = stats.total_users > 0 ? Math.round((lab.solves / stats.total_users) * 100) : 0
                                                    return (
                                                        <div key={lab.lab_id}>
                                                            <div className="flex justify-between font-mono text-xs mb-1">
                                                                <span className="text-gray-400">{lab.title}</span>
                                                                <span className="text-neon-amber">{lab.solves} solves ({pct}%)</span>
                                                            </div>
                                                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-neon-amber rounded-full"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ duration: 0.8, delay: lab.lab_id * 0.1 }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* PARTICIPANTS TAB */}
                            {tab === 'participants' && (
                                <motion.div key="participants" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                        <div>
                                            <h1 className="font-mono font-black text-2xl text-white">Participants</h1>
                                            <p className="font-cairo text-sm text-gray-500">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-dark-card border border-dark-border rounded-lg pl-8 pr-8 py-2 font-mono text-xs text-white focus:outline-none focus:border-neon-amber/40 w-48" />
                                                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"><X size={12} /></button>}
                                            </div>
                                            <button onClick={loadData} className="p-2 rounded-lg border border-dark-border text-gray-500 hover:text-neon-amber transition-colors">
                                                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-20"><Loader size={24} className="text-neon-amber animate-spin" /></div>
                                    ) : filtered.length === 0 ? (
                                        <div className="text-center py-20 text-gray-600 font-mono text-sm">No students found</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filtered.map(u => {
                                                const completedLabCount = u.solves?.length ?? 0
                                                const isExpanded = expandedId === u.id
                                                const isEditing = editId === u.id
                                                return (
                                                    <div key={u.id} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                                                        {/* Row */}
                                                        <div className="flex items-center gap-3 px-4 py-3">
                                                            <div className="w-8 h-8 rounded-full bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center font-mono text-xs font-bold text-neon-amber flex-shrink-0">
                                                                {u.username[0].toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-sm font-bold text-white truncate">{u.username}</span>
                                                                    <span className="font-mono text-xs text-gray-600">#{u.student_id}</span>
                                                                </div>
                                                                <div className="font-mono text-xs text-gray-500 truncate">{u.email}</div>
                                                            </div>
                                                            {/* Lab pills */}
                                                            <div className="hidden md:flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map(n => {
                                                                    const prog = u.progress?.find(p => p.lab_id === n)
                                                                    const steps = prog?.completed_steps?.length ?? 0
                                                                    const total = LAB_TOTAL[n] ?? 10
                                                                    const done = steps >= total
                                                                    return (
                                                                        <div key={n} title={`Lab ${n.toString().padStart(2, '0')}: ${steps}/${total} steps`}
                                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${done ? 'bg-neon-green/20 border border-neon-green/40 text-neon-green' : steps > 0 ? 'bg-neon-amber/10 border border-neon-amber/30 text-neon-amber' : 'bg-dark-border/40 border border-dark-border text-gray-700'
                                                                                }`}>{n}</div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <Trophy size={12} className="text-neon-amber" />
                                                                <span className="font-mono text-xs font-bold text-neon-amber w-10 text-right">{u.total_score}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 ml-1">
                                                                <button onClick={() => { setEditId(isEditing ? null : u.id); setEditData({ username: u.username, email: u.email, student_id: u.student_id }) }}
                                                                    className="p-1.5 rounded-lg text-gray-600 hover:text-neon-amber transition-colors" title="Edit"><Edit3 size={13} /></button>
                                                                <button onClick={() => setDeleteId(u.id)}
                                                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={13} /></button>
                                                                <button onClick={() => setExpandedId(isExpanded ? null : u.id)}
                                                                    className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-colors">
                                                                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Edit form */}
                                                        <AnimatePresence>
                                                            {isEditing && (
                                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                                    className="overflow-hidden border-t border-dark-border">
                                                                    <div className="p-4 grid grid-cols-2 gap-3">
                                                                        {([
                                                                            ['username', 'Username', 'text'],
                                                                            ['student_id', 'Student ID', 'text'],
                                                                            ['email', 'Email', 'email'],
                                                                            ['password', 'New Password (optional)', 'password'],
                                                                        ] as const).map(([field, label, type]) => (
                                                                            <div key={field}>
                                                                                <label className="block font-mono text-xs text-gray-600 mb-1">{label}</label>
                                                                                <input type={type} value={(editData as any)[field] ?? ''}
                                                                                    onChange={e => setEditData(p => ({ ...p, [field]: e.target.value }))}
                                                                                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-neon-amber/40" />
                                                                            </div>
                                                                        ))}
                                                                        <div className="col-span-2 flex items-center justify-between">
                                                                            <label className="flex items-center gap-2 font-mono text-xs text-gray-500 cursor-pointer">
                                                                                <input type="checkbox" checked={!!editData.is_admin}
                                                                                    onChange={e => setEditData(p => ({ ...p, is_admin: e.target.checked }))}
                                                                                    className="accent-neon-amber" />
                                                                                <Shield size={12} /> Admin account
                                                                            </label>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => resetProgress(u.id)}
                                                                                    className="font-mono text-xs text-gray-600 hover:text-red-400 border border-dark-border px-3 py-1.5 rounded-lg transition-colors">Reset Progress</button>
                                                                                <button onClick={() => setEditId(null)}
                                                                                    className="font-mono text-xs text-gray-600 border border-dark-border px-3 py-1.5 rounded-lg">Cancel</button>
                                                                                <button onClick={saveEdit} disabled={editLoading}
                                                                                    className="font-mono text-xs text-dark-bg bg-neon-amber px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                                                    {editLoading ? <Loader size={11} className="animate-spin" /> : null} Save
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {/* Expanded progress detail */}
                                                        <AnimatePresence>
                                                            {isExpanded && !isEditing && (
                                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                                    className="overflow-hidden border-t border-dark-border">
                                                                    <div className="p-4 space-y-3">
                                                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                                            <div><span className="text-gray-600">Joined: </span><span className="text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span></div>
                                                                            <div><span className="text-gray-600">Last active: </span><span className="text-gray-400">{u.last_active ? new Date(u.last_active).toLocaleDateString() : 'never'}</span></div>
                                                                            <div><span className="text-gray-600">Labs completed: </span><span className="text-neon-green">{completedLabCount} / 5</span></div>
                                                                            <div><span className="text-gray-600">Total score: </span><span className="text-neon-amber">{u.total_score} pts</span></div>
                                                                        </div>
                                                                        <div className="grid grid-cols-5 gap-2">
                                                                            {[1, 2, 3, 4, 5].map(n => {
                                                                                const prog = u.progress?.find(p => p.lab_id === n)
                                                                                const steps = prog?.completed_steps?.length ?? 0
                                                                                const total = LAB_TOTAL[n] ?? 10
                                                                                const pct = Math.round((steps / total) * 100)
                                                                                const done = steps >= total
                                                                                return (
                                                                                    <div key={n} className={`rounded-lg border p-2 text-center ${done ? 'border-neon-green/30 bg-neon-green/5' : steps > 0 ? 'border-neon-amber/20 bg-neon-amber/5' : 'border-dark-border bg-dark-bg'}`}>
                                                                                        <div className="font-mono text-xs text-gray-500 mb-1">Lab {n.toString().padStart(2, '0')}</div>
                                                                                        <div className={`font-mono text-sm font-bold ${done ? 'text-neon-green' : steps > 0 ? 'text-neon-amber' : 'text-gray-700'}`}>{pct}%</div>
                                                                                        <div className="font-mono text-xs text-gray-600">{steps}/{total}</div>
                                                                                        {done && <CheckCircle size={12} className="text-neon-green mx-auto mt-1" />}
                                                                                        {!done && steps > 0 && <Clock size={12} className="text-neon-amber mx-auto mt-1" />}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* CREATE ACCOUNT TAB */}
                            {tab === 'create' && (
                                <motion.div key="create" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl">
                                    <h1 className="font-mono font-black text-2xl text-white mb-1">Add Account</h1>
                                    <p className="font-cairo text-sm text-gray-500 mb-6">إنشاء حساب جديد للطالب أو المشرف</p>

                                    {createError && (
                                        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-red-400" />
                                            <p className="font-mono text-sm text-red-400">{createError}</p>
                                        </div>
                                    )}
                                    {createOk && (
                                        <div className="mb-4 bg-neon-green/10 border border-neon-green/30 rounded-xl px-4 py-3 flex items-center gap-2">
                                            <CheckCircle size={14} className="text-neon-green" />
                                            <p className="font-mono text-sm text-neon-green">Account created successfully! ✅</p>
                                        </div>
                                    )}

                                    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
                                        {([
                                            ['username', 'Username', 'text', 'officer_name', <Users size={13} />],
                                            ['student_id', 'Student ID', 'text', '202112345', <Hash size={13} />],
                                            ['email', 'Email', 'email', 'student@zewailcity.edu.eg', <Mail size={13} />],
                                        ] as const).map(([field, label, type, ph, icon]) => (
                                            <div key={field}>
                                                <label className="block font-mono text-xs text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">{icon}</span>
                                                    <input type={type} placeholder={ph}
                                                        value={(createData as any)[field] ?? ''}
                                                        onChange={e => setCreateData(p => ({ ...p, [field]: e.target.value }))}
                                                        className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-white placeholder-gray-700 focus:outline-none focus:border-neon-amber/60 transition-colors" />
                                                </div>
                                            </div>
                                        ))}

                                        <div>
                                            <label className="block font-mono text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                                            <div className="relative">
                                                <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                                                    value={createData.password}
                                                    onChange={e => setCreateData(p => ({ ...p, password: e.target.value }))}
                                                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-4 pr-11 py-3 font-mono text-sm text-white placeholder-gray-700 focus:outline-none focus:border-neon-amber/60 transition-colors" />
                                                <button type="button" onClick={() => setShowPw(p => !p)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-neon-amber transition-colors">
                                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 font-mono text-sm text-gray-400 cursor-pointer select-none">
                                                <input type="checkbox" checked={createData.is_admin}
                                                    onChange={e => setCreateData(p => ({ ...p, is_admin: e.target.checked }))}
                                                    className="accent-neon-amber w-4 h-4" />
                                                <Shield size={13} className="text-neon-amber" /> Admin account
                                            </label>
                                        </div>

                                        <motion.button onClick={createUser} disabled={createLoading}
                                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                            className="w-full py-3 rounded-xl font-mono font-bold text-sm text-dark-bg bg-neon-amber hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            style={{ boxShadow: '0 0 16px rgba(255,191,0,0.25)' }}>
                                            {createLoading ? <><Loader size={14} className="animate-spin" /> Creating...</> : <><UserPlus size={14} /> Create Account</>}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Delete confirmation modal */}
            <AnimatePresence>
                {deleteId && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500]" onClick={() => setDeleteId(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-[600] flex items-center justify-center px-4 pointer-events-none">
                            <div className="bg-dark-card border border-red-500/40 rounded-2xl p-6 max-w-sm w-full pointer-events-auto"
                                style={{ boxShadow: '0 0 40px rgba(239,68,68,0.2)' }}>
                                <AlertTriangle size={28} className="text-red-400 mx-auto mb-3" />
                                <h3 className="font-mono font-bold text-lg text-white text-center mb-1">Delete Account?</h3>
                                <p className="font-cairo text-sm text-gray-500 text-center mb-5">هيتحذف الحساب ده وكل تقدمه نهائياً. مفيش رجعة.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl font-mono text-sm border border-dark-border text-gray-500 hover:text-white transition-colors">Cancel</button>
                                    <button onClick={() => deleteUser(deleteId)} disabled={deleteLoading}
                                        className="flex-1 py-2 rounded-xl font-mono text-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1">
                                        {deleteLoading ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}
