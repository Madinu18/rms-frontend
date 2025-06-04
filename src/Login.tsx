/* eslint-disable prefer-const */
import React, { useState } from 'react';
import './Login.css';
// import qimtronics_login from './assets/qimtronics_background.jpg';


const Login = ({ onLogin }: { onLogin: () => void }) => {
  // const { setUsername } = useUser();
  const [username, setUsernameLogin] = useState('');
  const [password, setPasswordLogin] = useState('');
  const [attempts, setAttempts] = useState(0); // Track failed login attempts
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(''); // Store error message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setErrorMessage(
        <>
          Please enter a <strong>username</strong> and <strong>password</strong>.
        </>
      );
      return;
    }
    const JSON_MESSAGE = JSON.stringify({
      username: username,
      password: password,
    });

    try {
      const response = await fetch('https://monitoring.qimtronics.com:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON_MESSAGE
      });

      const response_json = await response.json();

      if (response.ok) {
        console.log(response_json);
        // setUsername(response_json.data.username);
        localStorage.setItem('id_user', response_json.data.id_user)
        localStorage.setItem('username', response_json.data.username);
        localStorage.setItem('name', response_json.data.name);
        localStorage.setItem('id_company', response_json.data.id_company);
        localStorage.setItem('company_name', response_json.data.company_name);
        localStorage.setItem('company_group', response_json.data.company_group);
        localStorage.setItem('id_role', response_json.data.id_role);
        localStorage.setItem('role_name', response_json.data.role_name);
        localStorage.setItem('token', response_json.data.token);

        const response_device = response_json.data.accessible_device;
        let list_device = response_device.split(',');
        localStorage.setItem('accessible_devices', JSON.stringify(list_device));

        sessionStorage.setItem('userSession', 'authenticated');
        onLogin();
      } else {
        if (response_json.error === 'Invalid username or password') {
          setAttempts(prev => prev + 1); // Increment failed attempt counter

          if (attempts >= 2) {
            setErrorMessage(
              <>
                Wrong <strong>username</strong> or <strong>password</strong>. Please contact your user manager to reset password.
              </>
            );
          } else {
            setErrorMessage(
              <>
                Wrong <strong>username</strong> or <strong>password</strong>. Please try again.
              </>
            );
          }
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleCloseError = () => {
    setErrorMessage(''); // Close error message when clicking the close button
  };

  return (
    <div className='login-page'>
      <div className="login-container">
        {/* Cloudscape-style logo/title */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #0972d3 0%, #035388 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 28,
            borderRadius: 10,
            padding: '10px 32px',
            letterSpacing: 1,
            boxShadow: '0 2px 8px 0 rgba(9, 114, 211, 0.08)',
            marginBottom: 10
          }}>
            Product Support System
          </span>
          {/* <h1 className="app-title" style={{ margin: 0, fontSize: 22, fontWeight: 500, color: '#202840', letterSpacing: 0.5 }}>
            Remote System Management
          </h1> */}
        </div>
        <div className="login-box">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Login</h2>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsernameLogin(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPasswordLogin(e.target.value)} />
            </div>

            {errorMessage && (
              <div className="error-message">
                <span className="error-text">{errorMessage}</span>
                <button type="button" className="close-button" onClick={handleCloseError}>×</button>
              </div>
            )}

            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
        <div style={{
          width: '100%',
          textAlign: 'center',
          marginTop: 30,
          color: '#b0b7c3',
          fontSize: 13,
          letterSpacing: 0.2
        }}>
          <span>@Powered by Qimtronics</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
