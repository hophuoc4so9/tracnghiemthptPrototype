import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Form, Checkbox } from "antd";
import {ListeningQuestionData, listenQuestionAPI } from "@/services/teacher/ListeningQuestion";

const { Option } = Select;

interface UpdateListeningQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
  questionData: ListeningQuestionData;
  onUpdateSuccess: () => void;
}

interface LocalOption {
  key: number;
  optionText: string;
  isCorrect: boolean;
}

const UpdateListeningQuestionModal: React.FC<UpdateListeningQuestionModalProps> = ({
  visible,
  handleClose,
  questionData,
  onUpdateSuccess,
}) => {
  const [question, setQuestion] = useState<ListeningQuestionData>(questionData);
  const [localOptions, setLocalOptions] = useState<LocalOption[]>([]);
  // Khi questionData thay đổi, cập nhật state câu hỏi
  useEffect(() => {
    setQuestion(questionData);
  }, [questionData]);
  useEffect(() => {
    if (visible && questionData.questionType === "6742fb1cd56a2e75dbd817ea" && questionData.options) {
      const updatedOptions: LocalOption[] = questionData.options.map((optionText, index) => ({
        key: index,
        optionText,
        isCorrect: questionData.correctAnswer?.includes(index) || false,
      }));
      setLocalOptions(updatedOptions);
    }
  }, [visible, questionData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (value: "easy" | "medium" | "hard") => {
    setQuestion(prev => ({ ...prev, difficulty: value }));
  };

  const handleQuestionTypeChange = (value: string) => {
    setQuestion(prev => ({ ...prev, questionType: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index].optionText = value;
    setLocalOptions(newOptions);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newOptions = [...localOptions];
    newOptions[index].isCorrect = checked;
    setLocalOptions(newOptions);
  };

  const handleAddOption = () => {
    setLocalOptions(prev => [...prev, { key: prev.length, optionText: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setLocalOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!question.questionText.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }
    if (question.questionType === "6742fb1cd56a2e75dbd817ea") {
      const emptyOption = localOptions.some(opt => !opt.optionText.trim());
      if (emptyOption) {
        return Modal.error({
          title: "Lỗi",
          content: "Nội dung đáp án không được để trống",
        });
      }
      const hasCorrect = localOptions.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        return Modal.error({
          title: "Lỗi",
          content: "Cần chọn ít nhất một đáp án đúng",
        });
      }
    } else if (question.questionType === "6742fb3bd56a2e75dbd817ec") {
      if (!question.blankAnswer?.trim()) {
        return Modal.error({
          title: "Lỗi",
          content: "Vui lòng nhập đáp án cho dạng điền khuyết",
        });
      }
    }

    let updatedQuestion: ListeningQuestionData;
    if (question.questionType === "6742fb1cd56a2e75dbd817ea") {
      // Chuyển localOptions thành mảng string và mảng chỉ số đáp án đúng
      const finalOptions = localOptions.map(opt => opt.optionText);
      const finalCorrectAnswer = localOptions.reduce<number[]>((acc, opt, idx) => {
        if (opt.isCorrect) acc.push(idx);
        return acc;
      }, []);
      updatedQuestion = {
        ...question,
        options: finalOptions,
        correctAnswer: finalCorrectAnswer,
      };
    } else {
      updatedQuestion = { ...question };
    }

    try {
      const response = await listenQuestionAPI.updateListeningQuestion(question._id!, updatedQuestion);
      console.log(response);
      if (response) {
        Modal.success({
          title: "Thành công",
          content: "Cập nhật câu hỏi listening thành công",
        });
        onUpdateSuccess();
        handleClose();
      }
    } catch (error: any) {
      Modal.error({
        title: "Lỗi",
        content: error.response?.data?.message || "Có lỗi xảy ra trong quá trình cập nhật",
      });
    }
  };

  return (
    <Modal
      title="Cập nhật câu hỏi listening"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSave}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Nội dung câu hỏi">
          <Input.TextArea
            name="questionText"
            value={question.questionText}
            onChange={handleInputChange}
            placeholder="Nhập nội dung câu hỏi"
          />
        </Form.Item>
        <Form.Item label="Độ khó">
          <Select value={question.difficulty} onChange={handleDifficultyChange}>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Loại câu hỏi">
          <Select value={question.questionType} onChange={handleQuestionTypeChange}>
            <Option value="6742fb1cd56a2e75dbd817ea">Multiple Choice</Option>
            <Option value="6742fb3bd56a2e75dbd817ec">Fill in the Blank</Option>
          </Select>
        </Form.Item>
        {question.questionType === "6742fb1cd56a2e75dbd817ea" && (
          <Form.Item label="Đáp án">
            {localOptions.map((opt, index) => (
              <div key={opt.key} style={{ display: "flex", marginBottom: "8px", alignItems: "center" }}>
                <Input
                  placeholder={`Đáp án ${index + 1}`}
                  value={opt.optionText}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  style={{ marginRight: "8px" }}
                />
                <Checkbox
                  checked={opt.isCorrect}
                  onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                >
                  Đáp án đúng
                </Checkbox>
                {localOptions.length > 1 && (
                  <Button type="link" danger onClick={() => handleRemoveOption(index)}>
                    Xóa
                  </Button>
                )}
              </div>
            ))}
            <Button type="dashed" onClick={handleAddOption}>
              Thêm đáp án
            </Button>
          </Form.Item>
        )}
        {question.questionType === "6742fb3bd56a2e75dbd817ec" && (
          <Form.Item label="Đáp án điền khuyết">
            <Input
              placeholder="Nhập đáp án điền khuyết"
              name="blankAnswer"
              value={question.blankAnswer}
              onChange={handleInputChange}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UpdateListeningQuestionModal;
