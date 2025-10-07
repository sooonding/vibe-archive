-- =====================================================
-- Mafia LMS Database Schema Migration
-- =====================================================

-- =====================================================
-- 1. Core User Tables
-- =====================================================

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('learner', 'instructor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Terms acceptance history
CREATE TABLE terms_acceptance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. Course Tables
-- =====================================================

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE enrollments (
  learner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (learner_id, course_id)
);

-- =====================================================
-- 3. Assignment Tables
-- =====================================================

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100),
  allow_late BOOLEAN NOT NULL DEFAULT false,
  allow_resubmission BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
  late BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, learner_id, submitted_at)
);

-- Grades and feedback
CREATE TABLE grades (
  submission_id UUID PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT NOT NULL,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. Operation Tables (Optional)
-- =====================================================

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'investigating', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category metadata
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Difficulty metadata
CREATE TABLE difficulties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true
);

-- =====================================================
-- 5. Indexes for Performance
-- =====================================================

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_learner ON submissions(learner_id);

-- =====================================================
-- 6. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulties ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Terms acceptance policies
CREATE POLICY "Users can view their own terms acceptance"
  ON terms_acceptance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own terms acceptance"
  ON terms_acceptance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published' OR instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    auth.uid() = instructor_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

CREATE POLICY "Instructors can update their own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own courses"
  ON courses FOR DELETE
  USING (auth.uid() = instructor_id);

-- Enrollments policies
CREATE POLICY "Learners can view their own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = learner_id);

CREATE POLICY "Learners can enroll in published courses"
  ON enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = learner_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'learner') AND
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND status = 'published')
  );

CREATE POLICY "Learners can unenroll from courses"
  ON enrollments FOR DELETE
  USING (auth.uid() = learner_id);

-- Assignments policies
CREATE POLICY "Published assignments are viewable by enrolled learners"
  ON assignments FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (SELECT 1 FROM enrollments WHERE course_id = assignments.course_id AND learner_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM courses WHERE id = assignments.course_id AND instructor_id = auth.uid())
  );

CREATE POLICY "Instructors can create assignments for their courses"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid())
  );

CREATE POLICY "Instructors can update their course assignments"
  ON assignments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid())
  );

CREATE POLICY "Instructors can delete their course assignments"
  ON assignments FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid())
  );

-- Submissions policies
CREATE POLICY "Learners can view their own submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = learner_id
    OR
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = submissions.assignment_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Learners can submit to published assignments"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = learner_id AND
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN enrollments e ON a.course_id = e.course_id
      WHERE a.id = assignment_id AND a.status = 'published' AND e.learner_id = auth.uid()
    )
  );

-- Grades policies
CREATE POLICY "Learners can view their own grades"
  ON grades FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND learner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.id = submission_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can grade submissions for their courses"
  ON grades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.id = submission_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update grades for their courses"
  ON grades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.id = submission_id AND c.instructor_id = auth.uid()
    )
  );

-- Reports policies (basic - can be extended with operator role)
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Categories and difficulties policies
CREATE POLICY "Everyone can view active categories"
  ON categories FOR SELECT
  USING (active = true);

CREATE POLICY "Everyone can view active difficulties"
  ON difficulties FOR SELECT
  USING (active = true);

-- =====================================================
-- 7. Triggers for auto-updating timestamps
-- =====================================================

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

-- =====================================================
-- 8. Initial seed data (optional)
-- =====================================================

INSERT INTO categories (name, active) VALUES
  ('Programming', true),
  ('Design', true),
  ('Business', true),
  ('Data Science', true);

INSERT INTO difficulties (name, active) VALUES
  ('Beginner', true),
  ('Intermediate', true),
  ('Advanced', true);
