import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/Login.module.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();
    const { t } = useTranslation();   

    const handleLogin = async (e) => {
        e.preventDefault();
        setMsg(t("logging_in"));
      
        try{
           const res = await fetch("http://127.0.0.1:8000/api/token/",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
           });

           if (!res.ok) throw new Error(t("login_failed"));
           const data = await res.json();

           localStorage.setItem("access", data.access);
           localStorage.setItem("refresh", data.refresh);

           setMsg(`${t("login_success")} ✅`);
           navigate("/home");

        }catch(err){
            console.log(err)
            setMsg(`${t("login_failed")} ❌`);
        }
    }

    return(
       <div className={styles["login-container"]}>
         <h1 style={{ color: "white" }}>{t("login_page_title")}</h1>
         <form onSubmit={handleLogin}>
            <input
                className={styles["login-input"]}
                type="text"
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                className={styles["login-input"]}
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button className={styles["login-button"]} type="submit">{t("login")}</button>
            <p>{msg}</p>
         </form>
         <button
           type="button"
           className={styles["login-button"]}
           onClick={() => navigate("/register")}
         >
           {t("go_register")}
         </button>
       </div>
    )
}

export default Login