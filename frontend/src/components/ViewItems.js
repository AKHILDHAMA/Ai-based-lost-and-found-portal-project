import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RecentActivity from "./RecentActivity";
function ViewItems() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimText, setClaimText] = useState("");

  const navigate = useNavigate();
  const loggedUserId = localStorage.getItem("userId");

  /* =========================
     TIME AGO FUNCTION
  ========================= */

  const timeAgo = (date) => {

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";

    return "just now";

  };

  /* =========================
     LOAD ITEMS
  ========================= */

  useEffect(() => {

    axios.get("http://localhost:4000/api/items/list")
      .then(res => {

        const normalized = res.data.map(i => ({
          ...i,
          status: i.status.toLowerCase()
        }));

        setItems(normalized);
        setLoading(false);

      })
      .catch(err => {

        console.log(err);
        setLoading(false);

      });

  }, []);

  /* =========================
     AUTO TIMER UPDATE
  ========================= */

  useEffect(() => {

    const timer = setInterval(() => {
      setItems(prev => [...prev]);
    }, 60000);

    return () => clearInterval(timer);

  }, []);

  const filteredItems = items.filter(item => {

    if (filter === "all") return true;

    return item.status === filter;

  });

  const openChat = (otherUserEmail, otherUserId) => {

    if (!loggedUserId) {
      alert("Please login to start chatting");
      return;
    }

    if (!otherUserId) {
      alert("Chat unavailable");
      return;
    }

    navigate(`/chat/${loggedUserId}/${otherUserId}`);

  };

  if (loading) {

    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
      </div>
    );

  }

  return (

    <div className="view-items-container">
      <RecentActivity />

      <div className="header-section">

        <h1 className="page-title">Lost & Found Items</h1>

        <p className="page-subtitle">
          Browse, claim, and connect with owners
        </p>

      </div>

      {/* FILTERS */}

      <div className="filter-tabs">

        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          📦 All Item
        </button>

        <button
          className={`filter-btn ${filter === "lost" ? "active" : ""}`}
          onClick={() => setFilter("lost")}
        >
          🔍 Lost Items
        </button>

        <button
          className={`filter-btn ${filter === "found" ? "active" : ""}`}
          onClick={() => setFilter("found")}
        >
          🎯 Found Items
        </button>

      </div>

      {/* ITEMS GRID */}

      <div className="items-grid">

        {filteredItems.map(item => (

          <div key={item.id} className="item-card">

            <div className="item-image-container">

              <img
                src={item.image || "/placeholder.jpg"}
                alt={item.title}
                className="item-image"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                }}
              />

              <span className={`status-badge ${item.status}`}>
                {item.status.toUpperCase()}
              </span>

            </div>

            <div className="item-content">

              <h3 className="item-title">{item.title}</h3>

{item.verified === 1 && (
  <div className="verified-badge">
    ✔ Verified Owner
  </div>
)}

              {/* TIMER FEATURE */}

              <div className="item-time">
                ⏱ Reported {timeAgo(item.created_at)}
              </div>

              <p className="item-description">
                {item.description}
              </p>

              <div className="item-actions">

                <button
                  className="chat-btn"
                  onClick={() => openChat(item.user_email, item.user_id)}
                  disabled={!item.user_id}
                >
                  💬 Chat
                </button>

                {item.status === "found" && item.user_id !== loggedUserId && (

                  <button
                    className="claim-btn"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowClaimForm(true);
                    }}
                  >
                    📝 Claim
                  </button>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* CLAIM POPUP */}

      {showClaimForm && selectedItem && (

        <div className="claim-overlay">

          <div className="claim-box">

            <h3>Claim Item</h3>

            <p>{selectedItem.title}</p>

            <textarea
              placeholder="Describe your claim..."
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
            />

            <div className="claim-actions">

              <button
                onClick={async () => {

                  if (!claimText.trim()) {
                    alert("Please enter claim details");
                    return;
                  }

                  try {

                    await axios.post("http://localhost:4000/api/items/claim", {

  item_id: selectedItem.id,
  claimant_id: loggedUserId,
  answers: claimText

});

alert("Claim submitted! You can now chat with the owner.");

// open chat automatically
navigate(`/chat/${loggedUserId}/${selectedItem.user_id}`);

setShowClaimForm(false);
setClaimText("");

                  } catch {

                    alert("Error submitting claim");

                  }

                }}
              >
                Submit Claim
              </button>

              <button
                onClick={() => {
                  setShowClaimForm(false);
                  setClaimText("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* BASIC CSS */}

      <style>{`


/* ================================
GLOBAL
================================ */

body{
font-family:"Poppins",sans-serif;
background:linear-gradient(135deg,#eef2ff,#e0f2fe,#f8fafc);
}

/* ================================
CONTAINER
================================ */

.view-items-container{
max-width:1400px;
margin:auto;
padding:50px 20px;
}

/* ================================
HEADER
================================ */

.header-section{
text-align:center;
margin-bottom:60px;
}

.page-title{
font-size:3.2rem;
font-weight:900;
background:linear-gradient(135deg,#667eea,#764ba2);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
letter-spacing:-1px;
margin-bottom:12px;
}

.page-subtitle{
font-size:1.15rem;
color:#6b7280;
}

/* ================================
FILTER BUTTONS
================================ */

.filter-tabs{
display:flex;
justify-content:center;
gap:18px;
margin-bottom:45px;
}

.filter-btn{
padding:12px 26px;
border-radius:40px;
border:none;
background:white;
font-weight:600;
cursor:pointer;
box-shadow:0 8px 25px rgba(0,0,0,.08);
transition:.25s;
}

.filter-btn:hover{
transform:translateY(-3px);
box-shadow:0 15px 35px rgba(0,0,0,.15);
}

.filter-btn.active{
background:linear-gradient(135deg,#667eea,#764ba2);
color:white;
}

/* ================================
GRID
================================ */

.items-grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
gap:35px;
}

/* ================================
CARD
================================ */

.item-card{
background:rgba(255,255,255,.8);
backdrop-filter:blur(15px);
border-radius:26px;
overflow:hidden;
box-shadow:0 20px 60px rgba(0,0,0,.12);
transition:.4s;
position:relative;
}

.item-card:hover{
transform:translateY(-14px) scale(1.02);
box-shadow:0 40px 90px rgba(0,0,0,.2);
}

/* ================================
IMAGE
================================ */

.item-image-container{
position:relative;
height:240px;
overflow:hidden;
}

.item-image{
width:100%;
height:100%;
object-fit:cover;
transition:.7s;
}

.item-card:hover .item-image{
transform:scale(1.15);
}

/* DARK GRADIENT */

.item-image-container::after{
content:"";
position:absolute;
inset:0;
background:linear-gradient(transparent,rgba(0,0,0,.35));
}

/* ================================
STATUS BADGE
================================ */

.status-badge{
position:absolute;
top:16px;
right:16px;
padding:7px 15px;
border-radius:20px;
font-size:12px;
font-weight:700;
color:white;
letter-spacing:.5px;
}

.status-badge.lost{
background:linear-gradient(135deg,#ff4d4d,#ff0000);
}

.status-badge.found{
background:linear-gradient(135deg,#2ecc71,#27ae60);
}

/* ================================
CONTENT
================================ */

.item-content{
padding:24px;
}

.item-title{
font-size:1.45rem;
font-weight:700;
margin-bottom:8px;
color:#1f2937;
}

/* VERIFIED */

.verified-badge{
display:inline-block;
background:#ecfdf5;
color:#10b981;
font-size:12px;
padding:5px 10px;
border-radius:8px;
font-weight:600;
margin-bottom:10px;
}

/* TIME */

.item-time{
font-size:13px;
color:#9ca3af;
margin-bottom:12px;
}

/* DESCRIPTION */

.item-description{
font-size:14px;
color:#4b5563;
margin-bottom:20px;
line-height:1.6;

display:-webkit-box;
-webkit-line-clamp:3;
-webkit-box-orient:vertical;
overflow:hidden;
}

/* ================================
ACTION BUTTONS
================================ */

.item-actions{
display:flex;
gap:12px;
}

/* CHAT BUTTON */

.chat-btn{
flex:1;
padding:13px;
border:none;
border-radius:14px;
font-weight:600;
cursor:pointer;
color:white;
background:linear-gradient(135deg,#667eea,#764ba2);
box-shadow:0 10px 30px rgba(102,126,234,.4);
transition:.25s;
}

.chat-btn:hover{
transform:translateY(-3px);
box-shadow:0 18px 40px rgba(102,126,234,.5);
}

/* CLAIM BUTTON */

.claim-btn{
flex:1;
padding:13px;
border:none;
border-radius:14px;
font-weight:600;
cursor:pointer;
color:white;
background:linear-gradient(135deg,#f59e0b,#ea580c);
box-shadow:0 10px 30px rgba(234,88,12,.35);
transition:.25s;
}

.claim-btn:hover{
transform:translateY(-3px);
box-shadow:0 18px 40px rgba(234,88,12,.45);
}

/* ================================
CLAIM MODAL
================================ */

.claim-overlay{
position:fixed;
inset:0;
background:rgba(0,0,0,.55);
display:flex;
align-items:center;
justify-content:center;
backdrop-filter:blur(10px);
z-index:1000;
animation:fadeIn .3s;
}

.claim-box{
width:460px;
background:white;
padding:35px;
border-radius:24px;
box-shadow:0 50px 120px rgba(0,0,0,.4);
animation:popUp .35s;
}

/* TEXTAREA */

.claim-box textarea{
width:100%;
padding:15px;
border-radius:12px;
border:1px solid #ddd;
font-size:14px;
min-height:120px;
margin-top:12px;
transition:.2s;
}

.claim-box textarea:focus{
outline:none;
border-color:#667eea;
box-shadow:0 0 0 3px rgba(102,126,234,.15);
}

/* CLAIM ACTIONS */

.claim-actions{
display:flex;
gap:12px;
margin-top:20px;
}

.claim-actions button{
flex:1;
padding:12px;
border:none;
border-radius:12px;
font-weight:600;
cursor:pointer;
}

/* SUBMIT */

.claim-actions button:first-child{
background:linear-gradient(135deg,#667eea,#764ba2);
color:white;
}

/* CANCEL */

.claim-actions button:last-child{
background:#f3f4f6;
}

/* ================================
LOADING
================================ */

.loading-container{
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
height:350px;
}

.loading-spinner{
width:60px;
height:60px;
border:6px solid #eee;
border-top:6px solid #667eea;
border-radius:50%;
animation:spin 1s linear infinite;
}

/* ================================
ANIMATIONS
================================ */

@keyframes spin{
to{transform:rotate(360deg)}
}

@keyframes fadeIn{
from{opacity:0}
to{opacity:1}
}

@keyframes popUp{
from{
transform:scale(.8);
opacity:0;
}
to{
transform:scale(1);
opacity:1;
}
}

`}</style>

    </div>

  );

}

export default ViewItems;