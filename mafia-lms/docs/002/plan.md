# Implementation Plan: 코스 탐색 & 수강신청/취소 (Learner)

## 개요

### Backend Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Enrollment Service | `src/features/enrollment/backend/service.ts` | 수강신청/취소 비즈니스 로직 |
| Enrollment Route | `src/features/enrollment/backend/route.ts` | POST /enrollments, DELETE /enrollments/:courseId |
| Enrollment Schema | `src/features/enrollment/backend/schema.ts` | 수강신청/취소 요청/응답 스키마 |
| Enrollment Error | `src/features/enrollment/backend/error.ts` | 수강신청 관련 에러 코드 정의 |
| Course Service (확장) | `src/features/course/backend/service.ts` | 검색/필터/정렬 기능 추가, 코스 상세 조회 |
| Course Route (확장) | `src/features/course/backend/route.ts` | GET /courses (쿼리 파라미터 추가), GET /courses/:id |
| Course Schema (확장) | `src/features/course/backend/schema.ts` | CourseDetail, CourseQueryParams 스키마 추가 |

### Frontend Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Course Detail Page | `src/app/courses/[id]/page.tsx` | 코스 상세 페이지 |
| Course Catalog Page | `src/app/courses/page.tsx` | 검색/필터 기능 포함 코스 카탈로그 |
| Course Search Component | `src/features/course/components/course-search.tsx` | 검색 입력 UI |
| Course Filter Component | `src/features/course/components/course-filter.tsx` | 카테고리/난이도 필터 UI |
| Course Sort Component | `src/features/course/components/course-sort.tsx` | 정렬 옵션 UI |
| Enrollment Button Component | `src/features/enrollment/components/enrollment-button.tsx` | 수강신청/취소 버튼 |
| Confirm Modal Component | `src/features/enrollment/components/confirm-modal.tsx` | 수강취소 확인 모달 |
| useCourseDetail Hook | `src/features/course/hooks/useCourseDetail.ts` | 코스 상세 조회 React Query |
| useEnroll Hook | `src/features/enrollment/hooks/useEnroll.ts` | 수강신청 Mutation |
| useUnenroll Hook | `src/features/enrollment/hooks/useUnenroll.ts` | 수강취소 Mutation |
| useEnrollmentStatus Hook | `src/features/enrollment/hooks/useEnrollmentStatus.ts` | 수강 여부 확인 Query |

### Shared/Utility Modules

| 모듈 | 위치 | 설명 |
|------|------|------|
| Enrollment DTO | `src/features/enrollment/lib/dto.ts` | Backend schema 재노출 |
| Course DTO (확장) | `src/features/course/lib/dto.ts` | CourseDetail, QueryParams 재노출 |

---

## Diagram

