import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./css/Home.module.css";
import { UserContext } from "../context/UserContext";
import { ROLE_CHOICES,TASK_TYPE_CHOICES,STATUS_CHOICES,REQUEST_STATUS_CHOICES} from "../config/choices";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const taskTypeMap = Object.fromEntries(
  TASK_TYPE_CHOICES.map(choice => [choice.value, choice.label])
);

const statusMap = Object.fromEntries(
  STATUS_CHOICES.map(choice => [choice.value, choice.label])
);

const Home = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openableOnly, setOpenableOnly] = useState(false);
  const [sortKey, setSortKey] = useState("updated_desc");
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/tasks/")
      .then(response => setTasks(response.data))
      .catch(err => console.error("Failed to fetch tasks:", err));
  }, []);

  // Listen for custom event "tasks_updated" to refresh task list
  useEffect(() => {
    const handler = () => {
      axios.get("http://127.0.0.1:8000/api/tasks/")
        .then(response => setTasks(response.data))
        .catch(err => console.error("Failed to fetch tasks:", err));
    };
    window.addEventListener("tasks_updated", handler);
    return () => window.removeEventListener("tasks_updated", handler);
  }, []);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
    })
    .then(res => {
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    })
    .catch(err => {
      console.error("Failed to fetch user:", err);
      setUser(null);
      localStorage.removeItem("user");
    });
  }, [setUser]);

  const handleDetail = (task) => {
    if (!user) {
      alert(t("login_required"));
      return;
    }

    const canOpenTask = (task, currentUser) => {
      if (!currentUser) return false;
      if (task.status !== "open") return false;

      const uid = currentUser.id;
      const role = currentUser.role;

      if (role === "client") {
        return task.client?.id === uid;
      } else if (role === "coordinator") {
        return task.coordinator?.id === uid || task.coordinator === null;
      } else if (role === "worker") {
        // worker can view only when coordinator is assigned (not null)
        if (!task.coordinator) return false;
        return task.worker?.id === uid || task.worker === null;
      }
      return false;
    };

    if (!canOpenTask(task, user)) {
      alert(
        t("cannot_view_task")
      );
      return;
    }

    navigate(`/task/${task.id}`);
  };

  return (
    <>

      {/* フィルターセクション */}
      <div className={styles["filter-section"]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            padding: "10px 0"
          }}
        >
          {/* タスク種類 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="typeFilter">
              <strong style={{ color: "#ffffff" }}>{t("task_type")}</strong>
            </label>
            <select
              id="typeFilter"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "none",
                fontSize: "14px"
              }}
            >
              <option value="">{t("all")}</option>
              {Object.entries(taskTypeMap).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* 状態 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="statusFilter">
              <strong style={{ color: "#ffffff" }}>{t("status")}</strong>
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "none",
                fontSize: "14px"
              }}
            >
              <option value="">{t("all")}</option>
              {Object.entries(statusMap).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* ソート */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="sortFilter">
              <strong style={{ color: "#ffffff" }}>{t("sort_by")}</strong>
            </label>
            <select
              id="sortFilter"
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "none",
                fontSize: "14px"
              }}
            >
              <option value="">{t("none")}</option>
              <option value="price_asc">{t("price_asc")}</option>
              <option value="price_desc">{t("price_desc")}</option>
              <option value="updated_asc">{t("updated_asc")}</option>
              <option value="updated_desc">{t("updated_desc")}</option>
            </select>
          </div>

          {/* 開けるタスク */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="openableFilter">
              <strong style={{ color: "#ffffff" }}>{t("openable_only")}</strong>
            </label>
            <input
              type="checkbox"
              id="openableFilter"
              checked={openableOnly}
              onChange={e => setOpenableOnly(e.target.checked)}
              style={{ width: "18px", height: "18px" }}
            />
          </div>
        </div>
      </div>

      {/* タスクカード */}
      {tasks.length === 0 ? (
        <p style={{ textAlign: "center" }}>{t("no_tasks")}</p>
      ) : (
        <div className={styles["home-container"]}>
          {tasks
            .filter(task => {
              const matchType = !filterType || task.task_type === filterType;
              const matchStatus = !filterStatus || task.status === filterStatus;

              const uid = user?.id;
              const role = user?.role;

              const matchOpenable = !openableOnly || (
                user && task.status === "open" && (
                  (role === "client" && task.client?.id === uid) ||
                  ((role === "coordinator" || role === "worker") &&
                    (task[role]?.id === uid || task[role] === null))
                )
              );

              return matchType && matchStatus && matchOpenable;
            })
            .sort((a, b) => {
              if (!sortKey) return 0;
              if (sortKey === "price_asc") return (a.price || 0) - (b.price || 0);
              if (sortKey === "price_desc") return (b.price || 0) - (a.price || 0);
              if (sortKey === "updated_asc") return new Date(a.updated_at) - new Date(b.updated_at);
              if (sortKey === "updated_desc") return new Date(b.updated_at) - new Date(a.updated_at);
              return 0;
            })
            .map(task => (
              <div key={task.id} className={styles["task-card"]} onClick={() => handleDetail(task)}>
                <p><strong>{t("title")}</strong> {task.title || "未設定"}</p>
                <p><strong>{t("task_type")}</strong> {taskTypeMap[task.task_type] || task.task_type}</p>
                <p><strong>{t("client")}</strong> {task.client?.username}</p>
                <p><strong>{t("coordinator")}</strong> {task.coordinator?.username || '応募なし'}</p>
                <p><strong>{t("worker")}</strong> {task.worker?.username || '応募なし'}</p>
                <p><strong>{t("status")}</strong> {statusMap[task.status] || task.status}</p>
                <p><strong>{t("reward")}</strong> {task.price ? `${task.price} 円` : "未設定"}</p>
                <p><strong>{t("deadline")}</strong> {task.deadline || "未設定"}</p>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default Home;