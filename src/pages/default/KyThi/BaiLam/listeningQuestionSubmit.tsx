import React, { useState, useEffect } from "react";
import { cleanString } from "@/utils/cn";
import { Input, Radio } from "antd";
import { ListeningQuestion } from "@/types/interface";

export type UserAnswer = {
  questionId: string;
  selectedAnswerId?: string;
  userAnswer?: string[];
};

type ListeningQuestionComponentProps = {
  question: ListeningQuestion;
  questionType: string;
  onAnswerChange: (newAnswer: UserAnswer) => void;
  currentAnswer?: UserAnswer;
  viewOnly?: boolean; // Add viewOnly prop
  questionIndex: number; // Add questionIndex prop
};

const ListeningQuestionSubmit: React.FC<ListeningQuestionComponentProps> = ({
  question,
  questionType,
  onAnswerChange,
  currentAnswer,
  viewOnly = false, // Add viewOnly prop with default value
  questionIndex, // Add questionIndex
}) => {
  const displayContent = question.questionText || "";

  const [localAnswer, setLocalAnswer] = useState<UserAnswer>(
    currentAnswer || { questionId: question._id || "", userAnswer: [] }
  );

  useEffect(() => {
    if (currentAnswer) {
      setLocalAnswer(currentAnswer);
    }
  }, [currentAnswer]);

  const handleCheckboxChange = (
    questionId: string,
    selectedAnswerId: string
  ) => {
    if (viewOnly) return; // Prevent interaction if viewOnly
    const newAnswer: UserAnswer = { questionId, selectedAnswerId };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  const handleFillBlankInputChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    if (viewOnly) return; // Prevent interaction if viewOnly
    // Nếu giá trị mới giống với giá trị hiện tại thì không cần cập nhật
    if (localAnswer.userAnswer && localAnswer.userAnswer[index] === value)
      return;

    // Ensure displayContent is a string before calling .match()
    const expectedCount = (displayContent || " ").match(/_+/g)
      ? (displayContent || "").match(/_+/g)!.length
      : 1;
    let currentUserAnswers: string[] = localAnswer.userAnswer
      ? [...localAnswer.userAnswer]
      : new Array(expectedCount).fill("");
    currentUserAnswers[index] = value;
    const newAnswer: UserAnswer = {
      questionId,
      userAnswer: currentUserAnswers,
    };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  // Render cho phần Fill in the Blanks
  const renderFillInTheBlanks = () => {
    const placeholderRegex = /_+/g;
    const hasPlaceholder = placeholderRegex.test(displayContent);

    if (hasPlaceholder) {
      // Nếu có placeholder, render inline input thay thế cho placeholder
      const parts = displayContent.split(placeholderRegex);
      // matchedPlaceholders chứa tất cả placeholder được tìm thấy
      const matchedPlaceholders = displayContent.match(placeholderRegex) || [];
      return (
        <span>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < matchedPlaceholders.length && (
                <Input
                  style={{
                    width: "150px",
                    display: "inline-block",
                    margin: "0 4px",
                  }}
                  value={localAnswer.userAnswer?.[index] || ""}
                  onChange={(e) =>
                    handleFillBlankInputChange(
                      question._id,
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Điền khuyết ${index + 1}`}
                  disabled={viewOnly} // Disable Input if viewOnly
                />
              )}
            </React.Fragment>
          ))}
        </span>
      );
    } else {
      // Nếu không có placeholder, render toàn bộ nội dung và 1 ô input bên cạnh
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            dangerouslySetInnerHTML={{ __html: cleanString(displayContent) }}
          />
          <Input
            style={{ width: "150px", marginLeft: "8px" }}
            value={localAnswer.userAnswer?.[0] || ""}
            onChange={(e) =>
              handleFillBlankInputChange(question._id, 0, e.target.value)
            }
            placeholder={`Nhập câu trả lời`}
            disabled={viewOnly} // Disable Input if viewOnly
          />
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h5 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        {questionIndex}. {/* Use questionIndex for numbering */}
        {questionType === "6742fb3bd56a2e75dbd817ec" ? (
          renderFillInTheBlanks()
        ) : (
          <span
            dangerouslySetInnerHTML={{ __html: cleanString(displayContent) }}
          />
        )}
      </h5>
      <div className="mt-1">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Radio.Group
            onChange={(e) => handleCheckboxChange(question._id, e.target.value)}
            value={localAnswer.selectedAnswerId}
            disabled={viewOnly} // Disable Radio.Group if viewOnly
          >
            {(question.options || []).map((option) => (
              <div key={String(option.option_id) || ""}>
                <Radio value={option.option_id}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cleanString(option.optionText || ""),
                    }}
                  />
                </Radio>
              </div>
            ))}
          </Radio.Group>
        ) : null}

        {questionType === "6742fb5dd56a2e75dbd817ee" ? (
          <Radio.Group
            onChange={(e) => handleCheckboxChange(question._id, e.target.value)}
            value={localAnswer.selectedAnswerId}
            disabled={viewOnly} // Disable Radio.Group if viewOnly
          >
            <div>
              <Radio value="true">True</Radio>
            </div>
            <div>
              <Radio value="false">False</Radio>
            </div>
            <div>
              <Radio value="notgiven">Not Given</Radio>
            </div>
          </Radio.Group>
        ) : null}
      </div>
      {/* Phần audio của bài nghe có thể được render ở component cha */}
    </div>
  );
};

export default ListeningQuestionSubmit;
