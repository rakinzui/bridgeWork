import React, { useState, useContext } from "react";
import WorkerTaskList from "./WorkerTaskList";
import WorkerRequestList from "./WorkerRequestList";
import styles from "../../css/Mypage.module.css";
import { UserContext } from "../../../context/UserContext";
import MypageHeader from "../../../components/MyPageHeader";
import { useTranslation } from "react-i18next";



const WorkerMyPage = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className={styles["worker-page"]} style={{ color: "#000" }}>
        {t("loading_user_info")}
      </div>
    );
  }

  return (
    <div className={styles["worker-mypage"]}>
      <MypageHeader user={user} />
      <h1 style={{ textAlign: "center" }}>{t("worker_mypage_title")}</h1>
      <WorkerTaskList />
      <WorkerRequestList />
    </div>
  );
};

export default WorkerMyPage;