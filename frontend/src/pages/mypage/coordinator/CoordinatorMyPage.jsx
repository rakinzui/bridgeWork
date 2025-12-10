import CoordinatorTaskList from "./CoordinatorTaskList";
import styles from "./css/CoordinatorMyPage.module.css";
import { ROLE_CHOICES } from "../../../config/choices";
import React, { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import CoordinatorMyRequests from "./CoordinatorMyRequests";
import CoordinatorWorkerRequestList from "./CoordinatorWorkerRequestList";

const roleMap = Object.fromEntries(
  ROLE_CHOICES.map(choice => [choice.value, choice.label])
);

const CoordinatorMyPage = () => {
  const { user } = useContext(UserContext);
  
  if (!user) {
     return <div className={styles["client-mypage"]} style={{ color: '#000' }}>ユーザー情報を読み込んでいます...</div>;
  }

  return (
    
    <div className={styles["coordinator-mypage"]}>  
       <div className={styles["top-bar"]} >
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
                cursor: "pointer"
              }}
              onClick={() => window.location.href = "/Home"}
            >
              ホームへ
            </button>
        </div>
       <h1 style={{ textAlign: "center" }}>仲介人マイページ</h1>
       <div>
         <CoordinatorTaskList />
         <CoordinatorMyRequests />
         <CoordinatorWorkerRequestList />
        </div>
    </div>
  );
};

export default CoordinatorMyPage;
