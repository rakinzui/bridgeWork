import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";

const WorkerRequestList = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("access");
  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map((choice) => [choice.value, choice.label])
  );

  useEffect(() => {
    fetchWorkerRequests();
  }, []);

  const fetchWorkerRequests = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/worker/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error("ワーカー申請一覧の取得に失敗しました:", error);
    }
  };

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles.sectionTitle}>自分の実行人申請一覧</h2>

      <table className={styles.taskTable}>
        <thead>
          <tr>
            <th>タスク識別番号</th>
            <th>タイトル</th>
            <th>申請日</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.created_at}</td>
                <td>{statusMap[req.status]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className={styles.noData}>
                申請データがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerRequestList;
