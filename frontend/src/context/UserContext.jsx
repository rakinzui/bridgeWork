import { createContext, useState, useEffect } from "react";
import axios from "axios";

// 创建 Context
export const UserContext = createContext(null);

// 创建 Context Provider 组件
export const UserProvider = ({ children }) => {
  // 初始化时读取 localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // 每次 user 改变时同步到 localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    // 同时尝试用 token 更新最新用户信息
    const token = localStorage.getItem("access");
    if (token) {
      axios.get("/api/me/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(err => {
        console.error("获取用户信息失败:", err);
        setUser(null);
        localStorage.removeItem("user");
      });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
