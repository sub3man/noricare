# Nori Care Frontend

리브라이블리(LIVELIVELY) 디자인 시스템을 기반으로 한 Noricare 고객용 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Toss Design System 기반)
- **Font**: Pretendard

## 주요 기능

### 📱 페이지 구성

1. **홈 (Dashboard)** - `/`
   - 오늘의 진행도 표시
   - 건강 상태 요약
   - 빠른 액션 버튼
   - 오늘의 운동 목록

2. **건강 평가** - `/assessment`
   - PHR 데이터 입력 (나이, 성별, SPPB, TUG)
   - 기저질환 선택
   - AI 분석 결과 확인

3. **운동 처방** - `/exercise`
   - AI 추천 운동 목록
   - 카테고리별 필터 (근력, 유산소, 유연성, 균형)
   - 운동 상세 정보 모달

4. **진행 현황** - `/progress`
   - 주간 운동 달성률
   - 월간 통계
   - 피드백 입력 (RPE, 통증, 만족도)
   - 운동 기록 히스토리

5. **프로필** - `/profile`
   - 개인 정보 관리
   - 건강 요약 통계
   - 설정 메뉴

## 시작하기

### 1. 의존성 설치

```bash
cd apps/frontend
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)를 열어 확인하세요.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 디자인 시스템

### 색상 팔레트 (Toss TDS)

| 용도 | 색상 코드 |
|------|-----------|
| Primary Blue | `#3182f6` |
| Grey 900 (헤드라인) | `#191f28` |
| Grey 50 (배경) | `#f9fafb` |
| Success | `#03b26c` |
| Error | `#f04452` |
| Warning | `#fe9800` |

### 타이포그래피

- **Pretendard** 폰트 사용
- 헤드라인: 24px Bold
- 본문: 15px Regular
- 캡션: 13px Regular

## 프로젝트 구조

```
apps/frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지
│   ├── globals.css         # 글로벌 스타일 (TDS)
│   ├── assessment/         # 건강 평가 페이지
│   ├── exercise/           # 운동 처방 페이지
│   ├── progress/           # 진행 현황 페이지
│   └── profile/            # 프로필 페이지
├── components/             # 공통 컴포넌트
│   ├── Header.tsx          # 상단 헤더
│   ├── BottomNav.tsx       # 하단 네비게이션
│   └── ...module.css       # 컴포넌트 스타일
├── lib/                    # 유틸리티
│   └── api.ts              # API 연동 레이어
├── package.json
├── tsconfig.json
└── next.config.js
```

## API 연동

백엔드 AI 엔진(`apps/ai-engine`)과 연동됩니다:

- `POST /diagnose/prescription` - 건강 평가 및 운동 처방
- `POST /optimize/feedback` - 피드백 기반 처방 최적화

환경 변수 설정:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 라이선스

Private - Nori Care
