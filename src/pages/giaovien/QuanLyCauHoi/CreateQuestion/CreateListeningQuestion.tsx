import React, { useState } from "react";
import { Modal, Button, Input, Select, Form, Checkbox } from "antd";
import {  ListeningQuestionData, listenQuestionAPI } from "@/services/teacher/ListeningQuestion";
import { useAuthContext } from "@/contexts/AuthProvider";

const { Option } = Select;

interface CreateListeningQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
  onCreateSuccess: () => void;
}

// Định nghĩa cho đáp án cục bộ (sử dụng key duy nhất để render)
interface LocalOption {
  key: number;
  optionText: string;
  isCorrect: boolean;
}

const CreateListeningQuestionModal: React.FC<CreateListeningQuestionModalProps> = ({
  visible,
  handleClose,
  onCreateSuccess,
}) => {
  const { user } = useAuthContext();
  const [question, setQuestion] = useState<Partial<ListeningQuestionData>>({
    teacherId: "",
    questionText: "",
    difficulty: "easy",
    // Mặc định dùng dạng multiple choice ("6742fb1cd56a2e75dbd817ea")
    questionType: "6742fb1cd56a2e75dbd817ea",
    options: [],
    blankAnswer: "",
  });

  // Sử dụng localOptions để quản lý đáp án khi dùng Multiple Choice
  const [localOptions, setLocalOptions] = useState<LocalOption[]>([
    { key: 0, optionText: "", isCorrect: false },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (value: "easy" | "medium" | "hard") => {
    setQuestion(prev => ({ ...prev, difficulty: value }));
  };

  const handleQuestionTypeChange = (value: string) => {
    if (value === "6742fb3bd56a2e75dbd817ec") {
      // Fill in the blank
      setQuestion(prev => ({ ...prev, questionType: value, blankAnswer: "" }));
    } else {
      // Multiple choice
      setQuestion(prev => ({ ...prev, questionType: value, options: [] }));
      setLocalOptions([{ key: 0, optionText: "", isCorrect: false }]);
    }
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
    if (!question.questionText?.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    if (question.questionType === "6742fb1cd56a2e75dbd817ea") {
      // Multiple Choice: kiểm tra đáp án
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
      // Fill in the blank
      if (!question.blankAnswer?.trim()) {
        return Modal.error({
          title: "Lỗi",
          content: "Vui lòng nhập đáp án cho dạng điền khuyết",
        });
      }
    }

    let finalQuestion: ListeningQuestionData;
    if (question.questionType === "6742fb1cd56a2e75dbd817ea") {
      // Với multiple choice, chuyển localOptions thành mảng string và mảng chỉ số cho đáp án đúng
      const finalOptions = localOptions.map(opt => opt.optionText);
      const finalCorrectAnswer = localOptions.reduce<number[]>((acc, opt, idx) => {
        if (opt.isCorrect) acc.push(idx);
        return acc;
      }, []);
      finalQuestion = {
        teacherId: user?._id || "",
        questionText: question.questionText!,
        questionType: "6742fb1cd56a2e75dbd817ea",
        difficulty: question.difficulty as "easy" | "medium" | "hard",
        options: finalOptions,
        correctAnswer: finalCorrectAnswer,
      };
    } else {
      finalQuestion = {
        teacherId: user?._id || "",
        questionText: question.questionText!,
        questionType: "6742fb3bd56a2e75dbd817ec",
        difficulty: question.difficulty as "easy" | "medium" | "hard",
        blankAnswer: question.blankAnswer,
      };
    }

    try {
      console.log(finalQuestion);
      const response = await listenQuestionAPI.createListeningQuestion(finalQuestion);
      console.log(response);
      if (response.code === 201) {
        Modal.success({
          title: "Thành công",
          content: "Thêm câu hỏi listening thành công",
        });
        // Reset state
        setQuestion({
          teacherId: "",
          questionText: "",
          difficulty: "easy",
          questionType: "6742fb1cd56a2e75dbd817ea",
          options: [],
          blankAnswer: "",
        });
        setLocalOptions([{ key: 0, optionText: "", isCorrect: false }]);
        onCreateSuccess();
        handleClose();
      }
    } catch (error: any) {
        console.log(error);
    ;
    }
  };

  return (
    <Modal
      title="Thêm câu hỏi listening"
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

export default CreateListeningQuestionModal;
