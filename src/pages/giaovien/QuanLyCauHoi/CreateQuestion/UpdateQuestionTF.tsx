import React, { useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { Question, QuestionAPI } from "@/services/teacher/Teacher";

interface UpdateQuestionTFModalProps {
  visible: boolean;
  handleClose: () => void;
  question2: Question;
  onUpdateSuccess: () => void;
}

const UpdateQuestionTFModal: React.FC<UpdateQuestionTFModalProps> = ({
  visible,
  handleClose,
  question2,
  onUpdateSuccess,
}) => {
  const [question, setQuestion] = useState<Question>(question2);

  const handleSaveClick = async () => {
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    if (
      !["true", "false", "notgiven"].includes(
        question.correctAnswerForTrueFalseNGV || ""
      )
    ) {
      return Modal.error({
        title: "Lỗi",
        content: "Đáp án đúng phải là True, False hoặc Not Given",
      });
    }

    try {
      if (!question._id) return;
      const response = await QuestionAPI.UpdateQuestion(question, question._id);
      if (response?.code === 200) {
        alert("Sửa câu hỏi thành công");
        handleClose();
        onUpdateSuccess();
      }
    } catch (error: any) {
      console.error("Lỗi khi sửa câu hỏi:", error);
    }
  };

  return (
    <Modal
      title="Sửa câu hỏi True/False/Not Given"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
    >
      <Form layout="vertical">
        <Form.Item label="Nội dung">
          <Input.TextArea
            value={question.content}
            onChange={(e) =>
              setQuestion({ ...question, content: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Mức độ">
          <Select
            value={question.level}
            onChange={(value) => setQuestion({ ...question, level: value })}
          >
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Đáp án đúng">
          <Select
            value={question.correctAnswerForTrueFalseNGV}
            onChange={(value) =>
              setQuestion({ ...question, correctAnswerForTrueFalseNGV: value })
            }
          >
            <Select.Option value="true">True</Select.Option>
            <Select.Option value="false">False</Select.Option>
            <Select.Option value="notgiven">Not Given</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Chủ đề">
          <Input
            value={question.subject}
            onChange={(e) =>
              setQuestion({ ...question, subject: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Kiến thức">
          <Input
            value={question.knowledge}
            onChange={(e) =>
              setQuestion({ ...question, knowledge: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Giải thích">
          <Input.TextArea
            value={question.explanation}
            onChange={(e) =>
              setQuestion({ ...question, explanation: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Dịch">
          <Input.TextArea
            value={question.translation}
            onChange={(e) =>
              setQuestion({ ...question, translation: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateQuestionTFModal;
