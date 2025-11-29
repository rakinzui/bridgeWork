import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./css/ClientMyPage.module.css";

const ClientTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("/api/client/tasks/");
        setTasks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("タスク取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <p>ロード中...</p>;

  return (
    <div className={styles.taskList}>
      <h2>私の公開タスク</h2>
      <div className={styles.cardContainer}>
        {Array.isArray(tasks) ? tasks.map(task => (
          <div key={task.id} className={styles.taskCard}>
            <p><strong>種類:</strong> {task.task_type}</p>
            <p><strong>報酬:</strong> {task.price}円</p>
            <p><strong>期限:</strong> {task.deadline}</p>
            <p><strong>状態:</strong> {task.status}</p>
          </div>
        )) : null}
      </div>
    </div>
  );
};

export default ClientTaskList;
