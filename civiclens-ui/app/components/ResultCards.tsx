"use client";

import { useEffect, useRef, useState } from "react";

export interface AnalysisResult {
    parsed_data: {
        application_type: string;
        department: string;
        rejection_reason: string;
        documents_submitted: string[];
        key_dates: string[];
    };
    law_found: {
        name: string;
        department: string;
        required_documents: string[];
        valid_rejection_grounds: string[];
        full_text: string;
    };
    contradiction: {
        contradiction_found: boolean;
        explanation: string;
        violated_clause: string;
        procedural_consistency_score: number;
        strength: "strong" | "medium" | "weak";
        reasoning_steps?: string[];
    };
    appeal: {
        message?: string;
        appeal_letter?: string;
        rti_application?: string;
        next_steps?: string[];
    };
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function downloadTxt(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ── Shared sub-components ─────────────────────────────────────── */
function GlowCard({
    children,
    delay,
    accentColor = "var(--navy)",
    className = "",
}: {
    children: React.ReactNode;
    delay: number;
    accentColor?: string;
    className?: string;
}) {
    return (
        <div
            className={`result-card ${className}`}
            style={{
                animation: `slideUp 0.55s cubic-bezier(0.23,1,0.32,1) ${delay}ms both`,
                borderTop: `3px solid ${accentColor}`,
            }}
        >
            {children}
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    badge,
}: {
    icon: string;
    title: string;
    badge?: { text: string; variant: "blue" | "gold" | "green" | "red" };
}) {
    const badgeStyles: Record<string, React.CSSProperties> = {
        blue: { background: "var(--navy-light)", color: "var(--navy)" },
        gold: { background: "var(--gold-light)", color: "#92400e" },
        green: { background: "var(--success-light)", color: "var(--success)" },
        red: { background: "var(--danger-light)", color: "var(--danger)" },
    };
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "var(--navy)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", flexShrink: 0,
                }}>
                    {icon}
                </span>
                <h3 style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px",
                    color: "var(--navy)", margin: 0,
                }}>
                    {title}
                </h3>
            </div>
            {badge && (
                <span style={{
                    ...badgeStyles[badge.variant],
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "11px",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    borderRadius: "8px", padding: "6px 14px", whiteSpace: "nowrap",
                }}>
                    {badge.text}
                </span>
            )}
        </div>
    );
}

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
        }}>
            <p style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "var(--navy)", opacity: 0.45, marginBottom: "6px",
            }}>
                {label}
            </p>
            <p style={{
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "15px",
                color: "var(--text)", margin: 0, lineHeight: 1.5,
            }}>
                {value || "—"}
            </p>
        </div>
    );
}

