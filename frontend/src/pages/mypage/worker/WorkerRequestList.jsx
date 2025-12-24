import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";
import { useTranslation } from "react-i18next";

const WorkerRequestList = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("access");
  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map((choice) => [choice.value, choice.label])
  );
  const { t } = useTranslation();

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
      console.error(t("worker_request_fetch_failed"), error);
    }
  };

  return (
    <div className={styles["task-list-section"]}>
      <h3>{t("worker_request_list_title")}</h3>

      {requests.length === 0 && (
        <p style={{ textAlign: "center" }}>{t("no_worker_requests")}</p>
      )}

      {requests.length > 0 && (
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th>{t("task_id_number")}</th>
              <th>{t("title")}</th>
              <th>{t("applied_date")}</th>
              <th>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.created_at}</td>
                <td>{statusMap[req.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}  
    </div>
  );
};

export default WorkerRequestList;
