import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import botIcon from "../assets/chatbot.png";
import botAvatar from "../assets/bot-avatar.png";

function Chatbot() {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [listening, setListening] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  /* ======================
     🎤 VOICE RECOGNITION
  ====================== */

  const startVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  };

  /* ======================
     SEND MESSAGE
  ====================== */

  const sendMessage = async () => {

    if(message.trim() === "") return;

    const userMessage = message;

    setChat(prev => [...prev, { type: "user", text: userMessage }]);
    setMessage("");
    setTyping(true);

    try {

      const res = await axios.post("http://localhost:4000/chatbot/ask", {
        message: userMessage
      });

      setTyping(false);

      setChat(prev => [
        ...prev,
        { type: "bot", text: res.data.reply }
      ]);

      if(!open){
        setUnread(prev => prev + 1);
      }

    } catch (error) {
      console.log(error);
      setTyping(false);
    }

  };

  return (
    <>

      {/* Floating Button */}

      <div
        className="chatbot-button"
        onClick={()=>{
          setOpen(!open);
          setUnread(0);
        }}
      >

        <img src={botIcon} alt="chatbot" className="chatbot-icon"/>

        {unread > 0 && (
          <div className="chatbot-badge">
            {unread}
          </div>
        )}

      </div>


      {/* Chat Window */}

      {open && (

        <div className="chat-window">

          {/* Header */}

          <div className="chat-header">
            🤖 Lost & Found Assistant
          </div>


          {/* Messages */}

          <div className="chat-messages">

            {chat.map((c,i)=>(
              <div key={i} className={`chat-row ${c.type}`}>

                {c.type === "bot" && (
                  <img
                    src={botAvatar}
                    alt="bot"
                    className="bot-avatar"
                  />
                )}

                <div className={`chat-bubble ${c.type}`}>
                  {c.text}
                </div>

              </div>
            ))}

            {typing && (
              <div className="bot-typing">
                🤖 Bot is typing...
              </div>
            )}

            <div ref={chatEndRef}></div>

          </div>


          {/* Input Area */}

          <div className="chat-input-area">

            <input
              className="chat-input"
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key==="Enter"){
                  sendMessage();
                }
              }}
              placeholder="Ask about lost items..."
            />

            <button
              onClick={startVoice}
              className={`chat-btn voice-btn ${listening ? "active" : ""}`}
            >
              🎤
            </button>

            <button
              onClick={sendMessage}
              className="chat-btn send-btn"
            >
              Send
            </button>

          </div>

        </div>

      )}


