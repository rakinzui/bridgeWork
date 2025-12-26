import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Register.module.css'; // 引入 CSS
import { ROLE_CHOICES } from '../config/choices';
import { useTranslation } from "react-i18next";
import LanguageSwitcher from '../components/LanguageSwitcher';


const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '発注者',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage(`${t("password_mismatch")} ❌`);
      return;
    }

    const postData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      role: ROLE_CHOICES.find(r => r.label === formData.role)?.value || '',
    };

    console.log('Sending registration data:', JSON.stringify(postData));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setMessage(`${t("register_success")} ✅`);
      } else {
        let errorMsg = `${t("register_failed")} ❌`;
        try {
          const errorData = await response.json();
          console.error('Registration error response:', errorData);
          if (errorData.detail) {
            errorMsg = `${t("register_failed")} ❌ (${errorData.detail})`;
          } else if (errorData.message) {
            errorMsg = `${t("register_failed")} ❌ (${errorData.message})`;
          } else if (typeof errorData === 'object') {
            errorMsg = `${t("register_failed")} ❌ (` + Object.entries(errorData)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join('; ') + ')';
          }
        } catch (jsonErr) {
          errorMsg += ` (${t("no_server_detail")})`;
        }
        setMessage(errorMsg);
      }
    } catch (error) {
      setMessage(`${t("register_failed")} ❌ (${error.message || t("network_error")})`);
    }
  };

  return (
    <div className={styles['register-container']}>
      <LanguageSwitcher />  
      <h2>{t("register_page_title")}</h2>
      <form
        className={styles['register-form']}
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <label htmlFor="username" style={{ color: '#222' }}>{t("username")}</label>
        <input
          className={styles['register-input']}
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="email" style={{ color: '#222' }}>{t("email")}</label>
        <input
          className={styles['register-input']}
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password" style={{ color: '#222' }}>{t("password")}</label>
        <input
          className={styles['register-input']}
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword" style={{ color: '#222' }}>{t("confirm_password")}</label>
        <input
          className={styles['register-input']}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="role" style={{ color: '#222' }}>{t("user_role")}</label>
        <select
          className={styles['register-input']}
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          {ROLE_CHOICES.map(role => (
            <option key={role.value} value={role.label}>{role.label}</option>
          ))}
        </select>

        <button className={styles['register-button']} type="submit">{t("register")}</button>
      </form>
      {message && <p>{message}</p>}

      <button
        className={styles['register-button']}
        style={{ marginTop: '10px', backgroundColor: '#A0E7E5', color: '#222' }}
        onClick={() => navigate('/')}
      >
        {t("back_to_login")}
      </button>
    </div>
  );
};

export default Register;