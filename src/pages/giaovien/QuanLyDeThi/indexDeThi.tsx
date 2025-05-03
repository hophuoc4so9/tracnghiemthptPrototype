import { Tabs } from "antd";
import { QuanLyDeThi } from ".";


export const QuanLyDeThiIndex = () => {
  const items = [
    {
      key: "1",
      label: "Đề thi trắc nghiệm",
      children: <QuanLyDeThi />,
    }
    

  ];

  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold">Quản lý đề thi</h1>
      </center>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default QuanLyDeThiIndex;