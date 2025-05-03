import { ExamAPIStudent } from "@/services/student";
import { Exam } from "@/services/teacher/Teacher";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Typography, Row, Col, Button, Space } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleTwoTone,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { KetQua } from "../KetQua";

const { Title, Text } = Typography;

export const DetailExam = () => {
  const { _id } = useParams<{ _id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isPracticed, setIsPracticed] = useState(false);

  const navigate = useNavigate();

  const fetchExam = async () => {
    const response = await ExamAPIStudent.getDetailExam(_id ?? "");
    if (response.code === 200) {
      setExam(response.exam);
      setQuestionCount(response.exam.questions.length);
      setIsPracticed(response.exam.hasDone);
    }
  };

  const handleJoinExam = async () => {
    const res = await ExamAPIStudent.joinExam(exam?._id ?? "");
    if (res.code === 200) navigate(`/KyThi/BaiLam/`);
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString() : "Không giới hạn thời gian";

  useEffect(() => {
    fetchExam();
  }, [_id]);

  return (
    <div className="container mt-4">
      {exam ? (
        <Card
          bordered
          style={{
            maxWidth: 800,
            margin: "0 auto",
            borderRadius: 10,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Title level={3} style={{ textAlign: "center" }}>
              {exam.title}{" "}
              {isPracticed && <CheckCircleTwoTone twoToneColor="#52c41a" />}
            </Title>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text>
                  <CalendarOutlined /> <strong>Thời gian bắt đầu:</strong>
                </Text>
                <br />
                <Text type="secondary">
                  {formatDate(exam.startTime as unknown as string)}
                </Text>
              </Col>
              <Col span={12}>
                <Text>
                  <CalendarOutlined /> <strong>Thời gian kết thúc:</strong>
                </Text>
                <br />
                <Text type="secondary">
                  {formatDate(exam.endTime as unknown as string)}
                </Text>
              </Col>

              <Col span={12}>
                <Text>
                  <QuestionCircleOutlined /> <strong>Số câu hỏi:</strong>
                </Text>
                <br />
                <Text type="secondary">{questionCount}</Text>
              </Col>
              <Col span={12}>
                <Text>
                  <ClockCircleOutlined /> <strong>Thời gian làm bài:</strong>
                </Text>
                <br />
                <Text type="secondary">{exam.duration} phút</Text>
              </Col>

              <Col span={12}>
                <Text>
                  <strong>Lớp:</strong>
                </Text>
                <br />
                <Text type="secondary">{exam.class}</Text>
              </Col>
              <Col span={12}>
                <Text>
                  <strong>Chủ đề:</strong>
                </Text>
                <br />
                <Text type="secondary">
                  {exam.topic?.join(", ") || "Không có"}
                </Text>
              </Col>
              <Col span={24}>
                <Text>
                  <strong>Kiến thức:</strong>
                </Text>
                <br />
                <Text type="secondary">
                  {exam.knowledge?.join(", ") || "Không có"}
                </Text>
              </Col>
            </Row>

            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={handleJoinExam}
              style={{ width: "100%", borderRadius: 6 }}
            >
              Làm bài
            </Button>

            <KetQua DeThi={exam._id} />
          </Space>
        </Card>
      ) : (
        <center>
          <Text>Đang tải thông tin Đề Thi...</Text>
        </center>
      )}
    </div>
  );
};

export default DetailExam;
