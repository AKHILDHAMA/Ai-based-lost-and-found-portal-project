import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { Link } from "react-router-dom";

import Signup from "./components/Signup";
import Login from "./components/Login";
import ViewItems from "./components/ViewItems";
import AddItem from "./components/AddItem";
import ChatPage from "./components/ChatPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import NotificationBar from "./components/NotificationBar";
import UserProfile from "./components/UserProfile";

import Chatbot from "./components/Chatbot";
import RecoveryStories from "./components/RecoveryStories";

/* 🔔 NEW FEATURES */
import AlertSubscribe from "./components/AlertSubscribe";
import ItemMap from "./components/ItemMap";
import LiveFeed from "./components/LiveFeed";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { socket } from "./socket";

/* =====================
   AUTH HELPERS
===================== */
const isUserLoggedIn = () => !!localStorage.getItem("userId");
const isAdminLoggedIn = () => !!localStorage.getItem("adminToken");

/* =====================
   PROTECTED ROUTES
===================== */
const UserRoute = ({ children }) =>
  isUserLoggedIn() ? children : <Navigate to="/signup" />;

const AdminRoute = ({ children }) =>
  isAdminLoggedIn() ? children : <Navigate to="/admin-login" />;

/* =====================
   NAVBAR
===================== */
const Navbar = () => {

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [hidden, setHidden] = useState(false);
  let lastScrollY = window.scrollY;

  useEffect(() => {

    const onScroll = () => {
      setHidden(window.scrollY > lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);

  }, []);

  if (!isUserLoggedIn()) return null;

  const isActive = (p) => location.pathname.startsWith(p);

  return (

    <>
      <nav className={`navbar ${hidden ? "hide" : ""} ${theme}`}>

        <div className="nav-content">

          <div className="nav-links">

          <Link className={`nav-link ${isActive("/items") ? "active" : ""}`} to="/items">📦 Items</Link>

<Link className={`nav-link ${isActive("/add") ? "active" : ""}`} to="/add">➕ Add Item</Link>

<Link className={`nav-link ${isActive("/map") ? "active" : ""}`} to="/map">📍 Map</Link>

<Link className={`nav-link ${isActive("/alerts") ? "active" : ""}`} to="/alerts">🔔 Alerts</Link>

<Link className={`nav-link ${isActive("/live") ? "active" : ""}`} to="/live">🔴 Live Feed</Link>

<Link className={`nav-link ${isActive("/profile") ? "active" : ""}`} to="/profile">👤 Profile</Link>

<Link className="nav-link admin" to="/admin">👑 Admin</Link>
<Link className={`nav-link ${isActive("/stories") ? "active" : ""}`} to="/stories">
🎉 Stories
</Link>

          </div>

          <div className="nav-controls">

            <NotificationBar />

            
          
              
            
      
            

            <button
              className="logout-btn"
             onClick={() => {
  localStorage.clear();
  socket.disconnect();   // stop live updates
 window.location.href = "/signup";
              }}
            >
              🚪 Logout
            </button>

          </div>

        </div>

      </nav>

      <style>{`

    body{
padding-top:90px;
margin:0;

font-family:"Poppins","Segoe UI",sans-serif;

background:
linear-gradient(135deg,#eef2ff,#dbeafe,#f0f9ff);

min-height:100vh;
}

/* ======================
   NAVBAR CONTAINER
====================== */

.navbar{

position:fixed;

top:14px;
left:22px;
right:22px;

height:75px;

display:flex;
align-items:center;

background:rgba(255,255,255,.65);

backdrop-filter:blur(16px);

border-radius:18px;

box-shadow:
0 20px 45px rgba(0,0,0,.12);

z-index:1000;

transition:all .35s ease;

}

/* HIDE ON SCROLL */

.navbar.hide{
transform:translateY(-120%);
}

/* GRADIENT BORDER EFFECT */

.navbar::before{

content:"";

position:absolute;

inset:0;

padding:1px;

border-radius:18px;

background:
linear-gradient(
135deg,
rgba(102,126,234,.6),
rgba(118,75,162,.6)
);

-webkit-mask:
linear-gradient(#fff 0 0) content-box,
linear-gradient(#fff 0 0);

-webkit-mask-composite:xor;

mask-composite:exclude;

pointer-events:none;

}

/* ======================
   NAV CONTENT
====================== */

.nav-content{

max-width:1350px;

margin:auto;

width:100%;

display:flex;

justify-content:space-between;

align-items:center;

padding:0 25px;

}

/* ======================
   LINKS
====================== */

.nav-links{

display:flex;

align-items:center;

gap:14px;

}

/* NAV LINK */

.nav-link{

position:relative;

text-decoration:none;

padding:10px 18px;

border-radius:12px;

font-weight:600;

font-size:14px;

color:#374151;

display:flex;

align-items:center;

gap:6px;

transition:.25s ease;

}

/* HOVER */

.nav-link:hover{

color:white;

background:
linear-gradient(135deg,#667eea,#764ba2);

transform:translateY(-2px);

box-shadow:
0 10px 25px rgba(102,126,234,.35);

}

/* ACTIVE */

.nav-link.active{

color:white;

background:
linear-gradient(135deg,#667eea,#764ba2);

box-shadow:
0 10px 25px rgba(102,126,234,.35);

}

/* ACTIVE INDICATOR */

.nav-link.active::after{

content:"";

position:absolute;

bottom:-6px;

left:50%;

transform:translateX(-50%);

width:6px;
height:6px;

border-radius:50%;

background:#667eea;

}

/* ADMIN BUTTON */

.nav-link.admin{

background:
linear-gradient(135deg,#FFD700,#FFA500);

color:#222;

font-weight:700;

box-shadow:
0 8px 20px rgba(255,165,0,.35);

}

.nav-link.admin:hover{

background:
linear-gradient(135deg,#ffcc00,#ff9900);

}

/* ======================
   RIGHT CONTROLS
====================== */

.nav-controls{

display:flex;

align-items:center;

gap:12px;

}

/* BUTTONS */

button{

border:none;

padding:9px 15px;

border-radius:10px;

font-size:14px;

font-weight:600;

cursor:pointer;

transition:.25s;

}

/* THEME BUTTON */

.control-btn{

background:
linear-gradient(135deg,#4facfe,#00f2fe);

color:white;

box-shadow:
0 6px 18px rgba(0,0,0,.2);

}

.control-btn:hover{

transform:translateY(-2px);

box-shadow:
0 12px 25px rgba(0,0,0,.25);

}

/* LOGOUT BUTTON */

.logout-btn{

background:
linear-gradient(135deg,#ff4d4d,#ff0000);

color:white;

box-shadow:
0 6px 18px rgba(255,0,0,.35);

}

.logout-btn:hover{

transform:translateY(-2px);

box-shadow:
0 12px 28px rgba(255,0,0,.4);

}

/* ======================
   RESPONSIVE
====================== */

@media (max-width:900px){

.navbar{
left:10px;
right:10px;
}

.nav-links{
gap:8px;
flex-wrap:wrap;
}

.nav-link{
font-size:13px;
padding:8px 12px;
}

}
     

      `}</style>

    </>
  );
};

/* =====================
   MAIN APP
===================== */

function App() {

  useEffect(() => {

    const email = localStorage.getItem("userEmail");

    if (email) {
      socket.emit("joinRoom", email);
    }

  }, []);

  return (

    <ThemeProvider>

      <NotificationProvider>

        <Router>

          <Navbar />

          {isUserLoggedIn() && <Chatbot />}

          <Routes>

            <Route path="/" element={<Navigate to="/items" />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route path="/items" element={<UserRoute><ViewItems /></UserRoute>} />
            <Route path="/add" element={<UserRoute><AddItem /></UserRoute>} />
            <Route path="/profile" element={<UserRoute><UserProfile /></UserRoute>} />
            <Route path="/chat/:senderId/:receiverId" element={<UserRoute><ChatPage /></UserRoute>} />

            {/* 🔔 ALERT PAGE */}
            <Route path="/alerts" element={<UserRoute><AlertSubscribe /></UserRoute>} />

            {/* 📍 MAP PAGE */}
            <Route path="/map" element={<UserRoute><ItemMap /></UserRoute>} />

            {/* 🔴 LIVE FEED */}
            <Route path="/live" element={<UserRoute><LiveFeed /></UserRoute>} />


            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/stories" element={<UserRoute><RecoveryStories /></UserRoute>} />

          </Routes>

        </Router>

      </NotificationProvider>

    </ThemeProvider>

  );
}

export default App;