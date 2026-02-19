import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ'
        const fontSize = 14
        const columns = Math.floor(canvas.width / fontSize)
        const drops: number[] = Array(columns).fill(1)

        function draw() {
            if (!ctx || !canvas) return
            ctx.fillStyle = 'rgba(10, 10, 10, 0.05)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#FFBF00'
            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`
            ctx.globalAlpha = 0.15

            drops.forEach((y, i) => {
                const char = chars[Math.floor(Math.random() * chars.length)]
                ctx.fillText(char, i * fontSize, y * fontSize)
                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }
                drops[i]++
            })
        }

        const interval = setInterval(draw, 60)
        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)

        return () => {
            clearInterval(interval)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            aria-hidden="true"
        />
    )
}
