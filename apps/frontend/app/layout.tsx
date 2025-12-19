import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
    title: '노리케어 - 만성질환 전문 AI 헬스케어',
    description: '만성질환 전문 개인 맞춤 AI 헬스케어 서비스, 노리케어',
    icons: {
        icon: '/favicon.png',
        apple: '/logo.png',
    },
    openGraph: {
        title: '노리케어 - 만성질환 전문 AI 헬스케어',
        description: '만성질환 전문 개인 맞춤 AI 헬스케어 서비스, 노리케어',
        images: ['/logo.png'],
    },
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
