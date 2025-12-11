import React, { useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Comment } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CommentsProps {
    ideaId: string;
    userId: string;
    userName: string;
}

const Comments: React.FC<CommentsProps> = ({ ideaId, userId, userName }) => {
    const storageKey = `cryo_comments_${ideaId}`;

    const [comments, setComments] = useState<Comment[]>(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
    });
    const [newComment, setNewComment] = useState('');

    const saveComments = (updated: Comment[]) => {
        setComments(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            comment_id: uuidv4(),
            idea_id: ideaId,
            user_id: userId,
            user_name: userName,
            content: newComment.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        saveComments([comment, ...comments]);
        setNewComment('');
    };

    const handleDelete = (commentId: string) => {
        saveComments(comments.filter(c => c.comment_id !== commentId));
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Discussion <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({comments.length})</span>
                </h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="p-6 text-center">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No comments yet. Start the discussion!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.comment_id} className="p-4 group hover:bg-white/5 transition-all" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    {comment.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{comment.user_name}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.created_at)}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                                </div>
                                {comment.user_id === userId && (
                                    <button
                                        onClick={() => handleDelete(comment.comment_id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
