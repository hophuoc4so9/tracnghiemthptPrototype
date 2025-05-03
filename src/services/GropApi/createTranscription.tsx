import axios, { AxiosResponse } from 'axios';

interface TranscriptionRequest {
  file: File;
}

const createTranscription = async (request: TranscriptionRequest) => {
  const url = 'https://api.groq.com/openai/v1/audio/transcriptions';
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
  const headers = {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${apiKey}`,
  };

  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('language', 'en');
  formData.append('model', 'whisper-large-v3');
  formData.append('prompt', 'Tạo văn bản tiếng Anh từ file nghe tiếng Anh');
  formData.append('response_format', 'text');
  formData.append('temperature', '0');

  try {
    const response: AxiosResponse = await axios.post(url, formData, { headers });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export default createTranscription;