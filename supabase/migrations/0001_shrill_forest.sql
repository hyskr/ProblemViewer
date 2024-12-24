/*
  # Complete exam system schema

  1. Tables Structure
    - `exams`: Main exam table
    - `exam_sections`: Sections within exams
    - `exam_section_questions`: Questions within sections
    - `user_submissions`: User answers and submissions
*/

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create exam sections table
CREATE TABLE IF NOT EXISTS exam_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    title text NOT NULL,
    "order" integer NOT NULL CHECK ("order" >= 0),
    created_at timestamptz DEFAULT now(),
    UNIQUE(exam_id, "order")
);

-- Create exam section questions table
CREATE TABLE IF NOT EXISTS exam_section_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
    typeID integer NOT NULL CHECK (typeID BETWEEN 0 AND 2),
    body text NOT NULL,
    options jsonb,
    correct_ans text,
    "order" integer NOT NULL CHECK ("order" >= 0),
    created_at timestamptz DEFAULT now(),
    UNIQUE(section_id, "order")
);

-- Create user submissions table
CREATE TABLE user_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL REFERENCES exam_section_questions(id) ON DELETE CASCADE,
    user_id varchar(8) NOT NULL CHECK (user_id ~ '^\d{8}$'),
    answer text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(question_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX exam_sections_exam_id_idx ON exam_sections(exam_id);
CREATE INDEX exam_sections_order_idx ON exam_sections("order");
CREATE INDEX exam_section_questions_section_id_idx ON exam_section_questions(section_id);
CREATE INDEX exam_section_questions_typeid_idx ON exam_section_questions(typeID);
CREATE INDEX exam_section_questions_order_idx ON exam_section_questions("order");
CREATE INDEX user_submissions_question_id_idx ON user_submissions(question_id);
CREATE INDEX user_submissions_user_id_idx ON user_submissions(user_id);

-- Add descriptive comments
COMMENT ON TABLE exams IS '试卷表';
COMMENT ON TABLE exam_sections IS '试卷章节表';
COMMENT ON TABLE exam_section_questions IS '试卷章节题目表';
COMMENT ON TABLE user_submissions IS '用户提交答案表';

COMMENT ON COLUMN exam_section_questions.correct_ans IS '正确答案';
COMMENT ON COLUMN user_submissions.question_id IS '题目ID';
COMMENT ON COLUMN user_submissions.user_id IS '用户ID';
COMMENT ON COLUMN user_submissions.answer IS '用户提交的答案';