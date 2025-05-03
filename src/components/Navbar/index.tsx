import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, MenuProps } from "antd";
interface navbarProps {
  rule?: boolean;
}

export const Navbar: React.FC<navbarProps> = ({ rule = true }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const { user, handleLogout } = useAuthContext();
  const navigator = useNavigate();

  const handleBTNLogout = async () => {
    handleLogout();
    // logout();
    navigator("/");
    setIsLoggedIn(false);
    setUserName("");
    try {
      const rq = await AuthApi.logout();
      console.log(rq?.data.message);
    } catch (error: any) {
      console.log(error);
    }
  };
  useLayoutEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.username);
    }
  }, [user]);
  const items: MenuProps["items"] = [
    // {
    //   key: "1",
    //   label: (
    //     <a rel="noopener noreferrer" href="/profile">
    //       Thông tin cá nhân
    //     </a>
    //   ),
    // },
    {
      key: "4",
      label: (
        <a
          onClick={() => handleBTNLogout()}
          className="nav-link"
          href="#"
          style={{ color: "#007bff" }}
        >
          <span className="fas fa-sign-out-alt"></span> Đăng xuất
        </a>
      ),
    },
  ];
  return (
    <div id="main">
      <div id="header">
        <div
          onClick={() => navigator("/")}
          id="logo"
          className="cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          <img src="/src/assets/img/P2N 1.svg" alt="Logo"></img>
        </div>

        {rule && (
          <div id="menu">
            <ul className="dsMenu">
              <li>
                <a href="/">Trang chủ </a>
              </li>
              {user && (
                <>
                  <li>
                    <a href="/KyThi">Danh sách Đề Thi</a>
                  </li>

                </>
              )}

            </ul>
          </div>
        )}
        {isLoggedIn ? (
          <ul className="navbar-nav ml-auto">
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["hover"]}
            >
              <div
                onClick={() =>
                  user &&
                  (user.role === "student"
                    ? navigator("/profile")
                    : user?.role === "teacher"
                    ? navigator("/giaovien/")
                    : navigator("/admin"))
                }
                style={{ cursor: "pointer" }}
              >
                <a
                  onClick={(e) => e.preventDefault()}
                  className="nav-link"
                  style={{ color: "#007bff", fontWeight: "bold" }}
                >
                  <li className="nav-item">
                    <span className="fas fa-user"></span> {userName}
                  </li>
                  <li className="nav-item">
                    <span className="fas fa-user"></span>{" "}
                    {user?.role === "student"
                      ? "Học sinh"
                      : user?.role === "teacher"
                      ? "Giáo viên"
                      : "Admin"}
                  </li>
                </a>
              </div>
            </Dropdown>
          </ul>
        ) : (
          <ul
            className="nav nav-pills justify-content-center gap-3"
            id="ex1"
            role="tablist"
          >
            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <a
                className="nav-dn bg-secondary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-login"
                href="/Login"
                role="tab"
                aria-controls="pills-login"
                aria-selected="true"
              >
                Đăng nhập
              </a>
            </li>

            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <a
                className="nav-dn bg-primary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-register"
                href="/SignUp"
                role="tab"
                aria-controls="pills-register"
                aria-selected="false"
              >
                Đăng ký
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

// Utility function to get cookie value
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
