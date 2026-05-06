import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

function ChatPage() {
  const { senderId, receiverId } = useParams();

  // Convert URL params to numbers
  const sId = Number(senderId);
  const rId = Number(receiverId);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  // Fetch chat history
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`http://localhost:4000/api/chat/history/${sId}/${rId}`)
      .then((res) => {
        setMessages(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [sId, rId]);

  // Join room
  useEffect(() => {
    socket.emit("joinRoom", sId);

    socket.on("receiveMessage", (data) => {
      if (data.sender_id === rId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [sId, rId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!msg.trim()) return;

    setIsSending(true);
    const body = {
      sender_id: sId,
      receiver_id: rId,
      message: msg
    };

    try {
      const res = await axios.post(
        "http://localhost:4000/api/chat/send",
        body
      );

      socket.emit("sendMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <h3 className="user-name">User #{rId}</h3>
            <div className="user-status">
              <span className="status-dot"></span>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" title="Call">
            📞
          </button>
          <button className="action-btn" title="Info">
            ⓘ
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h4>No messages yet</h4>
            <p>Start a conversation by sending a message!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((m, index) => {
              const isOwnMessage = m.sender_id === sId;
              const showAvatar = !isOwnMessage && 
                (index === 0 || messages[index - 1].sender_id !== m.sender_id);
              
              return (
                <div
                  key={index}
                  className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {showAvatar && (
                    <div className="message-avatar">👤</div>
                  )}
                  <div className="message-content">
                    <div
                      className={`message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}
                    >
                      <div className="message-text">{m.message}</div>
                      <div className="message-time">
                        {formatTime(m.timestamp || m.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} className="scroll-anchor"></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Type a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyPress={handleKeyPress}
            className="message-input"
            disabled={isSending}
          />
          <button 
            onClick={sendMessage}
            className={`send-button ${isSending ? 'sending' : ''}`}
            disabled={!msg.trim() || isSending}
          >
            {isSending ? (
              <div className="send-spinner"></div>
            ) : (
              <span className="send-icon">➤</span>
            )}
          </button>
        </div>
      </div>
      <button
onClick={async()=>{

  if(!window.confirm("Delete chat?")) return;

  await axios.delete(
   `http://localhost:4000/api/chat/delete/${senderId}/${receiverId}`
  );

  setMessages([]);

}}
style={{
 background:"#ff4d4d",
 color:"white",
 border:"none",
 padding:"6px 10px",
 borderRadius:"6px",
 cursor:"pointer"
}}
>
🗑 Delete Chat
</button>

      <style jsx>{`
       .chat-container{
width:100%;
height:100vh;
display:flex;
flex-direction:column;

background:
linear-gradient(135deg,#eef2ff,#e0f2fe,#f8fafc);
}

/* HEADER */

.chat-header{

background:rgba(255,255,255,.85);

backdrop-filter:blur(12px);

padding:16px 24px;

border-bottom:1px solid rgba(0,0,0,.08);

display:flex;
justify-content:space-between;
align-items:center;

box-shadow:0 6px 20px rgba(0,0,0,.08);
}

/* USER AVATAR */

.user-avatar{

width:42px;
height:42px;

border-radius:50%;

background:linear-gradient(135deg,#667eea,#764ba2);

display:flex;
align-items:center;
justify-content:center;

font-size:18px;
color:white;

box-shadow:0 5px 15px rgba(0,0,0,.2);
}

/* STATUS */

.status-dot{
width:8px;
height:8px;
border-radius:50%;
background:#2ecc71;
box-shadow:0 0 6px #2ecc71;
}

/* MESSAGE AREA */

.messages-container{

flex:1;
overflow-y:auto;

padding:25px;

background:
linear-gradient(135deg,#f8fafc,#eef2ff);

}

/* MESSAGE LIST */

.messages-list{

display:flex;
flex-direction:column;

gap:12px;

max-width:850px;

margin:auto;

}

/* MESSAGE WRAPPER */

.message-wrapper{

display:flex;
align-items:flex-end;

gap:8px;

animation:fadeIn .25s ease;

}

.message-wrapper.own-message{
flex-direction:row-reverse;
}

/* AVATAR */

.message-avatar{

width:32px;
height:32px;

border-radius:50%;

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

display:flex;
align-items:center;
justify-content:center;

font-size:13px;

box-shadow:0 4px 10px rgba(0,0,0,.15);
}

/* MESSAGE BUBBLE */

.message-bubble{

padding:12px 16px;

border-radius:18px;

max-width:100%;

transition:.2s;

}

/* OWN MESSAGE */

.own-bubble{

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

border-bottom-right-radius:4px;

box-shadow:0 6px 18px rgba(102,126,234,.35);

}

/* OTHER MESSAGE */

.other-bubble{

background:white;

color:#333;

border-bottom-left-radius:4px;

box-shadow:0 4px 12px rgba(0,0,0,.08);

}

/* TEXT */

.message-text{

font-size:14px;

line-height:1.4;

margin-bottom:4px;

}

/* TIME */

.message-time{

font-size:11px;

opacity:.7;

}

/* INPUT AREA */

.input-container{

background:rgba(255,255,255,.9);

backdrop-filter:blur(12px);

padding:20px;

border-top:1px solid rgba(0,0,0,.08);

}

/* INPUT */

.message-input{

flex:1;

padding:14px 18px;

border-radius:25px;

border:2px solid #e2e8f0;

font-size:15px;

transition:.25s;

}

/* INPUT FOCUS */

.message-input:focus{

border-color:#667eea;

box-shadow:0 0 0 3px rgba(102,126,234,.15);

}

/* SEND BUTTON */

.send-button{

width:50px;
height:50px;

border-radius:50%;

border:none;

background:linear-gradient(135deg,#667eea,#764ba2);

color:white;

display:flex;
align-items:center;
justify-content:center;

cursor:pointer;

transition:.25s;

}

/* HOVER */

.send-button:hover:not(:disabled){

transform:scale(1.08);

box-shadow:0 6px 20px rgba(102,126,234,.4);

}

/* SPINNER */

.send-spinner{

width:18px;
height:18px;

border:2px solid transparent;

border-top:2px solid white;

border-radius:50%;

animation:spin 1s linear infinite;

}

/* LOADING */

.spinner{

width:40px;
height:40px;

border:4px solid rgba(255,255,255,.3);

border-top:4px solid white;

border-radius:50%;

animation:spin 1s linear infinite;

}

/* ANIMATION */

@keyframes spin{
to{transform:rotate(360deg)}
}

@keyframes fadeIn{
from{
opacity:0;
transform:translateY(5px);
}
to{
opacity:1;
transform:translateY(0);
}
}

/* MOBILE */

@media(max-width:768px){

.messages-container{
padding:15px;
}

.message-content{
max-width:85%;
}

}
      `}</style>
    </div>
    
  );
}

export default ChatPage;