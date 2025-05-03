import { QuestionAPI, Question } from "@/services/teacher/Teacher";
import { cleanString } from "@/utils/cn";
import { Divider, Modal, Tag } from "antd";
import "./cauhoi.css";
import { useState } from "react";
import UpdateQuestionModal from "./CreateQuestion/UpdateQuestion";
import UpdateBlankQuestionModal from "./CreateQuestion/UpdateQuestionBlank";
import UpdateQuestionTFModal from "./CreateQuestion/UpdateQuestionTF";
import { Card, Typography, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type QuestionComponentProps = {
  question: Question;
  onUpdateSuccess: () => void;
  questionType: string;
  editable?: boolean;
  deletetalbe?: boolean;
};

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  onUpdateSuccess,
  question,
  questionType,
  editable = true,
  deletetalbe = true,
}) => {
  const [open, setOpen] = useState(false);

  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleDelete = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await QuestionAPI.deleteQuestion(question._id || "");
      if (response?.code === 200) {
        alert("Xóa câu hỏi thành công");
        onUpdateSuccess();
      }
    } catch (error) {
      console.error("Lỗi khi xóa câu hỏi:", error);
    }
    setOpen(false);
  };
  return (
    <Card
      bordered={false}
      style={{
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 8,
      }}
    >
      {/* Tiêu đề câu hỏi */}
      <Title level={4} style={{ marginBottom: 16 }}>
        <span
          dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
        />
      </Title>

      {/* Đáp án */}
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Đáp án
      </Divider>
      <div style={{ marginBottom: 16 }}>
        {question.questionType === "6742fb5dd56a2e75dbd817ee" ? (
          <div
            className={`p-2 rounded mb-2 bg-gray-100`}
            style={{
              border: "1px solid #d9d9d9",
              color: "#595959",
            }}
            dangerouslySetInnerHTML={{
              __html:
                question.correctAnswerForTrueFalseNGV?.toUpperCase() || "",
            }}
          />
        ) : (
          question.answers.map((answer) => (
            <div
              key={answer._id}
              className={`p-2 rounded mb-2 ${
                answer.isCorrect ? "bg-green-100" : "bg-gray-100"
              }`}
              style={{
                border: answer.isCorrect
                  ? "1px solid #52c41a"
                  : "1px solid #d9d9d9",
                color: answer.isCorrect ? "#52c41a" : "#595959",
              }}
              dangerouslySetInnerHTML={{
                __html: cleanString(
                  answer.text || answer.correctAnswerForBlank || ""
                ),
              }}
            />
          ))
        )}
      </div>

      {/* Thông tin chi tiết */}
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Thông tin chi tiết
      </Divider>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Mức độ: </Text>
        <Tag color={question.level === "easy" ? "green" : "red"}>
          {question.level}
        </Tag>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Chủ đề: </Text>
        <Tag color="blue">{question.subject}</Tag>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Kiến thức: </Text>
        <Tag color="cyan">{question.knowledge}</Tag>
      </div>

      {/* Giải thích và dịch */}
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Giải thích và Dịch
      </Divider>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Giải thích: </Text>
        <span
          dangerouslySetInnerHTML={{
            __html: cleanString(question.explanation),
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Dịch: </Text>
        {cleanString(question.translation)}
      </div>

      {/* Nút hành động */}
      {editable && (
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setOpenModal(true)}
            style={{ marginRight: 8 }}
          >
            Sửa câu hỏi
          </Button>
          {deletetalbe && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Xóa câu hỏi
            </Button>
          )}
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <Modal
        open={open}
        title="Xóa câu hỏi"
        onOk={handleConfirmDelete}
        onCancel={() => setOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
      </Modal>

      {/* Modal sửa câu hỏi */}
      {questionType === "6742fb5dd56a2e75dbd817ee" ? (
        <UpdateQuestionTFModal
          visible={openModal}
          handleClose={() => setOpenModal(false)}
          question2={question}
          onUpdateSuccess={onUpdateSuccess}
        />
      ) : questionType === "6742fb1cd56a2e75dbd817ea" ? (
        <UpdateQuestionModal
          visible={openModal}
          onUpdateSuccess={onUpdateSuccess}
          handleClose={() => setOpenModal(false)}
          question2={question}
        />
      ) : questionType === "6742fb3bd56a2e75dbd817ec" ? (
        <UpdateBlankQuestionModal
          visible={openModal}
          handleClose={() => setOpenModal(false)}
          question2={question}
        />
      ) : (
        <div>{/* Placeholder for future modals */}</div>
      )}
      {question.audioInfo && (
        <div>
          <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
            Phần nghe
          </Divider>
          <audio controls>
            <source
              src={
                typeof question.audioInfo.filePath === "string"
                  ? question.audioInfo.filePath
                  : ""
              }
              type="audio/mpeg"
            />
          </audio>

          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Giải thích: </span>
            {cleanString(question.audioInfo.description)}
          </p>
          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Dịch: </span>
            {cleanString(question.audioInfo.transcription)}
          </p>
        </div>
      )}
      
    </Card>
  );
};

export default QuestionComponent;
