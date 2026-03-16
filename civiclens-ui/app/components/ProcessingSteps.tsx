    "use client";

import { useEffect, useState } from "react";

/* ─── Agent definitions ──────────────────────────────────────────────────── */
const AGENTS = [
    {
        icon: "📄",
        name: "Document Parser",
        description: "Extracting structured data from your documents",
        statusLabel: "Reading your documents...",
    },
    {
        icon: "⚖️",
        name: "Law Identifier",
        description: "Matching your case to governing regulations",
        statusLabel: "Finding governing regulations...",
    },
    {
        icon: "🔍",
        name: "Contradiction Detector",
        description: "Comparing rejection against legal requirements",
        statusLabel: "Detecting contradictions...",
    },
    {
        icon: "✍️",
        name: "Appeal Writer",
        description: "Drafting your formal appeal documents",
        statusLabel: "Writing your appeal...",
    },
];

interface ProcessingStepsProps {
    currentStep: number;
}

export default function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
    // Mount animation: cards appear one by one
    const [mounted, setMounted] = useState<boolean[]>([false, false, false, false]);
    // checkmark pop animation tracker
    const [popped, setPopped] = useState<boolean[]>([false, false, false, false]);

    useEffect(() => {
        AGENTS.forEach((_, i) => {
            setTimeout(() => {
                setMounted((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                });
            }, i * 180);
        });
    }, []);

    // Trigger pop animation when a step completes
    useEffect(() => {
        if (currentStep > 0) {
            const completedIdx = currentStep - 1;
            setPopped((prev) => {
                const next = [...prev];
                next[completedIdx] = false;
                return next;
            });
            // tiny defer so re-trigger works
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setPopped((prev) => {
                        const next = [...prev];
                        next[completedIdx] = true;
                        return next;
                    });
                });
            });
        }
    }, [currentStep]);

    const progressPct = Math.round((currentStep / AGENTS.length) * 100);
    const activeAgent = AGENTS[currentStep];
    const statusText =
        currentStep < AGENTS.length
            ? `Agent ${currentStep + 1} of ${AGENTS.length} — ${activeAgent.statusLabel}`
            : "All agents complete — finalizing results...";

    return (
        <div>
            {/* ── Header ── */}
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
                <h2
                    style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        margin: "0 0 6px",
                    }}
                >
                    CivicLens Agent Pipeline
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
                    Four specialized AI agents analyzing your case
                </p>
            </div>

            {/* ── Inject CSS keyframes ── */}
            <style>{`
        @keyframes cl-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cl-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(30,58,95,0.45); }
          70%  { box-shadow: 0 0 0 9px rgba(30,58,95,0); }
          100% { box-shadow: 0 0 0 0 rgba(30,58,95,0); }
        }
        @keyframes cl-check-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes cl-flow-dot {
          0%   { left: -8px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: calc(100% + 4px); opacity: 0; }
        }
        @keyframes cl-progress {
          from { width: 0; }
        }
        @keyframes cl-status-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cl-connector-active .cl-dashed-line {
          border-color: #3b82f6;
          box-shadow: 0 0 6px rgba(59,130,246,0.5);
        }
        .cl-connector-active .cl-dot {
          display: block !important;
        }
      `}</style>

            {/* ── Pipeline: horizontal desktop, vertical mobile ── */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 0,
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    paddingBottom: "4px",
                }}
            /* mobile: column via inline media handled with a wrapper below */
            >
                {AGENTS.map((agent, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const waiting = i > currentStep;

                    return (
                        <div
                            key={i}
                            style={{ display: "contents" }}
                        >
                            {/* ── Agent Card ── */}
                            <div
                                style={{
                                    flex: "1 1 0",
                                    minWidth: "130px",
                                    maxWidth: "200px",
                                    opacity: mounted[i] ? 1 : 0,
                                    animation: mounted[i] ? `cl-card-in 0.38s cubic-bezier(0.23,1,0.32,1) ${i * 0.07}s both` : "none",
                                    border: done
                                        ? "1.5px solid var(--success-border)"
                                        : active
                                            ? "1.5px solid #93c5fd"
                                            : "1.5px solid var(--border)",
                                    borderRadius: "8px",
                                    background: done
                                        ? "var(--success-bg)"
                                        : active
                                            ? "#eff6ff"
                                            : "#ffffff",
                                    padding: "16px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "10px",
                                    textAlign: "center",
                                    position: "relative",
                                    transition: "border-color 0.3s, background 0.3s",
                                    boxShadow: active
                                        ? "0 4px 18px rgba(59,130,246,0.15)"
                                        : done
                                            ? "0 2px 8px rgba(21,128,61,0.08)"
                                            : "0 1px 3px rgba(0,0,0,0.05)",
                                }}
                            >
                                {/* Number badge */}
                                <div
                                    style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                        background: done ? "var(--success)" : active ? "var(--primary)" : "#d1d5db",
                                        color: done || active ? "#fff" : "#6b7280",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        flexShrink: 0,
                                        animation: active ? "cl-pulse-ring 1.4s ease-out infinite" : "none",
                                        transition: "background 0.3s",
                                    }}
                                >
                                    {i + 1}
                                </div>

                                {/* Icon */}
                                <div style={{ fontSize: "1.4rem", lineHeight: 1, opacity: waiting ? 0.45 : 1, transition: "opacity 0.3s" }}>
                                    {agent.icon}
                                </div>

                                {/* Name */}
                                <p
                                    style={{
                                        margin: 0,
                                        fontWeight: 700,
                                        fontSize: "0.78rem",
                                        color: done ? "var(--success)" : active ? "var(--primary)" : "var(--text-muted)",
                                        lineHeight: 1.3,
                                        transition: "color 0.3s",
                                    }}
                                >
                                    {agent.name}
                                </p>

                                {/* Description */}
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.7rem",
                                        color: "var(--text-muted)",
                                        lineHeight: 1.4,
                                        opacity: waiting ? 0.5 : 0.85,
                                        transition: "opacity 0.3s",
                                    }}
                                >
                                    {agent.description}
                                </p>

                                {/* Status indicator */}
                                <div style={{ marginTop: "2px" }}>
                                    {done ? (
                                        /* Green checkmark with pop */
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "22px",
                                                height: "22px",
                                                borderRadius: "50%",
                                                background: "var(--success)",
                                                color: "#fff",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                lineHeight: "22px",
                                                textAlign: "center",
                                                animation: popped[i] ? "cl-check-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both" : "none",
                                            }}
                                        >
                                            ✓
                                        </span>
                                    ) : active ? (
                                        /* Blue pulsing dot */
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "50%",
                                                background: "#3b82f6",
                                                animation: "cl-pulse-ring 1.4s ease-out infinite",
                                            }}
                                        />
                                    ) : (
                                        /* Grey waiting dot */
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "50%",
                                                background: "#d1d5db",
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* ── Connector Arrow (between cards, not after last) ── */}
                            {i < AGENTS.length - 1 && (
                                <div
                                    className={done ? "cl-connector-active" : ""}
                                    style={{
                                        flexShrink: 0,
                                        width: "36px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        height: "40px",
                                    }}
                                >
                                    {/* Dashed line */}
                                    <div
                                        className="cl-dashed-line"
                                        style={{
                                            width: "100%",
                                            height: 0,
                                            borderTop: `2px dashed ${done ? "#3b82f6" : "#d1d5db"}`,
                                            boxShadow: done ? "0 0 6px rgba(59,130,246,0.5)" : "none",
                                            position: "relative",
                                            overflow: "visible",
                                            transition: "border-color 0.4s, box-shadow 0.4s",
                                        }}
                                    >
                                        {/* Animated flowing dot */}
                                        {done && (
                                            <>
                                                <span
                                                    className="cl-dot"
                                                    style={{
                                                        display: "block",
                                                        position: "absolute",
                                                        top: "-4px",
                                                        left: 0,
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                        background: "#3b82f6",
                                                        animation: "cl-flow-dot 1.2s linear infinite",
                                                        animationDelay: "0s",
                                                    }}
                                                />
                                                <span
                                                    className="cl-dot"
                                                    style={{
                                                        display: "block",
                                                        position: "absolute",
                                                        top: "-4px",
                                                        left: 0,
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                        background: "#60a5fa",
                                                        animation: "cl-flow-dot 1.2s linear infinite",
                                                        animationDelay: "0.4s",
                                                    }}
                                                />
                                                <span
                                                    className="cl-dot"
                                                    style={{
                                                        display: "block",
                                                        position: "absolute",
                                                        top: "-4px",
                                                        left: 0,
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                        background: "#93c5fd",
                                                        animation: "cl-flow-dot 1.2s linear infinite",
                                                        animationDelay: "0.8s",
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    {/* Arrowhead */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: "-1px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: 0,
                                            height: 0,
                                            borderTop: "5px solid transparent",
                                            borderBottom: "5px solid transparent",
                                            borderLeft: `7px solid ${done ? "#3b82f6" : "#d1d5db"}`,
                                            transition: "border-left-color 0.4s",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Overall Progress Bar ── */}
            <div style={{ marginTop: "28px" }}>
                <div
                    style={{
                        background: "var(--border)",
                        borderRadius: "100px",
                        height: "8px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            borderRadius: "100px",
                            width: `${progressPct}%`,
                            background: "linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)",
                            transition: "width 0.9s cubic-bezier(0.23,1,0.32,1)",
                        }}
                    />
                </div>

                {/* Status text */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                        gap: "8px",
                    }}
                >
                    <p
                        key={currentStep}
                        style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--primary)",
                            animation: "cl-status-fade 0.35s ease both",
                        }}
                    >
                        {statusText}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {progressPct}%
                    </p>
                </div>

                <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    ⏱ This usually takes 15–30 seconds
                </p>
            </div>
        </div>
    );
}
