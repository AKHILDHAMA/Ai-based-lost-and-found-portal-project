import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    const email = localStorage.getItem("userEmail");

    /* LOAD NOTIFICATIONS FROM DATABASE */

    if (email) {

      axios
        .get(`http://localhost:4000/api/notifications/${email}`)
        .then(res => {

          const formatted = res.data.map(n => ({
            ...n,
            read: n.is_read === 1
          }));

          setNotifications(formatted);

        })
        .catch(err => console.log("Notification load error:", err));

    }

    /* SOCKET REAL TIME */

    const handler = (data) => {

      if (!data?.title) return;

      setNotifications(prev => [

        {
          ...data,
          id: Date.now(),
          read: false
        },

        ...prev

      ]);

      // 🔊 optional notification sound
      const audio = new Audio("/notify.mp3");
      audio.play().catch(()=>{});

    };

    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };

  }, []);


  /* MARK ALL READ */

  const markAllRead = async () => {

    const email = localStorage.getItem("userEmail");

    if (email) {

      await axios.post(
        "http://localhost:4000/api/notifications/mark-read",
        { email }
      );

    }

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );

  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );

};

export const useNotifications = () => useContext(NotificationContext);