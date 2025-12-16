"use client";

import { useState } from "react";
import { useIdeasStore } from "../../store/ideas";
import { IdeaStatus, statusConfig, Idea } from "../../types";

const columns: { status: IdeaStatus; title: string }[] = [
  { status: "inbox", title: "Inbox" },
  { status: "evaluating", title: "Evaluating" },
  { status: "experiment", title: "Experiment" },
  { status: "launched", title: "Launched" },
  { status: "killed", title: "Killed" },
];

export default function BoardPage() {
  const { ideas, updateIdeaStatus } = useIdeasStore();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [killReason, setKillReason] = useState("");
  const [showKillModal, setShowKillModal] = useState(false);
  const [pendingKillId, setPendingKillId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: IdeaStatus) => {
    e.preventDefault();
    if (!draggedId) return;

    if (status === "killed") {
      setPendingKillId(draggedId);
      setShowKillModal(true);
    } else {
      updateIdeaStatus(draggedId, status);
    }
    setDraggedId(null);
  };

  const handleConfirmKill = () => {
    if (pendingKillId) {
      updateIdeaStatus(pendingKillId, "killed");
      // TODO: Save kill reason to postMortem
      setShowKillModal(false);
      setKillReason("");
      setPendingKillId(null);
    }
  };

  const getColumnIdeas = (status: IdeaStatus) =>
    ideas.filter((idea) => idea.status === status);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Pipeline Board</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Drag ideas between columns to update their status
        </p>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => {
            const columnIdeas = getColumnIdeas(column.status);
            return (
              <div
                key={column.status}
                className="w-72 flex flex-col bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column header */}
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: statusConfig[column.status].color }}
                      />
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {column.title}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
                      {columnIdeas.length}
                    </span>
                  </div>
                </div>

                {/* Column content */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {columnIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idea.id)}
                      onClick={() => setSelectedIdea(idea)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all
                        ${draggedId === idea.id
                          ? "opacity-50 border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]"
                        }`}
                    >
                      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                        {idea.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 mb-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {idea.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {idea.avgScore && (
                          <span className="text-xs font-medium text-[var(--accent)]">
                            {idea.avgScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnIdeas.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border)] rounded-lg">
                      Drop ideas here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Idea detail modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                {selectedIdea.title}
              </h2>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                  Description
                </label>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {selectedIdea.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                    Status
                  </label>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: statusConfig[selectedIdea.status].color }}
                  >
                    {statusConfig[selectedIdea.status].label}
                  </p>
                </div>
                {selectedIdea.avgScore && (
                  <div>
                    <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                      Score
                    </label>
                    <p className="text-sm font-medium text-[var(--accent)] mt-1">
                      {selectedIdea.avgScore}%
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                    Evaluations
                  </label>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {selectedIdea.evaluations.length}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                  Tags
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                  Move to
                </label>
                <div className="flex items-center gap-2 mt-2">
                  {columns.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => {
                        if (col.status === "killed") {
                          setPendingKillId(selectedIdea.id);
                          setShowKillModal(true);
                          setSelectedIdea(null);
                        } else {
                          updateIdeaStatus(selectedIdea.id, col.status);
                          setSelectedIdea(null);
                        }
                      }}
                      disabled={selectedIdea.status === col.status}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        selectedIdea.status === col.status
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kill modal */}
      {showKillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] w-full max-w-md mx-4">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                Kill this idea?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Document why you&apos;re killing this idea for future reference.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                  Reason for killing
                </label>
                <textarea
                  value={killReason}
                  onChange={(e) => setKillReason(e.target.value)}
                  placeholder="e.g., Market too small, timing not right, team doesn't have skills..."
                  className="input mt-2 min-h-[100px] resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmKill}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors"
                >
                  Kill idea
                </button>
                <button
                  onClick={() => {
                    setShowKillModal(false);
                    setKillReason("");
                    setPendingKillId(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

