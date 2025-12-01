import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 初次加载时向后端获取用户信息
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios.get("http://127.0.0.1:8000/api/me/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
    }
  }, []);

  // user 变化时同步到 localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
