import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, MessageSquare, Share2, AlertTriangle, ChevronDown, ChevronUp, Send, Search } from 'lucide-react'

// The secret — students must figure out the pet name from posts
const PET_NAME = 'lola'

interface Props {
    onPetNameFound?: () => void
}

const POSTS = [
    {
        id: 1,
        timeAgo: '2d',
        text: `Finally pushed the new firewall rules live on the EvilCorp internal network. Long week but worth it. If you're in IT security, you know the pain of legacy configs 😮‍💨\n\n#CyberSecurity #EvilCorp #SysAdmin #NetworkSecurity`,
        likes: 47,
        comments: 5,
        hasImage: false,
    },
    {
        id: 2,
        timeAgo: '1w',
        text: `Weekend mood 🐱 Lola literally sat on my keyboard for 3 hours straight and somehow improved my uptime stats. Maybe she should be the IT Manager 😂\n\n#CatsOfLinkedIn #WorkFromHome`,
        likes: 312,
        comments: 38,
        hasImage: true,
        imageEmoji: '🐱',
        imageCaption: 'Lola taking over the home office',
    },
    {
        id: 3,
        timeAgo: '2w',
        text: `Attended the Cairo InfoSec Summit last Tuesday. Great talks on zero-trust architecture and supply-chain attacks. Ran into some old colleagues from my university days.\n\nIf you're in the cybersec space in Egypt — this conference is a must. See you next year! 🇪🇬\n\n#InfoSec #EgyptTech #ZeroTrust`,
        likes: 89,
        comments: 12,
        hasImage: false,
    },
    {
        id: 4,
        timeAgo: '3w',
        text: `Hot take: Most "password security" trainings miss the point entirely. Users aren't the weakest link — bad UX design is. If a secure password is annoying to use, people WILL write it on a sticky note.\n\nDesign for humans, not for compliance checklists.\n\n#InfoSec #UX #PasswordSecurity`,
        likes: 203,
        comments: 67,
        hasImage: false,
    },
    {
        id: 5,
        timeAgo: '1mo',
        text: `Proud to share I've completed my CISSP certification! 🎉 Three months of studying while managing the EvilCorp infrastructure was... character-building, let's say.\n\nShoutout to my cat Lola for keeping me company during those 2am study sessions.\n\n#CISSP #CyberSecurity #Milestone`,
        likes: 891,
        comments: 142,
        hasImage: false,
    },
]

// About section data
const ABOUT = `IT Manager & Systems Administrator with 9+ years of experience in network security, infrastructure management, and enterprise IT operations.

Currently leading the EvilCorp internal IT division — responsible for a team of 8 engineers, managing cloud infrastructure, endpoint security, and compliance frameworks.

Passionate about practical security: making systems actually safe, not just "audit-ready". 

📍 Cairo, Egypt`

const EXPERIENCE = [
    { role: 'IT Manager', company: 'EvilCorp', period: '2019 – Present', years: '5 yrs' },
    { role: 'Senior Network Engineer', company: 'TechNile Solutions', period: '2016 – 2019', years: '3 yrs' },
    { role: 'Network Admin', company: 'Cairo Telecom', period: '2014 – 2016', years: '2 yrs' },
]

