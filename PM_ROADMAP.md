# Chalk - 시니어 PM 개선 제안서 및 로드맵

## 1. 제품 비전 (Product Vision)
**"과외 선생님을 위한 올인원 운영체제 (All-in-one OS for Tutors)"**

Chalk는 단순한 수업 기록 앱을 넘어, 선생님들이 파편화된 도구(Zoom, Calendar, Excel, Notion)들을 하나로 통합하여 **"수업에만 집중할 수 있게 만드는"** 슈퍼 앱을 지향합니다.

## 2. 현재 상태 요약 (Current Status)
*   **개발 단계:** Phase 2 (Integrations) & New Features (Voice/Homework) - **진행 중**
*   **최근 업데이트:** 음성 메모(Voice Memo) 및 숙제 관리(Homework Tracker) 기능 탑재 완료.

## 3. 상세 로드맵 (Detailed Roadmap)

### Phase 1: 기반 구축 (Foundation) - *Completed*
선생님이 수업 직후 10초 안에 기록을 남길 수 있는 경험 제공.
*   [x] **안정화 및 구조:** Merge Conflict 해결, TypeScript 적용.
*   [x] **디자인 시스템:** Modern Dark Theme 적용.
*   [x] **핵심 기능:** 수업 기록(Log), 학생 관리, 성취도 입력.

### Phase 2: 연결과 통합 (Integrations) - *Current Focus*
외부 툴 연동을 통한 데이터 자동화.
*   [x] **Upcoming View:** `Schedule` 탭에서 예정된 수업 및 숙제 확인.
*   [x] **One-Tap Class Launch:** `Start Class` 버튼으로 수업 시작 및 자동 기록 모드 전환.
*   [ ] **Google Calendar/Stripe:** 실제 API 연동 (Mock 단계 완료).

### Phase 3: 지능화와 확장 (Pro Features) & 신규 기능
선생님의 업무 효율을 극대화하는 기능.
*   [x] **Voice Memo:** 수업 내용을 음성으로 남기면 자동 요약 (Mock 구현).
*   [x] **Homework Tracker:** 수업별 숙제 부여 및 다음 수업 전 확인 기능.
*   [ ] **AI Insight:** 누적된 데이터 기반 학생 분석 리포트.
*   [ ] **PDF Report:** 학부모 공유용 월간 리포트 생성.

---

## 4. Jules의 아이디어 제안 (Next Steps)
다음 단계로 개발하면 좋을 혁신적인 기능들입니다.

### 💡 Data-Driven Growth
1.  **"Golden Time" Analysis:** 선생님이 가장 에너지가 넘치고 수업 만족도가 높은 요일/시간대를 분석해 추천 ("선생님은 화요일 오후 2시 수업에서 최고의 성과를 냅니다!").
2.  **Retention Alert:** 특정 학생의 성취도가 3주 연속 하락하면 "상담이 필요할 수 있습니다" 알림 발송.

### 🛠 Tech Improvements
1.  **Real-time Audio Processing:** 현재 Mock인 Voice Memo를 OpenAI Whisper API와 실제로 연동.
2.  **Widget Support:** 아이폰 홈 화면에서 바로 다음 수업을 보고 진입할 수 있는 위젯 개발.

---
*Last Updated: 2024-05-21 by Jules*