/* ── Card 1: Case Summary ─────────────────────────────────────────── */
function CaseSummaryCard({ data, delay }: { data: AnalysisResult["parsed_data"]; delay: number }) {
    return (
        <GlowCard delay={delay}>
            <SectionHeader icon="📋" title="Case Summary" />
            <FieldRow label="Application Type" value={data.application_type} />
            <FieldRow label="Department" value={data.department} />
            <FieldRow label="Rejection Reason" value={data.rejection_reason} />

            {data.documents_submitted?.length > 0 && (
                <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "10px",
                    }}>
                        Documents Submitted
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {data.documents_submitted.map((doc, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "8px 14px", borderRadius: "10px",
                                background: "var(--off-white)", border: "1px solid var(--border)",
                                fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text)",
                            }}>
                                <span style={{ color: "var(--gold)", fontSize: "14px" }}>📄</span>
                                {doc}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.key_dates?.length > 0 && (
                <div style={{ padding: "16px 0" }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "10px",
                    }}>
                        Key Dates
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {data.key_dates.map((d, i) => (
                            <span key={i} style={{
                                background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                                color: "#fff",
                                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "11px",
                                textTransform: "uppercase", letterSpacing: "0.04em",
                                borderRadius: "8px", padding: "8px 16px",
                            }}>
                                📅 {d}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </GlowCard>
    );
}

/* ── Card 2: Governing Law ─────────────────────────────────────────── */
function GoverningLawCard({ law, delay }: { law: AnalysisResult["law_found"]; delay: number }) {
    return (
        <GlowCard delay={delay} accentColor="var(--navy-mid)">
            <SectionHeader icon="⚖️" title="Applicable Regulation" badge={{ text: "Verified Legal Source", variant: "blue" }} />

            <div style={{
                background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                borderRadius: "12px", padding: "16px 20px", marginBottom: "24px",
            }}>
                <p style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px",
                    color: "#fff", margin: 0,
                }}>
                    {law.name}
                </p>
            </div>

            {law.required_documents?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "12px",
                    }}>
                        Required Documents
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {law.required_documents.map((doc, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: "12px",
                                padding: "10px 16px", borderRadius: "10px",
                                background: "var(--off-white)", border: "1px solid var(--border)",
                                fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text)",
                                lineHeight: 1.5,
                            }}>
                                <span style={{
                                    color: "#fff", background: "var(--navy)",
                                    width: "20px", height: "20px", borderRadius: "6px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "10px", fontWeight: 700, flexShrink: 0, marginTop: "2px",
                                }}>→</span>
                                {doc}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {law.valid_rejection_grounds?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "12px",
                    }}>
                        Valid Grounds for Rejection
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {law.valid_rejection_grounds.map((g, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: "12px",
                                padding: "10px 16px",
                                fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text)",
                                lineHeight: 1.5,
                            }}>
                                <span style={{ color: "var(--gold)", fontSize: "8px", marginTop: "6px", flexShrink: 0 }}>●</span>
                                {g}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {law.full_text && (
                <div style={{
                    padding: "16px 20px", borderRadius: "12px",
                    background: "var(--off-white)",
                    borderLeft: "4px solid var(--gold)",
                    fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.7,
                    color: "var(--text-muted)",
                }}>
                    {law.full_text}
                </div>
            )}
        </GlowCard>
    );
}

/* ── Card 3: Compliance Analysis ──────────────────────────────────── */
const STEP_LABELS = [
    { n: 1, label: "What the rejection claimed", icon: "📋", color: "var(--navy)" },
    { n: 2, label: "What the law actually requires", icon: "⚖️", color: "var(--navy-mid)" },
    { n: 3, label: "What the comparison revealed", icon: "🔍", color: "var(--gold)" },
    { n: 4, label: "Conclusion reached", icon: "✅", color: "var(--success)" },
];

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
    const isGood = score >= 50;
    const color = isGood ? "var(--success)" : "var(--danger)";
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.23,1,0.32,1)" }} />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px",
                color,
            }}>
                {score}
            </div>
        </div>
    );
}

