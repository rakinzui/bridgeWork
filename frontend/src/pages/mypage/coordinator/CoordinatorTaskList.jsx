import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./css/CoordinatorMyPage.module.css";

const CoordinatorTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/coordinator/tasks/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 如果后端返回的是对象，取出数组部分
        const data = Array.isArray(response.data) ? response.data : response.data.results;
        setTasks(data);
      } catch (error) {
        console.error("仲介人タスク取得失敗:", error);
      }
    };
    fetchTasks();
  }, []);

  const statusMap = {
    open: "公開中",
    in_progress: "進行中",
    completed: "完了",
    withdrawn: "取り下げ",
  };

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>担当しているタスク一覧</h2>

      {tasks.length === 0 && (
        <p className={styles["no-tasks-message"]}>担当しているタスクはありません。</p>
      )}

      <table className={styles["taskTable"]}>
        <thead>
          <tr>
            <th>タスク識別番号</th>
            <th>タイトル</th>
            <th>依頼者</th>
            <th>ステータス</th>
            <th>締切</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id_number}</td>
              <td>{task.title}</td>
              <td>{task.client_username}</td>
              <td>{statusMap[task.status]}</td>
              <td>{task.deadline}</td>
              <td>
                <button
                  style={{ backgroundColor: "#529cea", color: "white" }}
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  詳細を見る
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinatorTaskList;