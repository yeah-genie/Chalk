# Chalk - 시니어 PM 개선 제안서 및 로드맵

## 1. 제품 비전 (Product Vision)
**"과외 선생님을 위한 올인원 운영체제 (All-in-one OS for Tutors)"**

Chalk는 단순한 수업 기록 앱을 넘어, 선생님들이 파편화된 도구(Zoom, Calendar, Excel, Notion)들을 하나로 통합하여 **"수업에만 집중할 수 있게 만드는"** 슈퍼 앱을 지향합니다.

## 2. 현재 상태 요약 (Current Status)
*   **개발 단계:** Phase 1 (Foundation) - **90% 완료**
*   **최근 업데이트:** UI/UX 전면 개편 (Modern Dark Theme), 코드 베이스 안정화.

## 3. 상세 로드맵 (Detailed Roadmap)

### Phase 1: 기반 구축 (Foundation) - *Current Focus*
선생님이 수업 직후 10초 안에 기록을 남길 수 있는 경험 제공.

*   **1.1 안정화 및 구조 잡기**
    *   [x] **Merge Conflict 해결:** Version A (English UI) 기반으로 코드 통합 완료.
    *   [x] **TypeScript 오류 수정:** 엄격한 타입 체크 통과 (`tsc` Clean).
    *   [x] **폴더 구조 정리:** 불필요한 파일 삭제 및 컴포넌트 구조화.

*   **1.2 디자인 시스템 (Design System)**
    *   [x] **Color Palette:** 'Modern Dark' 테마 및 Mint/Neon 엑센트 정의.
    *   [x] **UI Components:** 재사용 가능한 `Card`, `Button`, `Input`, `RatingSelector` 개발.
    *   [x] **Layout System:** 일관된 여백(Spacing)과 레이아웃 적용.

*   **1.3 핵심 기능: 수업 기록 (Log Lesson)**
    *   [x] **Student Picker:** 가로 스크롤 형태의 직관적인 학생 선택 UX.
    *   [x] **Topic Input:** 최근 수업 주제 자동 완성 기능.
    *   [x] **Rating Selector:** 아이콘 기반의 감성적인 성취도 입력 UI.
    *   [ ] **Lesson History:** 기록된 수업 목록을 캘린더나 리스트로 보기 (다음 작업).

### Phase 2: 연결과 통합 (Integrations) - *Next Step*
외부 툴 연동을 통한 데이터 자동화.

*   **2.1 화상 회의 연동**
    *   [ ] **Zoom/Google Meet:** 수업 종료 시 자동으로 Chalk 앱에 "수업 완료" 팝업 띄우기 (Deep Link 활용).
    *   [ ] **시간 기록:** 실제 통화 시간을 수업 시간으로 자동 입력.

*   **2.2 일정 및 결제**
    *   [ ] **Calendar Sync:** 구글 캘린더 연동으로 수업 일정 불러오기.
    *   [ ] **Payment Alert:** Stripe 연동 또는 수동 결제 알림 (수업 4회차마다 알림 등).

### Phase 3: 지능화와 확장 (Pro Features)
*   [ ] **AI Insight:** 수업 노트 분석("이 학생은 함수 부분에서 실수가 잦음") 및 리포트 자동 생성.
*   [ ] **Web Portfolio:** 앱에 쌓인 데이터를 기반으로 학부모 공유용 웹 페이지 생성.

---

## 4. Jules의 아이디어 제안 (Ideas & Suggestions)
개발 및 기획 과정에서 발견한 "더 멋진 앱"을 위한 제안들입니다.

### 💡 UX/UI 아이디어
1.  **"퇴근 모드" 버튼:** 하루 마지막 수업 기록 후, "오늘도 수고하셨습니다"라는 문구와 함께 폭죽 애니메이션을 보여주면 선생님들에게 작은 보상이 될 것 같습니다.
2.  **Voice Memo to Text:** 수업 직후 타이핑이 귀찮을 때, 음성으로 "오늘 철수 숙제 안 해옴, 다음 시간 챕터 5 예습 필요"라고 말하면 AI가 요약해서 텍스트로 저장해주는 기능. (OpenAI Whisper API 활용 추천)
3.  **Haptic Feedback:** 성취도(Rating) 아이콘을 누를 때마다 미세한 진동(Haptic)을 주어 "기록하는 손맛"을 살리면 좋겠습니다.

### 🛠 기술적 제안
1.  **Offline Support:** 수업 현장은 인터넷이 불안정할 수 있습니다. `TanStack Query`의 오프라인 모드나 `SQLite`를 도입하여 인터넷 없이도 기록하고, 나중에 동기화되도록 하면 신뢰도가 높아질 것입니다.
2.  **QR Code Login:** 웹 대시보드와 앱 간의 로그인을 편하게 하기 위해, 웹에서 QR을 띄우고 앱으로 찍으면 로그인되는 기능을 추가하면 좋겠습니다.

---
*Last Updated: 2024-05-21 by Jules*
