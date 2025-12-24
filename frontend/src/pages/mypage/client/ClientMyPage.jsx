import React, { useContext } from "react";
import ClientTaskForm from "./ClientTaskForm";
import ClientTaskList from "./ClientTaskList";
import styles from "../../css/Mypage.module.css";
import ClientCoordinatorRequestList from "./ClientCoordinatorRequestList";
import { UserContext } from "../../../context/UserContext";
import MypageHeader from "../../../components/MyPageHeader";

const ClientMyPage = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div className={styles["client-mypage"]} style={{ color: '#000' }}>ユーザー情報を読み込んでいます...</div>;
  }

  return (
    <div className={styles["client-mypage"]} >
      {/* 顶部用户信息 */}
      <MypageHeader user={user} />
      <center><h1>依頼者マイページ</h1></center>
      {/* 页面主体 */}
      <div className={styles["main-content"]}>
        {/* 发布任务模块 */}
        <div className={styles["task-form-section"]}>
          <ClientTaskForm user={user} />
        </div>

        {/* 已发布任务列表 */}
        <div className={styles["task-list-section"]}>
          <ClientTaskList user={user} />
        </div>

        {/* 中间人申请列表 */}
        <div className={styles["coordinator-request-section"]}>
          <ClientCoordinatorRequestList user={user} />
        </div>
      </div>
    </div>
  );
};

export default ClientMyPage;