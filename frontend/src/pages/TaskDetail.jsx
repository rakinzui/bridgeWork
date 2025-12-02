import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./css/TaskDetail.module.css";
import { TASK_TYPE_CHOICES, STATUS_CHOICES } from "../config/choices";

const taskTypeMap = Object.fromEntries(TASK_TYPE_CHOICES.map(item => [item.value, item.label]));
const statusMap = Object.fromEntries(STATUS_CHOICES.map(item => [item.value, item.label]));

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/tasks/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
    })
    .then(res => setTask(res.data))
    .catch(err => console.error("Failed to fetch task detail:", err));
  }, [id]);

  if (!task) return <p style={{ textAlign: "center" }}>読み込み中...</p>;

  return (
    <div className={styles["task-detail-container"]}>
      <button onClick={() => navigate(-1)} className={styles["back-button"]}>← 戻る</button>
      <h1>タスク詳細情報</h1>
      <p><strong>タスク番号:</strong> {task.id_number || "なし"}</p>
      <p><strong>タスクタイプ:</strong> {taskTypeMap[task.task_type] || task.task_type}</p>
      <p><strong>委託人:</strong> {task.client?.username || "不明"}</p>
      <p><strong>仲介人:</strong> {task.broker?.username || "応募なし"}</p>
      <p><strong>受託人:</strong> {task.worker?.username || "応募なし"}</p>
      <p><strong>状態:</strong> {statusMap[task.status] || task.status}</p>
      <p><strong>タイトル:</strong> {task.title || "なし"}</p>
      <p><strong>詳細:</strong> {task.description || "なし"}</p>
      <p><strong>報酬:</strong> {task.price || 0}円</p>
      <p><strong>更新日時:</strong> {
        task.updated_at
          ? new Date(task.updated_at).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "なし"
      }</p>
    </div>
  );
};

export default TaskDetail;