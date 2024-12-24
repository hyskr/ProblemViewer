export interface Database {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string;
          title: string;
          created_at: string;
        };
      };
      exam_sections: {
        Row: {
          id: string;
          exam_id: string;
          title: string;
          order: number;
          created_at: string;
        };
      };
      exam_section_questions: {
        Row: {
          id: string;
          section_id: string;
          typeid: number;
          body: string;
          options: any;
          correct_ans: string | null;
          order: number;
          created_at: string;
        };
      };
      user_submissions: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          answer: string;
          created_at: string;
        };
      };
    };
  };
}