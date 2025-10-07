# Implementation Plan: 과제 상세 열람 (Learner)

## 개요

### Backend Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Assignment Service | `src/features/assignment/backend/service.ts` | 과제 상세 조회, 과제 목록 조회 (확장) |
| Assignment Route | `src/features/assignment/backend/route.ts` | GET /courses/:courseId/assignments, GET /assignments/:id (신규) |
| Assignment Schema | `src/features/assignment/backend/schema.ts` | 과제 상세 응답 스키마 (확장) |
| Assignment Error | `src/features/assignment/backend/error.ts` | 과제 에러 코드 (확장) |
| Submission Service | `src/features/submission/backend/service.ts` | 제출 이력 조회 (확장) |
| Enrollment Service | `src/features/enrollment/backend/service.ts` | 수강신청 검증 재사용 |

### Frontend Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Assignments List Page | `src/app/(protected)/courses/[id]/assignments/page.tsx` | 코스별 과제 목록 페이지 (신규) |
| Assignment Detail Page | `src/app/(protected)/assignments/[id]/page.tsx` | 과제 상세 페이지 (신규) |
| Assignment List | `src/features/assignment/components/assignment-list.tsx` | 과제 목록 컴포넌트 |
| Assignment Detail View | `src/features/assignment/components/assignment-detail-view.tsx` | 과제 상세 정보 표시 |
| Submission Form | `src/features/submission/components/submission-form.tsx` | 제출 양식 컴포넌트 (신규) |
| Submission History | `src/features/submission/components/submission-history.tsx` | 제출 이력 표시 (신규) |
| useAssignments Hook | `src/features/assignment/hooks/use-assignments.ts` | 과제 목록 조회 Query (신규) |
| useAssignmentDetail Hook | `src/features/assignment/hooks/use-assignment-detail.ts` | 과제 상세 조회 Query (신규) |
| useSubmissionHistory Hook | `src/features/submission/hooks/use-submission-history.ts` | 제출 이력 조회 Query (신규) |

### Shared/Utility Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Assignment DTO | `src/features/assignment/dto.ts` | Backend schema 재노출 (확장) |
| Submission DTO | `src/features/submission/dto.ts` | Backend schema 재노출 (확장) |
| Date Formatter | `src/lib/format/date.ts` | 마감일 포맷팅 (재사용) |
| Assignment Status Util | `src/lib/utils/assignment-status.ts` | 제출 가능 여부 판단 로직 (신규) |

---

## Diagram

```mermaid
graph TB
    subgraph "Presentation Layer (Client)"
        AssignmentsPage[Assignments List Page<br/>src/app/courses/[id]/assignments/page.tsx]
        AssignmentDetailPage[Assignment Detail Page<br/>src/app/assignments/[id]/page.tsx]

        AssignmentList[Assignment List Component]
        AssignmentDetailView[Assignment Detail View]
        SubmissionForm[Submission Form]
        SubmissionHistory[Submission History]

        useAssignments[useAssignments Hook]
        useAssignmentDetail[useAssignmentDetail Hook]
        useSubmissionHistory[useSubmissionHistory Hook]
    end

    subgraph "API Layer (Hono)"
        AssignmentRoute1[GET /courses/:courseId/assignments]
        AssignmentRoute2[GET /assignments/:id]
    end

    subgraph "Business Logic Layer"
        AssignmentService[Assignment Service<br/>getCourseAssignments<br/>getAssignmentDetail]
        SubmissionService[Submission Service<br/>getSubmissionHistory]
        EnrollmentService[Enrollment Service<br/>checkEnrollment]
    end

    subgraph "Database (Supabase)"
        Assignments[(assignments)]
        Submissions[(submissions)]
        Enrollments[(enrollments)]
        Grades[(grades)]
        Courses[(courses)]
    end

    subgraph "Shared Layer"
        AssignmentDTO[Assignment DTO]
        SubmissionDTO[Submission DTO]
        AssignmentSchema[Assignment Schema<br/>zod]
        SubmissionSchema[Submission Schema<br/>zod]
        DateUtil[Date Formatter]
        StatusUtil[Assignment Status Util]
    end

    AssignmentsPage --> AssignmentList
    AssignmentsPage --> useAssignments

    AssignmentDetailPage --> AssignmentDetailView
    AssignmentDetailPage --> SubmissionForm
    AssignmentDetailPage --> SubmissionHistory
    AssignmentDetailPage --> useAssignmentDetail
    AssignmentDetailPage --> useSubmissionHistory

    useAssignments --> AssignmentRoute1
    useAssignmentDetail --> AssignmentRoute2
    useSubmissionHistory --> AssignmentRoute2

    AssignmentRoute1 --> EnrollmentService
    AssignmentRoute1 --> AssignmentService
    AssignmentRoute2 --> EnrollmentService
    AssignmentRoute2 --> AssignmentService
    AssignmentRoute2 --> SubmissionService

    AssignmentService --> Assignments
    AssignmentService --> Courses
    SubmissionService --> Submissions
    SubmissionService --> Grades
    EnrollmentService --> Enrollments

    AssignmentList --> AssignmentDTO
    AssignmentDetailView --> AssignmentDTO
    AssignmentDetailView --> StatusUtil
    SubmissionForm --> SubmissionDTO
    SubmissionHistory --> SubmissionDTO

    AssignmentService --> AssignmentSchema
    SubmissionService --> SubmissionSchema
```