```mermaid
graph TB
    subgraph "Presentation Layer (Client)"
        CourseCatalogPage[Course Catalog Page<br/>src/app/courses/page.tsx]
        CourseDetailPage[Course Detail Page<br/>src/app/courses/[id]/page.tsx]

        CourseSearch[Course Search Component]
        CourseFilter[Course Filter Component]
        CourseSort[Course Sort Component]
        CourseList[Course List Component<br/>기존]

        EnrollmentButton[Enrollment Button Component]
        ConfirmModal[Confirm Modal Component]

        useCoursesHook[useCourses Hook<br/>기존 + 확장]
        useCourseDetailHook[useCourseDetail Hook]
        useEnrollHook[useEnroll Hook]
        useUnenrollHook[useUnenroll Hook]
        useEnrollmentStatusHook[useEnrollmentStatus Hook]
    end

    subgraph "API Layer (Hono)"
        CourseRoute[Course Route<br/>GET /courses?search&category&difficulty&sort<br/>GET /courses/:id]
        EnrollmentRoute[Enrollment Route<br/>POST /enrollments<br/>DELETE /enrollments/:courseId]
    end

    subgraph "Business Logic Layer"
        CourseService[Course Service<br/>getPublicCourses (확장)<br/>getCourseDetail]
        EnrollmentService[Enrollment Service<br/>enrollCourse<br/>unenrollCourse<br/>checkEnrollment]
    end

    subgraph "Database (Supabase)"
        Courses[(courses)]
        Enrollments[(enrollments)]
        Profiles[(profiles)]
        Users[(users)]
    end

    subgraph "Shared Layer"
        CourseDTO[Course DTO<br/>CourseDetail, QueryParams]
        EnrollmentDTO[Enrollment DTO]
        CourseSchema[Course Schema<br/>zod]
        EnrollmentSchema[Enrollment Schema<br/>zod]
    end

    CourseCatalogPage --> CourseSearch
    CourseCatalogPage --> CourseFilter
    CourseCatalogPage --> CourseSort
    CourseCatalogPage --> CourseList
    CourseCatalogPage --> useCoursesHook

    CourseDetailPage --> EnrollmentButton
    CourseDetailPage --> useCourseDetailHook
    CourseDetailPage --> useEnrollmentStatusHook

    EnrollmentButton --> ConfirmModal
    EnrollmentButton --> useEnrollHook
    EnrollmentButton --> useUnenrollHook

    useCoursesHook --> CourseRoute
    useCourseDetailHook --> CourseRoute
    useEnrollHook --> EnrollmentRoute
    useUnenrollHook --> EnrollmentRoute
    useEnrollmentStatusHook --> EnrollmentRoute

    CourseRoute --> CourseService
    EnrollmentRoute --> EnrollmentService

    CourseService --> Courses
    CourseService --> Profiles
    EnrollmentService --> Enrollments
    EnrollmentService --> Courses
    EnrollmentService --> Users

    useCoursesHook -.uses.-> CourseDTO
    useCourseDetailHook -.uses.-> CourseDTO
    useEnrollHook -.uses.-> EnrollmentDTO
    useUnenrollHook -.uses.-> EnrollmentDTO

    CourseRoute -.validates.-> CourseSchema
    EnrollmentRoute -.validates.-> EnrollmentSchema
    CourseService -.validates.-> CourseSchema
    EnrollmentService -.validates.-> EnrollmentSchema

    CourseDTO -.re-exports.-> CourseSchema
    EnrollmentDTO -.re-exports.-> EnrollmentSchema
```

---

## Implementation Plan

### 1. Backend Layer

#### 1.1 Enrollment Schema
**파일**: `src/features/enrollment/backend/schema.ts`

**구현 내용**:
```typescript
export const EnrollRequestSchema = z.object({
  courseId: z.string().uuid(),
})

export const EnrollResponseSchema = z.object({
  learnerId: z.string().uuid(),
  courseId: z.string().uuid(),
  enrolledAt: z.string(),
})

export const UnenrollParamsSchema = z.object({
  courseId: z.string().uuid(),
})

export const EnrollmentStatusResponseSchema = z.object({
  isEnrolled: z.boolean(),
  enrolledAt: z.string().nullable(),
})
```

**Unit Test**:
- ✅ 유효한 courseId → 통과
- ✅ 잘못된 UUID 형식 → 검증 실패

---

#### 1.2 Enrollment Error Codes
**파일**: `src/features/enrollment/backend/error.ts`

**구현 내용**:
```typescript
export const enrollmentErrorCodes = {
  alreadyEnrolled: 'ALREADY_ENROLLED',
  notEnrolled: 'NOT_ENROLLED',
  courseNotPublished: 'COURSE_NOT_PUBLISHED',
  enrollmentFailed: 'ENROLLMENT_FAILED',
  unenrollmentFailed: 'UNENROLLMENT_FAILED',
  invalidRole: 'INVALID_ROLE',
} as const
```

---

#### 1.3 Enrollment Service
**파일**: `src/features/enrollment/backend/service.ts`

**구현 내용**:
```typescript
export const enrollCourse = async (
  supabase: SupabaseClient,
  learnerId: string,
  courseId: string
): Promise<HandlerResult<EnrollResponse, EnrollmentServiceError, unknown>>

export const unenrollCourse = async (
  supabase: SupabaseClient,
  learnerId: string,
  courseId: string
): Promise<HandlerResult<void, EnrollmentServiceError, unknown>>

export const checkEnrollment = async (
  supabase: SupabaseClient,
  learnerId: string,
  courseId: string
): Promise<HandlerResult<EnrollmentStatusResponse, EnrollmentServiceError, unknown>>
```

