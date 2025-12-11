import React, { useState, useContext } from "react";
import WorkerTaskList from "./WorkerTaskList";
import WorkerRequestList from "./WorkerRequestList";
import styles from "../../css/Mypage.module.css";
import { UserContext } from "../../../context/UserContext";
import { ROLE_CHOICES } from "../../../config/choices";

const roleMap = Object.fromEntries(
  ROLE_CHOICES.map((choice) => [choice.value, choice.label])
);

const WorkerMyPage = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <div className={styles["worker-page"]} style={{ color: "#000" }}>
        ユーザー情報を読み込んでいます...
      </div>
    );
  }

  return (
    <div className={styles["worker-mypage"]}>
      <div className={styles["top-bar"]}>
        <div>こんにちは、{user?.username || "不明"}さん</div>
        <div>ユーザー種別: {roleMap[user?.role] || "不明"}</div>

        <button
          style={{
            marginLeft: "15px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#b7dfef",
            color: "#000000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/Home")}
        >
          ホームへ
        </button>
      </div>
      <h1 style={{ textAlign: "center" }}>実行人マイページ</h1>
      <WorkerTaskList />
      <WorkerRequestList />
    </div>
  );
};

export default WorkerMyPage;