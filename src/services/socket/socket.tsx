import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); 

socket.on("connect", () => {
});

const reportError = (errorData) => {
  socket.emit("REPORT_ERROR", errorData);

  // Lắng nghe phản hồi từ server
  socket.on("REPORT_SUCCESS", (response) => {
    console.log(response.message); // Báo cáo lỗi thành công
  });

  socket.on("error", (error) => {
    console.error(error.message); // Xử lý lỗi nếu có
  });
};

// Dữ liệu báo cáo lỗi
const errorData = {
  description: "Câu hỏi không có đáp án đúng",
  questionId: "12345",
  examId: "67890",
  userId: "user123",
  additionalInfo: "Chi tiết bổ sung về lỗi",
};

reportError(errorData);