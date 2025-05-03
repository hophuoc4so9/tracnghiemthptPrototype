import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SignUp.css";
import { AuthApi } from "@/services/Auth";

export const SignUp = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Mật khẩu không khớp");
      return;
    }

    try {
      const response = await AuthApi.createUser({
        email,
        password,
        username: name,
        role: selectedRole || "user",
      });

      if (response.status === 201) {
        setMessage(response.data.message);
        if (selectedRole === "teacher") {
          alert("Đăng ký thành công. Đang chờ xác nhận từ quản trị viên");
          navigate("/");
        } else {
          navigate("/Login", {
            state: { message: "Đăng ký thành công" },
          });
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        setMessage(`Đăng ký thất bại: ${error.response.data.message}`);
      } else if (error.request) {
        setMessage("Lỗi mạng: Vui lòng kiểm tra kết nối.");
      } else {
        setMessage(`Lỗi: ${error.message}`);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (step === 1) {
    return (
      <div className="container mt-5">
        <center>
          {" "}
          <h2 className="text-center mb-4">Chọn loại tài khoản</h2>
        </center>
        <div className="row justify-content-center">
          <div className="col-md-4 mb-3" style={{ height: "100%" }}>
            <div
              className={`card ${
                selectedRole === "student" ? "border-primary" : ""
              }`}
              onClick={() => setSelectedRole("student")}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <h5 className="card-title">Học sinh</h5>
                <div className="card-text">
                  <ul>
                    <li>Tham gia các lớp học</li>
                    <li>Tham gia làm bài kiểm tra, ôn tập</li>
                    <li>Theo dõi tiến độ học tập</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3" style={{ height: "100%" }}>
            <div
              className={`card ${
                selectedRole === "teacher" ? "border-primary" : ""
              }`}
              onClick={() => setSelectedRole("teacher")}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <h5 className="card-title">Giáo viên</h5>
                <div className="card-text">
                  <ul>
                    <li>Quản lý ngân hàng câu hỏi</li>
                    <li>Tạo và quản lý các lớp học</li>
                    <li>Theo dõi và đánh giá tiến độ học tập của học sinh</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={() => setStep(2)}
            disabled={!selectedRole}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    );
  }

  // Bước 2: Form đăng ký
  return (
    <div className="wrapper fadeInDown">
      {message && (
        <div className="alert alert-danger alert-fade">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{message}</span>
        </div>
      )}
      <div className="formContent">
        <h2>
          Đăng Ký Tài Khoản{" "}
          {selectedRole === "teacher" ? "Giáo viên" : "Học sinh"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Tài khoản</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nhập tên đăng nhập"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className={`bi ${
                showPassword ? "bi-eye-slash" : "bi-eye"
              } toggle-password`}
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            ></i>
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            Đăng Ký
          </button>
        </form>
        <div className="formFooter">
          <p>
            Đã có tài khoản? <a href="/Login">Đăng nhập</a>
          </p>
          <button className="btn btn-link" onClick={() => setStep(1)}>
            Quay lại chọn loại tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};
