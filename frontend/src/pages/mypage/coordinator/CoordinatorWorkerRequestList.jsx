import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";

const CoordinatorWorkerRequestList = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://127.0.0.1:8000/api/coordinator/worker-requests/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("取得した実行人応募一覧データ:", response.data);
        setRequests(response.data);
      } catch (error) {
        console.error("実行人応募一覧の取得失敗:", error);
      }
    };
    fetchRequests();
  }, []);

  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map(choice => [choice.value, choice.label])
  );

  const handleApprove = async (id) => {
    if (!confirm("この実行人の応募を承認しますか？")) return;
    const token = localStorage.getItem("access");
    try {
      await axios.post(`http://127.0.0.1:8000/api/coordinator/worker-requests/${id}/approve/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("承認しました！");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved" } : r
        )
      );
    } catch (error) {
      alert("承認に失敗しました");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("この実行人の応募を拒否しますか？")) return;

    try {
      await axios.post(`/api/coordinator/worker-requests/${id}/reject/`);
      alert("拒否しました");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "rejected" } : r
        )
      );
    } catch (error) {
      alert("拒否に失敗しました");
    }
  };

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>実行人応募一覧</h2>

      {requests.length > 0 ? (
        <table className={styles["taskTable"]}>
          <thead>
            <tr>
              <th>タスク識別番号</th>
              <th>タイトル</th>
              <th>実行人</th>
              <th>申請日</th>
              <th>状態</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.worker_name}</td>
                <td>{req.created_at}</td>
                <td>{statusMap[req.status]}</td>

                <td>
                  {req.status === "pending" ? (
                    <>
                      <button
                        style={{ backgroundColor: "green", color: "white" }}
                        onClick={() => handleApprove(req.id)}
                      >
                        承認
                      </button>
                      <button
                        style={{ backgroundColor: "red", color: "white", marginLeft: "8px" }}
                        onClick={() => handleReject(req.id)}
                      >
                        拒否
                      </button>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: "center" }}>
          実行人からの応募はまだありません。
        </div>
      )}
    </div>
  );
};

export default CoordinatorWorkerRequestList;