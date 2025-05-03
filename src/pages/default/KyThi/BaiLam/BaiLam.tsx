import React, { useEffect, useRef, useState } from "react";
import { ResultAPI, SubmitAnswer } from "@/services/student";
import { ExamResult } from "@/services/teacher/Teacher";
import {
  Button,
  Card,

  Layout,
  Typography,
  Row,
  Col,
  Affix,
  Divider,
  Modal,
  Statistic,
} from "antd";
import QuestionSubmit from "./QuestionSumit";
import ListeningQuestionSubmit from "./listeningQuestionSubmit";

const { Title } = Typography;
const { Sider, Content } = Layout;

const BaiLam: React.FC = () => {
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [Examresult, setExamresult] = useState<ExamResult>();
  const [answers, setAnswers] = useState<any[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<any[]>([]);
 
  const [groupedQuestions, setGroupedQuestions] = useState<
    Record<string, any[]>
  >({});
  const questionRefs = useRef<Record<string, any>>({});
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<Date | null>(null);
  const showSubmitModal = () => {
    setIsSubmitModalVisible(true);
  };
  const showAlertModal = (message: string) => {
    setAlertMessage(message);
    setIsAlertModalVisible(true);
  };
  const handleCancelSubmit = () => {
    setIsSubmitModalVisible(false);
  };
  //xac dinh cau nao chua lam
  const getUnansweredQuestions = () => {
    const unanswered = [];

    for (const passageId of Object.keys(groupedQuestions)) {
      const questions = groupedQuestions[passageId];
      for (const question of questions) {
        const isAnswered =
          answers.some((ans) => ans.questionId === question._id) ||
          listeningAnswers.some((ans) => ans.questionId === question._id);

        if (!isAnswered) {
          unanswered.push(question);
        }
      }
    }
    //chỉ lấy id
    const unansweredIds = unanswered.map((question) => question._id);

    return unansweredIds; // Trả về id các câu hỏi chưa được trả lời
  };
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await ResultAPI.getInCompletedExam();
        if (response.code === 200 && response.results) {
          setExamDetails(response.results);

          // Group questions by passageId
          const questions = [
            ...(response.results.examId.questions || []),
            ...(response.results.examId.listeningExams?.flatMap(
              (le: any) => le.questions || []
            ) || []),
          ];
          if (questions.length > 0) { // Added null check
            const grouped = questions.reduce(
              (acc: Record<string, any[]>, question: any) => {
                const passageId =
                  question.passageId?._id || question.passageId || "no-passage";
                if (!acc[passageId]) acc[passageId] = [];
                acc[passageId].push(question);
                return acc;
              },
              {}
            );
            setGroupedQuestions(grouped);
          }
          const endTime = new Date(response.results.endTime);
          endTimeRef.current = endTime;
        }
      } catch (error) {
        console.error("Error fetching exam details:", error);
      }
    };

    fetchExamDetails();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const tick = () => {
      if (!endTimeRef.current || Examresult) return;

      const now = new Date();
      const timeLeft = Math.max(
        0,
        Math.floor((endTimeRef.current.getTime() - now.getTime()) / 1000)
      );
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        showAlertModal("Hết thời gian làm bài");
        handleSubmit();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [Examresult]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

 

  const handleAnswerChange = (newAnswer: any) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      if (index !== -1) updated[index] = newAnswer;
      else updated.push(newAnswer);

      return updated;
    });
  };

  const handleListeningAnswerChange = (newAnswer: any) => {
    setListeningAnswers((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      if (index !== -1) updated[index] = newAnswer;
      else updated.push(newAnswer);

      
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (Examresult) {
      showAlertModal("Bạn đã nộp bài rồi");
      return;
    }
    if (!examDetails) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Xác định các câu hỏi chưa trả lời
    const unansweredQuestions = getUnansweredQuestions();
    console.log("Unanswered Questions:", unansweredQuestions);

    // Map answers and listeningAnswers to the required format
    const enrichedAnswers = answers.map((ans) => {
      const question = Object.values(groupedQuestions)
        .flat()
        .find((q) => q._id === ans.questionId);
      return {
        questionId: ans.questionId,
        selectedAnswerId: ans.selectedAnswerId,
        userAnswer: ans.userAnswer,
        questionType: question?.questionType || "",
      };
    });

    const enrichedListeningAnswers = listeningAnswers.map((ans) => {
      const question = Object.values(groupedQuestions)
        .flat()
        .find((q) => q._id === ans.questionId);
      return {
        questionId: ans.questionId,
        selectedAnswerId: ans.selectedAnswerId,
        userAnswer: ans.userAnswer,
        questionType: question?.questionType || "",
      };
    });

    // Extract questionTypes from answers and listeningAnswers
    const questionTypes = [
      ...enrichedAnswers.map((ans) => ans.questionType),
      ...enrichedListeningAnswers.map((ans) => ans.questionType),
    ];

    const submitAnswer: SubmitAnswer = {
      resultId: examDetails._id,
      answers: enrichedAnswers,
      listeningAnswers: enrichedListeningAnswers,
      unansweredQuestions,
      questionTypes, // Removed as it is not part of SubmitAnswer type
    };

    try {
      const response = await ResultAPI.submitAnswer(submitAnswer);
      if (response.code === 200) {
        showAlertModal("Nộp bài thành công");
        setExamresult(response);
        setRemainingTime(0);
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showAlertModal("Đã xảy ra lỗi khi nộp bài.");
    }
  };

  

  const renderListeningSection = (listeningExam: any, sectionIndex: number) => {
    return (
      <div key={listeningExam._id} style={{ marginBottom: "24px" }}>
        <Title level={4}>Phần nghe {sectionIndex}</Title>
        <audio controls style={{ marginBottom: "16px" }}>
          <source src={listeningExam.audio.filePath} type="audio/mpeg" />
        </audio>
        {listeningExam.questions.map((q: any, idx: number) => {
          const questionIndex = globalQuestionIndex++;
          return (
            <Card
              key={q._id || idx}
              ref={(el) => {
                if (el) questionRefs.current[questionIndex] = el;
              }}
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <ListeningQuestionSubmit
                question={q}
                questionType={q.questionType || ""}
                onAnswerChange={handleListeningAnswerChange}
                currentAnswer={listeningAnswers.find(
                  (ans) => ans.questionId === q._id
                )}
                viewOnly={!!Examresult}
                questionIndex={questionIndex} // Pass questionIndex
              />
            </Card>
          );
        })}
      </div>
    );
  };

  const renderQuestionMap = () => {
    let questionNumber = 1;
    const listeningSections = examDetails?.examId.listeningExams || [];
    const readingSections = Object.keys(groupedQuestions).filter(
      (key) => key !== "no-passage"
    );
    const otherQuestions =
      groupedQuestions["no-passage"]?.filter(
        (q) =>
          !listeningSections.some((le:any) =>
            le.questions.some((lq: any) => lq._id === q._id)
          )
      ) || [];

    const getButtonColor = (questionId: string) => {
      if (!Examresult) {
        // Before submission
        const isAnswered =
          answers.some((ans) => ans.questionId === questionId) ||
          listeningAnswers.some((ans) => ans.questionId === questionId);
        return isAnswered ? "#52c41a" : "#d9d9d9"; // Green if answered, gray if not
      } else {
        // After submission
        const correctAnswer =
          Examresult.details?.find((ans) => ans.questionId === questionId) ||
          Examresult.listeningQuestions?.find(
            (ans: any) => ans.questionId === questionId
          );

        if (!correctAnswer) {
          return "#ff4d4f"; // Red for unanswered questions
        }

        return correctAnswer.isCorrect ? "#52c41a" : "#ff4d4f"; // Green if correct, red if incorrect
      }
    };

    return (
      <div
        style={{
          maxHeight: "calc(100vh - 200px)", // Adjust height to avoid overlapping navbar and footer
          paddingRight: "8px",
          overflowY: "auto",
        }}
      >
        {/* Listening Sections */}
        {listeningSections.map((_: any, idx: number) => (
          <div key={`listening-${idx}`} style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginBottom: "8px" }}>
              Phần nghe {idx + 1}
            </Title>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {listeningSections[idx].questions.map((_: any, qIdx: number) => {
                const questionIndex = questionNumber++;
                const buttonColor = getButtonColor(
                  listeningSections[idx].questions[qIdx]._id
                );
                return (
                  <Button
                    size="small"
                    key={`listening-btn-${questionIndex}`}
                    style={{
                      backgroundColor: buttonColor,
                      color: buttonColor === "#d9d9d9" ? "#000" : "#fff",
                    }}
                    onClick={() =>
                      questionRefs.current[questionIndex - 1]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  >
                    {questionIndex}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Reading Sections */}
        {readingSections.map((passageId, idx) => (
          <div key={`reading-${idx}`} style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginBottom: "8px" }}>
              Phần đọc {idx + 1}
            </Title>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {groupedQuestions[passageId].map((q) => {
                const questionIndex = questionNumber++;
                const buttonColor = getButtonColor(q._id);
                return (
                  <Button
                    size="small"
                    key={`reading-btn-${questionIndex}`}
                    style={{
                      backgroundColor: buttonColor,
                      color: buttonColor === "#d9d9d9" ? "#000" : "#fff",
                    }}
                    onClick={() =>
                      questionRefs.current[questionIndex - 1]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  >
                    {questionIndex}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Other Questions */}
        <div>
          <Title level={5} style={{ marginBottom: "8px" }}>
            Câu hỏi khác
          </Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {otherQuestions.map((q) => {
              const questionIndex = questionNumber++;
              const buttonColor = getButtonColor(q._id);
              return (
                <Button
                  size="small"
                  key={`other-btn-${questionIndex}`}
                  style={{
                    backgroundColor: buttonColor,
                    color: buttonColor === "#d9d9d9" ? "#000" : "#fff",
                  }}
                  onClick={() =>
                    questionRefs.current[questionIndex - 1]?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }
                >
                  {questionIndex}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Initialize globalQuestionIndex to 1
  let globalQuestionIndex = 1;

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
          {examDetails?.examId.title}
        </Title>

        {/* Render Listening Sections */}
        {examDetails?.examId.listeningExams?.map((le: any, idx: number) =>
          renderListeningSection(le, idx + 1)
        )}

        {/* Render Non-Listening Questions */}
        {Object.keys(groupedQuestions).length > 1 ||
        !groupedQuestions["no-passage"] ? (
          // Case: Questions grouped by passages
          Object.keys(groupedQuestions).map((passageId, groupIndex) => {
            // Filter out listening questions
            const filteredQuestions = groupedQuestions[passageId].filter(
              (q) =>
                !examDetails?.examId.listeningExams?.some((le: any) =>
                  le.questions.some((lq: any) => lq._id === q._id)
                )
            );

            if (filteredQuestions.length === 0) return null; // Skip if no questions remain after filtering

            return (
              <div
                key={groupIndex}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "24px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                {passageId !== "no-passage" &&
                  filteredQuestions[0]?.passageId?.content && (
                    // Left Panel: Passage Content
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: "500px",
                        padding: "16px",
                        borderRight: "1px solid #ddd",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: filteredQuestions[0].passageId.content.replace(
                          /\n/g,
                          "<br />"
                        ),
                      }}
                    ></div>
                  )}

                {/* Right Panel: Scrollable Questions */}
                <div
                  style={{
                    flex: 2,
                    overflowY: "auto",
                    maxHeight: "500px",
                    padding: "16px",
                  }}
                >
                  {filteredQuestions.map((q, idx) => {
                    // Use globalQuestionIndex for consistent numbering
                    const questionIndex = globalQuestionIndex++;
                    return (
                      <Card
                        key={q._id || idx}
                        ref={(el) => {
                          if (el) questionRefs.current[questionIndex] = el; // Only add non-null elements
                        }}
                        style={{
                          marginBottom: 24,
                          borderRadius: 12,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                       

                        {q.audio ? (
                          <>
                            <audio controls style={{ marginBottom: 8 }}>
                              <source
                                src={q.audio.filePath}
                                type="audio/mpeg"
                              />
                            </audio>
                            <ListeningQuestionSubmit
                              question={q}
                              questionType={q.questionType || ""}
                              onAnswerChange={handleListeningAnswerChange}
                              currentAnswer={listeningAnswers.find(
                                (ans) => ans.questionId === q._id
                              )}
                              viewOnly={!!Examresult}
                              questionIndex={questionIndex} // Pass questionIndex
                            />
                          </>
                        ) : (
                          <QuestionSubmit
                            question={q}
                            questionType={q.questionType || ""}
                            onAnswerChange={handleAnswerChange}
                            currentAnswer={answers.find(
                              (ans) => ans.questionId === q._id
                            )}
                            index={questionIndex}
                            viewOnly={!!Examresult}
                            questionIndex={questionIndex} // Pass questionIndex
                          />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Case: No passages, display questions in a single column
          <div>
            {groupedQuestions["no-passage"]
              ?.filter(
                (q) =>
                  !examDetails?.examId.listeningExams?.some((le: any) =>
                    le.questions.some((lq: any) => lq._id === q._id)
                  )
              )
              .map((q, idx) => {
                const questionIndex = globalQuestionIndex++;
                return (
                  <Card
                    key={q._id || idx}
                    ref={(el) => {
                      if (el) questionRefs.current[questionIndex] = el; // Only add non-null elements
                    }}
                    style={{
                      marginBottom: 24,
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    
                    {q.audio ? (
                      <>
                        <audio controls style={{ marginBottom: 8 }}>
                          <source src={q.audio.filePath} type="audio/mpeg" />
                        </audio>
                        <ListeningQuestionSubmit
                          question={q}
                          questionType={q.questionType || ""}
                          onAnswerChange={handleListeningAnswerChange}
                          currentAnswer={listeningAnswers.find(
                            (ans) => ans.questionId === q._id
                          )}
                          viewOnly={!!Examresult}
                          questionIndex={questionIndex} // Pass questionIndex
                        />
                      </>
                    ) : (
                      <>
                        <QuestionSubmit
                          question={q}
                          questionType={q.questionType || ""}
                          onAnswerChange={handleAnswerChange}
                          currentAnswer={answers.find(
                            (ans) => ans.questionId === q._id
                          )}
                          index={questionIndex}
                          viewOnly={!!Examresult}
                          questionIndex={questionIndex} // Pass questionIndex
                        />
                      </>
                    )}
                  </Card>
                );
              })}
          </div>
        )}

       
        {Examresult && (
          <div className="my-4" ref={resultSectionRef}>
            <Card>
              <Title level={4}>🎯 Kết quả làm bài</Title>

              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="Điểm số"
                    value={Examresult.score}
                    precision={1}
                    suffix="/ 10"
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="Câu đúng"
                    value={Examresult.correctAnswer}
                    suffix={`/ ${Examresult.totalQuestion}`}
                  />
                </Col>
              </Row>

              <Divider />

            </Card>
          </div>
        )}
      </Content>

      <Sider
        width={260}
        theme="light"
        style={{
          position: "fixed", // Cố định Sider
          top: 0,
          right: 0,
          height: "100vh", // Chiều cao toàn màn hình
          background: "#f7f8fa",
          borderLeft: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          overflowY: "auto", // Ensure scrolling works for long content
        }}
      >
        <Affix offsetTop={20}>
          <div style={{ paddingBottom: "80px" /* Space for footer */ }}>
            <Title level={5}>Sơ đồ câu hỏi</Title>
            {renderQuestionMap()}
            <Divider />
            <Title level={5}>
              Thời gian còn lại :{" "}
              <strong
                style={{
                  fontWeight: "bold",
                  color: remainingTime <= 60 ? "#ff4d4f" : "#000",
                }}
              >
                {formatTime(remainingTime)}
              </strong>
            </Title>
            <Button
              type="primary"
              onClick={showSubmitModal}
              disabled={!!Examresult || loading}
              block
            >
              Nộp bài
            </Button>
          </div>
        </Affix>
      </Sider>
      {/*  */}
      <Modal
        title="Xác nhận nộp bài"
        visible={isSubmitModalVisible}
        onOk={() => {
          handleSubmit(); // Gọi hàm handleSubmit khi người dùng xác nhận
          setIsSubmitModalVisible(false); // Đóng Modal sau khi xác nhận
        }}
        onCancel={handleCancelSubmit}
        okText="Có"
        cancelText="Không"
      >
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
      </Modal>
      {/*modal xac nhan nop bai  */}
      <Modal
        title="Xác nhận nộp bài"
        visible={isSubmitModalVisible}
        onOk={async () => {
          setIsSubmitting(true); // Bật trạng thái loading
          await handleSubmit(); // Gọi hàm handleSubmit
          setIsSubmitting(false); // Tắt trạng thái loading
          setIsSubmitModalVisible(false); // Đóng Modal
        }}
        onCancel={handleCancelSubmit}
        okText="Có"
        cancelText="Không"
        confirmLoading={isSubmitting} // Hiển thị loading trên nút "Có"
      >
        <p>Bạn có chắc chắn muốn nộp bài không?</p>
        <p>Còn {getUnansweredQuestions().length} câu hỏi chưa được làm.</p>
      </Modal>
      {/* modal alert */}
      <Modal
        title="Thông báo"
        visible={isAlertModalVisible}
        onOk={() => setIsAlertModalVisible(false)}
        okText="Đóng"
      >
        <p>{alertMessage}</p>
      </Modal>
    </Layout>
  );
};

export default BaiLam;
