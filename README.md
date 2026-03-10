# 부동산 매물 공유 플랫폼 - Front

React Native (Expo) 기반 모바일 앱

## 기술 스택

- React Native 0.83 / Expo SDK 55
- Expo Router (파일 기반 라우팅)
- Zustand (상태 관리)
- React Query (서버 상태 관리)
- React Native Reanimated (애니메이션)
- Socket.IO Client (실시간 알림)

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm start
```

Expo DevTools가 실행되며, QR 코드로 Expo Go 앱에서 확인할 수 있습니다.

### 3. 플랫폼별 실행

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### 4. API 서버 연결

[src/constants/api.ts](src/constants/api.ts)에서 서버 주소를 설정합니다.

## 프로젝트 구조

```
app/                  # 페이지 (Expo Router)
├── (tabs)/           # 탭 네비게이션 (홈, 지도, 커뮤니티, 즐겨찾기, 마이페이지)
├── property/         # 매물 등록/상세
├── community/        # 커뮤니티 글쓰기/상세
├── mypage/           # 마이페이지 하위 메뉴
├── login.tsx         # 로그인
└── signup.tsx        # 회원가입
src/
├── components/       # 공통 컴포넌트
├── constants/        # 상수 (API URL, 테마)
├── hooks/            # 커스텀 훅
├── services/         # API 서비스
└── stores/           # Zustand 스토어
```
