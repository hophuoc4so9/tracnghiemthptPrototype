import { useState, useEffect } from "react";
import { ExamAPI, Question, QuestionAPI } from "@/services/teacher/Teacher";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Button,
  Tag,
  Pagination,
  Select,
  Tabs,
  Table,
} from "antd";
import { PlusOutlined, MinusOutlined, EditOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import UpdateExamModal from "./UpdateExam";
import UpdateQuestionModal from "@/pages/giaovien/QuanLyCauHoi/CreateQuestion/UpdateQuestion";
import UpdateBlankQuestionModal from "@/pages/giaovien/QuanLyCauHoi/CreateQuestion/UpdateQuestionBlank";
import "./index.css";
import {
  ExamListeningQuestionAPI,
  ExamDataRecieve,
} from "@/services/teacher/ListeningQuestion";
import { Card } from "antd";
const { Search } = Input;
const { Option } = Select;

export const TruncatedText = ({
  text,
  maxLength,
}: {
  text: string;
  maxLength: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : `${text.slice(0, maxLength)}...`}
      <Button
        type="link"
        onClick={() => setExpanded(!expanded)}
        style={{ padding: 0 }}
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </Button>
    </span>
  );
};

export const UpdateExamQuestion = () => {
  const { _id } = useParams<{ _id: string }>();

  // --- State cho câu hỏi ---
  const [data, setData] = useState<Question[]>([]);
  const [otherQuestions, setOtherQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [selectedQuestionsGroup, setSelectedQuestionsGroup] = useState<
    Record<string, Question[]>
  >({});
  // --- State cho Đề Thi nghe ---
  const [allListeningExams, setAllListeningExams] = useState<ExamDataRecieve[]>(
    []
  );
  const [selectedListeningExams, setSelectedListeningExams] = useState<
    ExamDataRecieve[]
  >([]);
  // --- Các state phụ ---
  const [total, setTotal] = useState<number>(1);
  const [total2, setTotal2] = useState<number>(1);
  const [easyLimit, setEasyLimit] = useState<number>(0);
  const [hardLimit, setHardLimit] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [, setExamID] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");

  const [bankPage, setBankPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setOpenEditModal(true);
  };

  const handleEditSuccess = () => {
    setOpenEditModal(false);
    addSeletedQuestion(); // Refresh selected questions
  };

  // --- API: Lấy danh sách câu hỏi ---
  const getAllQuestions = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestions(page);
      if (rq?.code === 200) {
        setTotal(rq.totalPage);
        setData((prev) => {
          const combined = [...prev, ...rq.questions];
          const unique = Array.from(
            new Map(combined.map((q) => [q._id, q])).values()
          );
          return unique;
        });
      }
    } catch (error: any) {
      console.error(error.response?.data.message);
    }
  };

  const getAllQuestions2 = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestionsBlank(page);
      if (rq?.code === 200) {
        setData((prev) => {
          const combined = [...prev, ...rq.questions];
          const unique = Array.from(
            new Map(combined.map((q) => [q._id, q])).values()
          );
          return unique;
        });
        setTotal2(rq.totalPage);
      }
    } catch (error: any) {
      console.error(error.response?.data.message);
    }
  };

  // --- API: Lấy danh sách Đề Thi nghe ---
  const getAllListeningExams = async () => {
    try {
      const response = await ExamListeningQuestionAPI.getAllListeningExams();
      // console.log("response", response);
      if (response?.data) {
        setAllListeningExams(response.data);
      }
    } catch (error: any) {
      console.error(error.response?.message);
    }
  };

  // --- Load dữ liệu ban đầu ---
  useEffect(() => {
    getAllQuestions(1);
    getAllQuestions2(1);
    getAllListeningExams();
    addSeletedQuestion();
  }, []);

  useEffect(() => {
    if (total > 1) {
      Promise.all(
        Array.from({ length: total - 1 }, (_, i) => getAllQuestions(i + 2))
      );
    }
  }, [total]);

  useEffect(() => {
    if (total2 > 1) {
      Promise.all(
        Array.from({ length: total2 - 1 }, (_, i) => getAllQuestions2(i + 2))
      );
    }
  }, [total2]);

  // --- Cập nhật ngân hàng câu hỏi (loại trừ câu đã chọn) ---
  useEffect(() => {
    setOtherQuestions(
      data.filter((q) => !selectedQuestions.some((sq) => sq._id === q._id))
    );
  }, [selectedQuestions, data]);

  // --- Lấy dữ liệu câu hỏi và Đề Thi nghe đã có của đề thi ---
  const addSeletedQuestion = async () => {
    if (!_id) {
      console.error("Không tìm thấy id");
      return;
    }
    const rq = await ExamAPI.getDetailExam(_id);
    if (rq?.success) {
      setSelectedQuestions(rq.data.questions);
      setSelectedListeningExams(rq.data.listeningExams || []);
      setExamID(rq.data._id);
    }
  };

  // --- Group selectedQuestions by passageId whenever it changes ---
  useEffect(() => {
    const grouped = selectedQuestions.reduce((acc, question) => {
      const passageId =
        question.passageId?._id?.toString() ||
        question.passageId?.toString() ||
        "no-passage";
      if (!acc[passageId]) {
        acc[passageId] = [];
      }
      acc[passageId].push(question);
      return acc;
    }, {} as Record<string, Question[]>);

    setSelectedQuestionsGroup(grouped);
  }, [selectedQuestions]);

  // --- Utility: Trộn mảng câu hỏi ---
  const shuffleArray = (array: Question[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // --- Xử lý thêm câu hỏi tự động ---
  const handleOk = () => {
    const easyQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "easy")
    ).slice(0, easyLimit);
    const hardQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "hard")
    ).slice(0, hardLimit);

    setSelectedQuestions((prev) => [
      ...prev,
      ...easyQuestions,
      ...hardQuestions,
    ]);

    setOtherQuestions((prev) =>
      prev.filter(
        (q) =>
          !easyQuestions.some((eq) => eq._id === q._id) &&
          !hardQuestions.some((hq) => hq._id === q._id)
      )
    );

    setOpenModal(false);
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  // --- Di chuyển câu hỏi giữa danh sách được chọn và ngân hàng ---
  const moveQuestion = (question: Question) => {
    if (selectedQuestions.some((q) => q._id === question._id)) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q._id !== question._id)
      );
      setOtherQuestions((prev) => {
        if (!prev.some((q) => q._id === question._id)) {
          return [...prev, question];
        }
        return prev;
      });
    } else {
      setOtherQuestions((prev) => prev.filter((q) => q._id !== question._id));
      setSelectedQuestions((prev) => {
        if (!prev.some((q) => q._id === question._id)) {
          return [...prev, question];
        }
        return prev;
      });
    }
  };

  // --- Xử lý chuyển Đề Thi nghe ---
  // Khi ấn "Thêm" sẽ đưa exam đó vào danh sách đã chọn
  const handleAddListeningExam = (exam: ExamDataRecieve) => {
    setSelectedListeningExams((prev) => [...prev, exam]);
  };

  // Khi ấn "Gỡ" sẽ loại bỏ exam đó khỏi danh sách đã chọn
  const handleRemoveListeningExam = (exam: ExamDataRecieve) => {
    setSelectedListeningExams((prev) => prev.filter((e) => e._id !== exam._id));
  };

  // --- Tính danh sách ngân hàng Đề Thi nghe (loại trừ các đã chọn) ---
  const bankListeningExams = allListeningExams.filter(
    (exam) => !selectedListeningExams.some((e) => e._id === exam._id)
  );
  // --- Lọc câu hỏi theo tìm kiếm và filter ---
  const filteredOtherQuestions = otherQuestions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.content.toLowerCase().includes(term) ||
      (q.knowledge && q.knowledge.toLowerCase().includes(term)) ||
      (q.subject && q.subject.toLowerCase().includes(term));
    const matchesType = filterType
      ? q.questionType?.toLowerCase() === filterType.toLowerCase()
      : true;
    const matchesLevel = filterLevel
      ? q.level?.toLowerCase() === filterLevel.toLowerCase()
      : true;
    return matchesSearch && matchesType && matchesLevel;
  });

  // --- Phân trang cho danh sách câu hỏi ---
  const paginatedBankQuestions = filteredOtherQuestions.slice(
    (bankPage - 1) * pageSize,
    bankPage * pageSize
  );

  return (
    <div style={{ padding: 16 }}>
      {/* Card chứa các nút hành động */}
      <Card
        style={{
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: 8,
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenModal(true)}
          style={{ marginRight: 8 }}
        >
          Thêm câu hỏi tự động
        </Button>
        <Button
          type="default"
          icon={<EditOutlined />}
          onClick={() => {
            if (
              selectedQuestions.length > 0 ||
              selectedListeningExams.length > 0
            ) {
              setOpenModalCreate(true);
            } else {
              alert("Chưa có câu hỏi hoặc Đề Thi nghe nào");
            }
          }}
          style={{ marginRight: 8 }}
        >
          Sửa đề thi
        </Button>
        {/* <Button
          type="default"
          icon={<CopyOutlined />}
          onClick={() => {
            if (
              selectedQuestions.length > 0 ||
              selectedListeningExams.length > 0
            ) {
              copyExam();
            } else {
              alert("Chưa có câu hỏi hoặc Đề Thi nghe nào");
            }
          }}
        >
          Sao chép đề thi
        </Button> */}
      </Card>

      {/* Tabs để phân chia nội dung */}
      <Tabs defaultActiveKey="1" type="card">
        {/* Tab: Danh sách câu hỏi */}
        <Tabs.TabPane tab="Danh sách câu hỏi" key="1">
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Left Panel: Danh sách câu hỏi trong đề thi */}
            <div style={{ flex: 1 }}>
              <h3>Danh sách câu hỏi trong đề thi</h3>
              <div
                style={{
                  overflowY: "auto", // Enable vertical scrolling
                  maxHeight: "500px", // Set a maximum height for the scrollable area
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                {Object.keys(selectedQuestionsGroup).length > 0 ? (
                  <>
                    {Object.entries(selectedQuestionsGroup).map(
                      ([passageId, questions], groupIndex) => (
                        <div key={groupIndex} style={{ marginBottom: "16px" }}>
                          {passageId !== "no-passage" &&
                          questions[0]?.passageId?.content ? (
                            <div
                              style={{
                                marginBottom: "8px",
                                fontWeight: "bold",
                                color: "#333",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: questions[0].passageId.content,
                              }}
                            />
                          ) : null}

                          {/* Display questions in the group */}
                          {questions.map((question, index) => (
                            <div
                              key={question._id || index}
                              style={{
                                marginBottom: "12px",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <div style={{ marginBottom: "8px" }}>
                                <strong
                                  dangerouslySetInnerHTML={{
                                    __html: `${index + 1}. ${
                                      question.content ||
                                      "Nội dung không khả dụng"
                                    }`,
                                  }}
                                />
                              </div>
                              <div style={{ marginBottom: "8px" }}>
                                <Tag
                                  color={clsx(
                                    question.level === "easy" && "green",
                                    question.level === "hard" && "red"
                                  )}
                                >
                                  {question.level}
                                </Tag>
                                <Tag color="blue">{question.subject}</Tag>
                                <Tag color="cyan">{question.knowledge}</Tag>
                              </div>
                              {/* Determine question type and render accordingly */}
                              <div style={{ marginBottom: "8px" }}>
                                {question.questionType ===
                                  "6742fb1cd56a2e75dbd817ea" &&
                                  // Render for multiple-choice questions
                                  question.answers?.map(
                                    (answer, answerIndex) => (
                                      <div
                                        key={answer._id || answerIndex}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                          backgroundColor: answer.isCorrect
                                            ? "#f6ffed"
                                            : "#fff",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            {String.fromCharCode(
                                              65 + answerIndex
                                            )}
                                            .
                                          </strong>{" "}
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: answer.text || "",
                                            }}
                                          />
                                        </span>
                                        {answer.isCorrect && (
                                          <Tag
                                            color="green"
                                            style={{ marginLeft: "8px" }}
                                          >
                                            Đúng
                                          </Tag>
                                        )}
                                      </div>
                                    )
                                  )}

                                {question.questionType ===
                                  "6742fb3bd56a2e75dbd817ec" &&
                                  // Render for fill-in-the-blank questions
                                  question.answers?.map(
                                    (answer, answerIndex) => (
                                      <div
                                        key={answer._id || answerIndex}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            Điền khuyết {answerIndex + 1}:
                                          </strong>{" "}
                                          {answer.correctAnswerForBlank}
                                        </span>
                                      </div>
                                    )
                                  )}

                                {question.questionType ===
                                  "6742fb5dd56a2e75dbd817ee" &&
                                  // Render for True/False/Not Given questions
                                  ["true", "false", "not given"].map(
                                    (choice) => (
                                      <div
                                        key={choice}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                          backgroundColor:
                                            question.correctAnswerForTrueFalseNGV ===
                                            choice
                                              ? "#f6ffed"
                                              : "#fff",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            {choice.toUpperCase()}
                                          </strong>
                                        </span>
                                        {question.correctAnswerForTrueFalseNGV ===
                                          choice && (
                                          <Tag
                                            color="green"
                                            style={{ marginLeft: "8px" }}
                                          >
                                            Đúng
                                          </Tag>
                                        )}
                                      </div>
                                    )
                                  )}
                              </div>
                              <Button
                                size="small"
                                onClick={() => moveQuestion(question)}
                                icon={
                                  <MinusOutlined style={{ color: "red" }} />
                                }
                              >
                                Gỡ
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleEditQuestion(question)}
                                icon={
                                  <EditOutlined style={{ color: "blue" }} />
                                }
                                style={{ marginLeft: "8px" }}
                              >
                                Sửa
                              </Button>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* Display questions without a passage */}
                    {selectedQuestionsGroup["no-passage"] && (
                      <div>
                        <h4
                          style={{
                            marginTop: "16px",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          Câu hỏi không có bài đọc
                        </h4>
                        {selectedQuestionsGroup["no-passage"].map(
                          (question, index) => (
                            <div
                              key={question._id || index}
                              style={{
                                marginBottom: "12px",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <div style={{ marginBottom: "8px" }}>
                                <strong>
                                  {index + 1}.{" "}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: question.content || "",
                                    }}
                                  />
                                </strong>
                              </div>
                              <div style={{ marginBottom: "8px" }}>
                                <Tag
                                  color={clsx(
                                    question.level === "easy" && "green",
                                    question.level === "hard" && "red"
                                  )}
                                >
                                  {question.level}
                                </Tag>
                                <Tag color="blue">{question.subject}</Tag>
                                <Tag color="cyan">{question.knowledge}</Tag>
                              </div>
                              {/* Determine question type and render accordingly */}
                              <div style={{ marginBottom: "8px" }}>
                                {question.questionType ===
                                  "6742fb1cd56a2e75dbd817ea" &&
                                  // Render for multiple-choice questions
                                  question.answers?.map(
                                    (answer, answerIndex) => (
                                      <div
                                        key={answer._id || answerIndex}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                          backgroundColor: answer.isCorrect
                                            ? "#f6ffed"
                                            : "#fff",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            {String.fromCharCode(
                                              65 + answerIndex
                                            )}
                                            .
                                          </strong>{" "}
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: answer.text || "",
                                            }}
                                          />
                                        </span>
                                        {answer.isCorrect && (
                                          <Tag
                                            color="green"
                                            style={{ marginLeft: "8px" }}
                                          >
                                            Đúng
                                          </Tag>
                                        )}
                                      </div>
                                    )
                                  )}

                                {question.questionType ===
                                  "6742fb3bd56a2e75dbd817ec" &&
                                  // Render for fill-in-the-blank questions
                                  question.answers?.map(
                                    (answer, answerIndex) => (
                                      <div
                                        key={answer._id || answerIndex}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            Điền khuyết {answerIndex + 1}:
                                          </strong>{" "}
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                answer.correctAnswerForBlank ||
                                                "",
                                            }}
                                          />
                                        </span>
                                      </div>
                                    )
                                  )}

                                {question.questionType ===
                                  "6742fb5dd56a2e75dbd817ee" &&
                                  // Render for True/False/Not Given questions
                                  ["true", "false", "not given"].map(
                                    (choice) => (
                                      <div
                                        key={choice}
                                        style={{
                                          padding: "4px 8px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          marginBottom: "4px",
                                          backgroundColor:
                                            question.correctAnswerForTrueFalseNGV ===
                                            choice
                                              ? "#f6ffed"
                                              : "#fff",
                                        }}
                                      >
                                        <span>
                                          <strong>
                                            {choice.toUpperCase()}
                                          </strong>
                                        </span>
                                        {question.correctAnswerForTrueFalseNGV ===
                                          choice && (
                                          <Tag
                                            color="green"
                                            style={{ marginLeft: "8px" }}
                                          >
                                            Đúng
                                          </Tag>
                                        )}
                                      </div>
                                    )
                                  )}
                              </div>
                              <Button
                                size="small"
                                onClick={() => moveQuestion(question)}
                                icon={
                                  <MinusOutlined style={{ color: "red" }} />
                                }
                              >
                                Gỡ
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleEditQuestion(question)}
                                icon={
                                  <EditOutlined style={{ color: "blue" }} />
                                }
                                style={{ marginLeft: "8px" }}
                              >
                                Sửa
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p>Chưa có câu hỏi nào được chọn.</p>
                )}
              </div>
            </div>

            {/* Right Panel: Ngân hàng câu hỏi */}
            <div style={{ flex: 1 }}>
              <h3>Ngân hàng câu hỏi</h3>
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Search
                  placeholder="Tìm theo nội dung, kiến thức, chủ đề"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  enterButton
                  className="search-input"
                />
                <Select
                  placeholder="Loại câu hỏi"
                  allowClear
                  className="select-item"
                  value={filterType || undefined}
                  onChange={(value) => setFilterType(value)}
                >
                  <Option value="6742fb1cd56a2e75dbd817ea">
                    Multiple Choices
                  </Option>
                  <Option value="6742fb3bd56a2e75dbd817ec">Điền khuyết</Option>
                </Select>
                <Select
                  placeholder="Mức độ"
                  allowClear
                  className="select-item"
                  value={filterLevel || undefined}
                  onChange={(value) => setFilterLevel(value)}
                >
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </div>
              <div
                style={{
                  overflowY: "auto", // Enable vertical scrolling
                  maxHeight: "500px", // Set a maximum height for the scrollable area
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                {filteredOtherQuestions && filteredOtherQuestions.length > 0 ? (
                  <>
                    {paginatedBankQuestions.map((question, index) => (
                      <div
                        key={question._id || index}
                        style={{
                          marginBottom: "12px",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <div style={{ marginBottom: "8px" }}>
                          <strong>
                            {index + 1 + (bankPage - 1) * pageSize}.{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.content || "",
                              }}
                            />
                          </strong>
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                          <Tag
                            color={clsx(
                              question.level === "easy" && "green",
                              question.level === "hard" && "red"
                            )}
                          >
                            {question.level}
                          </Tag>
                          <Tag color="blue">{question.subject}</Tag>
                          <Tag color="cyan">{question.knowledge}</Tag>
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                          {question.questionType ===
                            "6742fb1cd56a2e75dbd817ea" &&
                            question.answers?.map((answer, answerIndex) => (
                              <div
                                key={answer._id || answerIndex}
                                style={{
                                  padding: "4px 8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                  backgroundColor: answer.isCorrect
                                    ? "#f6ffed"
                                    : "#fff",
                                }}
                              >
                                <span>
                                  <strong>
                                    {String.fromCharCode(65 + answerIndex)}.
                                  </strong>{" "}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: answer.text || "",
                                    }}
                                  />
                                </span>
                                {answer.isCorrect && (
                                  <Tag
                                    color="green"
                                    style={{ marginLeft: "8px" }}
                                  >
                                    Đúng
                                  </Tag>
                                )}
                              </div>
                            ))}
                          {question.questionType ===
                            "6742fb3bd56a2e75dbd817ec" &&
                            question.answers?.map((answer, answerIndex) => (
                              <div
                                key={answer._id || answerIndex}
                                style={{
                                  padding: "4px 8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span>
                                  <strong>
                                    Điền khuyết {answerIndex + 1}:
                                  </strong>{" "}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        answer.correctAnswerForBlank || "",
                                    }}
                                  />
                                </span>
                              </div>
                            ))}
                          {question.questionType ===
                            "6742fb5dd56a2e75dbd817ee" &&
                            ["true", "false", "not given"].map((choice) => (
                              <div
                                key={choice}
                                style={{
                                  padding: "4px 8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                  backgroundColor:
                                    question.correctAnswerForTrueFalseNGV ===
                                    choice
                                      ? "#f6ffed"
                                      : "#fff",
                                }}
                              >
                                <span>
                                  <strong>{choice.toUpperCase()}</strong>
                                </span>
                                {question.correctAnswerForTrueFalseNGV ===
                                  choice && (
                                  <Tag
                                    color="green"
                                    style={{ marginLeft: "8px" }}
                                  >
                                    Đúng
                                  </Tag>
                                )}
                              </div>
                            ))}
                        </div>
                        <Button
                          size="small"
                          onClick={() => moveQuestion(question)}
                          icon={<PlusOutlined style={{ color: "green" }} />}
                        >
                          Thêm
                        </Button>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Pagination
                        current={bankPage}
                        pageSize={pageSize}
                        total={filteredOtherQuestions.length}
                        onChange={(page) => setBankPage(page)}
                      />
                    </div>
                  </>
                ) : (
                  <p>Không có câu hỏi phù hợp.</p>
                )}
              </div>
            </div>
          </div>
        </Tabs.TabPane>

        {/* Tab: Danh sách Đề Thi nghe */}
        <Tabs.TabPane tab="Danh sách các phần thi nghe" key="3">
          <h3>Danh sách các phần nghe trong đề thi</h3>
          <Table
            dataSource={selectedListeningExams.map((exam, index) => ({
              key: exam._id || index,
              index: index + 1,
              title: exam.title,
              description: exam.description,
              duration: `${exam.duration} phút`,
              isPublished: exam.isPublished ? "Đã phát hành" : "Chưa phát hành",
              actions: exam,
            }))}
            columns={[
              {
                title: "STT",
                dataIndex: "index",
                key: "index",
                width: 50,
              },
              {
                title: "Tiêu đề",
                dataIndex: "title",
                key: "title",
              },
              {
                title: "Mô tả",
                dataIndex: "description",
                key: "description",
              },
              {
                title: "Thời gian",
                dataIndex: "duration",
                key: "duration",
              },
              {
                title: "Trạng thái",
                dataIndex: "isPublished",
                key: "isPublished",
              },
              {
                title: "Hành động",
                key: "actions",
                render: (_, record) => (
                  <Button
                    size="small"
                    onClick={() => handleRemoveListeningExam(record.actions)}
                    icon={<MinusOutlined style={{ color: "red" }} />}
                  >
                    Gỡ
                  </Button>
                ),
              },
            ]}
            pagination={false}
          />
        </Tabs.TabPane>

        {/* Tab: Ngân hàng Đề Thi nghe */}
        <Tabs.TabPane tab="Ngân hàng phần thi nghe" key="4">
          <h3>Ngân hàng phần thi nghe</h3>
          <Table
            dataSource={bankListeningExams.map((exam, index) => ({
              key: exam._id || index,
              index: index + 1,
              title: exam.title,
              description: exam.description,
              duration: `${exam.duration} phút`,
              isPublished: exam.isPublished ? "Đã phát hành" : "Chưa phát hành",
              actions: exam,
            }))}
            columns={[
              {
                title: "STT",
                dataIndex: "index",
                key: "index",
                width: 50,
              },
              {
                title: "Tiêu đề",
                dataIndex: "title",
                key: "title",
              },
              {
                title: "Mô tả",
                dataIndex: "description",
                key: "description",
              },
              {
                title: "Thời gian",
                dataIndex: "duration",
                key: "duration",
              },
              {
                title: "Trạng thái",
                dataIndex: "isPublished",
                key: "isPublished",
              },
              {
                title: "Hành động",
                key: "actions",
                render: (_, record) => (
                  <Button
                    size="small"
                    onClick={() => handleAddListeningExam(record.actions)}
                    icon={<PlusOutlined style={{ color: "green" }} />}
                  >
                    Thêm
                  </Button>
                ),
              },
            ]}
            pagination={false}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal thêm câu hỏi tự động */}
      <Modal
        open={openModal}
        title="Thêm câu hỏi tự động"
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Form layout="vertical">
          <Form.Item
            label={`Số câu dễ (còn lại: ${
              otherQuestions.filter((q) => q.level === "easy").length
            })`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "easy").length}
              value={easyLimit}
              onChange={(value) => {
                if (value !== null) setEasyLimit(value);
              }}
            />
          </Form.Item>

          <Form.Item
            label={`Số câu khó (còn lại: ${
              otherQuestions.filter((q) => q.level === "hard").length
            })`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "hard").length}
              value={hardLimit}
              onChange={(value) => {
                if (value !== null) setHardLimit(value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <UpdateExamModal
        slug={_id || ""}
        visible={openModalCreate}
        handleClose={() => setOpenModalCreate(false)}
        onCreateSuccess={() => setOpenModalCreate(false)}
        dataQuestion={selectedQuestions}
        listeningExams={selectedListeningExams}
      />
      {editingQuestion && (
        <>
          {editingQuestion.questionType === "6742fb1cd56a2e75dbd817ea" ? (
            <UpdateQuestionModal
              visible={openEditModal}
              onUpdateSuccess={handleEditSuccess}
              handleClose={() => setOpenEditModal(false)}
              question2={editingQuestion}
            />
          ) : (
            <UpdateBlankQuestionModal
              visible={openEditModal}
              handleClose={() => setOpenEditModal(false)}
              question2={editingQuestion}
            />
          )}
        </>
      )}
    </div>
  );
};
