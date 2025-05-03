import { cleanString } from "@/utils/cn";
import { Divider, Flex, Modal, Tag, Button } from "antd";
import clsx from "clsx";
import "./cauhoi.css";
import { useEffect, useState } from "react";
import UpdateListeningQuestionModal from "./CreateQuestion/UpdateListeningQuestion";
import {
  ListeningQuestionData,
  listenQuestionAPI,
} from "@/services/teacher/ListeningQuestion";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export interface ListeningQuestion {
  _id: string;
  teacherId: { _id: string; name?: string }; // Updated to reflect the expected structure
  questionText: string;
  questionType: { _id: string; name?: string }; // Updated to reflect the expected structure
  options?: { option_id: string; optionText: string }[];
  correctAnswer?: { answer_id: string; answer: string }[];
  difficulty: "easy" | "medium" | "hard";
  isDeleted?: boolean;
  blankAnswer?: string;
}

type ListeningQuestionComponentProps = {
  question: ListeningQuestion;
  onUpdateSuccess: () => void;
  editable?: boolean;
  deletetalbe?: boolean;
};

export const ListeningQuestionComponent: React.FC<
  ListeningQuestionComponentProps
> = ({ onUpdateSuccess, question, editable = true, deletetalbe = true }) => {
  const [questionData, setQuestionData] = useState<
    Partial<ListeningQuestionData>
  >({
    teacherId: "",
    questionText: "",
    difficulty: "easy",
    questionType: "",
    options: [],
    blankAnswer: "",
  });
  useEffect(() => {
    setQuestionData({
      _id: question._id,
      teacherId: question.teacherId?._id || "",
      questionText: question.questionText,
      difficulty: question.difficulty,
      questionType: question.questionType._id,
      options: question.options?.map((opt) => opt.optionText) || [],
      blankAnswer: question.blankAnswer || "",
    });
  }, [question]);

  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleOk = () => {
    handleDeleteQuestion(question._id);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const rq = await listenQuestionAPI.deleteListeningQuestion(id);
      if (rq?.code === 200) {
        alert("Xóa câu hỏi thành công");
        onUpdateSuccess();
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <span
          dangerouslySetInnerHTML={{
            __html: cleanString(question.questionText),
          }}
        />
      </h3>
      <div className="mt-1">
        {question.questionType._id != "6742fb3bd56a2e75dbd817ec" &&
          question.options?.map((option) => {
            const isCorrect = question.correctAnswer?.some(
              (ans) => ans.answer?.trim() === option.optionText?.trim()
            );

            return (
              <div
                key={option.option_id}
                className={clsx("ml-2 rounded mb-2 p-2", {
                  "bg-green-100": isCorrect,
                })}
                style={{
                  whiteSpace: "pre-wrap",
                  border: isCorrect ? "1px solid #52c41a" : "1px solid #d9d9d9",
                  color: isCorrect ? "#52c41a" : "#595959",
                }}
              >
               
                {cleanString(option.optionText)}
              </div>
            );
          })}
        {question.questionType._id == "6742fb3bd56a2e75dbd817ec" &&
          question.blankAnswer && (
            <div
              className="ml-2 rounded mb-2 bg-green-100 p-2"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {cleanString(question.blankAnswer)}
            </div>
          )}
      </div>
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Độ khó
      </Divider>
      <Flex gap="10px 0" wrap>
        <Tag
          color={clsx(
            question.difficulty === "easy" && "green",
            question.difficulty === "medium" && "yellow",
            question.difficulty === "hard" && "red"
          )}
          className="type-question"
        >
          {question.difficulty}
        </Tag>
      </Flex>
      {editable && (
        <>
          <hr />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-start" }}>
            <Button
              type="primary"
              icon={<EditOutlined />}

              className="my-3"
              onClick={() => setOpenModal(true)}
            >
              Sửa câu hỏi
            </Button>
            {deletetalbe && (
              <Button danger className="my-3" 
              icon={<DeleteOutlined />}

              onClick={() => setOpen(true)}>
                Xóa câu hỏi
              </Button>
            )}
            
          </div>
          <Modal
            open={open}
            title="Xóa câu hỏi"
            onOk={handleOk}
            onCancel={handleCancel}
            footer={(_, { OkBtn, CancelBtn }) => (
              <>
                <CancelBtn />
                <OkBtn />
              </>
            )}
          >
            <p>Bạn có chắc chắn muốn xóa câu hỏi này</p>
          </Modal>
          <UpdateListeningQuestionModal
            visible={openModal}
            onUpdateSuccess={onUpdateSuccess}
            handleClose={() => setOpenModal(false)}
            questionData={{
              ...questionData,
              teacherId: questionData.teacherId || "",
              questionText: questionData.questionText || "",
              questionType: questionData.questionType || "",
              difficulty: questionData.difficulty || "easy",
            }}
          />
        </>
      )}
    </div>
  );
};

export default ListeningQuestionComponent;
