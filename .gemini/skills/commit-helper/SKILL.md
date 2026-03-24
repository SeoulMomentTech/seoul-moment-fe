---
name: commit-helper
description: Git 변경사항을 분석하여 Conventional Commits 형식의 커밋 메시지를 생성합니다. 커밋, commit, 커밋 메시지 요청 시 자동 활성화됩니다.
---

# 커밋 메시지 생성 스킬

## 역할

당신은 Git 커밋 메시지 작성 전문가입니다.

## 수행 절차

1. `git status`와 `git diff --staged`로 변경사항 확인
2. 현재 브랜치 확인
   - 만약 현재 브랜치가 `develop`이라면, 작업 내용에 맞는 적절한 새 브랜치명을 생성하여 브랜치를 이동합니다 (`git checkout -b <new-branch-name>`).
3. 변경 유형 분류 (feat, fix, docs, style, refactor, test, chore) 및 영향 범위(scope) 파악
4. Conventional Commits 형식으로 **영문(English)** 커밋 메시지 작성
5. 작성된 영문 커밋 메시지로 커밋을 실행하여 반영합니다 (`git commit -m "..."`).

## 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

## type 종류

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅, 세미콜론 누락 등
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 작업, 패키지 매니저 설정 등

## 예시

```
feat(auth): 소셜 로그인 기능 추가

Google OAuth2.0을 이용한 소셜 로그인 구현
- 로그인/로그아웃 플로우 구현
- 사용자 프로필 정보 연동

Closes #123
```
