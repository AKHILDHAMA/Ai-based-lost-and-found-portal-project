import React, { useState } from "react";
import axios from "axios";

function AlertSubscribe() {

  const [keyword,setKeyword] = useState("");

  const subscribe = async () => {

    if(!keyword){
      alert("Enter item name");
      return;
    }

    try{

      const email = localStorage.getItem("userEmail");

      await axios.post("http://localhost:4000/api/items/alert-subscribe",{
        user_email: email,
        keyword: keyword
      });

      alert("🔔 Alert subscribed successfully!");
      setKeyword("");

    }catch(err){
      console.log(err);
      alert("Error subscribing alert");
    }

  };

  return (

    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"linear-gradient(135deg,#667eea,#764ba2)",
      fontFamily:"Segoe UI, sans-serif"
    }}>

      <div style={{
        width:"420px",
        padding:"40px",
        borderRadius:"18px",
        background:"rgba(255,255,255,0.15)",
        backdropFilter:"blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
        border:"1px solid rgba(255,255,255,0.3)",
        boxShadow:"0 20px 40px rgba(0,0,0,0.25)",
        textAlign:"center",
        color:"white"
      }}>

        <div style={{
          fontSize:"40px",
          marginBottom:"10px"
        }}>
          🔔
        </div>

        <h2 style={{
          marginBottom:"10px",
          fontSize:"26px",
          fontWeight:"600",
          letterSpacing:"1px"
        }}>
          Lost Item Alert
        </h2>

        <p style={{
          fontSize:"14px",
          marginBottom:"25px",
          opacity:"0.9"
        }}>
          Get notified instantly if someone reports your lost item.
        </p>

        <input
          placeholder="Example: wallet, phone, keys"
          value={keyword}
          onChange={(e)=>setKeyword(e.target.value)}
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"10px",
            border:"none",
            marginBottom:"20px",
            fontSize:"14px",
            outline:"none",
            background:"rgba(255,255,255,0.9)",
            color:"#333",
            boxShadow:"0 4px 10px rgba(0,0,0,0.1)",
            transition:"all 0.3s ease"
          }}
          onFocus={(e)=>{
            e.target.style.transform="scale(1.02)";
            e.target.style.boxShadow="0 6px 15px rgba(0,0,0,0.2)";
          }}
          onBlur={(e)=>{
            e.target.style.transform="scale(1)";
            e.target.style.boxShadow="0 4px 10px rgba(0,0,0,0.1)";
          }}
        />

        <button
          onClick={subscribe}
          style={{
            width:"100%",
            padding:"13px",
            borderRadius:"10px",
            border:"none",
            fontSize:"15px",
            fontWeight:"bold",
            cursor:"pointer",
            background:"linear-gradient(135deg,#ff9966,#ff5e62)",
            color:"white",
            letterSpacing:"0.5px",
            boxShadow:"0 8px 20px rgba(0,0,0,0.25)",
            transition:"all 0.3s ease"
          }}
          onMouseOver={(e)=>{
            e.target.style.transform="translateY(-3px)";
            e.target.style.boxShadow="0 12px 25px rgba(0,0,0,0.35)";
          }}
          onMouseOut={(e)=>{
            e.target.style.transform="translateY(0)";
            e.target.style.boxShadow="0 8px 20px rgba(0,0,0,0.25)";
          }}
        >
          Subscribe Alert
        </button>

      </div>

    </div>

  );

}

export default AlertSubscribe;