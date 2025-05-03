import React, { useState, useEffect } from "react";
import { ExamAPI, Question, Exam } from "@/services/teacher/Teacher";
import { Card, List, Tag, Typography, Spin, Alert } from "antd";
import QuestionComponent from "@/pages/giaovien/QuanLyCauHoi/Question";

const { Title, Paragraph } = Typography;

interface ViewExamDetailProps {
  _id: string;
}

const ViewExamDetail: React.FC<ViewExamDetailProps> = ({ _id }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      if (_id) {
        try {
          const response = await ExamAPI.getDetailExam(_id);
          setExam(response.data);
        } catch (err) {
          setError("Lỗi khi lấy thông tin Đề Thi");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Không tìm thấy id Đề Thi");
        setLoading(false);
      }
    };
    fetchExam();
  }, [_id]);

  if (loading) {
    return <Spin tip="Đang tải thông tin Đề Thi..." />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!exam) {
    return <Alert message="Không tìm thấy thông tin Đề Thi" type="warning" />;
  }

  return (
    <Card title={exam.title} style={{ margin: "16px" }}>
      <Paragraph>
        {exam.description || "Không có mô tả cho Đề Thi này"}
      </Paragraph>
      <Paragraph>
        <strong>Thời giản:</strong> {exam.duration} phút
      </Paragraph>
      <Paragraph>
        <strong>Bắt đầu:</strong> {new Date(exam.startTime).toLocaleString()}
      </Paragraph>
      <Paragraph>
        <strong>Kết thúc:</strong>{" "}
        {exam.endTime ? new Date(exam.endTime).toLocaleString() : "Chưa có"}
      </Paragraph>
      <Paragraph>
        <strong>Hiển thị:</strong> {exam.isPublic ? "Công khai" : "Riêng tư"}
      </Paragraph>

      {exam.updatedAt && (
        <Paragraph>
          <strong>Ngày cập nhật:</strong>{" "}
          {new Date(exam.updatedAt).toLocaleString()}
        </Paragraph>
      )}
      <Title level={4}>Danh sách câu hỏi:</Title>
      {exam.questions && exam.questions.length > 0 ? (
        <List
          dataSource={exam.questions as Question[]}
          renderItem={(question: Question, index) => (
            <List.Item key={question._id || index}>
              <div style={{ width: "100%" }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>
                    {index + 1}.{" "}
                    {question.content.length > 200
                      ? question.content.slice(0, 200) + " ..."
                      : question.content}
                  </strong>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Tag
                    color={
                      question.level === "easy"
                        ? "green"
                        : question.level === "medium"
                        ? "gold"
                        : question.level === "hard"
                        ? "red"
                        : "default"
                    }
                  >
                    {question.level}
                  </Tag>
                  {question.subject && (
                    <Tag color="blue">{question.subject}</Tag>
                  )}
                  {question.knowledge && (
                    <Tag color="cyan">{question.knowledge}</Tag>
                  )}
                </div>
                <QuestionComponent
                  deletetalbe={false}
                  question={question}
                  onUpdateSuccess={() => {}}
                  questionType={question.questionType || ""}
                />
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Paragraph>Không có câu hỏi nào.</Paragraph>
      )}
    </Card>
  );
};

export default ViewExamDetail;
