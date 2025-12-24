import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { ROLE_CHOICES } from "../config/choices";

const roleMap = Object.fromEntries(
  ROLE_CHOICES.map(choice => [choice.value, choice.label])
);

function UserInfo() {
  const { user } = useContext(UserContext);
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <>
        <div style={{ position: "absolute", top: "10px", left: "260px", color: "black" }}>
          <div>{t("hello_user", { username: user.username })}</div>
          <div>{t("user_type", { role: roleMap[user.role] })}</div>
        </div>
        <div style={{ position: "absolute", top: "10px", left: "500px", color: "black" }}>
          <div>{t("credit_score", { score: user.credit_score })}</div>
        </div>
    </>
  );
}

export default UserInfo;