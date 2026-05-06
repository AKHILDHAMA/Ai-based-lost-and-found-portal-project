import React, { useState } from "react";
import axios from "axios";
import { useNotifications } from "../context/NotificationContext";

function NotificationBar() {
  const { notifications, setNotifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [activeClaimId, setActiveClaimId] = useState(null);

  const unread = notifications.filter(n => !n.read).length;

  // ✅ REMOVE ONE NOTIFICATION
  const removeNotification = (claimId) => {
    setNotifications(prev =>
      prev.filter(n => n.claim_id !== claimId)
    );
  };

  // ✅ APPROVE
  const handleApprove = async (claimId) => {
    if (!locationText.trim()) {
      alert("Enter pickup location");
      return;
    }

    await axios.post("http://localhost:4000/api/items/claim/approve", {
      claim_id: claimId,
      location_text: locationText
    });

    alert("Approved & sent");
    removeNotification(claimId);
    setActiveClaimId(null);
    setLocationText("");
  };

  // ✅ REJECT
  const handleReject = async (claimId) => {
    await axios.post("http://localhost:4000/api/items/claim/reject", {
      claim_id: claimId
    });

    alert("Claim rejected");
    removeNotification(claimId);
  };

  return (
    <div className="notification-container">
      <div 
        className={`notification-bell ${unread > 0 ? 'has-unread' : ''} ${open ? 'active' : ''}`}
       onClick={() => {
  setOpen(!open);
  markAllRead();
}}
      >
        <div className="bell-icon">
          🔔
        </div>
        {unread > 0 && (
          <div className="unread-badge">
            {unread}
          </div>
        )}
        <div className="bell-tooltip">
          {unread > 0 ? `${unread} unread notifications` : 'No new notifications'}
        </div>
      </div>

      {open && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <span className="title-icon">📬</span>
              <span className="title-text">Notifications</span>
              {unread > 0 && (
                <span className="title-badge">{unread} new</span>
              )}
            </h3>
            <button 
              className="close-panel-btn"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No notifications yet</p>
                <p className="empty-subtext">You'll see updates here</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`notification-item ${!n.read ? 'unread' : ''} ${n.role === 'owner' ? 'owner-notification' : ''}`}
                  >
                    <div className="notification-header">
                      <div className="notification-icon">
                        {n.role === 'owner' ? '👑' : '👤'}
                      </div>
                      <strong className="notification-title">
                        {n.title}
                      </strong>
                      <span className="notification-badge">
                        {n.role === 'owner' ? 'Owner' : 'Claim'}
                      </span>
                    </div>
                    
                    <p className="notification-body">
                      {n.body}
                    </p>

                    {n.role === "owner" && n.claim_id && (
                      <div className="notification-actions">
                        {activeClaimId === n.claim_id ? (
                          <div className="approve-form">
                            <div className="form-group">
                              <label className="form-label">
                                <span className="label-text">Pickup Location</span>
                                <span className="label-hint">Where should they collect the item?</span>
                              </label>
                              <textarea
                                className="location-textarea"
                                value={locationText}
                                onChange={(e) => setLocationText(e.target.value)}
                                placeholder="Enter specific location details..."
                                rows={3}
                              />
                            </div>
                            
                            <button
                              className="submit-approval-btn"
                              onClick={() => handleApprove(n.claim_id)}
                            >
                              <span className="btn-icon">✅</span>
                              <span className="btn-text">Approve & Send Location</span>
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button
                              className="accept-btn"
                              onClick={() => setActiveClaimId(n.claim_id)}
                            >
                              <span className="btn-icon">✅</span>
                              <span className="btn-text">Accept Claim</span>
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() => handleReject(n.claim_id)}
                            >
                              <span className="btn-icon">❌</span>
                              <span className="btn-text">Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      className="dismiss-btn"
                      onClick={() => removeNotification(n.claim_id || n.id)}
                    >
                      <span className="dismiss-icon">✕</span>
                      <span className="dismiss-text">Dismiss</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="panel-footer">
              <button 
                className="clear-all-btn"
                onClick={() => setNotifications([])}
              >
                <span className="btn-icon">🗑️</span>
                <span className="btn-text">Clear All</span>
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .notification-container {
          position: relative;
          display: inline-block;
        }

        .notification-bell {
          position: relative;
          width: 50px;
          height: 50px;
          background: linear-gradient(145deg, #ffffff, #f5f7fa);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 2px 2px 4px rgba(255, 255, 255, 0.8),
            inset -2px -2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .notification-bell:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.12),
            inset 2px 2px 4px rgba(255, 255, 255, 0.8),
            inset -2px -2px 4px rgba(0, 0, 0, 0.05);
        }

        .notification-bell.active {
          background: linear-gradient(145deg, #667eea, #764ba2);
          color: white;
          box-shadow: 
            0 8px 20px rgba(102, 126, 234, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.2);
        }

        .notification-bell.has-unread {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        }

        .bell-icon {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .notification-bell:hover .bell-icon {
          transform: rotate(-15deg) scale(1.1);
        }

        .unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #ff4757, #ff3838);
          color: white;
          font-size: 11px;
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          box-shadow: 0 3px 8px rgba(255, 71, 87, 0.4);
          animation: bounce 1s infinite alternate;
        }

        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-3px); }
        }

        .bell-tooltip {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: 100;
        }

        .notification-bell:hover .bell-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(5px);
        }

        .notification-panel {
          position: absolute;
          right: 0;
          top: 60px;
          width: 400px;
          background: linear-gradient(145deg, #1f2937, #111827);
          border-radius: 20px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 15px 30px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          overflow: hidden;
          animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .panel-header {
          padding: 20px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .title-icon {
          font-size: 20px;
        }

        .title-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .close-panel-btn {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-panel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .panel-content {
          max-height: 400px;
          overflow-y: auto;
          padding: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .empty-text {
          color: #9ca3af;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .empty-subtext {
          color: #6b7280;
          font-size: 13px;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .notification-item {
          background: linear-gradient(145deg, #2d3748, #1f2937);
          border-radius: 15px;
          padding: 18px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 2px 2px 4px rgba(255, 255, 255, 0.02),
            inset -2px -2px 4px rgba(0, 0, 0, 0.2);
        }

        .notification-item.unread {
          border-left: 4px solid #667eea;
          background: linear-gradient(145deg, #374151, #1f2937);
        }

        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.3),
            inset 2px 2px 4px rgba(255, 255, 255, 0.02),
            inset -2px -2px 4px rgba(0, 0, 0, 0.2);
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .notification-icon {
          font-size: 16px;
          width: 32px;
          height: 32px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-title {
          flex: 1;
          color: #e5e7eb;
          font-size: 15px;
          font-weight: 600;
        }

        .notification-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .notification-body {
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .notification-actions {
          margin: 15px 0;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .accept-btn, .reject-btn, .submit-approval-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .accept-btn {
          background: linear-gradient(145deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .accept-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .reject-btn {
          background: linear-gradient(145deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .reject-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        }

        .approve-form {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
        }

        .label-text {
          display: block;
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 3px;
        }

        .label-hint {
          display: block;
          color: #9ca3af;
          font-size: 11px;
        }

        .location-textarea {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e5e7eb;
          font-size: 13px;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .location-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-approval-btn {
          width: 100%;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          color: white;
          padding: 12px;
        }

        .submit-approval-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-icon {
          font-size: 14px;
        }

        .btn-text {
          white-space: nowrap;
        }

        .dismiss-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #9ca3af;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dismiss-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .dismiss-icon {
          font-size: 12px;
        }

        .panel-footer {
          padding: 15px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .clear-all-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          background: linear-gradient(145deg, #6b7280, #4b5563);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-all-btn:hover {
          background: linear-gradient(145deg, #ef4444, #dc2626);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        /* Scrollbar styling */
        .panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .panel-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 3px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2, #667eea);
        }
      `}</style>
    </div>
  );
}

export default NotificationBar;