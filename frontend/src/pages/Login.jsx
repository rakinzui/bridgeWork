import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/Login.module.css";

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMsg("ログイン中…");
      
        try{
           const res = await fetch("http://127.0.0.1:8000/api/token/",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
           });

           if (!res.ok) throw new Error("ログイン失敗");
           const data = await res.json();

           localStorage.setItem("access", data.access);
           localStorage.setItem("refresh", data.refresh);

           setMsg("ログイン成功 ✅");
           navigate("/home");

        }catch(err){
            console.log(err)
            setMsg("ログイン失敗 ❌");
        }
    }

    return(
       <div className={styles["login-container"]}>
         <h1>ユーザーログイン</h1>
         <form onSubmit={handleLogin}>
            <input
                className={styles["login-input"]}
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                className={styles["login-input"]}
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button className={styles["login-button"]} type="submit">ログイン</button>
            <p>{msg}</p>
         </form>
         <button
           type="button"
           className={styles["login-button"]}
           onClick={() => navigate("/register")}
         >
           登録ページへ
         </button>
       </div>
    )
}

export default Login