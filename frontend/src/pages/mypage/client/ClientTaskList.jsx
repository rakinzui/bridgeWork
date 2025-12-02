import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./css/ClientMyPage.module.css";
import { TASK_TYPE_CHOICES, STATUS_CHOICES } from "../../../config/choices";

// 创建 value -> label 映射
const taskTypeMap = Object.fromEntries(
  TASK_TYPE_CHOICES.map(choice => [choice.value, choice.label])
);

const filteredStatusChoices = STATUS_CHOICES.filter(s => s.value !== 'in_progress');

const statusMap = Object.fromEntries(
  filteredStatusChoices.map(choice => [choice.value, choice.label])
);

const ClientTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedTasks, setUpdatedTasks] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/client/tasks/list/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }
        });
        setTasks(Array.isArray(res.data) ? res.data : []);
        console.log("タスク取得に成功しました", res.data);
      } catch (err) {
        console.error("タスク取得に失敗しました", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setSelectedStatuses(prev => ({ ...prev, [taskId]: newStatus }));
  };

  const handleUpdateClick = async (taskId) => {
    const newStatus = selectedStatuses[taskId];
    if (!newStatus) return;
    const confirmUpdate = window.confirm("ステータスを変更してもよろしいですか？\n(この操作は取り消せません)");
    if (!confirmUpdate) return;
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/client/tasks/update/${taskId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }
        }
      );
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      setUpdatedTasks(prev => [...prev, taskId]);
    } catch (err) {
      console.error("ステータス更新に失敗しました", err);
    }
  };

  if (loading) return <p>ロード中...</p>;

  // 辅助函数：确保获取字符串 label
  const getTaskTypeLabel = (taskType) => {
    if (!taskType) return "不明";
    return typeof taskType === "string"
      ? taskTypeMap[taskType] || taskType
      : taskType.label || taskTypeMap[taskType.value] || "不明";
  };

  const getStatusLabel = (status) => {
    if (!status) return "不明";
    return typeof status === "string"
      ? statusMap[status] || status
      : status.label || statusMap[status.value] || "不明";
  };

  return (
    <div className={styles.taskList}>
      <h2>私の公開タスク</h2>
      <div className={styles.cardContainer}>
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task.id} className={styles.taskCard}>
              <table className={styles.taskTable}>
                <thead>
                  <tr>
                    <th>種類</th>
                    <th>タイトル</th>
                    <th>報酬</th>
                    <th>期限</th>
                    <th>状態</th>
                    <th>依頼者</th>
                    <th>仲介人</th>
                    <th>受託者</th>
                    <th>詳細</th>
                    <th>詳細説明</th>
                    <th>更新日</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{getTaskTypeLabel(task.task_type)}</td>
                    <td>{task.title}</td>
                    <td>{task.price}円</td>
                    <td>{task.deadline}</td>
                    <td>
                      {(task.status && (task.status.value === "open" || task.status === "open")) ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                          <select
                            value={selectedStatuses[task.id] ?? (task.status?.value || task.status)}
                            onChange={e => handleStatusChange(task.id, e.target.value)}
                            disabled={updatedTasks.includes(task.id)}
                            style={{ fontSize: "0.75rem", padding: "2px 6px" }}
                          >
                            {filteredStatusChoices.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateClick(task.id)}
                            disabled={updatedTasks.includes(task.id)}
                            style={{ fontSize: "0.8rem", padding: "2px 8px" }}
                          >
                            更新
                          </button>
                        </div>
                      ) : (
                        getStatusLabel(task.status)
                      )}
                    </td>
                    <td>{task.client?.username || "未設定"}</td>
                    <td>{task.broker?.username || "未設定"}</td>
                    <td>{task.worker?.username || "未設定"}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      {task.updated_at
                        ? (() => {
                            const d = new Date(task.updated_at);
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const day = String(d.getDate()).padStart(2, "0");
                            const hour = String(d.getHours()).padStart(2, "0");
                            const minute = String(d.getMinutes()).padStart(2, "0");
                            return `${year}年${month}月${day}日 ${hour}時${minute}分`;
                          })()
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>公開タスクはありません</p>
        )}
      </div>
    </div>
  );
};

export default ClientTaskList;