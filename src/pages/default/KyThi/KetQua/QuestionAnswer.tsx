import React from "react";
import { QuestionAnswerResult } from "@/services/student";
import { cleanString } from "@/utils/cn";
import { Divider, Tag } from "antd";
import "./question.css";

type QuestionComponentProps = {
  question: QuestionAnswerResult;
};

const QuestionAnswerComponent: React.FC<QuestionComponentProps> = ({
  question,
}) => {
  const isFillInTheBlank =
    question.answers.length === 0 ||
    question.answers.some(
      (ans) =>
        ans.correctAnswerForBlank && ans.correctAnswerForBlank.trim() !== ""
    ) ||
    (question as any).blankAnswer;

  const isTrueFalseNotGiven =
    question.correctAnswerForTrueFalseNGV !== undefined;

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      {question.isCorrect ? (
        <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
          Đáp án chọn đúng
        </Divider>
      ) : (
        <Divider orientation="left" style={{ borderColor: "#ff0000" }}>
          Đáp án chọn sai
        </Divider>
      )}

      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <span
          dangerouslySetInnerHTML={{
            __html: cleanString(
              question.content || (question as any).questionText
            ),
          }}
        />
      </h3>

      {isTrueFalseNotGiven ? (
        <div className="ml-2 rounded my-2 p-2 border flex flex-col">
          {["true", "false", "not given"].map((choice) => (
            <div
              key={choice}
              className={`p-2 my-1 rounded ${
                question.correctAnswerForTrueFalseNGV === choice
                  ? "bg-green-100"
                  : question.selectedAnswerId === choice
                  ? "bg-red-100"
                  : ""
              }`}
              style={{
                border: "1px solid #ddd",
                whiteSpace: "pre-wrap",
              }}
            >
              <span>
                <strong>{choice.toUpperCase()}</strong>
              </span>
              {question.correctAnswerForTrueFalseNGV === choice && (
                <Tag color="green" style={{ marginLeft: "8px" }}>
                  Đúng
                </Tag>
              )}
              {question.selectedAnswerId === choice &&
                question.correctAnswerForTrueFalseNGV !== choice && (
                  <Tag color="red" style={{ marginLeft: "8px" }}>
                    Sai
                  </Tag>
                )}
            </div>
          ))}
        </div>
      ) : isFillInTheBlank ? (
        <>
          {question.answers && question.answers.length > 0
            ? question.answers.map((answer, index) => {
                const userAnsObj =
                  question.userAnswers && question.userAnswers[index];
                return (
                  <div
                    key={answer._id}
                    className="ml-2 rounded my-2 p-2 border flex flex-col"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    <div>
                      <strong>Đáp án {index + 1}:</strong>
                    </div>
                    <div>
                      <span>
                        <em>Đáp án của bạn:</em>{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanString(userAnsObj?.userAnswer || ""),
                          }}
                        />
                      </span>
                    </div>
                    <div>
                      <span>
                        <em>Đáp án chính xác:</em>{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanString(
                              answer.correctAnswerForBlank ||
                                (question as any).blankAnswer ||
                                ""
                            ),
                          }}
                        />
                      </span>
                    </div>
                  </div>
                );
              })
            : question.userAnswers.map((userAns, index) => (
                <div
                  key={userAns._id}
                  className="ml-2 rounded my-2 p-2 border flex flex-col"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  <div>
                    <strong>Đáp án {index + 1}:</strong>
                  </div>
                  <div>
                    <span>
                      <em>Đáp án của bạn:</em>{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: cleanString(userAns.userAnswer),
                        }}
                      />
                    </span>
                  </div>
                </div>
              ))}
        </>
      ) : (
        <>
          {question.answers.map((answer) => (
            <div key={answer._id}>
              <div
                className={`ml-2 rounded my-2 d-flex justify-content-between align-items-center 
                ${
                  question.selectedAnswerId === answer._id
                    ? "boder-dap-an-chon"
                    : ""
                } 
                ${answer.isCorrect ? "bg-green-100" : "bg-red-100"}`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanString(answer.text),
                  }}
                />
                <span>
                  <strong>
                    {question.selectedAnswerId === answer._id && "Đáp án chọn"}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default QuestionAnswerComponent;
