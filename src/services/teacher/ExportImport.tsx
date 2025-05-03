import { request } from "@/config/request";

export interface AnswerExport {
  text: string;
  isCorrect?: boolean;
}

export interface QuestionMultichoice {
  content: string;
  answers: AnswerExport[];
}

export interface QuestionFillInBlank {
  content: string;
}

export interface ListeningQuestion {
  content: string;
  answers: AnswerExport[];
}

export interface QuestionListening {
  transcript: string;
  audio: string;
  questions: ListeningQuestion[];
}
export interface ExamDataExport {
  slug?: string;
  title: string;
  description: string;
  school: string;
  department: string;
  subject: string;
  teacher: string;
  code: string;
  duration: number;
  comments: string;

}
export const ExportAPI = {
  exportWord: async (examDataExport: ExamDataExport) => {
    console.log("Exporting exam data:", examDataExport);
    const response = await request.post(
      `/teacher/exam/export-exam`,
      examDataExport
    );
    return response.data;
  },
};
