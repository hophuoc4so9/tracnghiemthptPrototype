import { request } from "@/config/request";


export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  deleted: boolean;
  status: string;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  questions: string[];
  duration: number;
  isPublic: boolean;
  createdAt: string;
  slug: string;
  endTime: string;
  startTime: string;
  createdBy?: string;
  class?: "10" | "11" | "12";
  topic?: string[];
  knowledge?: string[];
  listeningExams?: string[]; // Array of ListeningExam IDs
}

export interface ClassroomReponse {
  _id: string;
  title: string;
  teacherId: User;
  students: User[];
  password: string;
  exams: Exam[];
  isDeleted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const studentClassroomAPI = {
  // Tham gia lớp học
  joinClassroom: async (classroomId: string, password: string) => {
    const response = await request.post('/classroom/join', {
      classroomId,
      password,
    });
    return response.data;
  },

  // // Lấy danh sách lớp học hiện có
  // getAllClassrooms: async () => {
  //   const response = await request.get('/classroom/list');
  //   return response.data;
  // },

  // Lấy bài kiểm tra trong lớp học cụ thể
  getClassroomTests: async (classroomId: string) => {
    const response = await request.get(`/classroom/${classroomId}/tests`);
    return response.data;
  },

  // Lấy thông tin lớp học cụ thể
  getClassroomById: async (classroomId: string) => {
    const response = await request.get(`/classroom/${classroomId}`);
    return response.data;
  },

  // Lấy danh sách lớp học mà học sinh đã tham gia
  getStudentClassrooms: async () => {
    const response = await request.get(`/classroom/`);
    return response.data;
  },
};