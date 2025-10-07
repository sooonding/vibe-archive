# Assignment 게시/마감 기능 상세 유스케이스

## Primary Actor
- Instructor

## Precondition
- Instructor로 로그인되어 있음
- 본인이 소유한 코스에 대한 과제가 존재함

## Trigger
- Instructor가 과제 관리 페이지에서 과제 상태를 변경(게시 또는 마감)

## Main Scenario

### 1. 과제 게시 (Draft → Published)
1. Instructor가 본인의 과제 목록에서 `draft` 상태의 과제 선택
2. "게시" 버튼 클릭
3. 시스템이 과제 상태를 `published`로 변경
4. 해당 코스에 등록된 모든 Learner에게 과제가 노출됨
5. 성공 피드백 표시

### 2. 과제 마감 (Published → Closed)
1. Instructor가 본인의 과제 목록에서 `published` 상태의 과제 선택
2. "마감" 버튼 클릭 또는 마감일 도래
3. 시스템이 과제 상태를 `closed`로 변경
4. Learner의 과제 상세 페이지에서 제출 버튼 비활성화
5. 성공 피드백 표시

## Edge Cases

### 게시 시
- 과제 필수 정보(제목, 설명, 마감일, 점수 비중) 미입력 시 게시 불가
- 본인 소유가 아닌 코스의 과제 게시 시도 시 권한 오류 반환

### 마감 시
- 이미 `closed` 상태인 과제 재마감 시도 시 오류 반환
- 마감일 이후 자동 마감 시 크론잡 또는 스케줄러 실패 시 수동 마감 가능
- 마감 후에도 Instructor의 채점은 계속 가능

### 공통
- 네트워크 오류 시 상태 변경 실패 피드백 표시
- 동시성 문제: 여러 Instructor가 동일 과제 수정 시도 시 마지막 업데이트 우선

## Business Rules

### 상태 전환 규칙
- `draft` → `published`: Instructor가 수동으로 전환
- `published` → `closed`: 마감일 도래 시 자동 전환 또는 Instructor가 수동 전환
- `closed` → `published`: 재오픈 가능 (선택적 구현)

### 권한
- 과제를 소유한 코스의 Instructor만 상태 변경 가능

### 마감 정책
- 마감 후 Learner는 새로운 제출 불가
- 지각 제출 허용 정책과 무관하게 `closed` 상태에서는 제출 차단
- Instructor는 마감 후에도 채점 및 피드백 작성 가능

### Learner 영향
- `published` 상태의 과제만 Learner에게 노출
- `closed` 상태 과제는 열람 가능하나 제출 UI 비활성화
- 상태 변경 시 실시간 또는 다음 페이지 새로고침 시 반영
