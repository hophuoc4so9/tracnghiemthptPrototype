import React, { useState } from "react";
import { Modal, DatePicker, Form, message } from "antd";
import { ExamAPI } from "@/services/teacher/Teacher";

interface CreateExamModalProps {
  visible: boolean;
  handleClose: () => void;
  _id: string;
}

const CreateExamModalShedule: React.FC<CreateExamModalProps> = ({
  visible,
  handleClose,
  _id,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const handleDateChange = (name: string, date: any) => {
    if (name === "startTime") {
      setStartTime(date ? date.toDate() : null);
    } else if (name === "endTime") {
      setEndTime(date ? date.toDate() : null);
    }
  };

  const handleSaveClick = async () => {
    if (!startTime || !endTime) {
      message.error("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }

    if (endTime <= startTime) {
      message.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return;
    }

    try {
      const response = await ExamAPI.setScheduleExam(_id, startTime, endTime);
      
      if (response?.success === true) {
        message.success("Sửa lịch thi thành công");
        handleClose();
      } else {
        message.error("Failed to update exam schedule.");
        console.log(response);
      }
    } catch (error) {
      message.error("An error occurred while updating the exam schedule.");
      console.error(error);
    }
  };

  return (
    <Modal
      title="Tạo Đề Thi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Thời gian bắt đầu">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("startTime", date)}
          />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc">
          <DatePicker
            showTime
            onChange={(date) => handleDateChange("endTime", date)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModalShedule;
