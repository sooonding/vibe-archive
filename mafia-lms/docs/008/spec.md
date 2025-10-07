# Use Case 008: 코스 관리 (Instructor)

## Primary Actor
Instructor

## Precondition
- 사용자가 Instructor 역할로 로그인되어 있음

## Trigger
- Instructor가 코스 생성 버튼 클릭
- Instructor가 본인 소유 코스의 수정 버튼 클릭
- Instructor가 코스 상태 전환 버튼 클릭

## Main Scenario

### 코스 생성
1. Instructor가 "새 코스 만들기" 버튼 클릭
2. 시스템은 코스 생성 폼 표시
3. Instructor가 필수 정보 입력:
   - 제목 (필수)
   - 설명 (필수)
   - 카테고리 (필수)
   - 난이도 (필수)
   - 커리큘럼 (선택)
4. Instructor가 "생성" 버튼 클릭
5. 시스템은 입력 검증 수행
6. 시스템은 `status=draft`로 코스 생성
7. 시스템은 Instructor 대시보드로 리다이렉트
8. 생성 성공 메시지 표시

### 코스 수정
1. Instructor가 코스 목록에서 본인 소유 코스 선택
2. 시스템은 코스 수정 폼 표시 (기존 정보 로드)
3. Instructor가 정보 수정
4. Instructor가 "저장" 버튼 클릭
5. 시스템은 입력 검증 수행
6. 시스템은 변경사항 저장
7. 수정 성공 메시지 표시

### 상태 전환
1. Instructor가 코스 상태 전환 버튼 클릭
2. 시스템은 현재 상태와 가능한 전환 표시:
   - `draft → published`: 코스 공개
   - `published → archived`: 신규 수강 차단
   - `archived → published`: 재공개
3. Instructor가 전환 확인
4. 시스템은 상태 업데이트
5. Learner 화면에 변경사항 즉시 반영

## Edge Cases

### EC1: 비소유자 접근 시도
- 403 Forbidden 응답
- "권한이 없습니다" 메시지 표시

### EC2: 필수 입력 누락
- 폼 검증 실패
- 누락된 필드 하이라이트 및 에러 메시지

### EC3: 제목 중복
- 동일 제목 허용 (코스 ID로 구분)
- 검증 통과

### EC4: Published → Archived 전환 시 수강생 존재
- 기존 수강생은 유지
- 신규 수강신청만 차단
- 경고 메시지 표시 후 확인 필요

### EC5: Draft 상태 코스 삭제 요청
- 삭제 확인 다이얼로그 표시
- 삭제 시 관련 데이터 연쇄 삭제 또는 보존 정책 적용

### EC6: Archived 코스에 과제 추가 시도
- 허용 (과제는 기존 수강생용)
- 안내 메시지 표시

## Business Rules

### BR1: 역할 기반 접근 제어
- Instructor 역할만 코스 생성 가능
- Learner는 코스 관리 페이지 접근 불가

### BR2: 소유권 검증
- 코스 생성자만 수정/삭제/상태 전환 가능
- 다른 Instructor의 코스는 조회만 가능 (공개 카탈로그)

### BR3: 상태 전환 규칙
- `draft`: 작성 중, Learner에게 비공개
- `published`: 공개, 수강신청 가능
- `archived`: 보관, 신규 수강 차단, 기존 수강생 유지

### BR4: 상태 전환 제약
- `draft → archived`: 불가 (published 단계 필수)
- `published → draft`: 수강생 있으면 불가
- `archived → draft`: 불가

### BR5: 필수 입력 필드
- 제목: 최소 1자, 최대 200자
- 설명: 최소 10자, 최대 5000자
- 카테고리: 시스템 정의 목록에서 선택
- 난이도: beginner, intermediate, advanced 중 선택

### BR6: 커리큘럼 형식
- 텍스트 형식 자유 입력
- 마크다운 지원 권장

### BR7: 공개 정책
- Published 코스만 카탈로그에 노출
- Draft/Archived 코스는 Instructor 본인만 조회

### BR8: 수강생 존재 시 제약
- Published 코스에 수강생 있으면 Draft 전환 불가
- 삭제 불가 (Archived로만 전환)