---

## Implementation Plan

### Phase 1: Backend - Assignment Service & Routes

#### 1.1 Assignment Schema 확장
**파일**: `src/features/assignment/backend/schema.ts`

```typescript
// 기존 스키마 확장
export const AssignmentDetailSchema = AssignmentSchema.extend({
  description: z.string(),
  courseName: z.string(),
  courseId: z.string().uuid(),
});

export const CourseAssignmentsResponseSchema = z.array(
  AssignmentSchema.extend({
    submissionStatus: z.enum(['not_submitted', 'submitted', 'graded', 'resubmission_required']),
  })
);

export type AssignmentDetail = z.infer<typeof AssignmentDetailSchema>;
export type CourseAssignment = z.infer<typeof CourseAssignmentsResponseSchema>[number];
```

**Unit Tests**:
- ✅ Schema validation for valid assignment detail
- ✅ Schema validation for invalid fields
- ✅ CourseAssignmentsResponseSchema array validation

#### 1.2 Assignment Error 확장
**파일**: `src/features/assignment/backend/error.ts`

```typescript
export const assignmentErrorCodes = {
  fetchError: 'FETCH_ERROR',
  validationError: 'VALIDATION_ERROR',
  assignmentNotFound: 'ASSIGNMENT_NOT_FOUND', // 신규
  notEnrolled: 'NOT_ENROLLED', // 신규
  notPublished: 'NOT_PUBLISHED', // 신규
} as const;
```

#### 1.3 Assignment Service 확장
**파일**: `src/features/assignment/backend/service.ts`

**새 함수**:
- `getCourseAssignments(client, courseId, learnerId)`: 특정 코스의 published 과제 목록 + 제출 상태
- `getAssignmentDetail(client, assignmentId, learnerId)`: 과제 상세 + 권한 검증

**Unit Tests**:
- ✅ getCourseAssignments - 수강신청하지 않은 코스 접근 시 NOT_ENROLLED 반환
- ✅ getCourseAssignments - published 상태 과제만 반환
- ✅ getCourseAssignments - 각 과제의 제출 상태 정확히 반환
- ✅ getAssignmentDetail - 존재하지 않는 과제 조회 시 ASSIGNMENT_NOT_FOUND 반환
- ✅ getAssignmentDetail - draft 상태 과제 조회 시 NOT_PUBLISHED 반환
- ✅ getAssignmentDetail - 수강신청하지 않은 코스의 과제 조회 시 NOT_ENROLLED 반환
- ✅ getAssignmentDetail - 정상 조회 시 과제 상세 정보 반환

#### 1.4 Assignment Routes 신규
**파일**: `src/features/assignment/backend/route.ts`

**엔드포인트**:
- `GET /courses/:courseId/assignments` - 코스별 과제 목록 조회
- `GET /assignments/:id` - 과제 상세 조회

**검증**:
- ✅ courseId, assignmentId UUID 유효성 검증
- ✅ 로그인 사용자 확인
- ✅ Learner 역할 확인

#### 1.5 Submission Service 확장
**파일**: `src/features/submission/backend/service.ts`

**새 함수**:
- `getSubmissionHistory(client, assignmentId, learnerId)`: 특정 과제에 대한 제출 이력 + 채점 결과

**Unit Tests**:
- ✅ getSubmissionHistory - 제출 이력 없을 때 빈 배열 반환
- ✅ getSubmissionHistory - 제출 이력 있을 때 submitted_at 기준 내림차순 정렬
- ✅ getSubmissionHistory - 채점된 제출물의 경우 grade 정보 포함
- ✅ getSubmissionHistory - 재제출 요청된 제출물의 상태 정확히 반환

#### 1.6 Hono App 라우트 등록
**파일**: `src/backend/hono/app.ts`

```typescript
import { registerAssignmentRoutes } from '@/features/assignment/backend/route';
// ...
registerAssignmentRoutes(app);
```

---

### Phase 2: Backend - Submission Schema

#### 2.1 Submission Schema 확장
**파일**: `src/features/submission/backend/schema.ts`

```typescript
export const SubmissionHistoryItemSchema = SubmissionSchema.extend({
  grade: z.object({
    score: z.number().nullable(),
    feedback: z.string(),
    gradedAt: z.string(),
  }).nullable(),
});

export type SubmissionHistoryItem = z.infer<typeof SubmissionHistoryItemSchema>;
```

