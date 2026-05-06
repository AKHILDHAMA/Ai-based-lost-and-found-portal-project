import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // PROTECT ROUTE
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
    }
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem("adminToken");
    setLoading(true);

    try {
      const [itemsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:4000/api/admin/items", {
          headers: { Authorization: token }
        }),
        axios.get("http://localhost:4000/api/admin/users", {
          headers: { Authorization: token }
        })
      ]);

      setItems(itemsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setDeletingId(id);
    const token = localStorage.getItem("adminToken");

    try {
      await axios.delete(`http://localhost:4000/api/admin/items/${id}`, {
        headers: { Authorization: token }
      });
      await loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    } finally {
      setDeletingId(null);
    }
  };

  const getStats = () => ({
    totalItems: items.length,
    lostItems: items.filter(i => i.status === "lost").length,
    foundItems: items.filter(i => i.status === "found").length,
    totalUsers: users.length
  });

  const stats = getStats();

  // Ripple effect helper
  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "ripple";
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: #0b0e14;
          }

          /* Animated background with floating particles */
          .dashboard-wrapper {
            position: relative;
            min-height: 100vh;
            background: #0b0e14;
            overflow-x: hidden;
          }

          /* Animated gradient background */
          .dashboard-wrapper::before {
            content: '';
            position: fixed;
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
            z-index: -2;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Floating particles */
          .particle {
            position: fixed;
            background: rgba(59,130,246,0.15);
            border-radius: 50%;
            pointer-events: none;
            filter: blur(40px);
            animation: floatParticle 15s infinite alternate;
            z-index: -1;
          }

          @keyframes floatParticle {
            0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            100% { transform: translate(100px, 80px) scale(1.5); opacity: 0.6; }
          }

          /* Main container */
          .dashboard-container {
            position: relative;
            z-index: 1;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* HEADER - glassmorphism */
          .dashboard-header {
            background: rgba(17, 22, 31, 0.8);
            backdrop-filter: blur(12px);
            border-radius: 32px;
            padding: 1rem 2rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid rgba(59,130,246,0.3);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
          }

          .dashboard-header:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
          }

          .dashboard-header h1 {
            font-size: 1.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, #60a5fa);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
          }

          .refresh-btn, .logout-btn {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(59,130,246,0.3);
            padding: 8px 20px;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          }

          .refresh-btn {
            color: #e2e8f0;
            margin-right: 12px;
          }

          .refresh-btn:hover {
            background: #2d3a4f;
            transform: translateY(-1px);
            border-color: #3b82f6;
          }

          .logout-btn {
            color: #3b82f6;
          }

          .logout-btn:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-1px);
            border-color: #3b82f6;
          }

          /* Ripple effect */
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
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

          /* STATS GRID */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: rgba(17, 22, 31, 0.7);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 28px;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(59,130,246,0.2);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }

          .stat-card:hover {
            transform: translateY(-6px);
            border-color: #3b82f6;
            box-shadow: 0 12px 28px rgba(59,130,246,0.15);
            background: rgba(17, 22, 31, 0.85);
          }

          .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            display: inline-block;
            animation: gentleFloat 3s ease-in-out infinite;
          }

          @keyframes gentleFloat {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* TABS */
          .tabs-container {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid rgba(59,130,246,0.2);
            padding-bottom: 0.5rem;
          }

          .tab-btn {
            padding: 10px 28px;
            font-weight: 600;
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            color: #94a3b8;
            border-radius: 40px;
            transition: all 0.2s;
          }

          .tab-btn.active {
            background: rgba(59,130,246,0.2);
            color: #3b82f6;
            backdrop-filter: blur(4px);
          }

          .tab-btn:hover:not(.active) {
            background: rgba(59,130,246,0.1);
            color: #cbd5e1;
          }

          /* CARDS */
          .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .items-grid, .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .item-card, .user-card {
            background: rgba(17, 22, 31, 0.7);
            backdrop-filter: blur(8px);
            border-radius: 24px;
            padding: 1.2rem;
            transition: all 0.3s ease;
            border: 1px solid rgba(59,130,246,0.15);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: cardAppear 0.5s ease backwards;
          }

          @keyframes cardAppear {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .item-card:hover, .user-card:hover {
            transform: translateY(-4px);
            border-color: #3b82f6;
            box-shadow: 0 12px 24px rgba(59,130,246,0.15);
            background: rgba(17, 22, 31, 0.85);
          }

          .item-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: #ffffff;
          }

          .item-status {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 30px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          .status-lost {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239,68,68,0.3);
          }

          .status-found {
            background: rgba(59,130,246,0.15);
            color: #60a5fa;
            border: 1px solid rgba(59,130,246,0.3);
          }

          .delete-btn {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(59,130,246,0.4);
            width: 100%;
            padding: 8px;
            border-radius: 40px;
            color: #3b82f6;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          }

          .delete-btn:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: scale(0.98);
            border-color: #3b82f6;
          }

          .delete-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* USERS */
          .user-card {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .user-avatar {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #1e293b, #2d3a4f);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.3rem;
            color: #3b82f6;
            border: 1px solid #3b82f6;
            transition: 0.2s;
          }

          .user-card:hover .user-avatar {
            transform: scale(1.05);
            border-color: #60a5fa;
          }

          .user-name {
            font-weight: 700;
            color: #ffffff;
          }

          .user-email {
            font-size: 0.85rem;
            color: #94a3b8;
          }

          .empty-state {
            text-align: center;
            padding: 3rem;
            background: rgba(17, 22, 31, 0.6);
            backdrop-filter: blur(8px);
            border-radius: 28px;
            color: #94a3b8;
            border: 1px dashed rgba(59,130,246,0.3);
          }

          /* LOADING */
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            background: #0b0e14;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #1e293b;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin { to { transform: rotate(360deg); } }

          /* Responsive */
          @media (max-width: 768px) {
            .dashboard-container { padding: 1rem; }
            .dashboard-header { flex-direction: column; gap: 1rem; text-align: center; }
            .stats-grid { grid-template-columns: 1fr; }
            .tabs-container { justify-content: center; }
          }
        `}
      </style>

      {/* Floating particles */}
      <div className="particle" style={{ width: '350px', height: '350px', top: '5%', left: '-10%', animationDuration: '20s' }}></div>
      <div className="particle" style={{ width: '250px', height: '250px', bottom: '10%', right: '-5%', animationDuration: '25s' }}></div>
      <div className="particle" style={{ width: '180px', height: '180px', top: '50%', right: '20%', animationDuration: '18s', opacity: 0.4 }}></div>
      <div className="particle" style={{ width: '220px', height: '220px', bottom: '30%', left: '15%', animationDuration: '22s' }}></div>

      <div className="dashboard-container">
        {/* HEADER */}
        <div className="dashboard-header">
          <h1>⚡ Admin Dashboard</h1>
          <div>
            <button className="refresh-btn" onClick={loadData} onMouseDown={createRipple}>⟳ Refresh</button>
            <button className="logout-btn" onClick={handleLogout} onMouseDown={createRipple}>🚪 Logout</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📦</div><div className="stat-value">{stats.totalItems}</div><div className="stat-label">Total Items</div></div>
          <div className="stat-card"><div className="stat-icon">🔍</div><div className="stat-value">{stats.lostItems}</div><div className="stat-label">Lost</div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{stats.foundItems}</div><div className="stat-label">Found</div></div>
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Users</div></div>
        </div>

        {/* TABS */}
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>📋 Items</button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>👥 Users</button>
        </div>

        {/* ITEMS */}
        {activeTab === "items" && (
          <div>
            <div className="section-title"><span>📋</span> Manage Lost & Found</div>
            {items.length === 0 ? <div className="empty-state">✨ No items registered yet.</div> : (
              <div className="items-grid">
                {items.map((item, idx) => (
                  <div key={item.id} className="item-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="item-title">{item.title}</div>
                    <span className={`item-status ${item.status === "lost" ? "status-lost" : "status-found"}`}>
                      {item.status === "lost" ? "🔍 LOST" : "✅ FOUND"}
                    </span>
                    <button className="delete-btn" onClick={() => deleteItem(item.id)} disabled={deletingId === item.id} onMouseDown={createRipple}>
                      {deletingId === item.id ? "⏳ Deleting..." : "🗑 Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div>
            <div className="section-title"><span>👥</span> Registered Users</div>
            {users.length === 0 ? <div className="empty-state">No users found.</div> : (
              <div className="users-grid">
                {users.map((user, idx) => (
                  <div key={user.id} className="user-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                    <div><div className="user-name">{user.name}</div><div className="user-email">{user.email}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;