export default function FakeLinkedIn({ onPetNameFound }: Props) {
    const [inputVal, setInputVal] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [wrong, setWrong] = useState(false)
    const [aboutExpanded, setAboutExpanded] = useState(false)
    const [expandedPost, setExpandedPost] = useState<number | null>(null)

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault()
        const guess = inputVal.trim().toLowerCase()
        if (guess === PET_NAME) {
            setSubmitted(true)
            setWrong(false)
            onPetNameFound?.()
        } else {
            setWrong(true)
            setTimeout(() => setWrong(false), 2000)
        }
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* OSINT Warning banner */}
            <div className="flex-shrink-0 flex items-center gap-2 bg-neon-orange/10 border border-neon-orange/30 rounded-xl px-4 py-2 mb-3">
                <AlertTriangle size={13} className="text-neon-orange flex-shrink-0" />
                <span className="font-mono text-xs text-neon-orange/80">
                    SIMULATED PROFILE · Social Media OSINT · مفيش بيانات حقيقية هنا
                </span>
            </div>

            {/* Mission objective */}
            <div className="flex-shrink-0 bg-dark-card border border-neon-amber/30 rounded-xl px-4 py-3 mb-3">
                <p className="font-mono text-xs text-neon-amber font-bold mb-1">🎯 El-Stalker Mission</p>
                <p className="font-mono text-xs text-gray-300 leading-relaxed">
                    Karim Mansour is EvilCorp's IT Manager. Employees often use their pet's name as part of their password.
                    Browse his LinkedIn profile and find his <span className="text-neon-amber font-bold">pet's name</span>.
                </p>
                <p className="font-cairo text-xs text-neon-orange/60 italic mt-1">
                    الناس بتحب تكتب اسم قطتهم في الباسورد.. دور على الاسم ده 🐱
                </p>
            </div>

            {/* Main content: LinkedIn profile mock */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">

                {/* Profile card */}
                <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                    {/* Cover */}
                    <div className="h-20 bg-gradient-to-r from-blue-900/40 to-blue-700/20 relative">
                        <div className="absolute -bottom-8 left-5">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-dark-card flex items-center justify-center text-2xl">
                                👨‍💻
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 px-5 pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="font-mono text-base font-bold text-white">Karim Mansour</h2>
                                <p className="font-mono text-xs text-gray-300 mt-0.5">
                                    IT Manager @ EvilCorp · Cybersecurity · Network Infrastructure
                                </p>
                                <p className="font-mono text-xs text-gray-500 mt-0.5">Cairo, Egypt · 500+ connections</p>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="flex items-center gap-1 bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-xs px-3 py-1.5 rounded-full">
                                    <span>+ Connect</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick info */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {['EvilCorp', 'Cairo University – B.Sc. CS', 'CISSP Certified'].map((tag) => (
                                <span key={tag} className="font-mono text-xs text-gray-500 bg-dark-bg border border-dark-border px-2 py-0.5 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="font-mono text-sm font-bold text-white mb-2">About</h3>
                    <div className="font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                        {aboutExpanded ? ABOUT : ABOUT.slice(0, 140) + '...'}
                    </div>
                    <button
                        onClick={() => setAboutExpanded((p) => !p)}
                        className="flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                    >
                        {aboutExpanded ? <><ChevronUp size={12} /> show less</> : <><ChevronDown size={12} /> see more</>}
                    </button>
                </div>

                {/* Experience */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="font-mono text-sm font-bold text-white mb-3">Experience</h3>
                    <div className="space-y-3">
                        {EXPERIENCE.map((exp) => (
                            <div key={exp.role} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-md bg-dark-bg border border-dark-border flex items-center justify-center text-sm flex-shrink-0">
                                    🏢
                                </div>
                                <div>
                                    <p className="font-mono text-xs font-bold text-white">{exp.role}</p>
                                    <p className="font-mono text-xs text-gray-400">{exp.company}</p>
                                    <p className="font-mono text-xs text-gray-600">{exp.period} · {exp.years}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Posts / Activity */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <h3 className="font-mono text-sm font-bold text-white mb-3">Activity</h3>
                    <div className="space-y-4">
                        {POSTS.map((post) => {
                            const isExpanded = expandedPost === post.id
                            const shortText = post.text.length > 180
                            return (
                                <div key={post.id} className="border-b border-dark-border pb-4 last:border-0 last:pb-0">
                                    {/* Post header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-sm">
                                            👨‍💻
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs font-bold text-white">Karim Mansour</p>
                                            <p className="font-mono text-xs text-gray-600">IT Manager · {post.timeAgo}</p>
                                        </div>
                                    </div>

                                    {/* Post text */}
                                    <p className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                        {shortText && !isExpanded
                                            ? post.text.slice(0, 180) + '...'
                                            : post.text}
                                    </p>
                                    {shortText && (
                                        <button
                                            onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                                            className="font-mono text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
                                        >
                                            {isExpanded ? 'see less' : '…see more'}
                                        </button>
                                    )}

                                    {/* Image post */}
                                    {post.hasImage && (
                                        <div className="mt-2 bg-dark-bg border border-dark-border rounded-lg p-4 flex flex-col items-center gap-2">
                                            <span className="text-5xl">{post.imageEmoji}</span>
                                            <p className="font-mono text-xs text-gray-500 italic">{post.imageCaption}</p>
                                        </div>
                                    )}

                                    {/* Reactions */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <button className="flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-blue-400 transition-colors">
                                            <ThumbsUp size={11} /> {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-blue-400 transition-colors">
                                            <MessageSquare size={11} /> {post.comments}
                                        </button>
                                        <button className="flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-blue-400 transition-colors">
                                            <Share2 size={11} /> Share
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Answer box */}
                <div className="bg-dark-card border border-neon-amber/30 rounded-xl p-4">
                    <p className="font-mono text-xs font-bold text-neon-amber mb-1">🔑 Intel Captured?</p>
                    <p className="font-mono text-xs text-gray-400 mb-3">
                        Enter the pet's name you found. It will become part of the password: <code className="text-neon-green">Karim@[pet]2024!</code>
                    </p>

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-neon-green/10 border border-neon-green/40 rounded-xl p-4 text-center"
                            >
                                <p className="text-2xl mb-1">🏆</p>
                                <p className="font-mono text-sm font-bold text-neon-green">Pet Name Found!</p>
                                <code className="font-mono text-sm text-neon-green/80 block mt-2">
                                    Password hint: Karim@Lola2024!
                                </code>
                                <p className="font-cairo text-xs text-neon-green/50 italic mt-2">
                                    شايف إزاي المعلومة الصغيرة دي ممكن تكون خطيرة؟ 🙈
                                </p>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleGuess} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                    <input
                                        type="text"
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                        placeholder="Type the pet's name…"
                                        className={`w-full bg-dark-bg border rounded-lg pl-8 pr-3 py-2.5 font-mono text-sm placeholder:text-gray-700 focus:outline-none transition-colors ${wrong
                                            ? 'border-red-500/60 text-red-400'
                                            : 'border-dark-border text-gray-200 focus:border-neon-amber/50'
                                            }`}
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="bg-neon-amber/10 border border-neon-amber/40 text-neon-amber font-mono text-sm px-4 py-2.5 rounded-lg hover:bg-neon-amber/20 transition-all flex-shrink-0 flex items-center gap-1.5"
                                >
                                    <Send size={12} /> Submit
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {wrong && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="font-mono text-xs text-red-400 mt-2"
                            >
                                ✗ That's not right — keep reading his posts 👀
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-4" />
            </div>
        </div>
    )
}
