import React, { PropsWithChildren, useContext } from "react";

export type TUser = {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: "student" | "teacher" | "admin" | "user";
  __v: number;
};
type TContext = {
  user: TUser | undefined;
  handleLogin: (user: TUser) => void;
  handleLogout: () => void;
};

const AuthContext = React.createContext<TContext | undefined>(undefined);

type TAuthProviderProps = PropsWithChildren<{}>;

const AuthProvider = ({ children }: TAuthProviderProps) => {
  const [user, setUser] = React.useState<TUser | undefined>(
    localStorage.getItem("user")
      ? (JSON.parse(localStorage.getItem("user") ?? "") as TUser)
      : undefined
  );

  const handleLogin = (user: TUser) => {
    setUser(user);
    const { _id, avatar, email, role, username } = user;
    localStorage.setItem("user", JSON.stringify({ _id, avatar, email, role, username }));
  };

  const handleLogout = () => {
    setUser(undefined);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, handleLogout, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = (): TContext => {
  const auth = useContext(AuthContext);
  if (auth === undefined)
    throw new Error("useAuthContext must be used within a AuthProvider");

  return auth;
};

export { useAuthContext };
export default AuthProvider;
