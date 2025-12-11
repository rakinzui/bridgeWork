import React, { useEffect, useState,useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./css/TaskDetail.module.css";
import { TASK_TYPE_CHOICES, STATUS_CHOICES } from "../config/choices";
import { UserContext } from "../context/UserContext";

const taskTypeMap = Object.fromEntries(TASK_TYPE_CHOICES.map(item => [item.value, item.label]));
const statusMap = Object.fromEntries(STATUS_CHOICES.map(item => [item.value, item.label]));

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [showCoordinatorMessage, setShowCoordinatorMessage] = useState(false);
  const [coordinatorMessage, setCoordinatorMessage] = useState("");
  const [showWorkerMessage, setShowWorkerMessage] = useState(false);
  const [workerMessage, setWorkerMessage] = useState("");

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

  const userType = user?.role;

  const handlecoordinatorApply = async (message) => {
    if (!window.confirm("仲介人として応募しますか？")) return;

    const token = localStorage.getItem("access");

    try {
      const response = await axios.post(
        `/coordinator/tasks/${id}/apply/`,
        { message },
        {
          baseURL: "http://127.0.0.1:8000/api/",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data?.detail || "応募が完了しました");
    } catch (error) {
      console.error("coordinator apply failed:", error);
      alert(error.response?.data?.detail || "応募に失敗しました");
    }
  };

  const handleWorkerApply = async (message) => {
    if (!window.confirm("実行人として応募しますか？")) return;

    const token = localStorage.getItem("access");

    try {
      const response = await axios.post(
        `/worker/tasks/${id}/apply/`,
        { message },
        {
          baseURL: "http://127.0.0.1:8000/api/",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert(response.data?.detail || "応募が完了しました");
    } catch (error) {
      console.error("worker apply failed:", error);
      alert(error.response?.data?.detail || "応募に失敗しました");
    }
  };

  return (
    <div className={styles["task-detail-container"]}>
      <button onClick={() => navigate(-1)} className={styles["back-button"]}>← 戻る</button>
      <h1>タスク詳細情報</h1>
      <p><strong>タスク番号:</strong> {task.id_number || "なし"}</p>
      <p><strong>タスクタイプ:</strong> {taskTypeMap[task.task_type] || task.task_type}</p>
      <p><strong>委託人:</strong> {task.client?.username || "不明"}</p>
      <p><strong>仲介人:</strong> {task.coordinator?.username || "応募なし"}</p>
      <p><strong>実行人:</strong> {task.worker?.username || "応募なし"}</p>
      <p><strong>状態:</strong> {statusMap[task.status] || task.status}</p>
      <p><strong>タイトル:</strong> {task.title || "なし"}</p>
      <p><strong>詳細:</strong> {task.description || "なし"}</p>
      <p><strong>応募要件:</strong> {task.skill_required || "なし"}</p>
      <p><strong>納期:</strong> {task.deadline || "なし"}</p>
      <p><strong>報酬:</strong> {task.price || 0}円</p>
      <p><strong>更新日時:</strong> {
        task.updated_at
          ? new Date(task.updated_at).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "なし"
      }</p>
      {userType === "coordinator" && (
        <>
          <button
            onClick={() => setShowCoordinatorMessage(true)}
            className={styles["apply-button"]}
            style={{
              display: showCoordinatorMessage || task.coordinator ? 'none' : 'inline-block',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            仲介人に応募する
          </button>
          {showCoordinatorMessage && (
            <div className={styles["message-input-container"]} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                placeholder="メッセージを入力"
                value={coordinatorMessage}
                onChange={e => setCoordinatorMessage(e.target.value)}
              />
              <button
                className={styles["apply-button"]}
                style={{ backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}
                onClick={async () => {
                  await handlecoordinatorApply(coordinatorMessage);
                  setShowCoordinatorMessage(false); 前端更新显示
                }}
              >
                応募を確定する
              </button>
            </div>
          )}
        </>
      )}
      {userType === "worker" && (
        <>
          <button
            onClick={() => setShowWorkerMessage(true)}
            className={styles["apply-button"]}
            style={{
              display: showWorkerMessage || task.worker ? 'none' : 'inline-block',
              backgroundColor: '#2196F3',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            実行人に応募する
          </button>
          {showWorkerMessage && (
            <div className={styles["message-input-container"]} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                placeholder="メッセージを入力"
                value={workerMessage}
                onChange={e => setWorkerMessage(e.target.value)}
              />
              <button
                className={styles["apply-button"]}
                style={{ backgroundColor: '#2196F3', color: 'white', cursor: 'pointer' }}
                onClick={async () => {
                  await handleWorkerApply(workerMessage);
                  setShowWorkerMessage(false);
                }}
              >
                応募を確定する
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskDetail;