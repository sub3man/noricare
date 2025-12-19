'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();

    const getTitle = () => {
        switch (pathname) {
            case '/':
                return '홈';
            case '/assessment':
                return '건강 평가';
            case '/exercise':
                return '운동 처방';
            case '/progress':
                return '진행 현황';
            case '/profile':
                return '프로필';
            default:
                return 'Noricare';
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>💚</span>
                    <span className={styles.logoText}>Noricare</span>
                </Link>
                <h1 className={styles.title}>{getTitle()}</h1>
                <div className={styles.actions}>
                    <button className={styles.iconBtn} aria-label="알림">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
