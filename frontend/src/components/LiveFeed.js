import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { Navigate } from "react-router-dom";

function LiveFeed() {
  const [items, setItems] = useState([]);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("userId"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setItems([]);
      setLoggedIn(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch("http://localhost:4000/api/items/list")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.slice(0, 10));
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Live feed error:", err);
        setIsLoading(false);
      });

    const handler = (item) => {
      setItems((prev) => [item, ...prev]);
    };

    socket.on("new_item", handler);

    return () => {
      socket.off("new_item", handler);
    };
  }, []);

  // redirect if logged out
  if (!loggedIn) {
    return <Navigate to="/signup" />;
  }

  return (
    <div className="live-feed-page">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }

          .live-feed-page {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
          }

          /* Glassmorphism container */
          .feed-container {
            width: 100%;
            max-width: 800px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            border-radius: 2rem;
            padding: 2rem 1.8rem;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }

          /* Header */
          .feed-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 2rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid rgba(255, 255, 255, 0.25);
          }

          .live-badge {
            background: #ef4444;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            animation: pulse 1.5s infinite;
            box-shadow: 0 0 6px #ef4444;
          }

          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }

          .feed-header h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
            letter-spacing: -0.3px;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .feed-header span {
            background: rgba(255,255,255,0.2);
            padding: 0.2rem 0.7rem;
            border-radius: 40px;
            font-size: 0.8rem;
            font-weight: 500;
            color: white;
          }

          /* Loading & empty states */
          .loading-state, .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            font-weight: 500;
          }

          .spinner {
            display: inline-block;
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Items list */
          .items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          /* Individual item card */
          .item-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 1.25rem;
            padding: 1rem 1.25rem;
            transition: all 0.25s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.5);
            animation: fadeSlideUp 0.3s ease-out;
          }

          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .item-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
            background: white;
          }

          .item-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1e1e2f;
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .status-badge {
            font-size: 0.7rem;
            font-weight: 600;
            padding: 0.25rem 0.8rem;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            background: #e2e8f0;
            color: #334155;
          }

          .status-badge.lost {
            background: #fee2e2;
            color: #b91c1c;
          }

          .status-badge.found {
            background: #dcfce7;
            color: #15803d;
          }

          /* Item meta (optional extra info) */
          .item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.7rem;
            color: #64748b;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #eef2ff;
          }

          .timestamp {
            display: flex;
            align-items: center;
            gap: 0.3rem;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .live-feed-page {
              padding: 1rem;
            }
            .feed-container {
              padding: 1.5rem;
            }
            .feed-header h2 {
              font-size: 1.4rem;
            }
            .item-title {
              font-size: 1rem;
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>

      <div className="feed-container">
        <div className="feed-header">
          <div className="live-badge"></div>
          <h2>Live Recently Reported Items</h2>
          <span>Real-time</span>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading latest reports...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>✨ No items reported yet.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", opacity: 0.8 }}>
              New lost & found items will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-title">
                  <span>{item.title || "Untitled Item"}</span>
                  <span className={`status-badge ${item.status === "lost" ? "lost" : "found"}`}>
                    {item.status === "lost" ? "🔴 Lost" : "🟢 Found"}
                  </span>
                </div>
                {/* Optional: show date if available */}
                {item.date_posted && (
                  <div className="item-meta">
                    <div className="timestamp">
                      <span>🕒</span>
                      <span>{new Date(item.date_posted).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveFeed;