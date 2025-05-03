import { request } from "@/config/request";
import { Exam, Question } from "../teacher/Teacher";

export interface Result {
  _id?: string;
  examId: string | Exam;
  userId?: string;
  score: number;
  correctAnswer: number;
  wrongAnswer: number;
  totalQuestion: number;
  questions: QuestionAnswerResult[];
  listeningQuestions: QuestionAnswerResult[];
  suggestionQuestion: Question[];
  isCompleted: boolean;
  endTime: string;
  createdAt: Date;
  isDeleted: boolean;
  wrongAnswerByKnowledge: Record<string, number>;
}

export interface AnswerResult {
  _id: string;
  text: string;
  correctAnswerForBlank?: string;
  isCorrect: boolean;
}

export interface QuestionAnswerResult {
  _id: string;
  questionId: string;
  content: string;
  answers: AnswerResult[];
  selectedAnswerId?: string;
  userAnswers: UserAnswer[];
  isCorrect: boolean;
  correctAnswerForTrueFalseNGV?: string;
}

interface UserAnswer {
  userAnswer: string;
  answerId?: string;
  isCorrect: boolean;
  _id: string;
}

export interface SubmitAnswer {
  resultId: string;
  answers: SubmitAnswerDetail[];
  unansweredQuestions: SubmitAnswerDetail[];
  listeningAnswers: SubmitAnswerDetail[];
}

export interface SubmitAnswerDetail {
  questionId: string;
  selectedAnswerId?: string;
  userAnswer?: string[];
}

export const ResultAPI = {
  getAllResult: async (page: number) => {
    const response = await request.get(`/result/?page=${page}`);
    return response.data;
  },
  getDetailResult: async (id: string) => {
    const response = await request.get(`/result/${id}`);
    return response.data;
  },
  submitAnswer: async (data: SubmitAnswer) => {
    const response = await request.post("/result/submit", data);
    return response.data;
  },
  getWrongAnswers: async (id: string) => {
    const response = await request.get(`/result/wrong-questions/${id}`);
    return response.data;
  },
  getInCompletedExam: async () => {
    const response = await request.get(`/result/check-incomplete-exams/`);
    return response.data;
  },
  saveAnswer: async (data: SubmitAnswer) => {
    const response = await request.post(`/result/save`, data);
    return response.data;
  },
  
};

export const ExamAPIStudent = {
  getAllExam: async (page: number) => {
    const response = await request.get(`/exam/?page=${page}`);
    return response.data;
  },
  getAllExam1000: async (page: number) => {
    const response = await request.get(`/exam/?limit=10&?page=${page}`);
    return response.data;
  },
  getDetailExam: async (slug: string) => {
    const response = await request.get(`/exam/detail/${slug}`);
    return response.data;
  },
  joinExam: async (id: string) => {
    const response = await request.get(`/exam/exam-practice/${id}`);
    return response.data;
  },
};

export const QuestionAPIStudent = {
  getQuestionForStudent: async (questionId: string) => {
    const response = await request.get(`/question/student/${questionId}`);
    return response.data;
  },
};
