import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Form, Select, Upload } from "antd";
import { Question, QuestionAPI, AudioAPI, Audio } from "@/services/teacher/Teacher"; // Adjust the import path as needed
import {  QuestionOutlined } from "@ant-design/icons";
import { explainInVietnamese, translateEnglishToVietnamese } from "@/services/GropApi";

interface UpdateBlankQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
  question2: Question;
}

const UpdateBlankQuestionModal: React.FC<UpdateBlankQuestionModalProps> = ({
  visible,
  handleClose,
  question2: initialQuestion,
}) => {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudios, setExistingAudios] = useState<Audio[]>([]);

  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    const fetchAudios = async () => {
      const response = await AudioAPI.getAllAudio();
      setExistingAudios(response);
    };
    fetchAudios();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newAnswers = [...question.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [name]: value,
      isCorrect: false,
    };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAddAnswer = () => {
    setQuestion((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", correctAnswerForBlank: "", isCorrect: false },
      ],
    }));
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = question.answers.filter((_, i) => i !== index);
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAudioChange = (info: any) => {
    if (info.file.status === "done") {
      setAudioFile(info.file.originFileObj);
    }
  };

  const handleTranslate = async (text: string) => {
    const confirm = window.confirm(
      "Bạn có muốn dịch câu hỏi không? Sẽ xóa dữ liệu dịch cũ"
    );
    if (!confirm) return;
    try {
      const rq = await translateEnglishToVietnamese(text);
      if (rq) {
        setQuestion((prev) => ({ ...prev, translation: rq }));
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  const handleExplain = async () => {
    const text = `${question.content}\n${question.answers
      .map((answer, _index) => `$ ${answer.text}`)
      .join("\n")}`;
    const confirm = window.confirm(
      "Bạn có muốn giải thích câu hỏi không? Sẽ xóa dữ liệu giải thích cũ"
    );
    if (!confirm) return;
    try {
      const rq = await explainInVietnamese(text);
      if (rq) {
        setQuestion((prev) => ({ ...prev, explanation: rq }));
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  const handleSaveClick = async () => {
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    if (audioFile) {
      const formData = new FormData();
      formData.append("filePath", audioFile);
      formData.append("description", question.content);
      const response = await AudioAPI.createAudio(formData as unknown as Audio);
      if (response.success) {
        question.audio = response.data._id;
      }
    }

    UpdateQuestion(question);
  };

  const UpdateQuestion = async (q: Question) => {
    try {
      if (!q._id) return;
      const rq = await QuestionAPI.UpdateQuestion(q, q._id);
      console.log(rq);
      if (rq?.code === 200) {
        alert("Sửa câu hỏi thành công");
        handleClose();
      }
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  return (
    <Modal
      title="Update Question"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Save"
      cancelText="Cancel"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Content">
          <Input.TextArea
            name="content"
            value={question.content}
            onChange={(e) =>
              setQuestion({ ...question, content: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Level">
          <Select
            value={question.level}
            onChange={(value) => setQuestion({ ...question, level: value })}
          >
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Chủ đề">
          <Input
            name="subject"
            value={question.subject}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Kiến thức">
          <Input
            name="knowledge"
            value={question.knowledge}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Answers">
          {question.answers.map((answer, index) => (
            <div key={index} className="mb-2">
              <Input
                name="correctAnswerForBlank"
                value={answer.correctAnswerForBlank}
                onChange={(e) => handleAnswerChange(index, e)}
                placeholder={`Answer ${index + 1}`}
                style={{ marginRight: "8px" }}
              />
              <Button
                type="link"
                onClick={() => handleRemoveAnswer(index)}
                style={{ color: "red" }}
              >
                Xóa
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddAnswer}>
            Thêm đáp án
          </Button>
        </Form.Item>

        <Form.Item label="Dịch">
          <div className="d-flex">
            <Input.TextArea
              name="translation"
              value={question.translation}
              onChange={handleChange}
              style={{ width: "95% " }}
            />
            <div className="align-items-center d-flex flex-column justify-content-center">
              <Button
                type="link"
                icon={
                  <img
                    src="/src/Content/img/Google_Translate_Icon.png"
                    height="16px"
                  />
                }
                onClick={() => handleTranslate(question.content)}
                style={{ color: "#FF0000" }}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item label="Giải thích">
          <div className="d-flex">
            <Input.TextArea
              name="explanation"
              value={question.explanation}
              onChange={handleChange}
              style={{ width: "95% " }}
            />
            <div className="align-items-center d-flex flex-column justify-content-center">
              <Button
                type="link"
                icon={<QuestionOutlined />}
                onClick={() => handleExplain()}
                style={{ color: "#FF0000" }}
              />
            </div>
          </div>
        </Form.Item>

        {/* <Form.Item label="Audio">
          <Upload
            beforeUpload={() => false}
            onChange={handleAudioChange}
            accept="audio/*"
          >
            <Button icon={<UploadOutlined />}>Upload Audio</Button>
          </Upload>
          <Select
            placeholder="Hoặc chọn audio có sẵn"
            value={question.audio}
            onChange={(value) => setQuestion((prev) => ({ ...prev, audio: value }))}
            style={{ width: "100%", marginTop: "10px" }}
          >
            {existingAudios.map((audio) => (
              <Select.Option key={audio._id} value={audio._id}>
                {audio.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default UpdateBlankQuestionModal;
