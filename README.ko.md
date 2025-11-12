# Claude Agent 템플릿

[Vercel AI SDK](https://sdk.vercel.ai/docs), [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview), 그리고 커스텀 MCP 툴을 사용한 AI 에이전트 구축을 위한 Next.js 템플릿입니다.

> [English](./README.md) | 한국어

## 개요

이 템플릿은 Claude Sonnet 4.5 기반 AI 에이전트 구축을 위한 완전한 기반을 제공합니다. 커스텀 툴 생성, 외부 서비스 연동, 실시간 스트리밍을 포함한 인터랙티브 챗 인터페이스 구축 방법을 보여줍니다.

**기반 프로젝트:**
- [Vercel AI SDK Reasoning Starter](https://github.com/vercel-labs/ai-sdk-reasoning-starter) - Next.js + AI SDK 기본 설정
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview) - 멀티턴 에이전트 워크플로우 및 MCP 툴

## 주요 기능

- **멀티턴 에이전트 워크플로우** - 복잡한 작업 실행을 위한 Claude Agent SDK 기반
- **커스텀 MCP 툴** - 타입 안정성을 갖춘 확장 가능한 툴 시스템
- **실시간 스트리밍** - 빠른 사용자 경험을 위한 Server-Sent Events
- **모던 스택** - Next.js 15, React 19, Tailwind CSS, TypeScript
- **내장 툴** - 파일 작업, bash 명령어, 웹 검색 등

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- pnpm (또는 npm/yarn)
- Anthropic API Key ([여기서 발급](https://console.anthropic.com/))

### 설치

1. **저장소 클론 및 의존성 설치**

   ```bash
   git clone <your-repo-url>
   cd claude-agent-template
   pnpm install
   ```

2. **환경 변수 설정**

   `.env.example`을 `.env`로 복사:
   ```bash
   cp .env.example .env
   ```

   Anthropic API 키 추가:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **개발 서버 실행**

   ```bash
   pnpm dev
   ```

   브라우저에서 http://localhost:3000 를 엽니다.

## 아키텍처

### 시스템 개요

에이전트 시스템은 세 가지 핵심 컴포넌트로 구성됩니다:

1. **Agent API** (`app/api/agent/route.ts`) - 요청 처리, 대화 상태 관리, 응답 스트리밍
2. **MCP Tools** (`lib/mcp-tools/`) - 에이전트 기능을 확장하는 커스텀 툴
3. **Chat UI** (`components/agent-chat.tsx`) - 실시간 스트리밍을 포함한 인터랙티브 인터페이스

### 메시지 흐름

```
사용자 입력
  ↓
POST /api/agent → query({ prompt, options })
  ↓
에이전트가 여러 턴에 걸쳐 툴 실행
  ↓
Server-Sent Events로 클라이언트에 스트리밍
  ↓
UI에서 툴 사용 및 결과 표시
```

### 에이전트 설정

- **모델**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **내장 툴**: Read, Write, Bash, Grep, Glob, WebSearch
- **커스텀 툴**: MCP (Model Context Protocol)로 정의
- **최대 턴**: 대화당 10턴
- **스트리밍**: Yes (Server-Sent Events)

## 개발 워크플로우

### Git Worktree 관리

포함된 `wt` 스크립트를 사용하면 피처 브랜치를 위한 격리된 워크트리를 쉽게 생성할 수 있어, 컨텍스트 전환 없이 여러 기능을 동시에 작업할 수 있습니다:

```bash
./wt feature/new-feature              # 새 브랜치를 위한 워크트리 생성
./wt feature/existing-branch          # 기존 브랜치를 위한 워크트리 생성
```

스크립트가 자동으로:
- `../feature/new-feature`에 새 git 워크트리 생성
- `.env` 파일을 새 워크트리로 복사
- `pnpm install`로 의존성 설치

**예제 워크플로우:**
```bash
# main 브랜치에서 작업 중
./wt feature/add-auth               # 인증 기능을 위한 워크트리 생성
cd ../feature/add-auth              # 새 워크트리로 이동
pnpm dev                            # 이 브랜치의 개발 서버 시작
```

### GitHub 이슈 관리

이 템플릿에는 두 개의 전문화된 서브 에이전트를 활용하는 `/solve-github-issue` 슬래시 커맨드가 포함되어 있습니다:

1. **github-issue-planner** - GitHub 이슈를 분석하고 포괄적인 구현 계획 생성
2. **github-issue-manager** - 이슈 라이프사이클 관리 (업데이트, 테스트 결과, 종료)

**Claude Code에서 사용법:**
```bash
/solve-github-issue 42              # 이슈 #42 분석 및 구현 계획 수립
```

워크플로우:
1. Planner 에이전트가 이슈 및 관련 컨텍스트 분석
2. 상세한 구현 계획 생성
3. 솔루션 구현
4. Manager 에이전트가 테스트 결과로 이슈 업데이트 및 종료

에이전트 설정은 `.claude/agents/`를 참조하세요.

## 문서

- **[TOOLS.md](./TOOLS.md)** - 커스텀 MCP 툴 생성 완전 가이드
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 일반적인 문제 및 해결 방법
- **[CLAUDE.md](./CLAUDE.md)** - 개발 환경 설정 및 워크플로우

## 프로젝트 구조

```
claude-agent-template/
├── app/
│   ├── api/agent/route.ts          # 스트리밍을 포함한 에이전트 API 엔드포인트
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 메인 채팅 인터페이스
│   └── globals.css                 # 글로벌 스타일
├── components/
│   ├── agent-chat.tsx              # 메인 채팅 UI 컴포넌트
│   ├── input.tsx                   # 자동 크기 조절 채팅 입력
│   └── footnote.tsx                # 푸터 컴포넌트
├── lib/
│   ├── mcp-tools.ts                # MCP 툴 레지스트리
│   └── mcp-tools/
│       └── hello-world.ts          # 예제 MCP 툴
├── .claude/
│   ├── commands/                   # 커스텀 슬래시 커맨드
│   ├── agents/                     # 전문화된 에이전트
│   └── prompts.md                  # 시스템 프롬프트 라이브러리
├── wt                              # Git worktree 헬퍼 스크립트
├── CLAUDE.md                       # 개발 가이드
├── TOOLS.md                        # 툴 생성 가이드
├── TROUBLESHOOTING.md              # 트러블슈팅 가이드
├── README.md                       # 영문 README
└── README.ko.md                    # 한국어 README (이 파일)
```

## 참고 자료

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## 기여하기

기여 가이드라인:
- 툴을 집중적이고 단순하게 유지
- 파라미터를 명확하게 문서화
- 모든 에러 케이스 처리
- 설명적인 시스템 프롬프트 작성
- 다양한 입력으로 테스트

## 라이선스

MIT
