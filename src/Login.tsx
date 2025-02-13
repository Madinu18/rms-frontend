import React, { useState } from 'react';
import './Login.css'; // Import the CSS file for styling
import qimtronics_login from './assets/qimtronics_background.jpg';


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
      const response = await fetch('http://157.15.164.78:3001/login', {
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
    <div className="login-container">
      <div className="login-header">
        <img src={qimtronics_login} alt="logo" className="qimstronics-login-image" />
        <h1 className="app-title">Remote System Management</h1>
      </div>
      <div className="separator"></div>
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


    </div>
  );
};

export default Login;
