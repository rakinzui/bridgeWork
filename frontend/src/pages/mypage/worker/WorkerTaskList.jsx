import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";
import { TASK_TYPE_CHOICES,STATUS_CHOICES } from "../../../config/choices";
import styles from "../../css/Mypage.module.css";

const WorkerTaskList = () => {
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);

  const taskTypeMap = Object.fromEntries(
    TASK_TYPE_CHOICES.map((choice) => [choice.value, choice.label])
  );

  const statusMap = Object.fromEntries(
    STATUS_CHOICES.map((choice) => [choice.value, choice.label])
  );

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("access");

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/worker/tasks/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        console.log("取得した実行人担当タスクデータ:", response.data);
        setTasks(response.data);

  
      } catch (error) {
        console.error("実行人担当タスク取得エラー:", error);
      }
    };

    fetchTasks();
  }, [user]);

  return (
    <div className={styles["task-list-section"]}>
      <h3>担当タスク一覧</h3>

      {tasks.length === 0 ? (
        <p className={styles["no-data"]}>担当しているタスクはありません。</p>
      ) : (
        <table className={styles["taskTable"]}>
          <thead>
            <tr>
              <th>タスク識別番号</th>
              <th>タイトル</th>
              <th>種類</th>
              <th>依頼者</th>
              <th>仲介人</th>
              <th>状態</th>
              <th>期限</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.id_number}</td>
                <td>{t.title}</td>
                <td>{taskTypeMap[t.task_type]}</td>
                <td>{t.client_username || "不明"}</td>
                <td>{t.broker_username || "未設定"}</td>
                <td>{statusMap[t.status]}</td>
                <td>{t.deadline || "未設定"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkerTaskList;
