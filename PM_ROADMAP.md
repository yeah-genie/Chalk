# Chalk - 시니어 PM 개선 제안서 및 로드맵

## 1. 제품 비전 (Product Vision)
**"과외 선생님을 위한 올인원 운영체제 (All-in-one OS for Tutors)"**

Chalk는 단순한 수업 기록 앱을 넘어, 선생님들이 파편화된 도구(Zoom, Calendar, Excel, Notion)들을 하나로 통합하여 **"수업에만 집중할 수 있게 만드는"** 슈퍼 앱을 지향합니다.

## 2. 현재 상태 요약 (Current Status)
*   **개발 단계:** Phase 2 (Integrations) & UI Pivot (Slate/Indigo)
*   **최근 업데이트:**
    *   Voice Memo & Homework Tracker 기능 구현 완료.
    *   **디자인 피벗:** 기존의 'Cyber Mint' 스타일에서 'Professional Slate & Indigo' 스타일로 전면 개편.

## 3. 상세 로드맵 (Detailed Roadmap)

### Phase 1: 기반 구축 (Foundation) - *Refining*
*   [x] **안정화 및 구조:** Merge Conflict 해결, TypeScript 적용.
*   [x] **디자인 시스템 (V2):** `Slate 900` (배경) + `Indigo 500` (강조) 기반의 트렌디한 다크모드 적용 완료. (`chalk-portfolio` 참조)
*   [x] **핵심 기능:** 수업 기록(Log), 학생 관리, 성취도 입력.

### Phase 2: 연결과 통합 (Integrations) - *Current Focus*
*   [x] **Upcoming View:** `Schedule` 탭에서 예정된 수업 및 숙제 확인.
*   [x] **One-Tap Class Launch:** `Start Class` 버튼으로 수업 시작 및 자동 기록 모드 전환.
*   [ ] **Google Calendar/Stripe:** 실제 API 연동 (Mock 단계 완료).

### Phase 3: 지능화와 확장 (Pro Features)
*   [ ] **AI Insight:** 누적된 데이터 기반 학생 분석 리포트.
*   [ ] **PDF Report:** 학부모 공유용 월간 리포트 생성 (신규 제안).

---

## 4. UI/UX 디자인 분석 및 개선안 (Design Review)
`chalk---zero-action-tutor-portfolio`를 분석하고 글로벌 트렌드를 반영한 개선 방향입니다.

### 🎨 Color Palette Pivot (완료)
*   **기존 (Old):** `#0B0D10` (Pure Black) + `#00D4AA` (Mint). 게이밍/크립토 느낌이 강함.
*   **변경 (New):** `#0F172A` (Slate 900) + `#6366F1` (Indigo 500).
*   **이유:** SaaS 및 생산성 앱에서 가장 선호되는 '신뢰감 있는(Trustworthy)' 조합입니다. 눈의 피로를 줄이고(Slate Blue 톤), 전문적인 느낌을 줍니다.

### 🖌 UI 개선 제안 (Next Steps)
1.  **Card styling:** 카드 테두리를 더 얇고 투명하게 (`border-slate-800`) 처리하여 세련미를 더해야 합니다. (현재 구현됨)
2.  **Typography:** 헤드라인에 `Letter-spacing: -0.5px` (Tight)를 적용하여 모던한 느낌을 강화해야 합니다. (현재 구현됨)
3.  **Empty States:** 데이터가 없을 때 단순히 텍스트만 보여주는 것이 아니라, Indigo 톤의 일러스트레이션을 추가하여 빈 화면도 예쁘게 만들어야 합니다.

## 5. PM의 기능 제안 (Future Ideas)
### 💡 Retention & Marketing
1.  **"Golden Time" Analysis:** 선생님이 가장 에너지가 넘치는 시간대 분석.
2.  **Web Portfolio Sync:** 앱에 입력한 프로필과 후기를 기반으로, `chalk-portfolio` 웹사이트를 원클릭으로 생성해주는 기능. (마케팅 용도)

---
*Last Updated: 2024-05-21 by Jules*
