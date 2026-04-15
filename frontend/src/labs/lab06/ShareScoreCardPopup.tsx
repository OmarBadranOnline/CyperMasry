import { motion } from 'framer-motion'
import { Download, Printer, Share2, X } from 'lucide-react'

interface Props {
    name: string
    studentId: string
    score: number
    maxScore: number
    onClose: () => void
}

function buildCardCanvas(name: string, studentId: string, score: number, maxScore: number) {
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const g = ctx.createLinearGradient(0, 0, 1400, 900)
    g.addColorStop(0, '#0b0616')
    g.addColorStop(0.5, '#120d22')
    g.addColorStop(1, '#06141a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1400, 900)

    ctx.strokeStyle = 'rgba(34,211,238,0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(48, 48, 1304, 804)

    ctx.fillStyle = '#7dd3fc'
    ctx.font = 'bold 42px Segoe UI'
    ctx.fillText('Cyber-Masry Rapid Access Lab', 90, 130)

    ctx.fillStyle = '#e879f9'
    ctx.font = 'bold 56px Segoe UI'
    ctx.fillText('Achievement Card', 90, 200)

    ctx.fillStyle = '#e5e7eb'
    ctx.font = '30px Segoe UI'
    ctx.fillText(`Name: ${name}`, 90, 315)
    ctx.fillText(`Student ID: ${studentId}`, 90, 370)
    ctx.fillText(`Score: ${score}/${maxScore}`, 90, 425)

    const pct = Math.round((score / Math.max(1, maxScore)) * 100)
    ctx.fillStyle = '#22d3ee'
    ctx.font = 'bold 150px Segoe UI'
    ctx.fillText(`${pct}%`, 920, 420)

    ctx.fillStyle = '#a7f3d0'
    ctx.font = 'bold 36px Segoe UI'
    ctx.fillText('Completed', 990, 470)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '24px Segoe UI'
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}`, 90, 790)
    ctx.fillText('Simulation-based ethical security training', 90, 830)

    return canvas
}

export default function ShareScoreCardPopup({ name, studentId, score, maxScore, onClose }: Props) {
    const downloadImage = () => {
        const canvas = buildCardCanvas(name, studentId, score, maxScore)
        if (!canvas) return
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `cybermasry-score-${studentId}.png`
        link.click()
    }

    const printCard = () => {
        const canvas = buildCardCanvas(name, studentId, score, maxScore)
        if (!canvas) return
        const dataUrl = canvas.toDataURL('image/png')
        const win = window.open('', '_blank', 'width=1100,height=800')
        if (!win) return
        win.document.write(`
            <html>
              <head><title>Cyber-Masry Card</title></head>
              <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
                <img src="${dataUrl}" style="max-width:100%;height:auto;" />
                <script>window.onload = () => window.print();</script>
              </body>
            </html>
        `)
        win.document.close()
    }

    return (
        <div className="fixed inset-0 z-[550] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-2xl rounded-2xl border border-cyan-300/30 bg-[#090813] overflow-hidden"
                style={{ boxShadow: '0 0 45px rgba(34,211,238,0.18)' }}
            >
                <div className="px-5 py-3 border-b border-cyan-300/25 bg-cyan-500/10 flex items-center gap-2">
                    <Share2 size={15} className="text-cyan-300" />
                    <span className="font-cairo text-cyan-100 font-bold">بطاقة إنجاز قابلة للمشاركة</span>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="rounded-xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 p-4 mb-4">
                        <p className="font-cairo text-xl text-white font-bold mb-2">🎉 مبروك يا {name}</p>
                        <p className="font-mono text-sm text-cyan-200">Student ID: {studentId}</p>
                        <p className="font-mono text-2xl text-fuchsia-200 font-bold mt-2">{score}/{maxScore}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button onClick={downloadImage} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-300 text-black font-cairo font-bold hover:brightness-110">
                            <Download size={14} /> تحميل كصورة
                        </button>
                        <button onClick={printCard} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-fuchsia-300/35 text-fuchsia-200 hover:bg-fuchsia-500/10">
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
