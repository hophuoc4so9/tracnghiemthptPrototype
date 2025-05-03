import { Tabs } from "antd";
import ListYesNo from "./listYesNo";


export const QuanLyCauHoi = () => {
  const items = [
    {
      key: "yesNo",
      label: "Câu hỏi trắc nghiệm đáp án",
      children: <ListYesNo />,
    },
    // {
    //   key: "blank",
    //   label: "Câu hỏi điền khuyết",
    //   children: <ListBlank />,
    // },
    // {
    //   key: "TFnotgiven",
    //   label: "Câu hỏi True/ False/ not given",
    //   children: <ListTFnotgiven />,
    // },
    // {
    //   key: "listening",
    //   label: "Câu hỏi listening",
    //   children: <ListListening />,
    // },
  ];

  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold">Ngân hàng câu hỏi</h1>
      </center>
      <Tabs defaultActiveKey="yesNo" items={items} />
    </div>
  );
};

export default QuanLyCauHoi;