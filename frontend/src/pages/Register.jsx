import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Register.module.css'; // 引入 CSS
import { ROLE_CHOICES } from '../config/choices';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '依頼人',
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
      setMessage('パスワードが一致しません ❌');
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
        setMessage('登録成功 ✅');
      } else {
        let errorMsg = '登録失敗 ❌';
        try {
          const errorData = await response.json();
          console.error('Registration error response:', errorData);
          if (errorData.detail) {
            errorMsg = `登録失敗 ❌ (${errorData.detail})`;
          } else if (errorData.message) {
            errorMsg = `登録失敗 ❌ (${errorData.message})`;
          } else if (typeof errorData === 'object') {
            errorMsg = '登録失敗 ❌ (' + Object.entries(errorData)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join('; ') + ')';
          }
        } catch (jsonErr) {
          errorMsg += ' (サーバーからの詳細情報なし)';
        }
        setMessage(errorMsg);
      }
    } catch (error) {
      setMessage(`登録失敗 ❌ (${error.message || 'ネットワークエラー'})`);
    }
  };

  return (
    <div className={styles['register-container']}>
      <h2>ユーザー登録</h2>
      <form
        className={styles['register-form']}
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <label htmlFor="username" style={{ color: '#222' }}>ユーザー名</label>
        <input
          className={styles['register-input']}
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="email" style={{ color: '#222' }}>メールアドレス</label>
        <input
          className={styles['register-input']}
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password" style={{ color: '#222' }}>パスワード</label>
        <input
          className={styles['register-input']}
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword" style={{ color: '#222' }}>パスワード確認</label>
        <input
          className={styles['register-input']}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="role" style={{ color: '#222' }}>ユーザー役割</label>
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

        <button className={styles['register-button']} type="submit">登録</button>
      </form>
      {message && <p>{message}</p>}

      <button
        className={styles['register-button']}
        style={{ marginTop: '10px', backgroundColor: '#A0E7E5', color: '#222' }}
        onClick={() => navigate('/')}
      >
        ログイン画面に戻る
      </button>
    </div>
  );
};

export default Register;