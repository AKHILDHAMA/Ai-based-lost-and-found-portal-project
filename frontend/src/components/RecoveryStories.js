import React, { useEffect, useState } from "react";
import axios from "axios";

function RecoveryStories() {
  const [stories, setStories] = useState([]);
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [commentText, setCommentText] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  /* =========================
     FETCH STORIES
  ========================= */
  const fetchStories = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:4000/api/stories")
      .then((res) => {
        setStories(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStories();
  }, []);

  /* =========================
     ADD STORY
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert("Login required");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:4000/api/add-story", {
        item_name: itemName,
        location,
        story,
        user_email: userEmail,
      });

      setItemName("");
      setLocation("");
      setStory("");
      fetchStories();
    } catch (err) {
      console.log(err);
      alert("Error adding story");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     DELETE STORY
  ========================= */
  const deleteStory = async (id) => {
    if (!window.confirm("Delete this story?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/delete/${id}/${userEmail}`);
      fetchStories();
    } catch {
      alert("Delete failed");
    }
  };

  /* =========================
     ADD COMMENT
  ========================= */
  const addComment = async (id) => {
    const text = commentText[id];

    if (!text || !userEmail) {
      alert("Enter comment");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/comment", {
        story_id: id,
        comment: text,
        user_email: userEmail,
      });

      setCommentText({ ...commentText, [id]: "" });
      fetchStories();
    } catch (err) {
      console.log("❌ FRONTEND ERROR:", err.response?.data || err.message);
      alert("Comment failed");
    }
  };

  /* =========================
     DELETE COMMENT
  ========================= */
  const deleteComment = async (cid) => {
    try {
      await axios.delete(`http://localhost:4000/api/comment/${cid}/${userEmail}`);
      fetchStories();
    } catch {
      alert("Delete comment failed");
    }
  };

  return (
    <div className="stories-page">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }

          .stories-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
          }

          /* Title */
          .title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #1e293b, #2d3a4f);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-align: center;
            margin-bottom: 2rem;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }

          /* Form Card */
          .form-card {
            background: white;
            border-radius: 28px;
            padding: 1.8rem 2rem;
            margin-bottom: 3rem;
            box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.02);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.5);
          }

          .form-card:hover {
            box-shadow: 0 25px 40px -14px rgba(0, 0, 0, 0.12);
          }

          .form-card h3 {
            font-size: 1.6rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .form-card form {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
          }

          .form-card input,
          .form-card textarea {
            width: 100%;
            padding: 0.9rem 1.2rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            font-size: 1rem;
            transition: all 0.2s;
            background-color: #fefefe;
            font-family: inherit;
          }

          .form-card input:focus,
          .form-card textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }

          .form-card textarea {
            min-height: 110px;
            resize: vertical;
          }

          .form-card button {
            background: linear-gradient(105deg, #2563eb, #1d4ed8);
            border: none;
            padding: 0.9rem 1.5rem;
            border-radius: 40px;
            font-weight: 600;
            font-size: 1rem;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
          }

          .form-card button:hover {
            background: linear-gradient(105deg, #1d4ed8, #1e40af);
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
          }

          .form-card button:active {
            transform: translateY(1px);
          }

          /* Stories Grid */
          .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
            gap: 2rem;
          }

          /* Story Card */
          .story-card {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            transition: all 0.25s ease;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
            border: 1px solid rgba(203, 213, 225, 0.4);
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(2px);
          }

          .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 24px 36px -12px rgba(0, 0, 0, 0.15);
            border-color: rgba(59, 130, 246, 0.2);
          }

          .badge {
            background: #10b981;
            color: white;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.9rem;
            border-radius: 40px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            width: fit-content;
            margin: 1.2rem 1.5rem 0 1.5rem;
            letter-spacing: 0.3px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }

          .story-card h4 {
            font-size: 0.95rem;
            font-weight: 500;
            color: #334155;
            margin: 0.8rem 1.5rem 0 1.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 0.4rem;
          }

          .story-card h4::before {
            content: "👤";
            font-size: 0.9rem;
          }

          .story-card > p:first-of-type {
            margin: 0.2rem 1.5rem 0 1.5rem;
            font-size: 0.75rem;
            color: #64748b;
          }

          .story-card h3 {
            font-size: 1.45rem;
            font-weight: 700;
            margin: 0.8rem 1.5rem 0.2rem 1.5rem;
            color: #0f172a;
            word-break: break-word;
          }

          .story-card > p:nth-of-type(2) {
            margin: 0 1.5rem 0.5rem 1.5rem;
            color: #475569;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
          }

          .story-card > p:nth-of-type(3) {
            margin: 0 1.5rem 1rem 1.5rem;
            color: #1e293b;
            line-height: 1.5;
            background: #f8fafc;
            padding: 0.8rem 1rem;
            border-radius: 20px;
            font-size: 0.95rem;
          }

          .delete-btn {
            background: none;
            border: 1px solid #fee2e2;
            margin: 0 1.5rem 0.8rem 1.5rem;
            padding: 0.5rem 1rem;
            border-radius: 40px;
            color: #b91c1c;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background-color: #fff5f5;
            font-size: 0.8rem;
          }

          .delete-btn:hover {
            background-color: #fee2e2;
            border-color: #fecaca;
            color: #991b1b;
            transform: scale(0.98);
          }

          /* Comments section */
          .comments {
            background: #f9fafb;
            margin-top: 0.6rem;
            padding: 1rem 1.5rem 1.5rem 1.5rem;
            border-top: 1px solid #eef2ff;
          }

          .comment-item {
            background: white;
            border-radius: 20px;
            padding: 0.7rem 1rem;
            margin-bottom: 0.8rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            border: 1px solid #eef2ff;
            transition: all 0.1s;
          }

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.3rem;
            flex-wrap: wrap;
          }

          .comment-author {
            font-size: 0.7rem;
            font-weight: 500;
            color: #4b5563;
            background: #f1f5f9;
            padding: 0.2rem 0.7rem;
            border-radius: 30px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .comment-text {
            font-size: 0.9rem;
            color: #1f2937;
            margin: 0.3rem 0 0.2rem 0;
            word-break: break-word;
            padding-left: 0.2rem;
          }

          .delete-comment-btn {
            background: transparent;
            border: none;
            font-size: 1rem;
            cursor: pointer;
            color: #94a3b8;
            transition: all 0.2s;
            padding: 0 4px;
            border-radius: 30px;
            width: 26px;
            height: 26px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .delete-comment-btn:hover {
            background-color: #fee2e2;
            color: #dc2626;
            transform: scale(1.05);
          }

          .comment-input-group {
            display: flex;
            gap: 0.6rem;
            margin-top: 1rem;
            align-items: center;
          }

          .comment-input-group input {
            flex: 1;
            padding: 0.7rem 1rem;
            border: 1px solid #cbd5e1;
            border-radius: 40px;
            font-size: 0.85rem;
            background: white;
            transition: all 0.2s;
          }

          .comment-input-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
          }

          .comment-input-group button {
            background: #3b82f6;
            border: none;
            padding: 0.55rem 1.2rem;
            border-radius: 40px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }

          .comment-input-group button:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }

          /* Login banner */
          .login-banner {
            background: #fef9c3;
            border-left: 6px solid #eab308;
            padding: 0.8rem 1.5rem;
            border-radius: 60px;
            text-align: center;
            margin-bottom: 2rem;
            font-weight: 500;
            color: #854d0e;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 0.9rem;
          }

          /* Loading state */
          .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            gap: 12px;
            color: #1e293b;
          }

          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .empty-message {
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: 2rem;
            color: #64748b;
            font-size: 1.1rem;
            grid-column: 1 / -1;
          }

          @media (max-width: 680px) {
            .stories-page {
              padding: 1.2rem;
            }
            .title {
              font-size: 1.8rem;
            }
            .form-card {
              padding: 1.4rem;
            }
            .stories-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
            .comment-input-group {
              flex-wrap: wrap;
            }
            .comment-input-group button {
              width: 100%;
            }
          }
        `}
      </style>

      <h1 className="title">
        <span>🏆</span> Recovery Stories
      </h1>

      {!userEmail && (
        <div className="login-banner">
          🔐 Login required to share stories & comments
        </div>
      )}

      {/* FORM */}
      <div className="form-card">
        <h3>
          <span>✨</span> Share Recovery Story
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Item name (e.g., MacBook Pro)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location where found / returned"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your inspiring recovery story..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "✨ Post Story"}
          </button>
        </form>
      </div>

      {/* STORIES */}
      <div className="stories-grid">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading amazing stories...</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="empty-message">
            🌱 No stories yet. Be the first to share a recovery!
          </div>
        ) : (
          stories.map((s) => (
            <div key={s.id} className="story-card">
              <div className="badge">
                <span>✔</span> Returned successfully
              </div>
              <h4>{s.user_email}</h4>
              <p>📅 {new Date(s.date_posted).toLocaleDateString()}</p>
              <h3>📦 {s.item_name}</h3>
              <p>📍 {s.location}</p>
              <p>{s.story}</p>

              {/* DELETE STORY */}
              {s.user_email === userEmail && (
                <button className="delete-btn" onClick={() => deleteStory(s.id)}>
                  🗑 Delete Story
                </button>
              )}

              {/* COMMENTS */}
              <div className="comments">
                {s.comments?.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        💬 {c.user_email}
                      </span>
                      {(c.user_email === userEmail || s.user_email === userEmail) && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => deleteComment(c.id)}
                          aria-label="Delete comment"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="comment-text">{c.comment}</div>
                  </div>
                ))}

                <div className="comment-input-group">
                  <input
                    value={commentText[s.id] || ""}
                    onChange={(e) =>
                      setCommentText({
                        ...commentText,
                        [s.id]: e.target.value,
                      })
                    }
                    placeholder="Write a supportive comment..."
                  />
                  <button onClick={() => addComment(s.id)}>Post</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecoveryStories;