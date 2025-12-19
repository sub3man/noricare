'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const navItems = [
    {
        href: '/',
        label: '홈',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        href: '/assessment',
        label: '평가',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H3v10h6V11z" />
                <path d="M21 3h-6v18h6V3z" />
                <path d="M15 8H9v13h6V8z" />
            </svg>
        )
    },
    {
        href: '/exercise',
        label: '운동',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M4 21v-5l-1.5-1.5" />
                <path d="M9 16l-3-3 3-6 4 1 3.5-3" />
                <path d="M9 21v-4l3-3" />
            </svg>
        )
    },
    {
        href: '/progress',
        label: '진행',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        )
    },
    {
        href: '/profile',
        label: '프로필',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
        )
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
