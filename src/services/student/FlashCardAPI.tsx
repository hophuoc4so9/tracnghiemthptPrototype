import { request } from "@/config/request";

export interface FlashCardExam {
    _id?: string;
    title: string;
    flashCardSetId: string; 
    examType: Array<"true false" | "multiple choices" | "written" | "match">;
    createdBy: string;
    deleted?: boolean;
  }
  
  export interface FlashCardResult {
    _id?: string;
    flashCardExamId: string;
    score: number;
    correctAnswer: number;
    wrongAnswer: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface FlashCardSet {
    _id?: string;
    idSet?: string;
    title: string;
    description?: string;
    vocabs: string[] | Vocab[]; 
    deleted?: boolean;
    createdBy: string;
    public?: boolean;
    editable?: boolean;
    password?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Vocab {
    _id?: string;
    term: string;
    definition: string;
    image?: string;
    deleted?: boolean;
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
  }
export const FlashCardAPI = {
  getAllFlashCardSets: async () => {
    const response = await request.get(`/flashcard`);
    return response.data;
  },

  getFlashCardSetDetail: async (idSet: string) => {
    const response = await request.get(`/flashcard/${idSet}`);
    return response.data;
  },

  createFlashCardSet: async (data: FlashCardSet) => {
    const response = await request.post(`/flashcard/create`, data);
    return response.data;
  },

  updateFlashCardSet: async (idSet: string, data: Partial<FlashCardSet>) => {
    const response = await request.patch(`/flashcard/${idSet}`, data);
    return response.data;
  },

  deleteFlashCardSet: async (idSet: string) => {
    const response = await request.delete(`/flashcard/${idSet}`);
    return response.data;
  },
};
