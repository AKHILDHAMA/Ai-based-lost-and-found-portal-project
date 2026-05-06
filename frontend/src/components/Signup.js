import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/users/signup", form);
      alert(res.data);
    } catch (error) {
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Your Account</h2>
        <p className="signup-subtitle">Join us today and get started</p>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="input-group">
            <label htmlFor="name" className="input-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`signup-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="login-redirect">
          <p>Already have an account? <a href="/login" className="login-link">Sign in</a></p>
        </div>
      </div>

      <style jsx>{`
      .signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  perspective: 1200px;
}

.signup-card {
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.15),
    0 20px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  transform: rotateY(2deg) rotateX(-2deg);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.signup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 24px 24px 0 0;
}

.signup-card:hover {
  transform: rotateY(0) rotateX(0) translateY(-10px) scale(1.02);
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.25),
    0 30px 50px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 0 20px rgba(102, 126, 234, 0.3);
}

.signup-title {
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

.signup-title::after {
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

.signup-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 15px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 
    0 0 0 4px rgba(102, 126, 234, 0.2),
    inset 3px 3px 6px rgba(0, 0, 0, 0.05),
    inset -3px -3px 6px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
}

.signup-button {
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
}

.signup-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.signup-button:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 15px 30px rgba(102, 126, 234, 0.4),
    0 10px 20px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.signup-button:hover:not(:disabled)::before {
  left: 100%;
}

.signup-button:active:not(:disabled) {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 
    0 5px 15px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.signup-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 
    0 5px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.signup-button.loading {
  cursor: not-allowed;
}

.spinner {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-redirect {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid rgba(225, 229, 233, 0.6);
  position: relative;
}

.login-redirect::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
}

.login-redirect p {
  color: #666;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  position: relative;
  padding: 2px 4px;
  border-radius: 4px;
}

.login-link::after {
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

.login-link:hover {
  color: #764ba2;
  background: rgba(102, 126, 234, 0.1);
  text-decoration: none;
}

.login-link:hover::after {
  width: 100%;
}
      `}</style>
    </div>
  );
}

export default Signup;