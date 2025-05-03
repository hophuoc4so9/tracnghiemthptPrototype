import { Exam } from "@/services/teacher/Teacher";
import { Card, Col, Row, Space, Tag, Typography, Input, Select } from "antd";
import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import { ExamAPIStudent } from "@/services/student";
import { useNavigate } from "react-router-dom";
import flex from "antd/es/flex";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export const KyThi = () => {
  const [data, setData] = useState<Exam[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const navigator = useNavigate();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleClassFilter = (value: string | undefined) => {
    setSelectedClass(value);
  };

  const getAllExam = async (page: number) => {
    try {
      const rq = await ExamAPIStudent.getAllExam1000(page);
      if (rq?.code === 200) {
        setData((prev) => {
          const merged = [...(prev || []), ...rq.exams];
          const unique = Array.from(
            new Map(merged.map((i) => [i.slug, i])).values()
          );
          return unique;
        });
        setTotal(rq?.total);
      }
    } catch (error: any) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getAllExam(1);
  }, []);

  useEffect(() => {
    if (total > 1) {
      Promise.all(
        Array.from({ length: total - 1 }, (_, i) => getAllExam(i + 2))
      );
    }
  }, [total]);

  const formatDate = (dateStr?: string) => {
    return dateStr ? new Date(dateStr).toLocaleString() : "Không có";
  };

  const filteredData = data.filter((exam) => {
    const matchesSearch = (exam.title && " ")
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesClass = selectedClass ? exam.class === selectedClass : true;
    return matchesSearch && matchesClass;
  });

  const now = new Date().getTime();
  const ongoing = filteredData.filter((exam) => {
    const start = new Date(exam.startTime).getTime();
    const end = exam.endTime ? new Date(exam.endTime).getTime() : Infinity;
    return start <= now && now <= end;
  });

  const ended = filteredData.filter((exam) => {
    const end = exam.endTime ? new Date(exam.endTime).getTime() : 0;
    return now > end;
  });

  const renderExamList = (exams: Exam[]) => (
    <Row gutter={[16, 16]}>
      {exams.map((exam) => (
        <Col xs={24} sm={12} md={8} lg={6} key={exam._id}>
          <Card
            bordered
            hoverable
            onClick={() => navigator(`/KyThi/ChiTiet/${exam.slug}`)}
            style={{
              borderRadius: 12,
              height: "100%",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ minHeight: 200 }}
            className="exam-card"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                {exam.title}
              </Title>
              <Text type="secondary" ellipsis={{ tooltip: exam.description }}>
                {exam.description}
              </Text>
              <Space wrap size={[8, 8]}>
                <Tag icon={<ClockCircleOutlined />} color="blue">
                  {exam.duration} phút
                </Tag>
                <Tag icon={<CalendarOutlined />} color="green">
                  Bắt đầu: {formatDate(exam.startTime as unknown as string)}
                </Tag>
                <Tag icon={<CalendarOutlined />} color="red">
                  Kết thúc: {formatDate(exam.endTime as unknown as string)}
                </Tag>
                <Tag icon={<QuestionCircleOutlined />} color="purple">
                  {exam.questions?.length ?? 0} câu hỏi
                </Tag>
                <Tag color="gold">Lớp: {exam.class}</Tag>
                {exam.topic?.map((topic, index) => (
                  <Tag color="cyan" key={index}>
                    {topic}
                  </Tag>
                ))}
                {exam.knowledge?.map((knowledge, index) => (
                  <Tag color="magenta" key={index}>
                    {knowledge}
                  </Tag>
                ))}
              </Space>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="container mx-auto p-4">
      <Space
        direction="horizontal"
        size="large"
        style={{
          justifyContent: "center",
          width: "100%",
          minWidth: "700px",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Tìm kiếm theo tiêu đề"
          onSearch={handleSearch}
          enterButton
          style={{
            flex: 1,
            minWidth: "400px",
          }}
        />
        <Select
          placeholder="Lọc theo lớp"
          style={{ flex: 1 }}
          onChange={handleClassFilter}
          allowClear
        >
          <Option value="10">Lớp 10</Option>
          <Option value="11">Lớp 11</Option>
          <Option value="12">Lớp 12</Option>
        </Select>
      </Space>
      <center>
        <Title level={2}>📋 Danh sách Đề Thi</Title>
      </center>

      {ongoing.length > 0 && (
        <>
          <Title level={4} style={{ color: "#52c41a" }}>
            🟢 Đang diễn ra
          </Title>
          {renderExamList(ongoing)}
        </>
      )}

      {ended.length > 0 && (
        <>
          <Title level={4} style={{ color: "#f5222d", marginTop: 32 }}>
            🔴 Đã kết thúc
          </Title>
          {renderExamList(ended)}
        </>
      )}

      {filteredData.length === 0 && (
        <center>
          <Text type="secondary">Không có Đề Thi nào.</Text>
        </center>
      )}
    </div>
  );
};