---

### Phase 3: Shared Utilities

#### 3.1 Assignment Status Util
**파일**: `src/lib/utils/assignment-status.ts`

```typescript
export const canSubmit = (assignment: {
  status: string;
  dueDate: string;
  allowLate: boolean;
}): boolean => {
  if (assignment.status !== 'published') return false;
  if (assignment.status === 'closed') return false;

  const now = new Date();
  const due = new Date(assignment.dueDate);

  if (now <= due) return true;
  return assignment.allowLate;
};

export const canResubmit = (
  assignment: { allowResubmission: boolean },
  submission: { status: string } | null
): boolean => {
  if (!submission) return false;
  return assignment.allowResubmission && submission.status === 'resubmission_required';
};

export const getSubmissionStatus = (
  assignment: { id: string },
  submissions: { assignmentId: string; status: string }[]
): 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required' => {
  const submission = submissions.find(s => s.assignmentId === assignment.id);
  if (!submission) return 'not_submitted';

  if (submission.status === 'graded') return 'graded';
  if (submission.status === 'resubmission_required') return 'resubmission_required';
  return 'submitted';
};
```

**Unit Tests**:
- ✅ canSubmit - published 상태, 마감 전 → true
- ✅ canSubmit - closed 상태 → false
- ✅ canSubmit - 마감 후, allowLate=false → false
- ✅ canSubmit - 마감 후, allowLate=true → true
- ✅ canResubmit - allowResubmission=false → false
- ✅ canResubmit - 제출 이력 없음 → false
- ✅ canResubmit - status=resubmission_required, allowResubmission=true → true
- ✅ getSubmissionStatus - 정확한 상태 반환

---

### Phase 4: Frontend - Data Fetching Hooks

#### 4.1 useAssignments Hook
**파일**: `src/features/assignment/hooks/use-assignments.ts`

