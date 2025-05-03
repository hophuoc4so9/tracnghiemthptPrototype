import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Form, DatePicker } from "antd";
import { ExamAPI, Question } from "@/services/teacher/Teacher";
import { ExamDataRecieve } from "@/services/teacher/ListeningQuestion";

const { Option } = Select;

interface CreateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  onCreateSuccess: () => void;
  dataQuestion: Question[];
  listeningExams: ExamDataRecieve[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  visible,
  handleClose,
  onCreateSuccess,
  dataQuestion,
  listeningExams,
}) => {
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: 90,
    isPublic: false,
    questions: dataQuestion,
    listeningExams: listeningExams,
    slug: "",
    createdAt: new Date(),
    startTime: new Date(),
    endTime: undefined,
  });
  useEffect(() => {
    setExam((prev) => ({
      ...prev,
      questions: dataQuestion,
      listeningExams: listeningExams,
    }));
  }, [dataQuestion, listeningExams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: any) => {
    setExam((prev) => ({ ...prev, [name]: date }));
  };

  const handleSaveClick = async () => {
    const response = await ExamAPI.createExam(exam);
    if (response?.success) {
      alert("Tạo đề thi thành công");
      onCreateSuccess();
      handleClose();
    } else {
      console.error(response?.message);
    }
  };

  return (
    <Modal
      title="Tạo Đề Thi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Tiêu đề">
          <Input name="title" value={exam.title} onChange={handleChange} />
        </Form.Item>
        <Form.Item label="Mô tả">
          <Input.TextArea
            name="description"
            value={exam.description}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input
            name="duration"
            type="number"
            value={exam.duration}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("startTime", date)}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("endTime", date)}
          />
        </Form.Item>
        <Form.Item label="Công khai">
          <Select
            value={exam.isPublic}
            onChange={(value) => handleSelectChange("isPublic", value)}
          >
            <Option value={true}>Công khai</Option>
            <Option value={false}>Riêng tư</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModal;
