import { useState } from 'react'
import { Search, AlertCircle, Info, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SuccessModal from '../../components/SuccessModal'
import { parseWithGlossary } from '../../utils/parseWithGlossary'

const FLAG = 'FLAG{Omar_Badran_Recon_Master}'

type SearchState = 'idle' | 'too-broad' | 'site-found' | 'admin-found'

interface SearchResult {
    state: SearchState
    statsLine?: string
    feedbackEn?: string
    feedbackAr?: string
    results?: Array<{ title: string; url: string; snippet: string; isTarget?: boolean }>
}

// Step hints mapped from mission step IDs (6-9)
const STEP_HINTS: Record<number, string> = {
    6: 'admin',
    7: 'site:evilcorp.com',
    8: 'site:evilcorp.com inurl:admin',
    9: 'Click the green link below ↓',
}

function getSearchResult(query: string): SearchResult {
    const q = query.trim().toLowerCase()

    if (q.length === 0) return { state: 'idle' }

    // Check operators
    const hasSite = q.includes('site:evilcorp.com')
    const hasInurlAdmin = q.includes('inurl:admin')
    const hasAdminRaw = q.includes('admin')
    const hasFiletypePdf = q.includes('filetype:pdf')
    const hasIntitle = q.includes('intitle:index of') || q.includes('intitle:"index of"')

    // Step 8: Perfect dork (site + inurl:admin)
    if (hasSite && hasInurlAdmin) {
        return {
            state: 'admin-found',
            statsLine: '1 result (0.04 seconds)',
            feedbackEn: '✅ Precise dork. Target admin page located.',
            feedbackAr: 'الله ينور! جبت لوحة التحكم من قفاها 🎯',
            results: [
                {
                    title: 'EvilCorp Admin Panel – Login',
                    url: 'evilcorp.com/secret_panel',
                    snippet: 'Admin Control Panel · Restricted Access · EvilCorp Internal Systems Management · Powered by CustomCMS v2.1',
                    isTarget: true,
                },
            ],
        }
    }

    // Advanced Recon: Directory Listing (intitle:"index of")
    if (hasIntitle && hasSite) {
        return {
            state: 'site-found',
            statsLine: '1 result (0.12 seconds)',
            feedbackEn: 'Directory listing enabled! This is a misconfiguration exposing server files directly.',
            feedbackAr: 'سيرفر ناسي يقفل الـ Directory Listing.. كل ملفاته مكشوفة 📂',
            results: [
                {
                    title: 'Index of /uploads/confidential/',
                    url: 'evilcorp.com/uploads/confidential/',
                    snippet: 'Name Last modified Size Description Parent Directory - passwords.txt 2024-01-01 1.2K backup_db.sql...',
                }
            ]
        }
    }

    // Advanced Recon: PDF exposure (site + filetype)
    if (hasSite && hasFiletypePdf) {
         return {
            state: 'site-found',
            statsLine: '14 results (0.28 seconds)',
            feedbackEn: 'Awesome! Searching for specific file types on a target limits the noise and finds raw data.',
            feedbackAr: 'ممتاز! تصفية الملفات بالـ PDF بتجيب مستندات مهمة ممكن يكون فيها metadata خطيرة 📄',
            results: [
                {
                    title: '[PDF] EvilCorp Annual Report 2023',
                    url: 'evilcorp.com/reports/annual2023.pdf',
                    snippet: 'Financial statements, strategic plans, executive contacts...',
                },
                {
                    title: '[PDF] Internal Server Network Topology',
                    url: 'evilcorp.com/docs/network_map.pdf',
                    snippet: 'CONFIDENTIAL: Internal IP space 10.0.x.x routing documentation...',
                },
            ],
        }
    }

    // Step 7: Just site
    if (hasSite) {
        // If they also typed admin but forgot inurl:
        if (hasAdminRaw) {
             return {
                state: 'too-broad',
                statsLine: 'About 45,000 results (0.33 seconds)',
                feedbackEn: 'You narrowed it to evilcorp.com, but "admin" is just a keyword in the text. Use inurl:admin to find paths.',
                feedbackAr: 'كلمة admin لوحدها ممكن تكون في مقال عادي. استخدم inurl:admin عشان تدور في الرابط نفسه 🔗',
            }
        }

        return {
            state: 'site-found',
            statsLine: '3 results (0.21 seconds)',
            feedbackEn: "Good — you narrowed results to the target domain. Now use operators like inurl: or filetype: to find specific things.",
            feedbackAr: 'كويس! ضيّقنا البحث للدومين.. بس فين الصفحة المهمة؟ استخدم operators تانية 🤔',
            results: [
                {
                    title: 'EvilCorp – Home',
                    url: 'evilcorp.com',
                    snippet: 'Welcome to EvilCorp. We make world domination... I mean, enterprise solutions.',
                },
                {
                    title: 'EvilCorp – About Us',
                    url: 'evilcorp.com/about',
                    snippet: 'Learn about our mission. (Nothing suspicious here. Definitely not.)',
                },
                {
                    title: 'EvilCorp – Contact',
                    url: 'evilcorp.com/contact',
                    snippet: 'Questions? Concerns? Ransomware receipts? Reach out anytime.',
                },
            ],
        }
    }

    // Broad filetype search (no site)
    if (q.includes('filetype:')) {
        return {
            state: 'too-broad',
            statsLine: 'About 283,000,000 results (0.41 seconds)',
            feedbackEn: 'filetype: works, but you are searching the ENTIRE internet for PDFs. Combine with site:evilcorp.com.',
            feedbackAr: 'إنت كده بتدور في ملفات الإنترنت كلها! حط site: الأول 🌍',
        }
    }

    // Step 6: Generic keywords missing operators
    if (q.includes('admin') || q.includes('login') || q.includes('password') || q.includes('inurl:')) {
         return {
            state: 'too-broad',
            statsLine: 'About 4,230,000,000 results (0.78 seconds)',
            feedbackEn: "Way too broad. Searching 'admin' without a site: operator searches the whole web. Start with site:evilcorp.com.",
            feedbackAr: 'يا عم ده زي ما تسأل "فين المحل؟" من غير ما تحدد أي مدينة 😂 ابدأ بـ site:evilcorp.com',
        }
    }

    // completely generic
    return {
        state: 'too-broad',
        statsLine: 'About 10,400,000,000 results (0.56 seconds)',
        feedbackEn: 'Too generic. Use site:, inurl:, filetype:, or intitle: operators to perform actual OSINT.',
        feedbackAr: 'بحث عادي جداً. جرب تستخدم dorks زي site: أو inurl: يا كابتن 💪',
    }
}

interface Props {
    currentStepId?: number | null
    onSearchRun?: (query: string) => void
    onFlagCaptured?: () => void
}

export default function ZoogleSearch({ currentStepId, onSearchRun, onFlagCaptured }: Props) {
    const [query, setQuery] = useState('')
    const [submitted, setSubmitted] = useState('')
    const [searchId, setSearchId] = useState(0) // Force unmount on new searches
    const [result, setResult] = useState<SearchResult>({ state: 'idle' })
    const [modalOpen, setModalOpen] = useState(false)
    const [showDorkGuide, setShowDorkGuide] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setSubmitted(query)
        setSearchId((prev) => prev + 1)
        setResult(getSearchResult(query))
        onSearchRun?.(query)
    }

    const handleFlagCapture = () => {
        setModalOpen(true)
        onFlagCaptured?.()
    }

    // Current step hint for zoogle (steps 5-8)
    const stepHint = currentStepId && currentStepId >= 6 && currentStepId <= 8
        ? STEP_HINTS[currentStepId]
        : null

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Zoogle Header */}
            <div className="text-center">
                <div className="font-mono text-4xl font-bold mb-1">
                    <span className="text-blue-400">Z</span>
                    <span className="text-neon-amber">o</span>
                    <span className="text-neon-orange">o</span>
                    <span className="text-neon-green">g</span>
                    <span className="text-blue-400">l</span>
                    <span className="text-neon-amber">e</span>
                </div>
                <div className="font-mono text-xs text-gray-600">
                    [SIMULATED · EDUCATIONAL · مفيش اتصال حقيقي]
                </div>
            </div>

            {/* Guided hint banner */}
            <AnimatePresence>
                {stepHint && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-neon-amber/10 border border-neon-amber/30 rounded-lg px-4 py-2 flex items-center gap-3"
                    >
                        <Lightbulb size={14} className="text-neon-amber flex-shrink-0" />
                        <span className="font-mono text-xs text-neon-amber/80">
                            Next search:{' '}
                            <code
                                className="text-neon-green cursor-pointer hover:underline"
                                onClick={() => setQuery(stepHint)}
                            >
                                {stepHint}
                            </code>
                            <span className="text-neon-amber/40 ml-2">— click to fill, then search</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search form */}
            <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Try: site:evilcorp.com inurl:admin'
                            className="w-full bg-dark-bg border border-dark-border rounded-full pl-10 pr-4 py-3 font-mono text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-neon-amber/50 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-neon-amber/10 hover:bg-neon-amber/20 border border-neon-amber/40 text-neon-amber font-mono text-sm px-5 py-3 rounded-full transition-all duration-200 hover:border-neon-amber whitespace-nowrap"
                    >
                        Zoogle Search
                    </button>
                </div>
            </form>

            {/* Dork reference toggle */}
            <div>
                <button
                    onClick={() => setShowDorkGuide((p) => !p)}
                    className="flex items-center gap-1 font-mono text-xs text-gray-500 hover:text-neon-amber transition-colors"
                >
                    <Info size={12} />
                    {showDorkGuide ? '▾ Hide' : '▸ Show'} Google Dork Operators Reference
                </button>
                <AnimatePresence>
                    {showDorkGuide && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 bg-dark-card border border-dark-border rounded-lg p-3 grid grid-cols-2 gap-2">
                                {[
                                    { op: 'site:', descEn: 'Limit to one domain', descAr: 'حصر في دومين' },
                                    { op: 'inurl:', descEn: 'Match path/URL', descAr: 'في الـ URL' },
                                    { op: 'intitle:', descEn: 'Match page title', descAr: 'في عنوان الصفحة' },
                                    { op: 'filetype:', descEn: 'Filter by file type', descAr: 'نوع الملف' },
                                    { op: 'intext:', descEn: 'Match page body', descAr: 'في النص' },
                                    { op: '"exact"', descEn: 'Exact phrase', descAr: 'جملة تمام زي كده' },
                                ].map(({ op, descEn, descAr }) => (
                                    <div
                                        key={op}
                                        className="cursor-pointer hover:bg-dark-border rounded px-2 py-1.5 transition-colors"
                                        onClick={() => setQuery((q) => q + op)}
                                    >
                                        <code className="font-mono text-xs text-neon-green">{op}</code>
                                        <p className="font-mono text-xs text-gray-500 mt-0.5">{descEn}</p>
                                        <p className="font-cairo text-xs text-gray-600 italic">{descAr}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {result.state !== 'idle' && submitted ? (
                        <motion.div
                            key={`${submitted}-${searchId}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {/* Stats bar */}
                            <div className="font-mono text-xs text-gray-600 pb-2 border-b border-dark-border">
                                Results for: <span className="text-gray-300">"{submitted}"</span>
                                {result.statsLine && <span className="ml-2 text-gray-600">· {result.statsLine}</span>}
                            </div>

                            {/* Feedback */}
                            {result.feedbackEn && (
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-start gap-3 bg-neon-amber/5 border border-neon-amber/20 rounded-lg p-3"
                                >
                                    <AlertCircle size={16} className="text-neon-amber mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-mono text-xs text-neon-amber/90">{parseWithGlossary(result.feedbackEn, 'fb')}</p>
                                        {result.feedbackAr && (
                                            <p className="font-cairo text-xs text-neon-amber/60 mt-1 italic">
                                                {result.feedbackAr}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Actual results */}
                            {result.results?.map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`zoogle-result ${r.isTarget ? 'border-neon-green/40' : ''}`}
                                    style={r.isTarget ? { boxShadow: '0 0 12px rgba(0,255,65,0.08)' } : {}}
                                >
                                    <div className="font-mono text-xs text-gray-600 mb-1">{r.url}</div>
                                    <div
                                        className={`font-mono text-sm mb-1 ${r.isTarget
                                            ? 'text-neon-green cursor-pointer hover:underline'
                                            : 'text-blue-400'
                                            }`}
                                        onClick={r.isTarget ? handleFlagCapture : undefined}
                                    >
                                        {r.isTarget && '🔓 '}
                                        {r.title}
                                    </div>
                                    <div className="font-mono text-xs text-gray-500">{parseWithGlossary(r.snippet, `snip-${i}`)}</div>

                                    {/* Target CTA */}
                                    {r.isTarget && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="mt-3 pt-3 border-t border-neon-green/20"
                                        >
                                            <p className="font-mono text-xs text-neon-green/70 mb-2">
                                                🎯 Admin panel found. Click to access.{' '}
                                                <span className="font-cairo text-neon-orange/70">يلا دوس دلوقتي!</span>
                                            </p>
                                            <button
                                                onClick={handleFlagCapture}
                                                className="font-mono text-xs bg-neon-green/10 border border-neon-green/40 text-neon-green px-4 py-2 rounded-lg hover:bg-neon-green/20 transition-all duration-200 w-full font-bold"
                                            >
                                                → Access evilcorp.com/secret_panel
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Too-broad ghost results */}
                            {result.state === 'too-broad' && (
                                <div className="space-y-2 opacity-30">
                                    {[
                                        'Admin Portal – MegaCorp Systems',
                                        'Admin Dashboard – SaasGiant Inc.',
                                        'IT Admin Login – TechCorp Enterprise',
                                    ].map((title, i) => (
                                        <div key={i} className="zoogle-result cursor-default">
                                            <div className="font-mono text-xs text-gray-600 mb-1">
                                                result{i + 1}.example{i}.com/admin
                                            </div>
                                            <div className="font-mono text-sm text-blue-400/70 mb-1">{title}</div>
                                            <div className="font-mono text-xs text-gray-600">
                                                Login to access your admin dashboard. Secure. Trusted. Boring.
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center font-mono text-xs text-gray-700 py-2">
                                        ... and 4,229,999,997 more results 😵 (not helpful)
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full min-h-32 flex flex-col items-center justify-center gap-3 text-center py-8"
                        >
                            <Search size={36} className="text-gray-700" />
                            <p className="font-mono text-sm text-gray-500">
                                Use the search box to run Google Dork queries.
                            </p>
                            <p className="font-cairo text-xs text-gray-600 italic">
                                إبدأ البحث يا كابتن.. الهدف مش هيلاقي نفسه 😏
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SuccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} flag={FLAG} />
        </div>
    )
}
