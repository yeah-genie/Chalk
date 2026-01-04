# Chalk - 시니어 PM 개선 제안서 및 로드맵

## 1. 제품 비전 (Product Vision)
**"과외 선생님을 위한 올인원 운영체제 (All-in-one OS for Tutors)"**

Chalk는 단순한 수업 기록 앱을 넘어, 선생님들이 파편화된 도구(Zoom, Calendar, Excel, Notion)들을 하나로 통합하여 **"수업에만 집중할 수 있게 만드는"** 슈퍼 앱을 지향합니다.
특히 **"Unfakeable Portfolio"**를 통해 외부 서비스(Google, Zoom, Stripe)와 연동된 신뢰할 수 있는 수업 기록을 제공합니다.

## 2. 현재 상태 요약 (Current Status)
*   **개발 단계:** Phase 2 (Integrations) & Phase 3 (Growth) - **진행 중**
*   **최근 업데이트:** UI 전면 개편 (Slate/Indigo), 음성 메모, 숙제 관리 기능 추가.
*   **진행 예정:** 계정(Account) 및 포트폴리오(Portfolio) 탭 완성, 외부 서비스 인증 연동.

## 3. 상세 로드맵 (Detailed Roadmap)

### Phase 1: 기반 구축 (Foundation) - *Completed*
*   [x] **안정화 및 구조:** Merge Conflict 해결, TypeScript 적용.
*   [x] **디자인 시스템:** Professional Slate & Indigo 테마 적용.
*   [x] **핵심 기능:** 수업 기록(Log), 학생 관리, 성취도 입력.

### Phase 2: 연결과 통합 (Integrations) - *Current Focus*
*   [x] **Upcoming View:** `Schedule` 탭에서 예정된 수업 확인.
*   [x] **One-Tap Class Launch:** 수업 시작 및 자동 기록 모드.
*   [ ] **Account Tab:** 프로필 및 연동 관리 페이지 구현.
*   [ ] **Service Auth:** Google Calendar, Zoom, Stripe 인증 훅(Hook) 구현.

### Phase 3: 지능화와 확장 (Pro Features)
*   [x] **Voice Memo:** 음성 메모 기능 (Mock).
*   [x] **Homework Tracker:** 숙제 관리 기능.
*   [ ] **Portfolio Tab:** 실제 데이터(수업 시간, 횟수) 기반 통계 대시보드.
*   [ ] **Verified Badges:** 외부 연동 여부에 따른 '인증됨' 배지 시스템.

---

## 4. UI/UX 디자인 가이드 (Updated)
*   **Theme:** Slate 900 (`#0F172A`) & Indigo 500 (`#6366F1`)
*   **Components:** Glassmorphism Card, Gradient Button, Status Badges.

---
*Last Updated: 2024-05-21 by Jules*
