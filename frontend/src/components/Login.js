import React, { useState } from "react";
import axios from "axios";
import { socket } from "../socket";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/users/login", {
        email,
        password
      });

      // Save login info
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userEmail", res.data.user.email);

      // 🔥 JOIN SOCKET ROOM (MOST IMPORTANT LINE)
      socket.emit("joinRoom", res.data.user.email);

      alert("Login successful");
      window.location.href = "/items";
    } catch (err) {
      alert(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form 
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="login-form"
      >
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue to your account</p>
        
        <div className="input-group">
          <label htmlFor="email" className="input-label">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="signup-redirect">
          <p>Don't have an account? <a href="/signup" className="signup-link">Sign up</a></p>
        </div>
      </form>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          perspective: 1200px;
        }

        .login-form {
          max-width: 420px;
          width: 100%;
          padding: 40px;
          background: linear-gradient(145deg, #ffffff, #f5f7fa);
          border-radius: 24px;
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.15),
            0 20px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          transform: rotateY(2deg) rotateX(-2deg);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .login-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 24px 24px 0 0;
        }

        .login-form:hover {
          transform: rotateY(0) rotateX(0) translateY(-5px) scale(1.01);
          box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.25),
            0 30px 50px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 0 20px rgba(102, 126, 234, 0.3);
        }

        .login-title {
          text-align: center;
          color: #333;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.5px;
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .login-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
        }

        .login-subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 32px;
          font-size: 15px;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .input-label {
          font-size: 14px;
          font-weight: 700;
          color: #333;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          padding: 14px 18px;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
          box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          color: #333;
          width: 100%;
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:focus {
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.2),
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }

        .login-button {
          padding: 16px 24px;
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 10px 20px rgba(102, 126, 234, 0.3),
            0 6px 12px rgba(102, 126, 234, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          width: 100%;
        }

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.7s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 15px 30px rgba(102, 126, 234, 0.4),
            0 10px 20px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .login-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .login-button:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 5px 15px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: 
            0 5px 15px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .login-button:disabled::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 3px solid transparent;
          border-top: 3px solid white;
          border-right: 3px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .signup-redirect {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid rgba(225, 229, 233, 0.6);
          position: relative;
        }

        .signup-redirect::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
        }

        .signup-redirect p {
          color: #666;
          font-size: 15px;
          margin: 0;
          font-weight: 500;
        }

        .signup-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          position: relative;
          padding: 2px 4px;
          border-radius: 4px;
        }

        .signup-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .signup-link:hover {
          color: #764ba2;
          background: rgba(102, 126, 234, 0.1);
          text-decoration: none;
        }

        .signup-link:hover::after {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default Login;