```typescript
export const useAssignments = (courseId: string) => {
  return useQuery<CourseAssignment[], Error>({
    queryKey: ['assignments', 'course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}/assignments`);
      return response.data;
    },
    enabled: !!courseId,
  });
};
```

#### 4.2 useAssignmentDetail Hook
**파일**: `src/features/assignment/hooks/use-assignment-detail.ts`

```typescript
export const useAssignmentDetail = (assignmentId: string) => {
  return useQuery<AssignmentDetail, Error>({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};
```

#### 4.3 useSubmissionHistory Hook
**파일**: `src/features/submission/hooks/use-submission-history.ts`

```typescript
export const useSubmissionHistory = (assignmentId: string) => {
  return useQuery<SubmissionHistoryItem[], Error>({
    queryKey: ['submissions', 'history', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};
```

---

### Phase 5: Frontend - Components

#### 5.1 Assignment List Component
**파일**: `src/features/assignment/components/assignment-list.tsx`

**Props**:
```typescript
interface AssignmentListProps {
  assignments: CourseAssignment[];
}
```

**UI**:
- 과제 목록을 카드 형태로 표시
- 각 카드: 제목, 마감일, 제출 상태 Badge
- 클릭 시 `/assignments/[id]`로 이동

**QA Sheet**:
- ✅ 과제 목록이 없을 때 빈 상태 메시지 표시
- ✅ 각 과제 카드 클릭 시 올바른 URL로 이동
- ✅ 제출 상태 Badge 색상 구분 (미제출: gray, 제출완료: blue, 채점완료: green, 재제출필요: orange)
- ✅ 마감일 24시간 이내인 과제는 경고 색상으로 강조

#### 5.2 Assignment Detail View Component
**파일**: `src/features/assignment/components/assignment-detail-view.tsx`

**Props**:
```typescript
interface AssignmentDetailViewProps {
  assignment: AssignmentDetail;
}
```

**UI**:
- 과제 제목, 설명, 마감일 표시
- 점수 비중, 지각 허용 여부, 재제출 허용 여부 표시
- 마감일 강조 (24시간 이내: 빨간색)

**QA Sheet**:
- ✅ 모든 과제 정보 필드가 정확히 표시됨
- ✅ allow_late=true일 때 "지각 제출 가능" 표시
- ✅ allow_resubmission=true일 때 "재제출 가능" 표시
- ✅ 마감일이 과거일 때 "마감됨" 표시

#### 5.3 Submission Form Component
**파일**: `src/features/submission/components/submission-form.tsx`

**Props**:
```typescript
interface SubmissionFormProps {
  assignmentId: string;
  canSubmit: boolean;
  canResubmit: boolean;
  onSubmitSuccess: () => void;
}
```

**UI**:
- 텍스트 입력란 (textarea, required)
- 링크 입력란 (input, optional)
- 제출 버튼 (disabled when !canSubmit && !canResubmit)
- "마감된 과제입니다" 메시지 (when closed)

**QA Sheet**:
- ✅ canSubmit=false이고 canResubmit=false일 때 제출 버튼 비활성화
- ✅ 텍스트 입력란 비어있을 때 제출 불가
- ✅ 제출 성공 시 onSubmitSuccess 콜백 호출
- ✅ 제출 실패 시 에러 메시지 표시
- ✅ 재제출 모드일 때 "재제출하기" 버튼 텍스트 표시

#### 5.4 Submission History Component
**파일**: `src/features/submission/components/submission-history.tsx`

**Props**:
```typescript
interface SubmissionHistoryProps {
  submissions: SubmissionHistoryItem[];
}
```

**UI**:
- 제출 이력 리스트 (시간 역순)
- 각 항목: 제출일시, 제출 내용, 채점 결과 (있는 경우)
- 재제출 요청된 항목은 강조 표시

**QA Sheet**:
- ✅ 제출 이력이 없을 때 "아직 제출하지 않았습니다" 메시지 표시
- ✅ 제출 이력이 submitted_at 기준 내림차순 정렬
- ✅ 채점된 제출물은 점수와 피드백 표시
- ✅ 재제출 요청된 항목은 "재제출 필요" Badge와 주황색 배경

---

### Phase 6: Frontend - Pages

#### 6.1 Assignments List Page
**파일**: `src/app/(protected)/courses/[id]/assignments/page.tsx`

**로직**:
1. URL params에서 courseId 추출
2. useAssignments(courseId) 호출
3. Loading/Error 상태 처리
4. AssignmentList 컴포넌트 렌더링

**QA Sheet**:
- ✅ 로딩 중일 때 스피너 표시
- ✅ 에러 발생 시 에러 메시지 표시
- ✅ 수강신청하지 않은 코스 접근 시 "수강신청한 코스가 아닙니다" 메시지 표시
- ✅ 정상 로딩 시 과제 목록 표시

#### 6.2 Assignment Detail Page
**파일**: `src/app/(protected)/assignments/[id]/page.tsx`

**로직**:
1. URL params에서 assignmentId 추출
2. useAssignmentDetail(assignmentId) 호출
3. useSubmissionHistory(assignmentId) 호출
4. canSubmit, canResubmit 계산
5. AssignmentDetailView, SubmissionForm, SubmissionHistory 렌더링

**QA Sheet**:
- ✅ 로딩 중일 때 스피너 표시
- ✅ 과제가 존재하지 않을 때 404 메시지 표시
- ✅ draft 상태 과제 접근 시 "아직 공개되지 않은 과제입니다" 메시지 표시
- ✅ 수강신청하지 않은 코스의 과제 접근 시 "권한이 없습니다" 메시지 표시
- ✅ 제출 양식과 제출 이력이 함께 표시됨
- ✅ closed 상태 과제는 제출 버튼 비활성화
- ✅ 재제출 가능한 경우 재제출 버튼 활성화

---

### Phase 7: DTO & Integration

#### 7.1 Assignment DTO
**파일**: `src/features/assignment/dto.ts`

```typescript
export * from './backend/schema';
export type {
  AssignmentDetail,
  CourseAssignment,
} from './backend/schema';
```

#### 7.2 Submission DTO
**파일**: `src/features/submission/dto.ts`

```typescript
export * from './backend/schema';
export type {
  SubmissionHistoryItem,
} from './backend/schema';
```

---

## Testing Strategy

### Backend Unit Tests
- Assignment Service: 모든 함수의 성공/실패 케이스
- Submission Service: getSubmissionHistory 다양한 시나리오
- Shared Utils: canSubmit, canResubmit, getSubmissionStatus 로직

### Frontend QA Checklist
- 각 컴포넌트의 UI 렌더링 검증
- 페이지별 사용자 시나리오 검증
- 권한 검증 동작 확인
- 에러 상태 표시 확인
- 로딩 상태 표시 확인

### Integration Tests
- E2E: 과제 목록 조회 → 과제 상세 조회 → 제출 흐름
- API: 각 엔드포인트의 응답 구조 검증
- 권한 검증: Learner만 접근 가능, 수강신청 여부 확인

---

## Deployment Checklist

- ✅ 모든 백엔드 서비스 Unit Test 통과
- ✅ 모든 프론트엔드 컴포넌트 QA Sheet 검증 완료
- ✅ TypeScript 타입 에러 0개
- ✅ ESLint 경고 0개
- ✅ Build 성공
- ✅ Supabase migrations 적용 (assignments 테이블 확인)
- ✅ 수강신청하지 않은 사용자 접근 차단 확인
- ✅ draft 상태 과제 접근 차단 확인
- ✅ closed 상태 과제 제출 불가 확인
