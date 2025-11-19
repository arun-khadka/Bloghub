"use client"

import { useState, useEffect } from "react"
import { MessageCircle, ThumbsUp, Reply } from "lucide-react"
import Toast from "./Toast"

export default function CommentsSection({ articleId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [userName, setUserName] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [toast, setToast] = useState(null)

  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${articleId}`)
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
  }, [articleId])

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments))
    }
  }, [comments, articleId])

  const handleSubmitComment = (e) => {
    e.preventDefault()

    if (!newComment.trim() || !userName.trim()) return

    const comment = {
      id: Date.now(),
      author: userName,
      text: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
    setToast({ message: "Comment posted successfully!", type: "success" })
  }

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim() || !userName.trim()) return

    const reply = {
      id: Date.now(),
      author: userName,
      text: replyText,
      timestamp: new Date().toISOString(),
    }

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply],
          }
        }
        return comment
      }),
    )

    setReplyText("")
    setReplyTo(null)
    setToast({ message: "Reply posted successfully!", type: "success" })
  }

  const handleLike = (commentId) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 }
        }
        return comment
      }),
    )
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / 60000)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <>
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Comments ({comments.length})</h2>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-8 bg-card border border-border rounded-lg p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
          <textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            rows="4"
            required
          />
          <button
            type="submit"
            className="mt-3 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Post Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-6">
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{comment.author}</h4>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                </div>
              </div>

              {/* Comment Text */}
              <p className="text-foreground mb-4 leading-relaxed">{comment.text}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.likes > 0 && comment.likes}</span>
                </button>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="mt-4 pl-6 border-l-2 border-border">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null)
                        setReplyText("")
                      }}
                      className="px-4 py-1.5 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-border space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-sm text-foreground">{reply.author}</h5>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
