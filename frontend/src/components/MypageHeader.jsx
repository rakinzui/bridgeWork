import styles from "../pages/css/Mypage.module.css"; 
import { ROLE_CHOICES } from "../config/choices";

const roleMap = Object.fromEntries(
  ROLE_CHOICES.map(choice => [choice.value, choice.label])
);

const MypageHeader = () => {
    return (


<div className={styles["top-bar"]} >
    <button
        style={{
          marginLeft: "15px",
          padding: "6px 12px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#b7dfef",
          color: "#000000",
           fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={() => window.location.href = "/Home"}
        >
         ホームへ
    </button>
</div>
    ); 
};

export default MypageHeader;