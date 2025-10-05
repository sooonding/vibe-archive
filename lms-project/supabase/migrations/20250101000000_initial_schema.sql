-- ========================================
-- LMS Initial Schema Migration
-- ========================================

-- ========================================
-- 1. 사용자 & 인증
-- ========================================

-- 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor')),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 약관 동의
CREATE TABLE terms_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. 코스
-- ========================================

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  curriculum TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);

-- ========================================
-- 3. 수강 등록
-- ========================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, course_id)
);

CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ========================================
-- 4. 과제
-- ========================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
  allow_late BOOLEAN NOT NULL DEFAULT FALSE,
  allow_resubmission BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- ========================================
-- 5. 제출물
-- ========================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  link VARCHAR(500),
  status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
  late BOOLEAN NOT NULL DEFAULT FALSE,
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, learner_id)
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_learner ON submissions(learner_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- ========================================
-- 6. 신고 (운영)
-- ========================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('course', 'assignment', 'submission', 'user')),
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  content TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'investigating', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- ========================================
-- 7. 메타데이터 (운영)
-- ========================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ========================================
-- 8. 트리거: updated_at 자동 갱신
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. Row Level Security (RLS) 정책
-- ========================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- terms_agreements: 본인 동의만 조회/생성
CREATE POLICY "Users can view own terms agreements"
  ON terms_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own terms agreements"
  ON terms_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- courses: 모든 사용자가 published 코스 조회 가능, instructor만 본인 코스 관리
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published' OR instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = instructor_id);

-- enrollments: learner만 본인 수강신청 관리, instructor는 본인 코스 수강생 조회
CREATE POLICY "Learners can view own enrollments"
  ON enrollments FOR SELECT
  USING (
    auth.uid() = learner_id
    OR EXISTS (
      SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Learners can create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Learners can delete own enrollments"
  ON enrollments FOR DELETE
  USING (auth.uid() = learner_id);

-- assignments: 수강생은 본인이 수강하는 코스의 published 과제만, instructor는 본인 코스 과제 관리
CREATE POLICY "Users can view relevant assignments"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.instructor_id = auth.uid()
    )
    OR (
      status = 'published'
      AND EXISTS (
        SELECT 1 FROM enrollments WHERE enrollments.course_id = assignments.course_id AND enrollments.learner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Instructors can manage own course assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- submissions: learner는 본인 제출물만, instructor는 본인 코스 제출물만
CREATE POLICY "Users can view relevant submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = learner_id
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = submissions.assignment_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Learners can create own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Learners can update own submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = learner_id)
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Instructors can update submissions for their courses"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = submissions.assignment_id AND c.instructor_id = auth.uid()
    )
  );

-- reports: 본인이 작성한 신고만 조회/생성
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- categories, levels: 모든 사용자가 조회 가능 (관리는 별도 admin 권한 필요)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view levels"
  ON levels FOR SELECT
  USING (true);

-- ========================================
-- 10. 초기 데이터
-- ========================================

-- 기본 난이도
INSERT INTO levels (name) VALUES
  ('beginner'),
  ('intermediate'),
  ('advanced');

-- 기본 카테고리 (예시)
INSERT INTO categories (name) VALUES
  ('Programming'),
  ('Design'),
  ('Business'),
  ('Marketing'),
  ('Data Science');