**로직**:
- **enrollCourse**:
  1. 사용자 역할 확인 (Learner만 가능)
  2. 코스 상태 확인 (published만 가능)
  3. 중복 신청 확인
  4. enrollments 테이블에 INSERT
  5. 성공 시 enrolledAt 반환

- **unenrollCourse**:
  1. 수강 중인지 확인
  2. enrollments 테이블에서 DELETE
  3. 성공 응답

- **checkEnrollment**:
  1. enrollments 테이블 조회
  2. isEnrolled, enrolledAt 반환

**Unit Test**:
- ✅ Learner 역할 + published 코스 → 수강신청 성공
- ✅ Instructor 역할 → INVALID_ROLE
- ✅ draft 코스 → COURSE_NOT_PUBLISHED
- ✅ 중복 신청 → ALREADY_ENROLLED
- ✅ 수강 중인 코스 취소 → 성공
- ✅ 미수강 코스 취소 → NOT_ENROLLED

---

#### 1.4 Enrollment Route
**파일**: `src/features/enrollment/backend/route.ts`

**구현 내용**:
```typescript
export const registerEnrollmentRoutes = (app: Hono<AppEnv>) => {
  app.post('/enrollments', async (c) => {
    // 1. 요청 body 검증
    // 2. 현재 사용자 ID 가져오기 (c.get('user'))
    // 3. enrollCourse 서비스 호출
    // 4. respond 헬퍼로 응답
  })

  app.delete('/enrollments/:courseId', async (c) => {
    // 1. courseId 파라미터 검증
    // 2. 현재 사용자 ID 가져오기
    // 3. unenrollCourse 서비스 호출
    // 4. respond 헬퍼로 응답
  })

  app.get('/enrollments/status/:courseId', async (c) => {
    // 1. courseId 파라미터 검증
    // 2. 현재 사용자 ID 가져오기
    // 3. checkEnrollment 서비스 호출
    // 4. respond 헬퍼로 응답
  })
}
```

---

#### 1.5 Course Schema (확장)
**파일**: `src/features/course/backend/schema.ts`

**구현 내용**:
```typescript
export const CourseDetailSchema = PublicCourseSchema.extend({
  enrollmentCount: z.number(),
  createdAt: z.string(),
})

export const CourseQueryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.array(z.string()).optional(),
  difficulty: z.array(z.string()).optional(),
  sort: z.enum(['latest', 'popular']).optional().default('latest'),
})
```

---

#### 1.6 Course Service (확장)
**파일**: `src/features/course/backend/service.ts`

**구현 내용**:
```typescript
export const getPublicCourses = async (
  supabase: SupabaseClient,
  params: CourseQueryParams
): Promise<HandlerResult<PublicCourse[], CourseServiceError, unknown>>

export const getCourseDetail = async (
  supabase: SupabaseClient,
  courseId: string
): Promise<HandlerResult<CourseDetail, CourseServiceError, unknown>>
```

**로직 확장**:
- **getPublicCourses**:
  - search: title 또는 description에 ILIKE 검색
  - category: IN 조건 (OR)
  - difficulty: IN 조건 (OR)
  - sort: latest (created_at DESC), popular (enrollments count DESC)

- **getCourseDetail** (신규):
  - courseId로 코스 조회
  - enrollmentCount 계산 (enrollments 테이블 COUNT)
  - instructorName 조회 (profiles JOIN)

**Unit Test**:
- ✅ 검색어 필터링 → 제목/설명에 포함된 코스만 반환
- ✅ 카테고리 필터링 → 선택된 카테고리만 반환
- ✅ 난이도 필터링 → 선택된 난이도만 반환
- ✅ 최신순 정렬 → created_at DESC
- ✅ 인기순 정렬 → enrollments count DESC
- ✅ 코스 상세 조회 → CourseDetail 반환

---

#### 1.7 Course Route (확장)
**파일**: `src/features/course/backend/route.ts`

**구현 내용**:
```typescript
app.get('/courses', async (c) => {
  const query = c.req.query()
  const parsedParams = CourseQueryParamsSchema.safeParse({
    search: query.search,
    category: query.category ? query.category.split(',') : undefined,
    difficulty: query.difficulty ? query.difficulty.split(',') : undefined,
    sort: query.sort,
  })
  // ...
})

app.get('/courses/:id', async (c) => {
  const courseId = c.req.param('id')
  // getCourseDetail 호출
})
```

