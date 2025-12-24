import CoordinatorTaskList from "./CoordinatorTaskList";
import styles from "../../css/Mypage.module.css";
import { ROLE_CHOICES } from "../../../config/choices";
import React, { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import CoordinatorMyRequests from "./CoordinatorMyRequests";
import CoordinatorWorkerRequestList from "./CoordinatorWorkerRequestList";
import MypageHeader from "../../../components/MyPageHeader";
import { useTranslation } from "react-i18next";



const CoordinatorMyPage = () => {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();
  
  if (!user) {
     return <div className={styles["client-mypage"]} style={{ color: '#000' }}>{t("loading_user_info")}</div>;
  }

  return (
    
    <div className={styles["coordinator-mypage"]}>  

       <MypageHeader user={user} />
       <h1 style={{ textAlign: "center" }}>{t("coordinator_mypage_title")}</h1>
       <div>
         <CoordinatorTaskList />
         <CoordinatorMyRequests />
         <CoordinatorWorkerRequestList />
        </div>
    </div>
  );
};

export default CoordinatorMyPage;
