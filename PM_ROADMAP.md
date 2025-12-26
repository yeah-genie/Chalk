# Chalk - 시니어 PM 개선 제안서 및 로드맵

## 1. 제품 비전 (Product Vision)
**"과외 선생님을 위한 올인원 운영체제 (All-in-one OS for Tutors)"**

Chalk는 단순한 수업 기록 앱을 넘어, 선생님들이 파편화된 도구(Zoom, Calendar, Excel, Notion)들을 하나로 통합하여 **"수업에만 집중할 수 있게 만드는"** 슈퍼 앱을 지향합니다.

## 2. 현재 상태 요약 (Current Status)
*   **개발 단계:** Phase 1 (Foundation) 완료 및 Phase 2 (Integrations) 진입
*   **최근 업데이트:** `Schedule` 탭을 통해 '수업 일정(Upcoming)'과 '수업 기록(History)'을 통합 관리하는 기능 구현 중.

## 3. 상세 로드맵 (Detailed Roadmap)

### Phase 1: 기반 구축 (Foundation) - *Completed*
선생님이 수업 직후 10초 안에 기록을 남길 수 있는 경험 제공.

*   **1.1 안정화 및 구조 잡기**
    *   [x] **Merge Conflict 해결:** Version A 기반 통합 완료.
    *   [x] **TypeScript 오류 수정:** Clean Build 달성.
    *   [x] **폴더 구조 정리:** 컴포넌트 구조화 완료.

*   **1.2 디자인 시스템 (Design System)**
    *   [x] **Color Palette:** 'Modern Dark' & Mint/Neon 테마.
    *   [x] **UI Components:** `Card`, `Button`, `Input`, `RatingSelector`.
    *   [x] **Layout System:** 일관된 레이아웃 적용.

*   **1.3 핵심 기능: 수업 기록 (Log Lesson)**
    *   [x] **Student Picker:** 직관적인 학생 선택 UX.
    *   [x] **Topic Input:** 주제 자동 완성.
    *   [x] **Rating Selector:** 감성적인 성취도 입력 UI.
    *   [x] **Lesson History:** `Schedule` 탭 내에서 지난 수업 기록 확인 기능 (이번 업데이트 포함).

### Phase 2: 연결과 통합 (Integrations) - *Current Focus*
외부 툴 연동을 통한 데이터 자동화.

*   **2.1 화상 회의 및 일정 연동 (Schedule Tab)**
    *   [x] **Upcoming View:** 예정된 수업 목록 확인.
    *   [ ] **One-Tap Class Launch:** `Start Class` 버튼으로 Zoom/Meet 즉시 연결 및 "수업 중" 상태 전환.
    *   [ ] **Auto-Log:** 수업 종료 후 자동으로 기록 화면으로 이동하여 시간/학생 정보 프리필(Pre-fill).

*   **2.2 캘린더 및 결제**
    *   [ ] **Google Calendar Sync:** 실제 캘린더 API 연동.
    *   [ ] **Stripe Integration:** 미수금 알림 및 간편 결제 링크 생성.

### Phase 3: 지능화와 확장 (Pro Features)
*   [ ] **AI Insight:** 수업 노트 텍스트 마이닝을 통한 학생 취약점 분석.
*   [ ] **Web Portfolio:** 선생님 프로필 및 수업 후기 웹페이지 자동 생성.

---

## 4. Jules의 아이디어 제안 (New Ideas)
이번 단계 개발 후 제안하는 새로운 기능들입니다.

### 💡 UX/UI 및 기능 아이디어
1.  **Voice Memo to Text (유지):** 수업 직후 음성으로 남기면 AI가 요약 텍스트로 변환 (타이핑 최소화).
2.  **Homework Tracker (신규):** "숙제 검사" 탭을 따로 두거나 기록 시 체크박스로 간단히 확인. 다음 수업 시작 시 "지난 숙제: 000" 알림 띄우기.
3.  **PDF Report Generation (신규):** 한 달간의 수업 기록과 성취도 변화를 예쁜 PDF 리포트로 만들어 학부모에게 카톡 공유.

---
*Last Updated: 2024-05-21 by Jules*