---

#### 1.8 Hono App 등록
**파일**: `src/backend/hono/app.ts`

**수정 내용**:
```typescript
import { registerEnrollmentRoutes } from '@/features/enrollment/backend/route'

registerEnrollmentRoutes(app)
```

---

### 2. Frontend Layer

#### 2.1 Enrollment DTO
**파일**: `src/features/enrollment/lib/dto.ts`

**구현 내용**:
```typescript
export {
  EnrollRequestSchema,
  EnrollResponseSchema,
  EnrollmentStatusResponseSchema,
} from '../backend/schema'
export type {
  EnrollRequest,
  EnrollResponse,
  EnrollmentStatusResponse,
} from '../backend/schema'
```

---

#### 2.2 Course DTO (확장)
**파일**: `src/features/course/lib/dto.ts`

**구현 내용**:
```typescript
export {
  CourseDetailSchema,
  CourseQueryParamsSchema,
} from '../backend/schema'
export type {
  CourseDetail,
  CourseQueryParams,
} from '../backend/schema'
```

---

#### 2.3 useEnroll Hook
**파일**: `src/features/enrollment/hooks/useEnroll.ts`

**구현 내용**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/remote/api-client'
import { EnrollResponseSchema } from '../lib/dto'

export const useEnroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.post('/enrollments', { courseId })
      return EnrollResponseSchema.parse(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
```

**QA Sheet**:
- ✅ 수강신청 성공 → 버튼 상태 변경, 성공 메시지
- ✅ 이미 수강 중 → 에러 메시지 표시
- ✅ 비공개 코스 → 에러 메시지 표시
- ✅ Instructor 역할 → 에러 메시지 표시

---

#### 2.4 useUnenroll Hook
**파일**: `src/features/enrollment/hooks/useUnenroll.ts`

**구현 내용**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/remote/api-client'

export const useUnenroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (courseId: string) => {
      await apiClient.delete(`/enrollments/${courseId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
```

**QA Sheet**:
- ✅ 수강취소 성공 → 버튼 상태 변경, 성공 메시지
- ✅ 미수강 코스 취소 → 에러 메시지 표시

---

#### 2.5 useEnrollmentStatus Hook
**파일**: `src/features/enrollment/hooks/useEnrollmentStatus.ts`

**구현 내용**:
```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/remote/api-client'
import { EnrollmentStatusResponseSchema } from '../lib/dto'

export const useEnrollmentStatus = (courseId: string) => {
  return useQuery({
    queryKey: ['enrollments', 'status', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/enrollments/status/${courseId}`)
      return EnrollmentStatusResponseSchema.parse(response.data)
    },
  })
}
```

---

#### 2.6 useCourseDetail Hook
**파일**: `src/features/course/hooks/useCourseDetail.ts`

**구현 내용**:
```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/remote/api-client'
import { CourseDetailSchema } from '../lib/dto'

export const useCourseDetail = (courseId: string) => {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}`)
      return CourseDetailSchema.parse(response.data)
    },
  })
}
```

---

#### 2.7 useCourses Hook (확장)
**파일**: `src/features/course/hooks/useCourses.ts`

**수정 내용**:
```typescript
export const useCourses = (params?: CourseQueryParams) => {
  return useQuery({
    queryKey: ['courses', 'public', params],
    queryFn: async () => {
      const queryString = new URLSearchParams()
      if (params?.search) queryString.set('search', params.search)
      if (params?.category) queryString.set('category', params.category.join(','))
      if (params?.difficulty) queryString.set('difficulty', params.difficulty.join(','))
      if (params?.sort) queryString.set('sort', params.sort)

      const response = await apiClient.get(`/courses?${queryString}`)
      return PublicCoursesResponseSchema.parse(response.data)
    },
  })
}
```

---

#### 2.8 Enrollment Button Component
**파일**: `src/features/enrollment/components/enrollment-button.tsx`

**구현 내용**:
- useEnrollmentStatus로 수강 여부 확인
- useEnroll, useUnenroll 훅 사용
- 수강 중: "수강취소" 버튼, 클릭 시 확인 모달
- 미수강: "수강신청" 버튼
- 로딩 중: 버튼 비활성화 + 스피너

**QA Sheet**:
- ✅ 수강 중 코스 → "수강취소" 버튼 표시
- ✅ 미수강 코스 → "수강신청" 버튼 표시
- ✅ 처리 중 → 버튼 비활성화
- ✅ 성공 시 → 버튼 상태 즉시 변경

---

#### 2.9 Confirm Modal Component
**파일**: `src/features/enrollment/components/confirm-modal.tsx`

**구현 내용**:
- shadcn Dialog 컴포넌트 사용
- "정말 수강취소하시겠습니까?" 메시지
- 확인/취소 버튼

**QA Sheet**:
- ✅ 수강취소 버튼 클릭 → 모달 표시
- ✅ 취소 버튼 → 모달 닫기
- ✅ 확인 버튼 → 수강취소 실행

---

#### 2.10 Course Search Component
**파일**: `src/features/course/components/course-search.tsx`

**구현 내용**:
- Input 컴포넌트
- onChange 이벤트로 상위 컴포넌트에 전달
- debounce 적용 (500ms)

**QA Sheet**:
- ✅ 입력 후 500ms 대기 → 검색 실행
- ✅ 검색 결과 즉시 반영

---

#### 2.11 Course Filter Component
**파일**: `src/features/course/components/course-filter.tsx`

**구현 내용**:
- 카테고리/난이도 체크박스 그룹
- onChange 이벤트로 선택된 값 배열 전달
- shadcn Checkbox 사용

**QA Sheet**:
- ✅ 다중 선택 가능
- ✅ 선택 즉시 필터 적용

---

#### 2.12 Course Sort Component
**파일**: `src/features/course/components/course-sort.tsx`

**구현 내용**:
- Select 컴포넌트 (최신순/인기순)
- onChange 이벤트로 정렬 기준 전달

**QA Sheet**:
- ✅ 정렬 변경 즉시 적용

---

#### 2.13 Course Catalog Page
**파일**: `src/app/courses/page.tsx`

**구현 내용**:
- CourseSearch, CourseFilter, CourseSort 조합
- useCourses 훅에 쿼리 파라미터 전달
- CourseList로 결과 표시
- URL 쿼리 스트링과 동기화 (뒤로가기 지원)

**QA Sheet**:
- ✅ 검색/필터/정렬 조합 동작
- ✅ URL 쿼리 스트링 반영
- ✅ 뒤로가기 시 이전 검색 상태 복원

---

#### 2.14 Course Detail Page
**파일**: `src/app/courses/[id]/page.tsx`

**구현 내용**:
- useCourseDetail로 코스 정보 조회
- EnrollmentButton 표시
- 코스 제목, 설명, 강사명, 카테고리, 난이도, 수강생 수 표시

**QA Sheet**:
- ✅ 코스 정보 올바르게 표시
- ✅ 수강 여부에 따라 버튼 상태 변경
- ✅ 존재하지 않는 코스 → 404 페이지

---

### 3. Integration Checklist

- [ ] 백엔드 라우트 등록 (`src/backend/hono/app.ts`)
- [ ] 환경 변수 확인 (`.env.local`)
- [ ] Course Service 확장 (검색/필터/정렬)
- [ ] Enrollment Service 구현
- [ ] 프론트엔드 hooks 구현
- [ ] 컴포넌트 구현 및 조합
- [ ] 페이지 생성 (catalog, detail)
- [ ] E2E 테스트 (수강신청/취소 플로우)
- [ ] 타입 체크 및 빌드 확인

---

## Summary

이 구현 계획은 **코스 탐색 & 수강신청/취소** 기능을 최소 스펙으로 모듈화하여 설계했습니다.

### 핵심 원칙
1. **기존 Course 모듈 확장**: 검색/필터/정렬 기능 추가
2. **신규 Enrollment 모듈 생성**: 수강신청/취소 전담
3. **모듈 분리**: Backend (service/route/schema/error), Frontend (components/hooks), Shared (dto)
4. **재사용성**: 공통 컴포넌트 분리 (Search, Filter, Sort)
5. **검증 중심**: zod 스키마 기반 요청/응답 검증, Unit Test 포함
6. **사용자 경험**: QA Sheet 기반 사용성 테스트, 실시간 상태 업데이트

이 계획을 기반으로 순차적으로 구현하면 유스케이스 요구사항을 충족할 수 있습니다.
