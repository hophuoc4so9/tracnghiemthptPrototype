import { request } from "@/config/request";

export interface Classroom {
  _id?: string;
  title: string;
  teacherId: string;
  students: string[];
  password?: string;
  exams: string[];
  isDeleted?: boolean;
  status: 'active' | 'inactive' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
  deleted: boolean;
  status: string;
  __v: number;
}

export const ClassroomAPI = {
  createClassroom: async (classroomData: Classroom) => {
    const response = await request.post("/teacher/classroom/create", classroomData);
    return response.data;
  },
  getAllClassrooms: async () => {
    const response = await request.get("/teacher/classroom/all");
    return response.data;
  },
  getClassroomById: async (classroomId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}`);
    return response.data;
  },
  updateClassroom: async (classroomId: string, updateData: Partial<Classroom>) => {
    const response = await request.patch(`/teacher/classroom/update/${classroomId}`, updateData);
    return response.data;
  },
  deleteClassroom: async (classroomId: string) => {
    const response = await request.delete(`/teacher/classroom/delete/${classroomId}`);
    return response.data;
  },
  addStudentsToClassroom: async (classroomId: string, studentIds: string[]) => {
    const response = await request.patch(`/teacher/classroom/add_students/${classroomId}`, { studentIds });
    return response.data;
  },
  removeStudentFromClassroom: async (classroomId: string, studentId: string) => {
    const response = await request.delete(`/teacher/classroom/delete_student/${classroomId}/${studentId}`);
    return response.data;
  },
  removeStudentsFromClassroom: async (classroomId: string, studentIds: string[]) => {
    const response = await request.delete(`/teacher/classroom/remove_students/${classroomId}`, { data: { studentIds } });
    return response.data;
  },
  addExamToClassroom: async (classroomId: string, examId: string) => {
    const response = await request.patch(`/teacher/classroom/add_exam/${classroomId}/${examId}`);
    return response.data;
  },
  removeExamFromClassroom: async (classroomId: string, examId: string) => {
    const response = await request.delete(`/teacher/classroom/remove_exam/${classroomId}/${examId}`);
    return response.data;
  },
  getAllStudents: async () => {
    const response = await request.get("/teacher/classroom/allStudents");
    return response.data;
  },
  getAllStudentResults: async (classroomId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}/results`);
    return response.data;
  },
  getAllStudentResultsbyExam: async (classroomId: string, examId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}/exam/${examId}/results`);
    return response.data;
  },
  downloadStudentResultsExcel: async (classroomId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}/results/excel`, { responseType: 'blob' });
    return response.data;
  },
  getAllResultsForExamInClassroom: async (classroomId: string, examId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}/exam/${examId}/all-results`);
    return response.data;
  },
  getStudentResultsForAllExamsInClassroom: async (classroomId: string, studentId: string) => {
    const response = await request.get(`/teacher/classroom/${classroomId}/student/${studentId}/all-results`);
    return response.data;
  },
  getSpecificExamResult: async (_id: string) => {
    const response = await request.get(`/teacher/classroom/exam/${_id}`);
    return response.data;
  }
};
