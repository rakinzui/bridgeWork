import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./css/Home.module.css";
import { UserContext } from "../context/UserContext";
import { ROLE_CHOICES,TASK_TYPE_CHOICES,STATUS_CHOICES,REQUEST_STATUS_CHOICES} from "../config/choices";

const taskTypeMap = Object.fromEntries(
  TASK_TYPE_CHOICES.map(choice => [choice.value, choice.label])
);

const statusMap = Object.fromEntries(
  STATUS_CHOICES.map(choice => [choice.value, choice.label])
);

const roleMap = Object.fromEntries(
  ROLE_CHOICES.map(choice => [choice.value, choice.label])
);

const Home = () => {
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

  if (!user) {
    return <p style={{ textAlign: "center", color: "#fff" }}>ユーザー情報を読み込んでいます...</p>;
  }

  const handleDetail = (task) => {
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
        return task.worker?.id === uid || task.worker === null;
      }
      return false;
    };

    if (!canOpenTask(task, user)) {
      alert(
        "このタスクを閲覧できません。\n\n" +
        "■ 閲覧可能な条件:\n" +
        "1. 状態が『公開中』であること\n" +
        "2. 以下のいずれかに該当すること:\n" +
        "   - あなたが委託人（client）\n" +
        "   - あなたが仲介人（coordinator）または仲介人が未定\n" +
        "   - あなたが受託人（worker）または受託人が未定\n\n" +
        "※ 現在の状態や担当者情報をご確認ください。"
      );
      return;
    }

    navigate(`/task/${task.id}`);
  };

  return (
    <>
      <div style={{
        position: "absolute",
        top: "20px",
        right: "25px",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "16px",
        textAlign: "right"
      }}>
        <div>hello, {user.username}さん</div>
        <div>ユーザー種別: {roleMap[user.role]}</div>
        <button
          style={{
            marginTop: "8px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#00bfa5",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={() => {
            if (!user) {
              alert("ユーザー情報を取得できていません。");
              return;
            }
            if (user.role === "client") {
              navigate("/mypage/client");
            } else if (user.role === "coordinator") {
              navigate("/mypage/coordinator");
            } else if (user.role === "worker") {
              navigate("/mypage/worker");
            } else {
              alert("マイページにアクセスできません。ユーザー種別を確認してください。");
            }
          }}
        >
          マイページ
        </button>
        <button
          style={{
            marginTop: "8px",
            marginLeft: "10px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/");
          }}
        >
          ログアウト
        </button>
      </div>
      <h1 style={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}>BridgeWorkへようこそ</h1>

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
              <strong style={{ color: "#fff" }}>タスク種類:</strong>
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
              <option value="">全て</option>
              {Object.entries(taskTypeMap).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* 状態 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="statusFilter">
              <strong style={{ color: "#fff" }}>状態:</strong>
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
              <option value="">全て</option>
              {Object.entries(statusMap).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* ソート */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="sortFilter">
              <strong style={{ color: "#fff" }}>並び替え:</strong>
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
              <option value="">なし</option>
              <option value="price_asc">報酬（昇順）</option>
              <option value="price_desc">報酬（降順）</option>
              <option value="updated_asc">更新日（古→新）</option>
              <option value="updated_desc">更新日（新→古）</option>
            </select>
          </div>

          {/* 開けるタスク */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="openableFilter">
              <strong style={{ color: "#fff" }}>閲覧可能なタスクのみ:</strong>
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
        <p style={{ textAlign: "center" }}>現在、タスクはありません。</p>
      ) : (
        <div className={styles["home-container"]}>
          {tasks
            .filter(task => {
              const matchType = !filterType || task.task_type === filterType;
              const matchStatus = !filterStatus || task.status === filterStatus;

              const uid = user.id;
              const role = user.role;

              const matchOpenable = !openableOnly || (
                task.status === "open" && (
                  (role === "client" && task.client?.id === uid) ||
                  ((role === "coordinator" || role === "worker") && (task[role]?.id === uid || task[role] === null))
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
                <p><strong>タイトル:</strong> {task.title || "未設定"}</p>
                <p><strong>タスク種類:</strong> {taskTypeMap[task.task_type] || task.task_type}</p>
                <p><strong>依頼者:</strong> {task.client?.username}</p>
                <p><strong>仲介人:</strong> {task.coordinator?.username || '応募なし'}</p>
                <p><strong>実行人:</strong> {task.worker?.username || '応募なし'}</p>
                <p><strong>状態:</strong> {statusMap[task.status] || task.status}</p>
                <p><strong>報酬:</strong> {task.price ? `${task.price} 円` : "未設定"}</p>
                <p><strong>期限:</strong> {task.deadline || "未設定"}</p>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default Home;