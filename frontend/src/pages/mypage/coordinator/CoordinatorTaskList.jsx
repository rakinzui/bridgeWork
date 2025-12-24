import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Mypage.module.css";
import { STATUS_CHOICES } from "../../../config/choices";
import { useTranslation } from "react-i18next";

const CoordinatorTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        console.error(t("coordinator_task_fetch_failed"), error);
      }
    };
    fetchTasks();
  }, []);

  const statusMap = Object.fromEntries(
    STATUS_CHOICES.map((choice) => [choice.value, choice.label])
  );

  return (
    <div className={styles["task-list-section"]}>
      <h2 className={styles["title"]}>{t("coordinator_task_list_title")}</h2>

      {tasks.length === 0 && (
        <p style={{ textAlign: "center" }}>{t("no_coordinator_tasks")}</p>
      )}

      {tasks.length > 0 && (
          <table className={styles["taskTable"]}>
            <thead>
              <tr>
                <th>{t("task_id_number")}</th>
                <th>{t("title")}</th>
                <th>{t("client")}</th>
                <th>{t("status")}</th>
                <th>{t("deadline")}</th>
                <th>{t("detail")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id_number}</td>
                  <td>{task.title}</td>
                  <td>{task.client_username}</td>
                  <td>{statusMap[task.status]}</td>
              <td>
                {task.deadline
                  ? (() => {
                      const d = new Date(task.deadline);
                      return `${d.getFullYear()}/${String(
                        d.getMonth() + 1
                      ).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
                    })()
                  : ""}
              </td>
                  <td>
                    <button
                      style={{ backgroundColor: "#529cea", color: "white" }}
                      onClick={() => navigate(`/task/${task.id}`)}
                    >
                      {t("view_detail")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
  );
};

export default CoordinatorTaskList;