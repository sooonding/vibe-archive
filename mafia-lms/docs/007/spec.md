# Use Case 007: Instructor 대시보드

## Primary Actor
Instructor

## Precondition
- 사용자가 Instructor 역할로 로그인되어 있음
- 최소 1개 이상의 코스를 소유하고 있음

## Trigger
- Instructor가 대시보드 페이지에 접근

## Main Scenario

1. 시스템은 Instructor가 소유한 모든 코스 목록을 조회
2. 각 코스에 대해 다음 정보를 표시:
   - 코스 제목, 설명
   - 코스 상태 (draft/published/archived)
   - 등록된 학습자 수
   - 전체 과제 수
3. 시스템은 채점 대기 중인 제출물 수를 계산
   - 모든 소유 코스의 과제에 대해
   - `status=submitted`인 제출물 개수 집계
4. 시스템은 최근 제출물 목록을 표시 (최대 5개)
   - 제출 시간 기준 최신순 정렬
   - 과제명, 학습자명, 제출 시간, 지각 여부 표시
5. 대시보드에 모든 정보를 렌더링

## Edge Cases

### EC1: 소유한 코스가 없는 경우
- 빈 상태 UI 표시
- "새 코스 만들기" 액션 제공

### EC2: 채점 대기 제출물이 없는 경우
- 채점 대기 수를 0으로 표시
- 빈 상태 메시지 표시

### EC3: 최근 제출물이 없는 경우
- 빈 상태 메시지 표시

### EC4: Learner 역할로 접근 시도
- 403 Forbidden 응답
- 접근 거부 메시지 표시

## Business Rules

### BR1: 역할 기반 접근 제어
- Instructor 역할만 대시보드 접근 가능
- Learner는 본인의 대시보드로 리다이렉트

### BR2: 코스 소유권
- Instructor는 본인이 생성한 코스만 조회 가능
- 다른 Instructor의 코스는 표시하지 않음

### BR3: 채점 대기 집계
- `status=submitted`인 제출물만 카운트
- `graded`, `resubmission_required` 상태는 제외

### BR4: 최근 제출물 정렬
- 제출 시간(`submitted_at`) 기준 내림차순
- 최대 5개까지만 표시

### BR5: 코스 상태 표시
- draft: 작성 중 (학습자에게 비공개)
- published: 공개 (학습자 수강신청 가능)
- archived: 보관 (신규 수강 차단, 기존 학습자는 유지)
