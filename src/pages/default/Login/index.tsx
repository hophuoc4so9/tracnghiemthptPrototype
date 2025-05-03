import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { AuthApi } from "@/services/Auth";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

interface Message {
  text: string;
  type: "success" | "error";
}

export const Login = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email: email, password: pass });
      setMessage({ text: rq?.data.message, type: "success" });
      if (rq?.status === 201) {
        handleLogin(rq?.data.user);
        if (rq?.data.user.role === "admin") {
          navigate("/admin");
        } else if (rq?.data.user.role === "teacher") {
          navigate("/giaovien");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      if (error.response) {
        setMessage({
          text: `Login failed: ${error.response.data.message}`,
          type: "error",
        });
      } else if (error.request) {
        setMessage({
          text: "Network error: Please check your connection.",
          type: "error",
        });
      } else {
        setMessage({ text: `Error: ${error.message}`, type: "error" });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2 className={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Tài khoản
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              placeholder="Nhập email"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                value={password}
                placeholder="Nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash" : "bi-eye"
                } eyeIcon`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Đăng nhập
          </button>

          <div className="forget-password">
            <a href="/forgetPass">Quên mật khẩu?</a>
          </div>
          <div className="formFooter">
            <p>
              Chưa có tài khoản? <a href="/SignUp">Đăng ký ngay</a>
            </p>
          </div>
        </form>
        {message && (
          <div
            className={`alert alert-${
              message.type === "success" ? "success" : "danger"
            } mt-3`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
