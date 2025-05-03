import { Result } from "@/types/interface";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css"; 
interface ExamInfoBoxProps {
  examDetails: Result;
}

const ExamInfoBox: React.FC<ExamInfoBoxProps> = ({ examDetails }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(examDetails.endTime).getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [examDetails.endTime]);

  // Check if the current path is /KyThi/BaiLam/
  if (location.pathname.startsWith("/KyThi/BaiLam/")) {
    return null;
  }

  return (
    <div className="exam-info-box">
      <Link to={`/KyThi/BaiLam/`} className="exam-link">
        <h2 className="exam-title">{examDetails?.examId?.title }</h2>
        <p className="time-left"><center>{timeLeft}</center></p>
      </Link>
    </div>
  );
};

export default ExamInfoBox;
