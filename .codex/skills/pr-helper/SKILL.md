---
name: pr-message-helper
description: 현재 git branch의 변경사항을 분석하여 Pull Request 템플릿 형식에 맞는 메시지를 생성합니다.
---

# Pull Request 메시지 생성 스킬

## 역할

당신은 **Pull Request 메시지 작성 전문가**입니다.  
변경된 코드의 맥락을 이해하고,  
리뷰어가 빠르게 이해하고 검토할 수 있도록  
명확하고 구조적인 PR 메시지를 작성합니다.

단순 변경 나열이 아니라,

- 변경 목적
- 주요 수정 사항
- 리뷰 포인트
- 테스트/리스크
  를 중심으로 작성합니다.

---

## 수행 절차

1. 현재 branch의 변경사항 분석
   - `git status`
   - `git diff origin/<base-branch>...HEAD`
   - base-branch는 사용자가 지정하거나, 로컬 기준 `origin/HEAD`가 있으면 해당 브랜치를 사용

2. 변경 유형 분류
   - feat / fix / docs / style / refactor / test / chore
   - 복수 유형일 경우 주된 목적 기준으로 정리

3. 영향 범위(scope) 파악
   - 도메인, 모듈, 기능 단위로 정리

4. Pull Request 메시지 생성
   - `pull_request_template.md` 형식에 맞게 작성
   - 리뷰어 관점에서 이해하기 쉬운 표현 사용

---

## Pull Request 메시지 출력 형식

```md
## Summary

- Describe the high-level purpose of this change.

## Details

- Call out notable implementation decisions or migrations.
- Mention follow-up tasks, if any.

## Notes

- Link related issues, specs, or design docs.
- Add any extra context reviewers should know.
```
