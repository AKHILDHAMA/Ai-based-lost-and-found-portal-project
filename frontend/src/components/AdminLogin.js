import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const loginAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/admin/login",
        { email, password }
      );

      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', 'Poppins', system-ui, sans-serif;
            min-height: 100vh;
            background: #0b0e14;
          }

          .login-wrapper {
            position: relative;
            width: 100%;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #0b0e14;
          }

          /* Animated gradient background */
          .login-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              125deg,
              #0b0e14 0%,
              #11161f 30%,
              #1a2a3a 60%,
              #0b0e14 100%
            );
            background-size: 300% 300%;
            animation: gradientShift 12s ease infinite;
            z-index: 0;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Floating particles */
          .particle {
            position: absolute;
            background: rgba(59,130,246,0.2);
            border-radius: 50%;
            pointer-events: none;
            filter: blur(40px);
            animation: floatParticle 15s infinite alternate;
            z-index: 0;
          }

          @keyframes floatParticle {
            0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            100% { transform: translate(100px, 80px) scale(1.5); opacity: 0.6; }
          }

          /* Card */
          .login-card {
            position: relative;
            z-index: 1;
            background: rgba(17, 22, 31, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 32px;
            padding: 2.5rem;
            width: 90%;
            max-width: 440px;
            border: 1px solid rgba(59,130,246,0.3);
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: cardFloat 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          }

          @keyframes cardFloat {
            0% {
              opacity: 0;
              transform: translateY(40px) scale(0.96);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .login-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 35px 55px rgba(0, 0, 0, 0.6);
            border-color: #3b82f6;
          }

          .login-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .login-header h2 {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, #60a5fa);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
          }

          .login-header p {
            color: #94a3b8;
            font-size: 0.9rem;
            margin-top: 0.5rem;
          }

          /* Input groups with floating label effect */
          .input-group {
            margin-bottom: 1.5rem;
            position: relative;
          }

          .input-group input {
            width: 100%;
            padding: 1rem 1.2rem;
            background: #1e293b;
            border: 1px solid #2d3a4f;
            border-radius: 60px;
            font-size: 1rem;
            color: #ffffff;
            outline: none;
            transition: all 0.3s ease;
            font-family: inherit;
          }

          .input-group input:focus {
            border-color: #3b82f6;
            background: #1e293b;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
            transform: scale(1.01);
          }

          .input-group input::placeholder {
            color: #64748b;
            transition: opacity 0.2s;
          }

          .input-group input:focus::placeholder {
            opacity: 0.5;
          }

          /* Button with shine effect */
          .login-btn {
            width: 100%;
            padding: 1rem;
            background: #3b82f6;
            border: none;
            border-radius: 60px;
            color: white;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            margin-top: 0.5rem;
            letter-spacing: 0.5px;
          }

          .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .login-btn:hover::before {
            left: 100%;
          }

          .login-btn:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59,130,246,0.4);
          }

          .login-btn:active:not(:disabled) {
            transform: translateY(0);
          }

          .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Ripple effect */
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: rippleAnim 0.6s linear;
            pointer-events: none;
          }

          @keyframes rippleAnim {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          /* Loading spinner */
          .spinner-small {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Error message with slide-in */
          .error-message {
            background: rgba(239, 68, 68, 0.15);
            border-left: 3px solid #ef4444;
            padding: 0.8rem 1rem;
            border-radius: 16px;
            color: #fca5a5;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideError 0.3s ease;
          }

          @keyframes slideError {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Responsive */
          @media (max-width: 480px) {
            .login-card {
              padding: 1.8rem;
              margin: 1rem;
            }
            .login-header h2 {
              font-size: 1.6rem;
            }
          }
        `}
      </style>

      {/* Animated particles */}
      <div className="particle" style={{ width: '300px', height: '300px', top: '10%', left: '-10%', animationDuration: '18s' }}></div>
      <div className="particle" style={{ width: '200px', height: '200px', bottom: '5%', right: '-5%', animationDuration: '22s' }}></div>
      <div className="particle" style={{ width: '150px', height: '150px', top: '40%', right: '20%', animationDuration: '14s', opacity: 0.4 }}></div>

      <div className="login-card">
        <div className="login-header">
          <h2>⚡ Admin Portal</h2>
          <p>Sign in to manage lost & found items</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={loginAdmin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            onMouseDown={(e) => {
              const btn = e.currentTarget;
              const ripple = document.createElement("span");
              const rect = btn.getBoundingClientRect();
              const size = Math.max(rect.width, rect.height);
              const x = e.clientX - rect.left - size / 2;
              const y = e.clientY - rect.top - size / 2;
              ripple.style.width = ripple.style.height = `${size}px`;
              ripple.style.left = `${x}px`;
              ripple.style.top = `${y}px`;
              ripple.className = "ripple";
              btn.appendChild(ripple);
              setTimeout(() => ripple.remove(), 600);
            }}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span> Authenticating...
              </>
            ) : (
              "🔐 Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;