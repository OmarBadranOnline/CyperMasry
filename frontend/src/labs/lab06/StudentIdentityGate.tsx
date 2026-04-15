import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserRound, Hash, ArrowRight } from 'lucide-react'

interface Props {
    defaultName?: string
    defaultStudentId?: string
    onSubmit: (name: string, studentId: string) => void
}

export default function StudentIdentityGate({ defaultName = '', defaultStudentId = '', onSubmit }: Props) {
    const [name, setName] = useState(defaultName)
    const [studentId, setStudentId] = useState(defaultStudentId)
    const [error, setError] = useState('')

    const submit = () => {
        const cleanName = name.trim()
        const cleanId = studentId.trim()
        if (!cleanName || !cleanId) {
            setError('من فضلك اكتب الاسم و الـ ID قبل بداية اللاب.')
            return
        }
        setError('')
        onSubmit(cleanName, cleanId)
    }

    return (
        <div className="fixed inset-0 z-[540] bg-[#04030a]/95 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-xl rounded-2xl border border-cyan-300/30 bg-[#090813] overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(34,211,238,0.18)' }}
            >
                <div className="px-5 py-3 border-b border-cyan-300/25 bg-cyan-500/10">
                    <p className="font-cairo text-cyan-100 font-bold">تسجيل بسيط قبل بداية اللاب</p>
                    <p className="font-cairo text-xs text-cyan-200/70 mt-1">اكتب بياناتك عشان نعرض النتيجة النهائية باسمك.</p>
                </div>

                <div className="p-5 space-y-3">
                    <div>
                        <label className="font-cairo text-xs text-gray-300 flex items-center gap-1 mb-1.5">
                            <UserRound size={12} className="text-cyan-300" /> الاسم
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="مثال: Omar Badran"
                            className="w-full rounded-lg bg-black/30 border border-dark-border px-3 py-2 font-mono text-sm text-gray-100 outline-none focus:border-cyan-300/50"
                        />
                    </div>

                    <div>
                        <label className="font-cairo text-xs text-gray-300 flex items-center gap-1 mb-1.5">
                            <Hash size={12} className="text-fuchsia-300" /> Student ID
                        </label>
                        <input
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="مثال: 20241023"
                            className="w-full rounded-lg bg-black/30 border border-dark-border px-3 py-2 font-mono text-sm text-gray-100 outline-none focus:border-fuchsia-300/50"
                        />
                    </div>

                    {error && <p className="font-cairo text-xs text-red-300">{error}</p>}

                    <button
                        onClick={submit}
                        className="w-full mt-2 inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-300 text-black font-cairo font-bold py-2 hover:brightness-110"
                    >
                        ابدأ اللاب <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
