import { useState, useEffect } from "react";
import { Pagination } from "antd";
import QuestionComponent from "./Question";
import CreateQuestionModal from "./CreateQuestion/CreateQuestion"; // Import the modal component
import { Question, QuestionAPI } from "@/services/teacher/Teacher";

export const ListBlank = () => {
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<Question[]>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const getAllQuestionsBlank = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestionsBlank(page);
      console.log(rq);
      if (rq?.code === 200) {
        setData(rq?.questions);
        console.log(rq?.questions);
        setTotal(rq?.totalPage);
        setPage(rq?.currentPage);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  useEffect(() => {
    getAllQuestionsBlank(page);
  }, [page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };
  const handleUpdateSuccess = () => {
    getAllQuestionsBlank(page);
  };
  return (
    <div className="container mx-auto p-4">
      <div>
        <button
          className="btn btn-primary  my-3"
          onClick={() => setShowModal(true)}
        >
          Thêm câu hỏi
        </button>
      </div>
      {data
        ? data.map((item) => (
            <QuestionComponent
              onUpdateSuccess={handleUpdateSuccess}
              question={item}
              questionType={item.questionType || ""}
            />
          ))
        : null}
      <div className="flex justify-center mt-4">
        <Pagination
          current={page}
          total={total}
          onChange={onPageChange}
          pageSize={1}
          style={{ display: "flex", justifyContent: "center" }}
        />
      </div>
      <CreateQuestionModal
        visible={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
};
