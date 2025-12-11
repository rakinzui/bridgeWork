import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";

const CoordinatorMyRequests = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://127.0.0.1:8000/api/coordinator/applications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("取得した仲介人申請一覧データ:", response.data);
        setRequests(response.data);
      } catch (error) {
        console.error("自分の仲介人申請一覧の取得失敗:", error);
      }
    };
    fetchRequests();
  }, []);

  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map(choice => [choice.value, choice.label])
  );

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>自分の仲介人申請一覧</h2>

      <table className={styles["taskTable"]}>
        <thead>
          <tr>
            <th>タスク識別番号</th>
            <th>タイトル</th>
            <th>依頼者</th>
            <th>申請日</th>
            <th>申請状態</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                送信した仲介人申請はありません。
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.client_username}</td>
                <td>{req.created_at}</td>
                <td>{statusMap[req.status]}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinatorMyRequests;