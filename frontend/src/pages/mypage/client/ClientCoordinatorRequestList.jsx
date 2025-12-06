import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./css/ClientMyPage.module.css";
import { COORDINATOR_REQUEST_STATUS_CHOICES } from "../../../config/choices";

const ClientCoordinatorRequestList = () => {
  const [requests, setRequests] = useState([]);

  const handleApprove = async (requestId) => {
    if (!window.confirm("この仲介者申請を承認しますか？")) return;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/client/coordinator-requests/${requestId}/approve/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      alert("承認しました！");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "approved" } : r
        )
      );
    } catch (error) {
      console.error("Approve failed:", error);
      alert("承認に失敗しました");
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("この仲介者申請を拒否しますか？")) return;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/client/coordinator-requests/${requestId}/reject/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      alert("拒否しました！");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "rejected" } : r
        )
      );
    } catch (error) {
      console.error("Reject failed:", error);
      alert("拒否に失敗しました");
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/client/coordinator-requests/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (Array.isArray(response.data)) {
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Failed to fetch coordinator requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "20px", color: "#000" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        仲介者申請一覧
      </h2>

      {requests.length === 0 ? (
        <p>現在、仲介者からの申請はありません。</p>
      ) : (
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th>タスク番号</th>
              <th>タイトル</th>
              <th>仲介者</th>
              <th>メッセージ</th>
              <th>状態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.coordinator_name}</td>
                <td>{req.message}</td>
                <td>
                    {COORDINATOR_REQUEST_STATUS_CHOICES.find(c => c.value === req.status)?.label}
                </td>
                <td>
                  {(req.status === "pending" || req.status === null) ? (
                    <>
                      <button
                        style={{ backgroundColor: "#066d63", marginRight: "6px" }}
                        onClick={() => handleApprove(req.id)}
                      >
                        承認
                      </button>
                      <button
                        style={{ backgroundColor: "#cc0000" }}
                        onClick={() => handleReject(req.id)}
                      >
                        拒否
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#555" }}>操作不可</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientCoordinatorRequestList;
