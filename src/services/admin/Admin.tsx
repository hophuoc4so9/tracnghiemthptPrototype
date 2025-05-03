import { request } from "@/config/request";

export interface VerificationRequest {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define the API functions
export const AdminAPI = {
  getVerificationRequests: async (): Promise<VerificationRequest[]> => {
    const response = await request.get("/admin/verification-teacher");
    return response.data;
  },

  getDetailVerificationRequest: async (requestId: string): Promise<VerificationRequest> => {
    const response = await request.get(`/admin/verification-teacher/detail/${requestId}`);
    return response.data;
  },

  approveTeacher: async (requestId: string): Promise<void> => {
    await request.post(`/admin/verification-teacher/approve/${requestId}`);
  },

  rejectTeacher: async (requestId: string): Promise<void> => {
    await request.post(`/admin/verification-teacher/reject/${requestId}`);
  },
};

