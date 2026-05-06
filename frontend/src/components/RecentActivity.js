import React, { useEffect, useState } from "react";
import axios from "axios";

function RecentActivity(){

  const [users,setUsers] = useState([]);

  useEffect(()=>{

    axios.get("http://localhost:4000/api/activity/recent-users")
    .then(res=>{
      setUsers(res.data);
    })
    .catch(err=>{
      console.log("Activity error:",err);
    });

  },[]);

  return(

    <div style={styles.container}>

      <h3 style={styles.title}>
        🔥 Recently Active Users
      </h3>

      {users.length === 0 ? (
        <p style={styles.empty}>No recent activity</p>
      ) : (
        users.map((u,i)=>(
          <div key={i} style={styles.activityCard}>

            <div style={styles.avatar}>
              {u.name?.charAt(0).toUpperCase()}
            </div>

            <div style={styles.textSection}>
              <span style={styles.name}>{u.name}</span>
              <span style={styles.action}>
                reported <b>{u.title}</b>
              </span>
            </div>

          </div>
        ))
      )}

    </div>

  );

}

const styles = {

container:{
background:"rgba(255,255,255,0.85)",
backdropFilter:"blur(12px)",
padding:"25px",
borderRadius:"18px",
marginBottom:"25px",

boxShadow:"0 15px 40px rgba(0,0,0,0.12)",

border:"1px solid rgba(255,255,255,0.4)"
},

title:{
marginBottom:"18px",
fontSize:"20px",
fontWeight:"700",

background:"linear-gradient(135deg,#667eea,#764ba2)",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent"
},

activityCard:{
display:"flex",
alignItems:"center",
gap:"12px",

padding:"12px",
borderRadius:"10px",

marginBottom:"10px",

background:"rgba(245,247,250,0.8)",

transition:"all .25s ease",

cursor:"pointer"
},

avatar:{
width:"36px",
height:"36px",

borderRadius:"50%",

background:"linear-gradient(135deg,#667eea,#764ba2)",

color:"white",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontWeight:"700",
fontSize:"16px",

boxShadow:"0 4px 10px rgba(0,0,0,0.2)"
},

textSection:{
display:"flex",
flexDirection:"column",
fontSize:"14px"
},

name:{
fontWeight:"600",
color:"#333"
},

action:{
color:"#666"
},

empty:{
color:"#888",
textAlign:"center",
padding:"10px"
}

};

export default RecentActivity;