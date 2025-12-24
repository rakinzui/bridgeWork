import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Mypage.module.css";
import {REQUEST_STATUS_CHOICES}  from "../../../config/choices";
import { useTranslation } from "react-i18next";

const CoordinatorMyRequests = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get("http://127.0.0.1:8000/api/coordinator/applications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(t("coordinator_request_fetch_success"), response.data);
        setRequests(response.data);
      } catch (error) {
        console.error(t("coordinator_request_fetch_failed"), error);
      }
    };
    fetchRequests();
  }, []);

  const statusMap = Object.fromEntries(
    REQUEST_STATUS_CHOICES.map(choice => [choice.value, choice.label])
  );

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>{t("coordinator_request_list_title")}</h2>

      <table className={styles["taskTable"]}>
        <thead>
          <tr>
            <th>{t("task_id_number")}</th>
            <th>{t("title")}</th>
            <th>{t("client")}</th>
            <th>{t("applied_date")}</th>
            <th>{t("request_status")}</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                {t("no_coordinator_requests")}
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.task_id_number}</td>
                <td>{req.task_title}</td>
                <td>{req.client_username}</td>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinatorMyRequests;