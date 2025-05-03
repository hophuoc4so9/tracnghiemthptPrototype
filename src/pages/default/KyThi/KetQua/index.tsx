import { Result, ResultAPI } from "@/services/student";
import { Button, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import ChiTietKetQua from "./ChiTietKetQua";

const { Title } = Typography;

type KetQuaProps = {
  DeThi?: string;
};

export const KetQua: React.FC<KetQuaProps> = ({ DeThi }) => {
  const [detail, setDetail] = useState<Result>();
  const [isDetail, setIsDetail] = useState(false);
  const [result, setResult] = useState<Result[]>([]);

  const fetchAllResult = async () => {
    const res = await ResultAPI.getAllResult(1);
    if (res.code === 200) {
      let filtered = res.data;
      if (DeThi) {
        filtered = filtered.filter(
          (item: { examId: { _id: string } }) => item.examId?._id === DeThi
        );
      }
      setResult(filtered.reverse());
    }
  };

  useEffect(() => {
    fetchAllResult();
  }, [DeThi]);

  const columns = [
    {
      title: "Ngày làm bài",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: "Điểm",
      key: "score",
      render: (record: Result) => `${record.score}/${10.0} điểm`,
    },
    {
      title: "Số câu đúng",
      key: "score",
      render: (record: Result) =>
        `${record.correctAnswer}/${record.questions.length} câu đúng`,
    },
    {
      title: "Thời gian làm",
      key: "duration",
      render: (record: Result) => {
        const start = new Date(record.createdAt).getTime();
        const end = new Date(record.endTime).getTime();
        const duration = Math.round((end - start) / 60000); // ms -> phút
        return `${duration} phút`;
      },
    },

    {
      title: "",
      key: "action",
      render: (record: Result) => (
        <Button
          type="link"
          onClick={() => {
            setDetail(record);
            setIsDetail(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];
  // console.log(detail);
  return (
    <div>
      <center>
        <Title level={3}>Kết quả các lần làm bài</Title>
      </center>

      {isDetail && detail !== undefined ? (
        <div>
          <center style={{ marginBottom: 16 }}>
            <Button type="default" onClick={() => setIsDetail(false)}>
              Quay về danh sách
            </Button>
          </center>
          <ChiTietKetQua result={detail} />
        </div>
      ) : (
        <Table
          style={{ width: "90%", margin: "auto" }}
          columns={columns}
          dataSource={result}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      )}
    </div>
  );
};
