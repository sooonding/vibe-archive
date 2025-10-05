# Database Design

## 개요

본 문서는 LMS(Learning Management System)의 데이터베이스 설계를 정의합니다.
- DBMS: PostgreSQL (Supabase)
- 인증: Supabase Auth (`auth.users`)
- 설계 원칙: 유저플로우에 명시된 최소 스펙만 포함

---

## 데이터플로우

### 1. 역할 선택 & 온보딩
```
auth.users 생성 (Supabase Auth)
→ profiles INSERT (user_id, role, name, phone)
→ terms_agreements INSERT (user_id, agreed_at)
```

### 2. 코스 탐색 & 수강신청/취소
```
courses SELECT WHERE status='published'
→ enrollments INSERT (learner_id, course_id) - 중복 체크
→ enrollments DELETE (취소 시)
```

### 3. Learner 대시보드
```
enrollments JOIN courses WHERE learner_id=?
→ submissions JOIN assignments - 진행률 계산
→ submissions WHERE due_date < NOW() + interval - 마감 임박
→ submissions ORDER BY graded_at DESC - 최근 피드백
```

### 4. 과제 상세 열람
```
assignments SELECT WHERE status='published' AND course_id IN (내 코스)
```

### 5. 과제 제출/재제출
```
submissions INSERT/UPDATE (assignment_id, learner_id, text, link, status, late)
```

### 6. 성적 & 피드백 열람
```
submissions JOIN assignments WHERE learner_id=?
→ SUM(score × weight) GROUP BY course_id
```

### 7. Instructor 대시보드
```
courses SELECT WHERE instructor_id=?
→ submissions COUNT WHERE status='submitted'
→ submissions ORDER BY submitted_at DESC
```

### 8. 코스 관리
```
courses INSERT/UPDATE (instructor_id, title, description, category, level, status)
```

### 9. 과제 관리
```
assignments INSERT/UPDATE (course_id, title, description, due_date, weight, allow_late, allow_resubmission, status)
→ submissions SELECT WHERE assignment_id=? - 필터링
```

### 10. 제출물 채점 & 피드백
```
submissions UPDATE (score, feedback, status='graded' | 'resubmission_required')
```

### 11. Assignment 게시/마감
```
assignments UPDATE status='published' | 'closed'
```

### 12. 운영
```
reports INSERT (reporter_id, target_type, target_id, reason, status)
categories, levels CRUD
```

---

## ERD 개념도

```
auth.users (Supabase Auth)
    ↓
profiles (role, name, phone)
    ↓
    ├─→ terms_agreements
    ├─→ courses (instructor_id) ──→ assignments ──→ submissions
    ├─→ enrollments (learner_id, course_id)              ↑
    └─→ reports (reporter_id)                            │
                                                         └─ (learner_id)
```

---

## 테이블 스키마

### 1. profiles
사용자 프로필 정보 (Supabase Auth 확장)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, FK → auth.users(id) | 사용자 ID |
| role | VARCHAR(20) | NOT NULL, CHECK | 'learner' \| 'instructor' |
| name | VARCHAR(100) | NOT NULL | 이름 |
| phone | VARCHAR(20) | NOT NULL | 전화번호 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

### 2. terms_agreements
약관 동의 이력

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 약관 동의 ID |
| user_id | UUID | NOT NULL, FK → auth.users(id) | 사용자 ID |
| agreed_at | TIMESTAMPTZ | DEFAULT NOW() | 동의일시 |

### 3. courses
코스

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 코스 ID |
| instructor_id | UUID | NOT NULL, FK → auth.users(id) | 강사 ID |
| title | VARCHAR(200) | NOT NULL | 코스명 |
| description | TEXT | | 설명 |
| category | VARCHAR(50) | NOT NULL | 카테고리 |
| level | VARCHAR(20) | NOT NULL, CHECK | 'beginner' \| 'intermediate' \| 'advanced' |
| curriculum | TEXT | | 커리큘럼 |
| status | VARCHAR(20) | NOT NULL, CHECK, DEFAULT 'draft' | 'draft' \| 'published' \| 'archived' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

**인덱스:**
- `idx_courses_status` ON (status)
- `idx_courses_instructor` ON (instructor_id)

### 4. enrollments
수강 등록

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 수강 등록 ID |
| learner_id | UUID | NOT NULL, FK → auth.users(id) | 학습자 ID |
| course_id | UUID | NOT NULL, FK → courses(id) | 코스 ID |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() | 등록일시 |

**제약:**
- UNIQUE(learner_id, course_id)

**인덱스:**
- `idx_enrollments_learner` ON (learner_id)
- `idx_enrollments_course` ON (course_id)

