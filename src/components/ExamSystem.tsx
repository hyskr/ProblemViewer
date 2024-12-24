import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DOMPurify from 'dompurify';
import { BarChart3, ChevronLeft, ChevronRight, Send, UserCircle2, Users, Menu } from 'lucide-react';
import { QuestionStats } from './QuestionStats';
import { SubjectiveAnswers } from './SubjectiveAnswers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionList } from './QuestionList';

interface Exam {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
  order: number;
}

interface Question {
  id: string;
  body: string;
  typeid: number;
  options: any;
  correct_ans: string | null;
  order: number;
}

interface QuestionStats {
  optionCounts: Record<string, number>;
  totalResponses: number;
}

export function ExamSystem() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [showIdInput, setShowIdInput] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>(''); 
  const [stats, setStats] = useState<Record<string, QuestionStats>>({});
  const [hideStats, setHideStats] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState<{ answer: string; user_id: string }[]>([]);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  // const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  // Add auto-refresh interval for stats
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      questions.forEach(question => {
        if (!hideStats[question.id]) {
          fetchQuestionStats(question.id);
        }
      });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(refreshInterval);
  }, [hideStats, questions]);

  useEffect(() => {
    fetchExams();
    const savedId = localStorage.getItem('studentId');
    if (savedId) {
      setStudentId(savedId);
      setShowIdInput(false);
    }
  }, []);

  const handleStudentIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.length === 8 && /^\d+$/.test(studentId)) {
      localStorage.setItem('studentId', studentId);
      setShowIdInput(false);
    } else {
      alert('请输入正确的8位学号！');
    }
  };

  useEffect(() => {
    if (selectedExam) {
      fetchSections(selectedExam);
    } else {
      setSections([]);
      setQuestions([]);
    }
  }, [selectedExam]);

  useEffect(() => {
    if (selectedSection) {
      fetchQuestions(selectedSection);
    } else {
      setQuestions([]); 
    }
  }, [selectedSection]);

  async function fetchExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('id, title')
      .order('created_at');

    if (error) {
      console.error('Error fetching exams:', error);
      return;
    }

    setExams(data);
  }

  async function fetchSections(examId: string) {
    const { data, error } = await supabase
      .from('exam_sections')
      .select('id, title, order')
      .eq('exam_id', examId)
      .order('order');

    if (error) {
      console.error('Error fetching sections:', error);
      return;
    }

    setSections(data);
  }

  async function fetchQuestions(sectionId: string) {
    const { data, error } = await supabase
      .from('exam_section_questions')
      .select('id, body, typeid, options, correct_ans, order')
      .eq('section_id', sectionId)
      .order('order');

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    setQuestions(data);
    // Fetch stats for all questions initially
    data.forEach(question => fetchQuestionStats(question.id));
  }

  async function fetchQuestionStats(questionId: string) {
    const { data: answers, error } = await supabase
      .from('user_submissions')
      .select('answer')
      .eq('question_id', questionId);

    if (error) {
      console.error('Error fetching stats:', error);
      return;
    }

    const optionCounts: Record<string, number> = {};
    let totalResponses = 0;

    answers?.forEach(({ answer }) => {
      answer.split(',').forEach((option: string) => {
        optionCounts[option] = (optionCounts[option] || 0) + 1;
        totalResponses++;
      });
    });

    setStats(prev => ({
      ...prev,
      [questionId]: { optionCounts, totalResponses }
    }));
  }

  const handleAnswerChange = (questionId: string, value: string, isMultiple: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: isMultiple 
        ? (prev[questionId] || []).includes(value)
          ? prev[questionId].filter(v => v !== value)
          : [...(prev[questionId] || []), value]
        : [value]
    }));
  };

  const fetchSubjectiveAnswers = async (questionId: string) => {
    const { data, error } = await supabase
      .from('user_submissions')
      .select('answer, user_id')
      .eq('question_id', questionId);

    if (error) {
      console.error('Error fetching subjective answers:', error);
      return;
    }

    setSubjectiveAnswers(data || []);
    // setSelectedQuestionId(questionId);
    setShowAnswersModal(true);
  };

  const handleSubmit = async (questionId: string) => {
    const answer = answers[questionId]?.join(',');
    const question = questions.find(q => q.id === questionId);
    
    // If it's a subjective question (typeid === 1) and answer is empty, delete the submission
    if (question?.typeid === 1 && (!answer || answer.trim() === '')) {
      const { error: deleteError } = await supabase
        .from('user_submissions')
        .delete()
        .match({ question_id: questionId, user_id: studentId });

      if (deleteError) {
        console.error('Failed to delete submission:', deleteError.message);
        return;
      }

      // Clear the answer in local state
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });

      // Refresh stats after deletion
      fetchQuestionStats(questionId);
      return;
    }

    // For non-subjective questions or non-empty subjective answers
    if (!answer) return;
    
    const { error } = await supabase
      .from('user_submissions')
      .upsert(
        {
          question_id: questionId,
          answer,
          user_id: studentId
        },
        {
          onConflict: 'question_id,user_id',
          ignoreDuplicates: false
        }
      );

    if (error) {
      console.error('Failed to submit answer:', error.message);
      return;
    }

    console.log('Answer submitted successfully');
    // Refresh stats after submission
    fetchQuestionStats(questionId);
  };

  function getQuestionTypeLabel(typeid: number): string {
    switch (typeid) {
      case 0:
        return '单选题';
      case 1:
        return '主观题';
      case 2:
        return '多选题';
      default:
        return '未知类型';
    }
  }

  const toggleStats = (questionId: string) => {
    setHideStats(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    if (!hideStats[questionId]) {
      fetchQuestionStats(questionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-md shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Subjective Answers Modal */}
      {showAnswersModal && (
        <SubjectiveAnswers
          answers={subjectiveAnswers}
          onClose={() => setShowAnswersModal(false)}
        />
      )}

      {/* Student ID Input Dialog */}
      {showIdInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-4 mb-6">
              <UserCircle2 className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">学号验证</h2>
            </div>
            <form onSubmit={handleStudentIdSubmit}>
              <div className="mb-6">
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  请输入您的8位学号
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如: 22271005"
                  maxLength={8}
                  pattern="\d{8}"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                确认
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-80 bg-white border-r p-6 space-y-6 flex-shrink-0 fixed h-screen overflow-y-auto transition-transform duration-300 ease-in-out z-40`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">考试系统</h1>
          <button
            onClick={() => setShowIdInput(true)}
            className="text-gray-600 hover:text-gray-800"
            title="修改学号"
          >
            <UserCircle2 className="w-6 h-6" />
          </button>
        </div>
        <div className="text-sm text-gray-600">
          学号：{studentId}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">选择考试</label>
          <Select
            value={selectedExam}
            onValueChange={(value) => {
              setSelectedExam(value);
              setSelectedSection('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择考试" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedExam && (
          <div>
            <label className="block text-sm font-medium mb-2">选择章节</label>
            <Select
              value={selectedSection}
              onValueChange={(value) => setSelectedSection(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择章节" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedSection && questions.length > 0 && (
          <QuestionList
            questions={questions}
            onQuestionClick={(id) => 
              document.getElementById(`question-${id}`)?.scrollIntoView({ behavior: 'smooth' })
            }
          />
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-8 overflow-auto transition-all duration-300 ease-in-out ${showSidebar ? 'lg:ml-80' : 'ml-0'}`}>
        {selectedSection && questions.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8">
            {questions.map((question, index) => (
              <div 
                key={question.id} 
                id={`question-${question.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                  <h3 className="text-lg font-medium">
                    第 {question.order + 1} 题 - {getQuestionTypeLabel(question.typeid)}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSubmit(question.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>提交</span>
                    </button>
                    <button
                      onClick={() => toggleStats(question.id)}
                      className="text-gray-500 hover:text-gray-700 lg:block hidden"
                      title="查看统计"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <div className="items-center space-x-2 lg:flex hidden">
                      <button
                        disabled={index === 0}
                        onClick={() => document.getElementById(`question-${questions[index - 1].id}`)?.scrollIntoView({ behavior: 'smooth' })}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        disabled={index === questions.length - 1}
                        onClick={() => document.getElementById(`question-${questions[index + 1].id}`)?.scrollIntoView({ behavior: 'smooth' })}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6 space-y-6">
                  {/* Question Body */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">题目内容</h4>
                    <div 
                      className="text-gray-900 prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(question.body)
                      }} 
                    />
                  </div>

                  {/* Options */}
                  {question.typeid === 1 ? (
                    <div className="space-y-4">
                      <textarea
                        value={answers[question.id]?.[0] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, false)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                        placeholder="请输入您的答案..."
                      />
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => fetchSubjectiveAnswers(question.id)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                          <Users className="w-5 h-5" />
                          <span>查看所有回答</span>
                        </button>
                      </div>
                    </div>
                  ) : question.options && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-500">选项</h4>
                        <button
                          onClick={() => toggleStats(question.id)}
                          className={`text-sm font-medium ${!hideStats[question.id] ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-700 flex items-center gap-1`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          {!hideStats[question.id] ? '隐藏统计' : '显示统计'}
                        </button>
                      </div>
                      <div className="grid gap-3">
                        {JSON.parse(question.options).map((option: { key: string; value: string }) => {
                          const questionStats = stats[question.id] || { optionCounts: {}, totalResponses: 0 };
                          const count = questionStats.optionCounts[option.key] || 0;
                          const percentage = questionStats.totalResponses
                            ? Math.round((count / questionStats.totalResponses) * 100)
                            : 0;
                          const showStatsForQuestion = !hideStats[question.id];

                          return (
                          <label
                            key={option.key}
                            className="relative flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer overflow-hidden group"
                          >
                            {showStatsForQuestion && (
                              <div
                                className="absolute inset-0 bg-blue-50 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            )}
                            <div className="relative flex items-center space-x-3 w-full">
                            <input 
                              type={question.typeid === 0 ? "radio" : "checkbox"}
                              name={`question-${question.id}`}
                              value={option.key}
                              checked={(answers[question.id] || []).includes(option.key)}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.typeid === 1)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="flex-grow">
                              <span className="font-medium">{option.key}.</span> {option.value}
                            </span>
                            {showStatsForQuestion && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {count} ({percentage}%)
                              </span>
                            )}
                            </div>
                          </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  {!hideStats[question.id] && stats[question.id] && (
                    <div className="mt-4 pt-3 border-t text-sm text-gray-500 flex justify-between items-center">
                      <span>总回答人数:</span>
                      <span className="font-medium">
                        {Math.round((stats[question.id].totalResponses || 0) / (question.typeid === 1 ? 2 : 1))}
                      </span>
                    </div>
                  )}

                  {/* Correct Answer */}
                  {question.correct_ans && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">正确答案</h4>
                      <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                        {question.correct_ans}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}