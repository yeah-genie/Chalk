"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [slackConnected, setSlackConnected] = useState(false);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");
  const [digestTime, setDigestTime] = useState("09:00");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage integrations and preferences</p>
      </div>

      {/* Slack Integration */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Integrations</h2>
        
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Slack</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Add ideas directly from Slack with <code className="px-1 py-0.5 bg-[var(--bg-surface)] rounded">/seedlab idea</code>
                </p>
              </div>
            </div>
            
            {slackConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--green)]">Connected</span>
                <button
                  onClick={() => setSlackConnected(false)}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red)]"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSlackConnected(true)}
                className="btn-primary text-sm py-2 px-4"
              >
                Connect Slack
              </button>
            )}
          </div>
          
          {slackConnected && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                Slack Commands
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <code className="px-2 py-1 bg-[var(--bg-surface)] rounded text-xs">/seedlab idea [title]</code>
                  <span className="text-xs text-[var(--text-tertiary)]">Add a new idea</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <code className="px-2 py-1 bg-[var(--bg-surface)] rounded text-xs">/seedlab list</code>
                  <span className="text-xs text-[var(--text-tertiary)]">View recent ideas</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <code className="px-2 py-1 bg-[var(--bg-surface)] rounded text-xs">/seedlab vote [id]</code>
                  <span className="text-xs text-[var(--text-tertiary)]">Quick vote on an idea</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Weekly Digest */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Weekly Digest</h2>
        
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Enable weekly digest</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Get a summary of unevaluated and stale ideas
              </p>
            </div>
            <button
              onClick={() => setDigestEnabled(!digestEnabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                digestEnabled ? "bg-[var(--accent)]" : "bg-[var(--bg-surface)]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  digestEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          {digestEnabled && (
            <>
              <div className="pt-4 border-t border-[var(--border)]">
                <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                  Send digest on
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <select
                    value={digestDay}
                    onChange={(e) => setDigestDay(e.target.value)}
                    className="input py-2 w-auto"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                  <span className="text-sm text-[var(--text-tertiary)]">at</span>
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="input py-2 w-auto"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-[var(--border)]">
                <h4 className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                  Digest includes
                </h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ideas without evaluations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ideas idle for 90+ days
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Top-rated ideas ready to experiment
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Weekly activity summary
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Other Integrations */}
      <section>
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Coming Soon</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Linear", icon: "L", color: "#5E6AD2" },
            { name: "Notion", icon: "N", color: "#000000" },
            { name: "Jira", icon: "J", color: "#0052CC" },
            { name: "GitHub", icon: "G", color: "#333333" },
          ].map((integration) => (
            <div
              key={integration.name}
              className="card p-4 opacity-60"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: integration.color }}
                >
                  {integration.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">{integration.name}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Coming soon</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

