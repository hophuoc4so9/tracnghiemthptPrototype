import { request } from "@/config/request";

interface Teacher {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
  __v: number;
  deleted: boolean;
  status: string;
}

interface Audio {
  deletedAt: string | null;
  isDeleted: boolean;
  _id: string;
  filePath: string;
  description: string;
  transcription: string;
  createdAt: string;
}

interface Option {
  option_id: string;
  optionText: string;
  _id: string;
}

interface CorrectAnswer {
  answer_id: string;
  answer: string;
  _id: string;
}

interface Question {
  _id: string;
  teacherId: string;
  questionText: string;
  questionType: string;
  options: Option[];
  correctAnswer: CorrectAnswer[];
  correctAnswerForTrueFalseNGV?: string;
  difficulty: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Exam {
  _id: string;
  teacherId: Teacher;
  title: string;
  description: string;
  audio: Audio;
  questions: Question[];
  duration: number;
  difficulty: string;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GetListeningExamsResponse {
  code: number;
  exams: Exam[];
  currentPage: number;
  totalItems: number;
  totalPage: number;
  limitItems: number;
  hasNextPage: boolean;
}

export const studentListeningApi = {
  getListeningExams: async (): Promise<GetListeningExamsResponse> => {
    const response = await request.get<GetListeningExamsResponse>("/listening-exam");
    return response.data;
  },
};