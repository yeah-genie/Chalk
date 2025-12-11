# Cryo 슬랙 봇 설정 가이드

## 🧊 아이디어 Freeze 방법 2가지

| 방법 | 사용법 | 장점 |
|------|--------|------|
| **❄️ 이모지** | 메시지에 눈송이 이모지 붙이기 | 대화 중 바로 캡처 |
| **/freeze** | `/freeze [아이디어]` 입력 | 옵션 지정 가능 |

---

## 빠른 설정

### 1. 슬랙 앱 생성

1. https://api.slack.com/apps 접속 (지금 여기!)
2. **"Create an App"** 클릭
3. **"From scratch"** 선택
4. App Name: `Cryo` 입력
5. 워크스페이스 선택 (Kastor)

---

### 2. 권한 설정

왼쪽 메뉴 → **OAuth & Permissions** → Bot Token Scopes 추가:

```
channels:history      (메시지 읽기)
reactions:read        (이모지 반응 감지)
chat:write            (응답 메시지 보내기)
commands              (슬래시 명령어)
```

---

### 3. 이벤트 구독 설정 (❄️ 이모지용)

왼쪽 메뉴 → **Event Subscriptions**

1. **"Enable Events"** 켜기
2. Request URL: `https://[PROJECT_ID].supabase.co/functions/v1/slack-emoji-freeze`
3. Subscribe to bot events에서 추가:
   - `reaction_added`

---

### 4. 슬래시 명령어 추가 (/freeze용)

왼쪽 메뉴 → **Slash Commands** → **Create New Command**

| 항목 | 값 |
|------|-----|
| Command | `/freeze` |
| Request URL | `https://[PROJECT_ID].supabase.co/functions/v1/slack-freeze` |
| Short Description | 아이디어 냉동하기 |
| Usage Hint | `[아이디어] --priority high --category Feature` |

---

### 5. 워크스페이스에 설치

왼쪽 메뉴 → **Install App** → **Install to Workspace** → 승인

⚠️ **Bot User OAuth Token** 복사해두기 (xoxb-로 시작)

---

### 6. 환경변수 설정

Supabase Dashboard → Project Settings → Edge Functions:

```
SLACK_BOT_TOKEN=xoxb-복사한-토큰
```

---

### 7. 함수 배포

```bash
cd cryo
supabase functions deploy slack-freeze
supabase functions deploy slack-emoji-freeze
```

---

## 사용법

### ❄️ 이모지 방식 (추천!)

1. 팀원이 좋은 아이디어를 슬랙에 올림
2. 그 메시지에 ❄️ (눈송이) 이모지 추가
3. 봇이 스레드에 답글: *"🧊 Frozen! Dashboard에서 보기"*

### /freeze 명령어

```
/freeze 모바일 앱 개발
/freeze 마케팅 캠페인 --priority high
/freeze API 리팩토링 --category Technical
```

옵션:
- `--priority`: high, medium, low
- `--category`: Feature, Growth, Operations, Technical

---

## 구조

```
슬랙 채널
    ↓
❄️ 이모지 또는 /freeze
    ↓
Supabase Edge Function
    ↓
ideas 테이블 (PostgreSQL)
    ↓
Cryo 대시보드 (실시간 반영)
```
