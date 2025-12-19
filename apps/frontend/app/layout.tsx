import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
    title: 'Noricare - 스마트 건강 케어',
    description: 'AI 기반 맞춤형 운동 처방 서비스',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
            <body>
                <Header />
                <main className="page">
                    {children}
                </main>
                <BottomNav />
            </body>
        </html>
    )
}
