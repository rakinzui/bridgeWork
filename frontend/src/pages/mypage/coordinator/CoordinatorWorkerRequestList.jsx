import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";
import { useTranslation } from "react-i18next";

const CoordinatorWorkerRequestList = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://127.0.0.1:8000/api/coordinator/worker-requests/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(t("coordinator_worker_request_fetch_success"), response.data);
        setRequests(response.data);
      } catch (error) {
        console.error(t("coordinator_worker_request_fetch_failed"), error);
      }
    };
    fetchRequests();
  }, []);

  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map(choice => [choice.value, choice.label])
  );

  const handleApprove = async (id) => {
    if (!confirm(t("confirm_approve_worker_request"))) return;
    const token = localStorage.getItem("access");
    try {
      await axios.post(`http://127.0.0.1:8000/api/coordinator/worker-requests/${id}/approve/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(t("approved_success"));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved" } : r
        )
      );
    } catch (error) {
      alert(t("approved_failed"));
    }
  };

  const handleReject = async (id) => {
    if (!confirm(t("confirm_reject_worker_request"))) return;

    try {
      await axios.post(`/api/coordinator/worker-requests/${id}/reject/`);
      alert(t("rejected_success"));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "rejected" } : r
        )
      );
    } catch (error) {
      alert(t("rejected_failed"));
    }
  };

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>{t("coordinator_worker_request_list_title")}</h2>

      {requests.length > 0 ? (
        <table className={styles["taskTable"]}>
          <thead>
            <tr>
              <th>{t("task_id_number")}</th>
              <th>{t("title")}</th>
              <th>{t("worker")}</th>
              <th>{t("applied_date")}</th>
              <th>{t("status")}</th>
              <th>{t("operation")}</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.worker_name}</td>
                <td>
                    {req.created_at
                      ? (() => {
                          const d = new Date(req.created_at);
                          return `${d.getFullYear()}/${String(
                            d.getMonth() + 1
                          ).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
                        })()
                      : ""}
                </td>
                <td>{statusMap[req.status]}</td>

                <td>
                  {req.status === "pending" ? (
                    <>
                      <button
                        style={{ backgroundColor: "green", color: "white" }}
                        onClick={() => handleApprove(req.id)}
                      >
                        {t("approve")}
                      </button>
                      <button
                        style={{ backgroundColor: "red", color: "white", marginLeft: "8px" }}
                        onClick={() => handleReject(req.id)}
                      >
                        {t("reject")}
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
          {t("no_worker_applications")}
        </div>
      )}
    </div>
  );
};

export default CoordinatorWorkerRequestList;