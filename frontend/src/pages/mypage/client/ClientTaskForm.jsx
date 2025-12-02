import React, { useState } from "react";
import styles from "./css/ClientMyPage.module.css";
import { TASK_TYPE_CHOICES } from "../../../config/choices";

const ClientTaskForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: "",
    task_type: "",
    description: "",
    price: "",
    deadline: "",
    skill_required: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.title || !formData.task_type || !formData.description || !formData.price) {
      setMessage("すべての必須項目を入力してください ❌");
      return;
    }

    const postData = {
      ...formData,
      client: user.id
    };

    try {
      console.log(postData)
      const res = await fetch("http://127.0.0.1:8000/api/client/tasks/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        setMessage("タスクを公開しました ✅");
        setFormData({ title: "", task_type: "", description: "", price: "", deadline: "", skill_required: "" });
      } else {
        const errData = await res.json();
        setMessage("公開失敗 ❌: " + JSON.stringify(errData));
      }
    } catch (err) {
      setMessage("公開失敗 ❌: " + err.message);
    }
  };

  return (
    <>
      <h3>タスクを公開する</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} className={styles["task-form"]}>
        <label>タイトル</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>タスク種類</label>
        <select name="task_type" value={formData.task_type} onChange={handleChange} required>
          <option value="">選択してください</option>
          {TASK_TYPE_CHOICES.map(choice => (
            <option key={choice.value} value={choice.value}>{choice.label}</option>
          ))}
        </select>

        <label>詳細説明</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>応募条件</label>
        <textarea
          name="skill_required"
          value={formData.skill_required}
          onChange={handleChange}
          required
        />

        <br></br>
        <label>報酬 (円)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <label>締切</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />
        
        <br></br>
        <button type="submit"  style={{
            marginLeft: "15px",
            marginTop: "15px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#116663",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}>公開する</button>
      </form>
    </>
  );
};

export default ClientTaskForm;