<style>
{`

/* =========================
   FLOATING CHAT BUTTON
========================= */

.chatbot-button{

position:fixed;
bottom:25px;
right:25px;

width:70px;
height:70px;

border-radius:50%;

display:flex;
align-items:center;
justify-content:center;

background:linear-gradient(135deg,#667eea,#764ba2);

cursor:pointer;

box-shadow:
0 12px 30px rgba(0,0,0,.35);

z-index:999;

animation:chatbotPulse 2.5s infinite;

transition:.3s;

}

.chatbot-button:hover{
transform:scale(1.1) rotate(6deg);
box-shadow:0 15px 35px rgba(102,126,234,.5);
}

.chatbot-icon{
width:34px;
}

/* BADGE */

.chatbot-badge{

position:absolute;

top:-6px;
right:-6px;

background:#ff3b3b;

color:white;

font-size:11px;

width:22px;
height:22px;

border-radius:50%;

display:flex;
align-items:center;
justify-content:center;

font-weight:700;

box-shadow:0 4px 10px rgba(0,0,0,.35);

}

/* =========================
   CHAT WINDOW
========================= */

.chat-window{

position:fixed;

bottom:100px;
right:25px;

width:360px;
height:440px;

display:flex;
flex-direction:column;

background:rgba(255,255,255,.9);

backdrop-filter:blur(12px);

border-radius:18px;

overflow:hidden;

box-shadow:
0 25px 60px rgba(0,0,0,.35);

animation:slideUp .35s ease;

z-index:999;

}

/* =========================
   HEADER
========================= */

.chat-header{

padding:15px;

text-align:center;

font-weight:700;

letter-spacing:.3px;

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

font-size:15px;

box-shadow:0 4px 12px rgba(0,0,0,.25);

}

/* =========================
   MESSAGE AREA
========================= */

.chat-messages{

flex:1;

padding:14px;

overflow-y:auto;

background:linear-gradient(135deg,#f6f7fb,#eef2ff);

}

/* CUSTOM SCROLLBAR */

.chat-messages::-webkit-scrollbar{
width:6px;
}

.chat-messages::-webkit-scrollbar-thumb{
background:#c7c7c7;
border-radius:10px;
}

/* =========================
   MESSAGE ROW
========================= */

.chat-row{

display:flex;

align-items:flex-end;

margin-bottom:12px;

animation:messageFade .25s ease;

}

.chat-row.user{
justify-content:flex-end;
}

.chat-row.bot{
justify-content:flex-start;
}

/* =========================
   BOT AVATAR
========================= */

.bot-avatar{

width:30px;
height:30px;

border-radius:50%;

margin-right:6px;

box-shadow:0 3px 8px rgba(0,0,0,.25);

}

/* =========================
   MESSAGE BUBBLES
========================= */

.chat-bubble{

max-width:72%;

padding:10px 14px;

border-radius:18px;

font-size:14px;

line-height:1.4;

word-break:break-word;

}

/* USER MESSAGE */

.chat-bubble.user{

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

border-bottom-right-radius:6px;

box-shadow:0 6px 15px rgba(102,126,234,.35);

}

/* BOT MESSAGE */

.chat-bubble.bot{

background:white;

color:#333;

border-bottom-left-radius:6px;

box-shadow:0 4px 10px rgba(0,0,0,.12);

}

/* =========================
   TYPING TEXT
========================= */

.bot-typing{

font-size:13px;

color:#666;

padding:6px;

font-style:italic;

}

/* =========================
   INPUT AREA
========================= */

.chat-input-area{

display:flex;

padding:12px;

border-top:1px solid rgba(0,0,0,.08);

gap:6px;

background:white;

}

/* INPUT */

.chat-input{

flex:1;

padding:10px 14px;

border-radius:12px;

border:1px solid #ddd;

font-size:14px;

outline:none;

transition:.25s;

}

.chat-input:focus{

border-color:#667eea;

box-shadow:0 0 0 2px rgba(102,126,234,.15);

}

/* =========================
   BUTTONS
========================= */

.chat-btn{

border:none;

border-radius:10px;

cursor:pointer;

transition:.25s;

}

/* VOICE BUTTON */

.voice-btn{

background:#444;

color:white;

padding:8px 10px;

}

.voice-btn:hover{
background:#333;
}

.voice-btn.active{

background:red;

animation:pulse 1s infinite;

}

/* SEND BUTTON */

.send-btn{

padding:8px 14px;

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

font-weight:600;

}

.send-btn:hover{

transform:scale(1.05);

box-shadow:0 6px 15px rgba(102,126,234,.4);

}

/* =========================
   ANIMATIONS
========================= */

@keyframes slideUp{
from{
transform:translateY(60px);
opacity:0;
}
to{
transform:translateY(0);
opacity:1;
}
}

@keyframes chatbotPulse{
0%{box-shadow:0 0 0 0 rgba(102,126,234,.7);}
70%{box-shadow:0 0 0 20px rgba(102,126,234,0);}
100%{box-shadow:0 0 0 0 rgba(102,126,234,0);}
}

@keyframes messageFade{
from{
transform:translateY(8px);
opacity:0;
}
to{
transform:translateY(0);
opacity:1;
}
}

@keyframes pulse{
0%{transform:scale(1);}
50%{transform:scale(1.1);}
100%{transform:scale(1);}
}

`}
</style>

    </>
  );

}

export default Chatbot;