 import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

function AddItem() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "lost",
    user_email: "",
    location_text: "",
    latitude: "",
    longitude: ""
  });

  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const savedEmail = localStorage.getItem("userEmail");

  // Auto-fill email on load
  useEffect(() => {
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, user_email: savedEmail }));
    }
  }, []);

  // Email auto-complete suggestions
  const emailDomains = ["gmail.com", "yahoo.com", "outlook.com"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-complete: Suggest domain
    if (name === "user_email") {
      const atIndex = value.indexOf("@");

      if (atIndex > -1) {
        const entered = value.slice(atIndex + 1).toLowerCase();
        const domain = emailDomains.find((d) => d.startsWith(entered));

        if (domain) {
          const completed = value.slice(0, atIndex + 1) + domain;
          setFormData((prev) => ({ ...prev, user_email: completed }));
        } else {
          setFormData((prev) => ({ ...prev, user_email: value }));
        }
      } else {
        setFormData((prev) => ({ ...prev, user_email: value }));
      }

      // Validate after auto-complete
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailError("Enter a valid email address");
      } else {
        setEmailError("");
      }

      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // GPS detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lon }));

        try {
          const r = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );

          setFormData((prev) => ({
            ...prev,
            location_text: r.data.display_name
          }));
        } catch (e) {
          console.log(e);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        alert("Location permission denied");
        setDetectingLocation(false);
      }
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      alert("Fix email before submitting.");
      return;
    }

    setIsLoading(true);
    let imageUrl = null;

    try {
      if (file) {
        const imgData = new FormData();
        imgData.append("image", file);

        const uploadRes = await axios.post(
          "http://localhost:4000/api/upload",
          imgData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              const percent = Math.round((e.loaded * 100) / e.total);
              setUploadProgress(percent);
            }
          }
        );

        imageUrl = uploadRes.data.url;
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed");
      setIsLoading(false);
      return;
    }

    const sendData = {
      ...formData,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      location_text: formData.location_text || null,
      image: imageUrl
    };

    try {
      const res = await axios.post(
        "http://localhost:4000/api/items/add",
        sendData
      );

      if (res.data.match) {
        addNotification(`Match Found: ${res.data.match.title}`);
      } else {
        addNotification("Item added successfully");
      }

      navigate("/items");
    } catch (err) {
      console.log(err);
      alert("item saved successfully ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-item-container">
      <div className="form-header">
        <h1 className="form-title">Report Lost & Found Item</h1>
        <p className="form-subtitle">Help reunite items with their owners</p>
      </div>

      <div className="form-layout">
        <div className="form-left-panel">
          <form onSubmit={handleSubmit} className="add-item-form">
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📋</div>
                <h3 className="section-title">Item Details</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-text">Item Title</span>
                    <span className="label-required">*</span>
                  </label>
                  <input 
                    name="title"
                    placeholder="e.g., Black iPhone 13, Blue Wallet"
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">
                    <span className="label-text">Status</span>
                    <span className="label-required">*</span>
                  </label>
                  <select 
                    name="status"
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="lost">I Lost This Item</option>
                    <option value="found">I Found This Item</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">
                  <span className="label-text">Description</span>
                  <span className="label-required">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Provide detailed description including brand, color, distinguishing features, contents..."
                  onChange={handleChange}
                  className="form-textarea"
                  required
                  rows={4}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📍</div>
                <h3 className="section-title">Location Details</h3>
              </div>
              
              <div className="form-group">
                <label className="input-label">Auto Detect Location</label>
                <div className="location-container">
                  <button 
                    type="button" 
                    onClick={detectLocation} 
                    className={`location-button ${detectingLocation ? 'loading' : ''}`}
                    disabled={detectingLocation}
                  >
                    {detectingLocation ? (
                      <>
                        <div className="spinner-small"></div>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <span className="location-icon">🌍</span>
                        Detect My Location
                      </>
                    )}
                  </button>
                  <div className="location-hint">
                    <span className="hint-icon">ℹ️</span>
                    <span className="hint-text">We'll automatically fill your address</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Address</label>
                <input
                  name="location_text"
                  placeholder="Detected address will appear here..."
                  value={formData.location_text}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📧</div>
                <h3 className="section-title">Contact Information</h3>
              </div>
              
              <div className="form-group">
                <label className="input-label">
                  <span className="label-text">Email Address</span>
                  <span className="label-required">*</span>
                </label>
                <div className="input-with-suggestions">
                  <input
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`form-input ${emailError ? 'input-error' : formData.user_email ? 'input-success' : ''}`}
                    required
                  />
                  {formData.user_email.includes('@') && !emailError && (
                    <div className="suggestions">
                      {emailDomains.map(domain => (
                        <span 
                          key={domain}
                          className="suggestion-badge"
                          onClick={() => {
                            const base = formData.user_email.split('@')[0];
                            setFormData(prev => ({ ...prev, user_email: `${base}@${domain}` }));
                          }}
                        >
                          @{domain}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {emailError && (
                  <div className="error-container">
                    <span className="error-icon">⚠️</span>
                    <span className="error-message">{emailError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span className="button-text">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    <span className="button-text">Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="form-right-panel">
          <div className="upload-section">
            <div className="section-header">
              <div className="section-icon">📷</div>
              <h3 className="section-title">Item Image</h3>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
            >
              {preview ? (
                <div className="preview-container">
                  <div className="preview-overlay">
                    <img
                      src={preview}
                      alt="Preview"
                      className="preview-image"
                    />
                    <div className="preview-actions">
                      <label className="replace-button">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="file-input"
                        />
                        <span className="action-icon">🔄</span>
                        <span className="action-text">Replace</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => { setPreview(null); setFile(null); }}
                        className="remove-button"
                      >
                        <span className="action-icon">🗑️</span>
                        <span className="action-text">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">
                    <div className="upload-icon-bg">📸</div>
                  </div>
                  <div className="upload-texts">
                    <p className="upload-main-text">
                      {dragActive ? 'Drop it like it\'s hot!' : 'Drag & Drop Your Image'}
                    </p>
                    <p className="upload-subtext">or</p>
                  </div>
                  <label className="file-input-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="file-input"
                    />
                    <span className="browse-button">
                      <span className="browse-icon">📁</span>
                      <span className="browse-text">Browse Files</span>
                    </span>
                  </label>
                  <div className="upload-info">
                    <div className="info-item">
                      <span className="info-icon">📏</span>
                      <span className="info-text">Max 5MB</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">✅</span>
                      <span className="info-text">JPG, PNG, WEBP</span>
                    </div>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-title">Uploading</span>
                    <span className="progress-percent">{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    <span className="stat-item">Compressing...</span>
                    <span className="stat-item">Optimizing...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="upload-tips">
              <h4 className="tips-title">💡 Upload Tips</h4>
              <ul className="tips-list">
                <li>Take clear, well-lit photos</li>
                <li>Include unique features or damages</li>
                <li>Show size comparison if possible</li>
                <li>Multiple angles increase recognition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .add-item-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
          max-width: 800px;
        }

        .form-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin: 0 0 16px 0;
          text-shadow: 
            0 2px 10px rgba(0, 0, 0, 0.2),
            0 4px 20px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.5px;
        }

        .form-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
        }

        .form-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          max-width: 1400px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          padding: 40px;
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.3),
            0 20px 40px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform: translateZ(0);
        }

        .form-left-panel {
          background: white;
          border-radius: 25px;
          padding: 40px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.1),
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        .form-right-panel {
          display: flex;
          flex-direction: column;
        }

        .add-item-form {
          display: flex;
          flex-direction: column;
          gap: 35px;
        }

        .form-section {
          background: linear-gradient(145deg, #f9fbfd, #ffffff);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(225, 229, 233, 0.5);
          transition: transform 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .form-section:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .form-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 20px 20px 0 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .section-icon {
          font-size: 28px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 
            0 8px 20px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .label-text {
          color: #333;
        }

        .label-required {
          color: #e74c3c;
          font-weight: bold;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 16px 20px;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          outline: none;
          font-family: inherit;
          box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.2),
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }

        .form-input.input-error {
          border-color: #e74c3c;
          box-shadow: 
            0 0 0 4px rgba(231, 76, 60, 0.2),
            inset 3px 3px 6px rgba(0, 0, 0, 0.05);
        }

        .form-input.input-success {
          border-color: #27ae60;
          box-shadow: 
            0 0 0 4px rgba(39, 174, 96, 0.2),
            inset 3px 3px 6px rgba(0, 0, 0, 0.05);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }

        .input-with-suggestions {
          position: relative;
        }

        .suggestions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .suggestion-badge {
          padding: 6px 12px;
          background: linear-gradient(145deg, #f5f7fa, #ffffff);
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .suggestion-badge:hover {
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 
            0 4px 12px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .error-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: linear-gradient(145deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
          border: 1px solid rgba(231, 76, 60, 0.2);
          border-radius: 8px;
        }

        .error-icon {
          font-size: 0.9rem;
        }

        .error-message {
          font-size: 0.85rem;
          color: #e74c3c;
          font-weight: 600;
        }

        .location-container {
          background: linear-gradient(145deg, #f0f7ff, #ffffff);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .location-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 15px;
          box-shadow: 
            0 6px 18px rgba(102, 126, 234, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .location-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 
            0 10px 25px rgba(102, 126, 234, 0.4),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .location-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .location-icon {
          font-size: 1.2rem;
        }

        .location-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          background: linear-gradient(145deg, #e8f4ff, #ffffff);
          border-radius: 10px;
          font-size: 0.85rem;
          color: #667eea;
        }

        .hint-icon {
          font-size: 0.9rem;
        }

        .hint-text {
          font-weight: 600;
        }

        .upload-section {
          background: linear-gradient(145deg, #ffffff, #f5f7fa);
          border-radius: 25px;
          padding: 30px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.1),
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .upload-area {
          flex: 1;
          border: 3px dashed #cbd5e0;
          border-radius: 20px;
          transition: all 0.4s ease;
          background: linear-gradient(145deg, #fafafa, #ffffff);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .upload-area.drag-active {
          border-color: #667eea;
          background: linear-gradient(145deg, #e8f4ff, #ffffff);
          transform: scale(1.02);
          box-shadow: 
            0 0 30px rgba(102, 126, 234, 0.2),
            inset 0 0 20px rgba(102, 126, 234, 0.1);
        }

        .upload-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .upload-icon {
          margin-bottom: 25px;
        }

        .upload-icon-bg {
          font-size: 64px;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 
            0 15px 35px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          margin: 0 auto;
        }

        .upload-texts {
          margin-bottom: 25px;
        }

        .upload-main-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px 0;
        }

        .upload-subtext {
          font-size: 0.95rem;
          color: #666;
          margin: 0;
        }

        .file-input-label {
          display: inline-block;
          cursor: pointer;
        }

        .file-input {
          display: none;
        }

        .browse-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 30px;
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 
            0 6px 18px rgba(102, 126, 234, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .browse-button:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 10px 25px rgba(102, 126, 234, 0.4),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .browse-icon {
          font-size: 1.2rem;
        }

        .upload-info {
          display: flex;
          gap: 20px;
          margin-top: 30px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(145deg, #f5f7fa, #ffffff);
          border-radius: 10px;
          font-size: 0.85rem;
          color: #666;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.05),
            inset 2px 2px 4px rgba(255, 255, 255, 0.8);
        }

        .preview-container {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .preview-overlay {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 15px;
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.2),
            0 8px 25px rgba(0, 0, 0, 0.15);
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .preview-actions {
          display: flex;
          gap: 15px;
        }

        .replace-button, .remove-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .replace-button {
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .remove-button {
          background: linear-gradient(145deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 
            0 4px 12px rgba(239, 68, 68, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .replace-button:hover, .remove-button:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.2),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .progress-container {
          background: linear-gradient(145deg, #f5f7fa, #ffffff);
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .progress-title {
          font-size: 1rem;
          font-weight: 700;
          color: #333;
        }

        .progress-percent {
          font-size: 1.1rem;
          font-weight: 800;
          color: #667eea;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: linear-gradient(145deg, #e1e5e9, #f0f4f8);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
          border-radius: 5px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #666;
        }

        .upload-tips {
          margin-top: 30px;
          background: linear-gradient(145deg, #e8f4ff, #ffffff);
          border-radius: 15px;
          padding: 25px;
          box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.05),
            inset -3px -3px 6px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .tips-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-list li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
          color: #555;
          font-size: 0.9rem;
        }

        .tips-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #667eea;
          font-weight: bold;
        }

        .form-actions {
          margin-top: 30px;
        }

        .submit-button {
          width: 100%;
          padding: 20px;
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          box-shadow: 
            0 10px 30px rgba(102, 126, 234, 0.4),
            0 6px 18px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.7s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 
            0 15px 40px rgba(102, 126, 234, 0.6),
            0 10px 25px rgba(102, 126, 234, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-icon {
          font-size: 1.4rem;
        }

        .button-text {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .spinner, .spinner-small {
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner {
          width: 24px;
          height: 24px;
        }

        .spinner-small {
          width: 18px;
          height: 18px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .form-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .form-layout {
            padding: 20px;
          }
          
          .form-left-panel, .upload-section {
            padding: 25px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default AddItem 