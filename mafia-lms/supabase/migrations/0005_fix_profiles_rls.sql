-- =====================================================
-- Fix RLS Policies for Profiles and Enrollments
-- =====================================================

-- 1. Fix Profiles RLS
-- Drop the old restrictive policy first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Allow users to view their own profile and instructors to view enrolled learners profiles
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.learner_id = profiles.user_id
      AND c.instructor_id = auth.uid()
    )
  );

-- 2. Fix Enrollments RLS
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Learners can view their own enrollments" ON enrollments;

-- Allow learners to view their own enrollments and instructors to view enrollments for their courses
CREATE POLICY "Users can view enrollments"
  ON enrollments FOR SELECT
  USING (
    auth.uid() = learner_id
    OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = enrollments.course_id
      AND c.instructor_id = auth.uid()
    )
  );
