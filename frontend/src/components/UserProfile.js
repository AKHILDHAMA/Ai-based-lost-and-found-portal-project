import React, { useEffect, useState } from "react";
import axios from "axios";

function UserProfile() {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    if (!userEmail || !userId) return;

    setEmail(userEmail);

    const fetchProfileData = async () => {
      try {
        const itemsRes = await axios.get(
          `http://localhost:4000/api/items/user/${userEmail}`
        );

        const claimsRes = await axios.get(
          `http://localhost:4000/api/items/claims/${userId}`
        );

        setItems(itemsRes.data || []);
        setClaims(claimsRes.data || []);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <p style={styles.loading}>Loading profile...</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.profileTitle}>👤 User Profile</h2>

      <div style={styles.emailSection}>
        <strong>Email:</strong> <span style={styles.emailText}>{email}</span>
      </div>

      <hr style={styles.divider} />

      <h3 style={styles.sectionTitle}>📦 Items Posted</h3>
      {items.length === 0 ? (
        <p style={styles.emptyMessage}>No items posted yet.</p>
      ) : (
        <div style={styles.itemsGrid}>
          {items.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardContent}>
                <strong style={styles.cardTitle}>{item.title}</strong>
                <span style={{
                  ...styles.status,
                  ...(item.status === 'available' ? styles.statusAvailable : 
                       item.status === 'claimed' ? styles.statusClaimed : 
                       styles.statusOther)
                }}>{item.status}</span>
              </div>
              <div style={styles.cardShadow}></div>
            </div>
          ))}
        </div>
      )}

      <hr style={styles.divider} />

      <h3 style={styles.sectionTitle}>📝 Claims Made</h3>
      {claims.length === 0 ? (
        <p style={styles.emptyMessage}>No claims made yet.</p>
      ) : (
        <div style={styles.itemsGrid}>
          {claims.map((c) => (
            <div key={c.id} style={styles.card}>
              <div style={styles.cardContent}>
                <strong style={styles.cardTitle}>Item #{c.item_id}</strong>
                <span style={{
                  ...styles.status,
                  ...(c.status === 'pending' ? styles.statusPending : 
                       c.status === 'approved' ? styles.statusApproved : 
                       c.status === 'rejected' ? styles.statusRejected : 
                       styles.statusOther)
                }}>{c.status}</span>
              </div>
              <div style={styles.cardShadow}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {

container:{
padding:"40px",
maxWidth:"1200px",
margin:"auto",
fontFamily:"Poppins, sans-serif",
background:"linear-gradient(135deg,#eef2ff,#e0f2fe,#f8fafc)",
minHeight:"100vh"
},

profileTitle:{
textAlign:"center",
fontSize:"40px",
fontWeight:"800",
marginBottom:"30px",
background:"linear-gradient(135deg,#667eea,#764ba2)",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent"
},

profileHeader:{
display:"flex",
alignItems:"center",
gap:"20px",
justifyContent:"center",
marginBottom:"25px"
},

avatar:{
width:"90px",
height:"90px",
borderRadius:"50%",
background:"linear-gradient(135deg,#667eea,#764ba2)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"40px",
color:"white",
boxShadow:"0 10px 25px rgba(0,0,0,.2)"
},

profileName:{
fontSize:"22px",
fontWeight:"700",
marginBottom:"3px"
},

profileSub:{
color:"#777",
fontSize:"14px"
},

emailSection:{
background:"rgba(255,255,255,.8)",
backdropFilter:"blur(10px)",
borderRadius:"20px",
padding:"20px",
textAlign:"center",
boxShadow:"0 15px 35px rgba(0,0,0,.1)",
marginBottom:"35px"
},

emailText:{
color:"#667eea",
fontWeight:"700"
},

statsContainer:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"20px",
marginBottom:"40px"
},

statCard:{
background:"white",
borderRadius:"18px",
padding:"25px",
textAlign:"center",
boxShadow:"0 10px 30px rgba(0,0,0,.1)",
transition:"all .3s ease"
},

sectionTitle:{
fontSize:"24px",
fontWeight:"700",
marginBottom:"20px",
borderLeft:"5px solid #667eea",
paddingLeft:"12px"
},

itemsGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
gap:"22px"
},

card:{
background:"white",
borderRadius:"18px",
padding:"20px",
transition:"all .35s ease",
boxShadow:"0 10px 25px rgba(0,0,0,.08)"
},

cardContent:{
display:"flex",
flexDirection:"column",
gap:"10px"
},

cardTitle:{
fontWeight:"700",
fontSize:"17px"
},

status:{
padding:"6px 14px",
borderRadius:"20px",
fontSize:"12px",
fontWeight:"700",
alignSelf:"flex-start"
},

statusAvailable:{
background:"linear-gradient(135deg,#2ecc71,#27ae60)",
color:"white"
},

statusClaimed:{
background:"linear-gradient(135deg,#3498db,#2980b9)",
color:"white"
},

statusPending:{
background:"linear-gradient(135deg,#f39c12,#e67e22)",
color:"white"
},

statusApproved:{
background:"linear-gradient(135deg,#2ecc71,#27ae60)",
color:"white"
},

statusRejected:{
background:"linear-gradient(135deg,#e74c3c,#c0392b)",
color:"white"
},

statusOther:{
background:"#888",
color:"white"
},

divider:{
height:"3px",
border:"none",
margin:"40px 0",
background:"linear-gradient(to right,transparent,#667eea,transparent)"
},

emptyMessage:{
textAlign:"center",
padding:"40px",
background:"rgba(255,255,255,.7)",
borderRadius:"15px"
}

}

// Add hover effect for cards
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes float {
      0% { transform: perspective(1000px) rotateX(0deg) translateY(0); }
      100% { transform: perspective(1000px) rotateX(5deg) translateY(-10px); }
    }
    
    .card-hover-effect:hover {
      animation: float 0.3s forwards;
      box-shadow: 0 25px 50px rgba(50, 50, 93, 0.25), 0 15px 35px rgba(0, 0, 0, 0.15);
    }
    
    .card-hover-effect:hover .card-shadow {
      bottom: -15px;
      filter: blur(15px);
      opacity: 0.4;
    }
    
    .email-section-hover:hover {
      transform: perspective(1000px) translateZ(10px);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UserProfile;