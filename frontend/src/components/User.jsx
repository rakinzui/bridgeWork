import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";


function User() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const {user, setUser} = React.useContext(UserContext);

  const handleLogin = () => {
     navigate("/login");    
  };

  const handleLogout = () => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
  };

  const handleMyPage = () => {
     if (user.role === "client") {
        navigate("/mypage/client");
     } else if (user.role === "coordinator") {
        navigate("/mypage/coordinator");
     } else if (user.role === "worker") {
        navigate("/mypage/worker");
    }
  };

  return (
    <div>
      {!user ? (
        <button style={{position: "absolute", top: "10px", right: "300px",backgroundColor: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', padding: '8px 16px' }} onClick={handleLogin}>{t('login')}</button>
      ) : (   
        <>
          <button style={{position: "absolute", top: "10px", right: "370px",backgroundColor: '#ed2f2f', border: '1px solid #ee948c', borderRadius: '6px', padding: '8px 16px' }} onClick={handleLogout}>{t('logout')}</button>
          <button style={{position: "absolute", top: "10px", right: "250px",backgroundColor: '#1f6707', border: '1px solid #9be583', borderRadius: '6px', padding: '8px 16px' }} onClick={handleMyPage}>{t('mypage')}</button>
        </>
      )}
    </div>
  );
}

export default User;
