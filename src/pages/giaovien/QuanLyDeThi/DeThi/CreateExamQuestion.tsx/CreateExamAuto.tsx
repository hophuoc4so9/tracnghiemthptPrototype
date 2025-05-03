import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Form, message } from "antd";
import {
  ExamAPI,
  QuestionType,
  QuestionTypeAPI,
} from "@/services/teacher/Teacher";

const { Option } = Select;

interface CreateExamModalProps {
  visible: boolean;
  handleClose: () => void;
}

export const CreateExamModalAuTo: React.FC<CreateExamModalProps> = ({
  visible,
  handleClose,
}) => {
  const [level, setLevel] = useState<string>("easy");
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [duration, setDuration] = useState<number>(60);
  const [questionTypesData, setQuestionTypesData] = useState<QuestionType[]>(
    []
  );
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(
    []
  );

  const handleLevelChange = (value: string) => {
    setLevel(value);
  };

  const getAllQT = async (page: number) => {
    try {
      const rq = await QuestionTypeAPI.getAllQuestionTypeTeacher(page);

      if (rq?.success) {
        setQuestionTypesData(rq?.data);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    getAllQT(1);
  }, []);

  const handleNumberOfQuestionsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNumberOfQuestions(Number(e.target.value));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
  };

  const handleQuestionTypeChange = (value: string[]) => {
    setSelectedQuestionTypes(value);
  };

  const handleSaveClick = async () => {
    try {
      // Map selected question type names to their corresponding _id values
      const questionTypeIds = selectedQuestionTypes
        .map(
          (name) => questionTypesData.find((type) => type.name === name)?._id
        )
        .filter((id): id is string => id !== undefined);
      const response = await ExamAPI.createExamAuTo(
        level,
        numberOfQuestions,
        duration,
        questionTypeIds
      );
      if (response?.code === 200) {
        message.success(response?.message);
        handleClose();
      } else {
        message.error(response?.message || "Failed to create exam.");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "An error occurred.");
      console.error(error);
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
        <Form.Item label="Mức độ">
          <Select value={level} onChange={handleLevelChange}>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Số lượng câu">
          <Input
            type="number"
            value={numberOfQuestions}
            onChange={handleNumberOfQuestionsChange}
          />
        </Form.Item>
        <Form.Item label="Thời gian (phút)">
          <Input
            type="number"
            value={duration}
            onChange={handleDurationChange}
          />
        </Form.Item>
        <Form.Item label="Loại câu hỏi">
          <Select
            mode="multiple"
            value={selectedQuestionTypes}
            onChange={handleQuestionTypeChange}
            placeholder="Chọn loại câu hỏi"
          >
            {questionTypesData.map((type) => (
              <Option key={type._id} value={type.name}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModalAuTo;
