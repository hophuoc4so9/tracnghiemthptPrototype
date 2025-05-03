import { useState, useEffect } from "react";
import { Button, Pagination } from "antd"; // Import Pagination
import { ListeningQuestion, listenQuestionAPI } from "@/services/teacher/ListeningQuestion";
import { ListeningQuestionComponent } from "./ListeningQuestion";
import CreateListeningQuestionModal from "./CreateQuestion/CreateListeningQuestion";

export const ListListening = () => {
  const [data, setData] = useState<ListeningQuestion[]>([]);
  const [paginatedData, setPaginatedData] = useState<ListeningQuestion[]>([]); // Data for the current page
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page
  const [pageSize, setPageSize] = useState<number>(10); // Page size

  const getAllQuestions = async () => {
    try {
      const rq = await listenQuestionAPI.getAllListeningQuestions();
      console.log("listening", rq);
      if (rq.data) {
        const questions = rq.data.map((q: any) => ({
          ...q,
          _id: q._id ? String(q._id) : crypto.randomUUID(), // Ensure _id is always a string
        }));
        setData(questions);
        setPaginatedData(questions.slice(0, pageSize)); // Initialize paginated data
      } else {
        setData([]);
        setPaginatedData([]);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.message);
      }
    }
  };

  useEffect(() => {
    getAllQuestions();
  }, []);

  useEffect(() => {
    // Update paginated data whenever currentPage or pageSize changes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [currentPage, pageSize, data]);

  const handleUpdateSuccess = () => {
    getAllQuestions();
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <Button type="primary" className="my-3" onClick={() => setShowModal(true)}>
          Thêm câu hỏi
        </Button>
      </div>
      {paginatedData && paginatedData.map((item) => (
        <ListeningQuestionComponent
          key={item._id}
          question={item}
          onUpdateSuccess={handleUpdateSuccess}
        />
      ))}
     <center><Pagination
        className="mt-4"
        current={currentPage}
        pageSize={pageSize}
        total={data.length} // Total items from the full dataset
        onChange={handlePageChange}
        showSizeChanger
        onShowSizeChange={handlePageChange}
      />
      </center> 
      <CreateListeningQuestionModal
        visible={showModal}
        handleClose={() => {
          setShowModal(false);
          getAllQuestions();
        }}
        onCreateSuccess={getAllQuestions}
      />
    </div>
  );
};

export default ListListening;
