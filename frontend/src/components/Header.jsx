import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./css/Header.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { UserContext } from "../context/UserContext";
import User from "./User";
import UserInfo from "./UserInfo.jsx";

const Header = () => {
  const { user, setUser } = useContext(UserContext);


  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" className={styles.logoLink}>
            <img
              src="/src/assets/img/logo.png"
              alt="BridgeWork Logo"
              className={styles.logo}
            />
          </Link>
        </div>

        <div className={styles.center}>
          <UserInfo />
        </div>

        <div className={styles.right}>
          <User />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;