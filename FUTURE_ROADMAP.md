# Chalk - 미래 계획 (Future Roadmap)

> 현재 개발 범위를 넘어, 장기적으로 구현할 기능들을 정리한 문서입니다.

---

## 1. 튜터 마켓플레이스 (Tutor Marketplace)

### 개요
학부모가 검증된 튜터를 찾고, 튜터가 자신의 "Unfakeable Portfolio"를 통해 신뢰를 구축할 수 있는 플랫폼.

### 핵심 기능
- **튜터 프로필 공개**: 수업 이력, 학생 성과, 인증 배지 표시
- **학부모 검색**: 과목, 지역, 가격대별 튜터 검색
- **예약 시스템**: 일정 확인 및 수업 예약
- **결제 연동**: Stripe 기반 자동 정산

### 예상 일정
- Phase 5 (2026 Q3 이후)

---

## 2. AI 고도화 - Hugging Face 데이터셋 활용

### 2.1 음성 인식 개선 (Whisper Fine-tuning)

| 데이터셋 | 용도 | 기대 효과 |
|---------|------|----------|
| [Common Voice](https://huggingface.co/datasets/mozilla-foundation/common_voice_13_0) | 다국어 음성 인식 | 튜터/학생 발화 정확도 향상 |
| [LibriSpeech](https://huggingface.co/datasets/librispeech_asr) | 영어 교육 음성 | 교육 컨텍스트 STT 최적화 |
| [VoxPopuli](https://huggingface.co/datasets/facebook/voxpopuli) | 유럽어권 음성 | 글로벌 튜터링 지원 |

**구현 방향**:
```
튜터 녹음 → Whisper Fine-tuned 모델 → 교육 맥락 최적화된 전사
```

### 2.2 수업 분석 AI

| 데이터셋 | 용도 | 기대 효과 |
|---------|------|----------|
| [SQuAD](https://huggingface.co/datasets/rajpurkar/squad) | 질의응답 분류 | 학생 질문 자동 분류 |
| [CoQA](https://huggingface.co/datasets/stanfordnlp/coqa) | 대화형 QA | 수업 대화 분석 |
| [DialogSum](https://huggingface.co/datasets/knkarthick/dialogsum) | 대화 요약 | 수업 핵심 요약 자동 생성 |

### 2.3 맞춤형 커리큘럼 추천

| 데이터셋 | 용도 | 기대 효과 |
|---------|------|----------|
| [ARC](https://huggingface.co/datasets/allenai/ai2_arc) | 과학 문제 분류 | 난이도 자동 판별 |
| [MATH](https://huggingface.co/datasets/hendrycks/competition_math) | 수학 문제 | AP Calculus 지원 |

### 우선순위

| 순위 | 영역 | 예상 효과 | 예상 일정 |
|------|------|----------|----------|
| 1️⃣ | Whisper Fine-tuning | AI Scribe 정확도 30%↑ | 2026 Q2 |
| 2️⃣ | 대화 요약 | 수업 리포트 자동화 | 2026 Q3 |
| 3️⃣ | 난이도 분류 | 맞춤 학습 추천 | 2026 Q4 |

---

## 3. 추가 확장 기능

### 3.1 학부모 대시보드
- 자녀 학습 진도 실시간 확인
- 튜터와 메시지 기능
- 결제/영수증 관리

### 3.2 그룹 수업 지원
- 다중 학생 동시 관리
- 그룹별 성과 비교 분석

### 3.3 오프라인 모드
- 인터넷 없이 수업 기록
- 연결 시 자동 동기화

---

*Last Updated: 2026-01-04*
