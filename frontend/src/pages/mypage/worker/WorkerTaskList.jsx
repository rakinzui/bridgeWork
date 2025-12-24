import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";
import { TASK_TYPE_CHOICES,STATUS_CHOICES } from "../../../config/choices";
import { useTranslation } from "react-i18next";
import styles from "../../css/Mypage.module.css";

const WorkerTaskList = () => {
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const { t } = useTranslation();

  const taskTypeMap = Object.fromEntries(
    TASK_TYPE_CHOICES.map((choice) => [choice.value, choice.label])
  );

  const statusMap = Object.fromEntries(
    STATUS_CHOICES.map((choice) => [choice.value, choice.label])
  );

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("access");

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/worker/tasks/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        console.log(t("worker_task_fetch_success"), response.data);
        setTasks(response.data);

  
      } catch (error) {
        console.error(t("worker_task_fetch_failed"), error);
      }
    };

    fetchTasks();
  }, [user]);

  return (
    <div className={styles["task-list-section"]}>
      <h3>{t("worker_task_list_title")}</h3>

      {tasks.length === 0 ? (
        <p style={{ textAlign: "center" }}>{t("no_worker_tasks")}</p>
      ) : (
        <table className={styles["taskTable"]}>
          <thead>
            <tr>
              <th>{t("task_id_number")}</th>
              <th>{t("title")}</th>
              <th>{t("task_type")}</th>
              <th>{t("client")}</th>
              <th>{t("coordinator")}</th>
              <th>{t("status")}</th>
              <th>{t("deadline")}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id_number}</td>
                <td>{task.title}</td>
                <td>{taskTypeMap[task.task_type]}</td>
                <td>{task.client_username || t("unknown")}</td>
                <td>{task.broker_username || t("not_set")}</td>
                <td>{statusMap[task.status]}</td>
                <td>{task.deadline || t("not_set")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WorkerTaskList;
