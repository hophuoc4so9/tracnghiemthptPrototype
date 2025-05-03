import { Passage } from "@/services/teacher/Teacher";

export interface Answer {
  _id: string;
  correctAnswerForBlank: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  detailsFetched?: Question | undefined;
  passageId?: Passage;
  _id: string;
  content: string;
  level: string;
  answers: Answer[];
  correctAnswerForTrueFalseNGV?: string;
  subject: string;
  knowledge: string;
  translation: string;
  explanation: string;
  createdAt: string;
  __v: number;
  deleted: boolean;
  questionType: string;
  audioInfo?: {
    filePath: string;
    description: string;
    transcription: string;
  };
}

export interface Audio {
  deletedAt: string | null;
  isDeleted: boolean;
  _id: string;
  filePath: string;
  description: string;
  transcription: string;
  createdAt: string;
}

export interface ListeningQuestion {
  _id: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options: {
    option_id: string;
    optionText: string;
    _id: string;
  }[];
  correctAnswer: {
    answer_id: string;
    answer: string;
    _id: string;
  }[];
  blankAnswer?: string; // Optional field for fill-in-the-blank questions
  difficulty: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ListeningExam {
  _id: string;
  teacherId: string;
  title: string;
  description: string;
  audio: Audio;
  questions: ListeningQuestion[];
  duration: number;
  difficulty: string;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  createdBy: string;
  listeningExams: ListeningExam[];
  class: "10" | "11" | "12"; // Class level
  topic: string[]; // Topics covered in the exam
  knowledge: string[]; // Knowledge areas covered in the exam
  createdAt: string;
  slug: string;
  __v: number;
}

export interface Result {
  _id: string;
  examId: Exam;
  userId: string;
  score: number;
  correctAnswer: number;
  wrongAnswer: number;
  isDeleted: boolean;
  suggestionQuestion: any[];
  isCompleted: boolean;
  endTime: string;
  questions: any[];
  listeningQuestions: any[];
  createdAt: string;
  __v: number;
}

export interface GetDontCompletedExamResponse {
  code: number;
  message: string;
  results: Result | null;
}
