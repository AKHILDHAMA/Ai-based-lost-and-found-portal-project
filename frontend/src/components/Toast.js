import React from "react";
import { motion } from "framer-motion";

function Toast({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      style={styles.toast}
    >
      🔔 {message}
    </motion.div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "#333",
    color: "white",
    padding: "15px 20px",
    borderRadius: "8px",
    fontSize: "18px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 9999,
  }
};

export default Toast;
