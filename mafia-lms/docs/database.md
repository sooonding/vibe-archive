# Database Schema

## 데이터플로우 (Database Perspective)

### 1. 사용자 인증 & 프로필
```
Auth (Supabase) → users (id, email, role) → profiles (user_id, name, phone)
                                          → terms_acceptance (user_id, accepted_at)
```

### 2. 코스 & 수강신청
```
courses (id, instructor_id, title, status, category, difficulty)
  ↓
enrollments (learner_id, course_id, enrolled_at)
```

### 3. 과제 & 제출물
```
courses → assignments (course_id, title, due_date, weight, allow_late, allow_resubmission, status)
             ↓
          submissions (assignment_id, learner_id, text, link, status, late, submitted_at)
             ↓
          grades (submission_id, score, feedback, graded_at)
```

### 4. 운영 (Optional)
```
reports (target_type, target_id, reporter_id, reason, status)
categories (name, active)
difficulties (name, active)
```

---

## PostgreSQL 스키마

### Core Tables

#### users
사용자 기본 정보 (Supabase Auth 연동)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) | 사용자 ID |
| email | TEXT | NOT NULL, UNIQUE | 이메일 |
| role | TEXT | NOT NULL, CHECK | learner / instructor |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |

#### profiles
사용자 프로필

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users(id) | 사용자 ID |
| name | TEXT | NOT NULL | 이름 |
| phone | TEXT | NOT NULL | 휴대폰번호 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

#### terms_acceptance
약관 동의 이력

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PK, FK → users(id) | 사용자 ID |
| accepted_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 동의일시 |

---

### Course Tables

#### courses
코스 정보

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 코스 ID |
| instructor_id | UUID | NOT NULL, FK → users(id) | 강사 ID |
| title | TEXT | NOT NULL | 코스 제목 |
| description | TEXT | | 코스 소개 |
| category | TEXT | NOT NULL | 카테고리 |
| difficulty | TEXT | NOT NULL | 난이도 |
| status | TEXT | NOT NULL, DEFAULT 'draft', CHECK | draft / published / archived |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

#### enrollments
수강신청 기록

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| learner_id | UUID | PK, FK → users(id) | 학습자 ID |
| course_id | UUID | PK, FK → courses(id) | 코스 ID |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() | 수강신청일시 |

---

### Assignment Tables

#### assignments
과제 정보

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 과제 ID |
| course_id | UUID | NOT NULL, FK → courses(id) | 코스 ID |
| title | TEXT | NOT NULL | 과제 제목 |
| description | TEXT | | 과제 설명 |
| due_date | TIMESTAMPTZ | NOT NULL | 마감일 |
| weight | INTEGER | NOT NULL, CHECK (0~100) | 점수 비중 |
| allow_late | BOOLEAN | NOT NULL, DEFAULT false | 지각 허용 여부 |
| allow_resubmission | BOOLEAN | NOT NULL, DEFAULT false | 재제출 허용 여부 |
| status | TEXT | NOT NULL, DEFAULT 'draft', CHECK | draft / published / closed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 |

#### submissions
제출물

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 제출물 ID |
| assignment_id | UUID | NOT NULL, FK → assignments(id) | 과제 ID |
| learner_id | UUID | NOT NULL, FK → users(id) | 학습자 ID |
| text | TEXT | NOT NULL | 제출 텍스트 |
| link | TEXT | | 제출 링크 (URL) |
| status | TEXT | NOT NULL, DEFAULT 'submitted', CHECK | submitted / graded / resubmission_required |
| late | BOOLEAN | NOT NULL, DEFAULT false | 지각 여부 |
| submitted_at | TIMESTAMPTZ | DEFAULT NOW() | 제출일시 |
| | | UNIQUE (assignment_id, learner_id, submitted_at) | 재제출 구분 |

#### grades
성적 & 피드백

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| submission_id | UUID | PK, FK → submissions(id) | 제출물 ID |
| score | INTEGER | NOT NULL, CHECK (0~100) | 점수 |
| feedback | TEXT | NOT NULL | 피드백 |
| graded_at | TIMESTAMPTZ | DEFAULT NOW() | 채점일시 |

---

### Operation Tables (Optional)

#### reports
신고 관리

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 신고 ID |
| target_type | TEXT | NOT NULL | 신고 대상 타입 |
| target_id | UUID | NOT NULL | 신고 대상 ID |
| reporter_id | UUID | NOT NULL, FK → users(id) | 신고자 ID |
| reason | TEXT | NOT NULL | 신고 사유 |
| content | TEXT | | 신고 내용 |
| status | TEXT | NOT NULL, DEFAULT 'received', CHECK | received / investigating / resolved |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 신고일시 |

#### categories
카테고리 메타데이터

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 카테고리 ID |
| name | TEXT | NOT NULL, UNIQUE | 카테고리명 |
| active | BOOLEAN | NOT NULL, DEFAULT true | 활성화 여부 |

#### difficulties
난이도 메타데이터

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 난이도 ID |
| name | TEXT | NOT NULL, UNIQUE | 난이도명 |
| active | BOOLEAN | NOT NULL, DEFAULT true | 활성화 여부 |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_learner ON submissions(learner_id);
```

---

## 주요 정책 요약

### 1. 사용자 역할
- `learner`: 코스 수강, 과제 제출, 성적 조회
- `instructor`: 코스/과제 생성·관리, 제출물 채점

### 2. 코스 상태
- `draft`: 작성 중 (instructor만 접근)
- `published`: 공개 (수강신청 가능)
- `archived`: 보관 (신규 수강 차단)

### 3. 과제 상태
- `draft`: 작성 중 (learner에게 미노출)
- `published`: 게시 (제출 가능)
- `closed`: 마감 (제출 불가, 채점만 가능)

### 4. 제출물 상태
- `submitted`: 제출 완료 (채점 대기)
- `graded`: 채점 완료
- `resubmission_required`: 재제출 요청

### 5. 지각 & 재제출 정책
- `allow_late`: 마감일 이후 제출 허용 → `late=true`
- `allow_resubmission`: 재제출 허용 → 동일 assignment_id에 새 submission 생성
