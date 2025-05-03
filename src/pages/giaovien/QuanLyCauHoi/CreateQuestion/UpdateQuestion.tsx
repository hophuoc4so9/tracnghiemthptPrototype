import { Question, QuestionAPI, AudioAPI, Audio } from "@/services/teacher/Teacher";
import { Button, Form, Input, Modal, Select, Upload } from "antd";
import { Option } from "antd/es/mentions";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { CloseCircleOutlined, QuestionOutlined, UploadOutlined } from "@ant-design/icons";
import { explainInVietnamese, translateEnglishToVietnamese } from "@/services/GropApi";

interface UpdateQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
  question2: Question;
  onUpdateSuccess: () => void;
}

const UpdateQuestionModal: React.FC<UpdateQuestionModalProps> = ({
  visible,
  handleClose,
  question2,
  onUpdateSuccess,
}) => {
  const [question, setQuestion] = useState<Question>(question2);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudios, setExistingAudios] = useState<Audio[]>([]);

  useEffect(() => {
    setQuestion(question2);
  }, [question2]);

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

  const handleLevelChange = (value: "easy" | "medium" | "hard") => {
    setQuestion((prev) => ({ ...prev, level: value }));
  };

  const handleAnswerChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], [name]: value };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleCheckboxChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], isCorrect: e.target.checked };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAddAnswer = () => {
    setQuestion((prev) => ({
      ...prev,
      answers: [...prev.answers, { text: "", isCorrect: false }],
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

  const handleSaveClick = async () => {
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    const emptyAnswer = question.answers.some((answer) => !answer.text?.trim());
    if (emptyAnswer) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung đáp án không được để trống",
      });
    }

    const check = question.answers.some((answer) => answer.isCorrect);
    if (!check) {
      return Modal.error({
        title: "Lỗi",
        content: "Cần phải chọn ít nhất 1 đáp án đúng",
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
      if (rq?.code === 200) {
        alert("Sửa câu hỏi thành công");
        handleClose();
        onUpdateSuccess();
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
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

  return (
    <Modal
      title="Sửa câu hỏi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Nội dung">
          <Input.TextArea
            name="content"
            value={question.content}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Mức độ">
          <Select value={question.level} onChange={handleLevelChange}>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
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

        <Form.Item label="Loại câu hỏi">
          <Select
            value={
              question.questionType === "6742fb1cd56a2e75dbd817ea"
                ? "yesno"
                : question.questionType === "6742fb3bd56a2e75dbd817ec"
                ? "fillblank"
                : "truefalsengv"
            }
            onChange={(value) =>
              setQuestion((prev) => ({
                ...prev,
                questionType:
                  value === "yesno"
                    ? "6742fb1cd56a2e75dbd817ea"
                    : value === "fillblank"
                    ? "6742fb3bd56a2e75dbd817ec"
                    : "6742fb5dd56a2e75dbd817ee",
                answers:
                  value === "yesno"
                    ? [{ text: "", isCorrect: false }]
                    : value === "fillblank"
                    ? [{ text: "", correctAnswerForBlank: "", isCorrect: true }]
                    : [],
                correctAnswerForTrueFalseNGV:
                  value === "truefalsengv" ? "true" : "",
              }))
            }
          >
            <Option value="yesno">Yes/No</Option>
            <Option value="fillblank">Điền khuyết</Option>
            <Option value="truefalsengv">True/False/Not Given</Option>
          </Select>
        </Form.Item>

        {question.questionType === "6742fb5dd56a2e75dbd817ee" && (
          <Form.Item label="Đáp án đúng">
            <Select
              value={question.correctAnswerForTrueFalseNGV}
              onChange={(value) =>
                setQuestion((prev) => ({
                  ...prev,
                  correctAnswerForTrueFalseNGV: value,
                }))
              }
            >
              <Option value="true">True</Option>
              <Option value="false">False</Option>
              <Option value="notgiven">Not Given</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item label="Đáp án">
          {question.answers.map((answer, index) => (
            <div
              key={index}
              className={clsx(
                answer.isCorrect
                  ? "border border-success"
                  : "border border-warning",
                "mb-2 flex items-center"
              )}
            >
              {answer.isCorrect ? (
                <span style={{ marginLeft: "8px", color: "green" }}>
                  Đáp án chính xác{" "}
                </span>
              ) : null}
              <div className="d-flex">
                <Input
                  name="text"
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(index, e)}
                  placeholder={`Answer ${index + 1}`}
                  style={{ marginRight: "8px", flexGrow: 1 }}
                  className="flex-1"
                />
                <div className=" align-items-center d-flex flex-column justify-content-center">
                  <Input
                    type="checkbox"
                    name="isCorrect"
                    checked={answer.isCorrect}
                    onChange={(e) => handleCheckboxChange(index, e)}
                    style={{ height: "16px" }}
                  />

                  <Button
                    type="link"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRemoveAnswer(index)}
                    style={{ color: "#FF0000" }}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddAnswer}>
            Thêm câu trả lời
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
            <div className=" align-items-center d-flex flex-column justify-content-center">
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
            <div className=" align-items-center d-flex flex-column justify-content-center">
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
              <Option key={audio._id} value={audio._id}>
                {audio.description}
              </Option>
            ))}
          </Select>
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default UpdateQuestionModal;