function AnalysisCard({ contradiction, delay }: { contradiction: AnalysisResult["contradiction"]; delay: number }) {
    const { contradiction_found, explanation, violated_clause, procedural_consistency_score, reasoning_steps } = contradiction;
    const score = procedural_consistency_score;
    const borderColor = contradiction_found ? "var(--gold)" : "var(--success)";
    const [showReasoning, setShowReasoning] = useState(false);

    const steps: string[] = Array.isArray(reasoning_steps) && reasoning_steps.length === 4
        ? reasoning_steps
        : [
            "No rejection reason information available.",
            "No law requirements identified.",
            "Comparison could not be performed.",
            "No conclusion reached.",
        ];

    return (
        <GlowCard delay={delay} accentColor={borderColor}>
            <SectionHeader icon="🔍" title="Compliance Analysis" />

            {explanation && (
                <div style={{
                    padding: "16px 20px", borderRadius: "12px", marginBottom: "24px",
                    background: "var(--off-white)", border: "1px solid var(--border)",
                    fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.7,
                    color: "var(--text)",
                }}>
                    {explanation}
                </div>
            )}

            {/* Score section */}
            <div style={{
                display: "flex", alignItems: "center", gap: "24px",
                padding: "20px 24px", borderRadius: "14px",
                background: "var(--off-white)", border: "1px solid var(--border)",
                marginBottom: "24px",
            }}>
                <ScoreRing score={score} />
                <div>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "4px",
                    }}>
                        Procedural Consistency Score
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px",
                        color: "var(--text)", margin: 0,
                    }}>
                        {score >= 50 ? "Within acceptable range" : "Below threshold — review recommended"}
                    </p>
                </div>
            </div>

            {/* Contradiction notice */}
            {contradiction_found ? (
                <div style={{
                    padding: "16px 20px", borderRadius: "12px", marginBottom: "20px",
                    background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                    border: "1px solid #fde68a",
                    display: "flex", alignItems: "center", gap: "12px",
                }}>
                    <span style={{ fontSize: "24px" }}>⚠️</span>
                    <div>
                        <p style={{
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                            color: "#92400e", margin: "0 0 2px",
                        }}>
                            Potential Grounds for Appeal
                        </p>
                        <p style={{
                            fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px",
                            color: "#a16207", margin: 0,
                        }}>
                            The rejection reason may not align with the governing regulation.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: "16px 20px", borderRadius: "12px", marginBottom: "20px",
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #bbf7d0",
                    display: "flex", alignItems: "center", gap: "12px",
                }}>
                    <span style={{ fontSize: "24px" }}>✅</span>
                    <div>
                        <p style={{
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                            color: "var(--success)", margin: "0 0 2px",
                        }}>
                            Procedurally Consistent
                        </p>
                        <p style={{
                            fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px",
                            color: "#166534", margin: 0,
                        }}>
                            The rejection appears to follow established procedures. Review details below.
                        </p>
                    </div>
                </div>
            )}

            {violated_clause && (
                <div style={{
                    marginBottom: "20px",
                    padding: "14px 20px", borderRadius: "12px",
                    background: "var(--danger-light)", border: "1px solid #fecaca",
                }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--danger)", opacity: 0.7, marginBottom: "6px",
                    }}>
                        Specific Clause
                    </p>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
                        color: "var(--danger)", margin: 0,
                    }}>
                        {violated_clause}
                    </p>
                </div>
            )}

            {/* ── Collapsible AI Reasoning Process ─────────────────── */}
            <div style={{
                borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "20px",
            }}>
                <button
                    onClick={() => setShowReasoning((v) => !v)}
                    style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, width: "100%", textAlign: "left",
                    }}
                    aria-expanded={showReasoning}
                >
                    <span style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", flexShrink: 0,
                    }}>
                        🧠
                    </span>
                    <span style={{
                        fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700,
                        color: "var(--navy)",
                    }}>
                        AI Reasoning Process
                    </span>
                    <span style={{
                        marginLeft: "auto",
                        fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                        color: "var(--navy)",
                        background: "var(--navy-light)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px", padding: "6px 14px",
                        whiteSpace: "nowrap", flexShrink: 0,
                        transition: "all 0.2s ease",
                    }}>
                        {showReasoning ? "Hide ▲" : "Show reasoning ▼"}
                    </span>
                </button>

                {showReasoning && (
                    <div style={{
                        marginTop: "20px", paddingLeft: "4px",
                        animation: "clr-expand 0.22s ease both",
                    }}>
                        <style>{`
                            @keyframes clr-expand {
                                from { opacity: 0; transform: translateY(-6px); }
                                to   { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>

                        <div style={{ position: "relative" }}>
                            {/* Vertical connector line */}
                            <div style={{
                                position: "absolute", left: "19px", top: "40px", bottom: "40px",
                                width: "2px",
                                background: "linear-gradient(180deg, var(--navy) 0%, var(--gold) 50%, var(--success) 100%)",
                                zIndex: 0, borderRadius: "2px",
                            }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {STEP_LABELS.map(({ n, label, icon, color }, idx) => (
                                    <div key={n} style={{
                                        display: "flex", gap: "16px", alignItems: "flex-start",
                                        position: "relative", zIndex: 1,
                                    }}>
                                        <div style={{
                                            width: "40px", height: "40px", borderRadius: "12px",
                                            background: color, color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "14px", fontWeight: 800, flexShrink: 0,
                                            boxShadow: `0 0 0 4px var(--white), 0 2px 8px rgba(0,0,0,0.1)`,
                                            fontFamily: "var(--font-body)",
                                        }}>
                                            {n}
                                        </div>

                                        <div style={{
                                            flex: 1,
                                            background: idx === 3 ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "var(--off-white)",
                                            border: `1px solid ${idx === 3 ? "#bbf7d0" : "var(--border)"}`,
                                            borderRadius: "12px", padding: "14px 18px",
                                            transition: "all 0.2s ease",
                                        }}>
                                            <p style={{
                                                margin: "0 0 6px", fontSize: "11px", fontWeight: 700,
                                                textTransform: "uppercase", letterSpacing: "0.06em",
                                                color: idx === 3 ? "var(--success)" : color,
                                                fontFamily: "var(--font-body)",
                                            }}>
                                                {icon} {label}
                                            </p>
                                            <p style={{
                                                margin: 0, fontSize: "14px", lineHeight: 1.6,
                                                color: "var(--text)", fontFamily: "var(--font-body)",
                                            }}>
                                                {steps[idx]}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </GlowCard>
    );
}

/* ── Card 4: Generated Documents ──────────────────────────────────── */
function DocumentsCard({ appeal, delay }: { appeal: AnalysisResult["appeal"]; delay: number }) {
    if (appeal.message) {
        return (
            <GlowCard delay={delay} accentColor="var(--success)">
                <SectionHeader icon="📄" title="Generated Documents" />
                <div style={{
                    padding: "16px 20px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #bbf7d0",
                    fontFamily: "var(--font-body)", fontSize: "14px",
                    color: "var(--success)",
                }}>
                    {appeal.message}
                </div>
            </GlowCard>
        );
    }

    return (
        <GlowCard delay={delay} accentColor="var(--gold)">
            <SectionHeader icon="📄" title="Generated Documents" badge={{ text: "Ready to Download", variant: "green" }} />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
                {appeal.appeal_letter && (
                    <button
                        onClick={() => downloadTxt("CivicLens_Appeal_Letter.txt", appeal.appeal_letter!)}
                        style={{
                            background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                            color: "#fff",
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                            borderRadius: "12px", padding: "14px 24px",
                            border: "none", cursor: "pointer",
                            boxShadow: "var(--shadow-md)",
                            display: "inline-flex", alignItems: "center", gap: "10px",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }}
                    >
                        <span style={{ fontSize: "18px" }}>📥</span> Download Appeal Letter
                    </button>
                )}
                {appeal.rti_application && (
                    <button
                        onClick={() => downloadTxt("CivicLens_RTI_Application.txt", appeal.rti_application!)}
                        style={{
                            background: "transparent",
                            color: "var(--navy)",
                            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                            borderRadius: "12px", padding: "14px 24px",
                            border: "2px solid var(--navy)",
                            cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: "10px",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--navy-light)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <span style={{ fontSize: "18px" }}>📥</span> Download RTI Application
                    </button>
                )}
            </div>

            {appeal.next_steps && appeal.next_steps.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                    <p style={{
                        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "10px",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "var(--navy)", opacity: 0.45, marginBottom: "14px",
                    }}>
                        Next Steps
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {appeal.next_steps.map((step, i) => (
                            <div key={i} style={{
                                display: "flex", gap: "14px", alignItems: "flex-start",
                            }}>
                                <span style={{
                                    width: "32px", height: "32px", borderRadius: "10px",
                                    background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                                    color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "13px",
                                    flexShrink: 0,
                                }}>
                                    {i + 1}
                                </span>
                                <p style={{
                                    fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.6,
                                    color: "var(--text)", margin: 0, paddingTop: "6px",
                                }}>
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                padding: "12px 16px", borderRadius: "10px",
                background: "var(--off-white)", border: "1px solid var(--border)",
            }}>
                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-muted)",
                    margin: 0, lineHeight: 1.5,
                }}>
                    💡 Review these documents carefully before submitting. Consider consulting a legal professional
                    for complex cases.
                </p>
            </div>
        </GlowCard>
    );
}

/* ── Chat Message types ──────────────────────────────────────────── */
interface ChatMessage {
    role: "user" | "assistant";
    text: string;
}

/* ── Chat Assistant Panel ────────────────────────────────────────── */
function ChatAssistant({ result }: { result: AnalysisResult }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, thinking]);

    const send = async () => {
        const msg = input.trim();
        if (!msg || thinking) return;
        setInput("");
        setError(null);
        setMessages((prev) => [...prev, { role: "user", text: msg }]);
        setThinking(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg, context: result }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error ?? "An error occurred. Please try again.");
            } else {
                setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
            }
        } catch {
            setError("Could not reach the CivicLens service. Is Flask running on port 5000?");
        } finally {
            setThinking(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    };

    return (
        <GlowCard delay={400} accentColor="var(--navy)">
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                paddingBottom: "20px", borderBottom: "1px solid var(--border)",
                marginBottom: "16px",
            }}>
                <span style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", flexShrink: 0,
                }}>
                    💬
                </span>
                <div>
                    <h3 style={{
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px",
                        color: "var(--navy)", margin: "0 0 2px",
                    }}>
                        Ask CivicLens
                    </h3>
                    <p style={{
                        fontFamily: "var(--font-body)", fontSize: "13px",
                        color: "var(--text-muted)", margin: 0,
                    }}>
                        Have questions about your analysis? Ask below.
                    </p>
                </div>
            </div>

            {/* Message window */}
            <div
                ref={scrollRef}
                style={{
                    maxHeight: "300px", minHeight: messages.length === 0 ? "80px" : undefined,
                    overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: "12px",
                    marginBottom: "16px",
                }}
            >
                {messages.length === 0 && !thinking && (
                    <p style={{
                        fontFamily: "var(--font-body)", fontSize: "14px",
                        color: "var(--text-muted)", textAlign: "center",
                        margin: "24px 0", lineHeight: 1.6,
                    }}>
                        Ask a question about your case — e.g. &quot;What documents am I missing?&quot; or &quot;How do I file an appeal?&quot;
                    </p>
                )}

                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    }}>
                        <div style={{
                            maxWidth: "80%", padding: "12px 16px",
                            fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.5,
                            ...(msg.role === "user"
                                ? {
                                    background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                                    color: "#fff", borderRadius: "16px 16px 4px 16px",
                                }
                                : {
                                    background: "var(--off-white)",
                                    color: "var(--text)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "16px 16px 16px 4px",
                                }),
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {thinking && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{
                            padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
                            background: "var(--off-white)", border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", gap: "6px",
                        }}>
                            {[0, 1, 2].map((d) => (
                                <span key={d} style={{
                                    display: "inline-block", width: "6px", height: "6px",
                                    borderRadius: "50%", background: "var(--navy)",
                                    animation: `dotPulse 1.2s ease ${d * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: "10px 16px", borderRadius: "10px",
                        background: "var(--danger-light)", border: "1px solid #fecaca",
                        fontFamily: "var(--font-body)", fontSize: "13px",
                        color: "var(--danger)",
                    }}>
                        {error}
                    </div>
                )}
            </div>

            {/* Input row */}
            <div style={{
                display: "flex", gap: "10px",
                borderTop: "1px solid var(--border)", paddingTop: "16px",
            }}>
                <input
                    id="chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask a question about your case..."
                    disabled={thinking}
                    style={{
                        flex: 1,
                        fontFamily: "var(--font-body)", fontSize: "14px",
                        border: "1px solid var(--border)", borderRadius: "12px",
                        padding: "12px 16px", outline: "none",
                        background: "var(--off-white)", color: "var(--text)",
                        transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                    id="chat-send-btn"
                    onClick={send}
                    disabled={thinking || !input.trim()}
                    style={{
                        background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                        color: "#fff",
                        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px",
                        borderRadius: "12px", padding: "12px 20px",
                        border: "none",
                        cursor: thinking || !input.trim() ? "not-allowed" : "pointer",
                        opacity: thinking || !input.trim() ? 0.5 : 1,
                        transition: "all 0.2s ease", flexShrink: 0,
                    }}
                >
                    {thinking ? "..." : "Send"}
                </button>
            </div>

            <p style={{
                fontFamily: "var(--font-body)", fontSize: "11px",
                color: "var(--text-muted)", textAlign: "center",
                marginTop: "12px",
            }}>
                CivicLens provides informational guidance only. <strong>Not a substitute for legal advice.</strong>
            </p>
        </GlowCard>
    );
}

/* ── Main Export ─────────────────────────────────────────────────── */
export default function ResultCards({ result }: { result: AnalysisResult }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <CaseSummaryCard data={result.parsed_data} delay={0} />
            <GoverningLawCard law={result.law_found} delay={100} />
            <AnalysisCard contradiction={result.contradiction} delay={200} />
            <DocumentsCard appeal={result.appeal} delay={300} />
            <ChatAssistant result={result} />
        </div>
    );
}