### 5. assignments
과제

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 과제 ID |
| course_id | UUID | NOT NULL, FK → courses(id) | 코스 ID |
| title | VARCHAR(200) | NOT NULL | 과제명 |
| description | TEXT | | 설명 |
| due_date | TIMESTAMPTZ | NOT NULL | 마감일시 |
| weight | DECIMAL(5,2) | NOT NULL, CHECK (0-100) | 배점 비중 |
| allow_late | BOOLEAN | NOT NULL, DEFAULT FALSE | 지각 제출 허용 |
| allow_resubmission | BOOLEAN | NOT NULL, DEFAULT FALSE | 재제출 허용 |
| status | VARCHAR(20) | NOT NULL, CHECK, DEFAULT 'draft' | 'draft' \| 'published' \| 'closed' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

**인덱스:**
- `idx_assignments_course` ON (course_id)
- `idx_assignments_status` ON (status)

### 6. submissions
제출물

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 제출물 ID |
| assignment_id | UUID | NOT NULL, FK → assignments(id) | 과제 ID |
| learner_id | UUID | NOT NULL, FK → auth.users(id) | 학습자 ID |
| text | TEXT | NOT NULL | 제출 내용 |
| link | VARCHAR(500) | | 제출 링크 |
| status | VARCHAR(30) | NOT NULL, CHECK, DEFAULT 'submitted' | 'submitted' \| 'graded' \| 'resubmission_required' |
| late | BOOLEAN | NOT NULL, DEFAULT FALSE | 지각 제출 여부 |
| score | DECIMAL(5,2) | CHECK (0-100) | 점수 |
| feedback | TEXT | | 피드백 |
| submitted_at | TIMESTAMPTZ | DEFAULT NOW() | 제출일시 |
| graded_at | TIMESTAMPTZ | | 채점일시 |

**제약:**
- UNIQUE(assignment_id, learner_id)

**인덱스:**
- `idx_submissions_assignment` ON (assignment_id)
- `idx_submissions_learner` ON (learner_id)
- `idx_submissions_status` ON (status)

### 7. reports
신고

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 신고 ID |
| reporter_id | UUID | NOT NULL, FK → auth.users(id) | 신고자 ID |
| target_type | VARCHAR(20) | NOT NULL, CHECK | 'course' \| 'assignment' \| 'submission' \| 'user' |
| target_id | UUID | NOT NULL | 신고 대상 ID |
| reason | VARCHAR(100) | NOT NULL | 신고 사유 |
| content | TEXT | | 상세 내용 |
| status | VARCHAR(20) | NOT NULL, CHECK, DEFAULT 'received' | 'received' \| 'investigating' \| 'resolved' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 신고일시 |
| resolved_at | TIMESTAMPTZ | | 처리일시 |

**인덱스:**
- `idx_reports_status` ON (status)
- `idx_reports_target` ON (target_type, target_id)

### 8. categories
카테고리 메타데이터

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 카테고리 ID |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 카테고리명 |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 여부 |

### 9. levels
난이도 메타데이터

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | 난이도 ID |
| name | VARCHAR(20) | NOT NULL, UNIQUE | 난이도명 |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 여부 |

---

## 주요 쿼리 패턴

### 1. Learner 대시보드: 내 코스 목록
```sql
SELECT c.*, e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.learner_id = $1
ORDER BY e.enrolled_at DESC;
```

### 2. Learner: 과제 진행률
```sql
SELECT
  a.id,
  a.title,
  a.due_date,
  s.status,
  s.score
FROM assignments a
JOIN enrollments e ON e.course_id = a.course_id
LEFT JOIN submissions s ON s.assignment_id = a.id AND s.learner_id = $1
WHERE e.learner_id = $1 AND a.status = 'published'
ORDER BY a.due_date ASC;
```

### 3. Instructor: 미채점 제출물
```sql
SELECT
  s.*,
  a.title AS assignment_title,
  c.title AS course_title,
  p.name AS learner_name
FROM submissions s
JOIN assignments a ON s.assignment_id = a.id
JOIN courses c ON a.course_id = c.id
JOIN profiles p ON s.learner_id = p.id
WHERE c.instructor_id = $1 AND s.status = 'submitted'
ORDER BY s.submitted_at ASC;
```

### 4. 코스별 성적 계산
```sql
SELECT
  c.id,
  c.title,
  SUM(s.score * a.weight / 100) AS final_score
FROM courses c
JOIN assignments a ON a.course_id = c.id
JOIN submissions s ON s.assignment_id = a.id
WHERE s.learner_id = $1 AND s.status = 'graded'
GROUP BY c.id, c.title;
```

---

## 보안 고려사항

1. **Row Level Security (RLS)**: Supabase RLS를 활용하여 각 테이블별 접근 제어
   - `profiles`: 본인 정보만 수정 가능
   - `courses`: 본인이 instructor인 코스만 수정 가능
   - `enrollments`: learner만 자신의 수강신청 관리
   - `assignments`: instructor만 자신의 코스 과제 관리
   - `submissions`: learner는 본인 제출물만, instructor는 자신의 코스 제출물만
   - `reports`: 본인이 작성한 신고만 조회

2. **외래키 CASCADE**: 데이터 일관성 유지를 위해 ON DELETE CASCADE 적용

3. **CHECK 제약**: enum 값, 점수 범위 등 데이터 무결성 검증
