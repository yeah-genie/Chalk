"use client";

import { useState } from "react";
import { useIdeasStore } from "../../store/ideas";
import { statusConfig, scoreLabels, IdeaStatus } from "../../types";
import EvaluationSlider from "../../components/EvaluationSlider";

export default function IdeasPage() {
  const { ideas, addIdea, updateIdeaStatus, addEvaluation } = useIdeasStore();
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [filter, setFilter] = useState<IdeaStatus | "all">("all");
  
  const filteredIdeas = filter === "all" 
    ? ideas 
    : ideas.filter((i) => i.status === filter);
  
  const handleAddIdea = () => {
    if (!newTitle.trim()) return;
    
    const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
    addIdea(newTitle, newDescription, tags);
    
    setNewTitle("");
    setNewDescription("");
    setNewTags("");
    setIsAddingIdea(false);
  };
  
  const handleEvaluate = (ideaId: string, scores: Record<string, number>) => {
    addEvaluation(ideaId, {
      evaluatorId: "current-user",
      evaluatorName: "You",
      scores: {
        market: scores.market,
        revenue: scores.revenue,
        effort: scores.effort,
        teamFit: scores.teamFit,
        learning: scores.learning,
      },
    });
    
    updateIdeaStatus(ideaId, "evaluating");
    setSelectedIdea(null);
  };
  
  const currentIdea = ideas.find((i) => i.id === selectedIdea);
  
  return (
    <div className="flex h-screen">
      {/* Ideas List */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Ideas</h1>
              <p className="text-sm text-[var(--text-secondary)]">{ideas.length} ideas in total</p>
            </div>
            <button
              onClick={() => setIsAddingIdea(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New idea
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              All
            </button>
            {(Object.keys(statusConfig) as IdeaStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === status
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Add idea form */}
        {isAddingIdea && (
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Idea title"
                className="input"
                autoFocus
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="input min-h-[80px] resize-none"
              />
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="input"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleAddIdea} className="btn-primary">
                  Add idea
                </button>
                <button
                  onClick={() => setIsAddingIdea(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Ideas list */}
        <div className="flex-1 overflow-y-auto">
          {filteredIdeas.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-tertiary)]">
              <p>No ideas yet. Add your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea.id)}
                  className={`p-4 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors ${
                    selectedIdea === idea.id ? "bg-[var(--bg-hover)]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {idea.title}
                        </h3>
                        {idea.avgScore && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                            {idea.avgScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-2 line-clamp-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {idea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          color: statusConfig[idea.status].color,
                          background: `${statusConfig[idea.status].color}15`,
                        }}
                      >
                        {statusConfig[idea.status].label}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {idea.evaluations.length} eval
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Side panel - Evaluation */}
      {currentIdea && (
        <div className="w-96 border-l border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Evaluate idea</h2>
            <button
              onClick={() => setSelectedIdea(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                {currentIdea.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {currentIdea.description}
              </p>
              <div className="flex items-center gap-2">
                {currentIdea.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <EvaluationSlider
              onSubmit={(scores) => handleEvaluate(currentIdea.id, scores)}
            />
            
            {/* Previous evaluations */}
            {currentIdea.evaluations.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <h4 className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                  Previous evaluations ({currentIdea.evaluations.length})
                </h4>
                <div className="space-y-3">
                  {currentIdea.evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          {evaluation.evaluatorName}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {new Date(evaluation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {Object.entries(evaluation.scores).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-[var(--text-tertiary)]">
                              {key.slice(0, 3)}
                            </div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

