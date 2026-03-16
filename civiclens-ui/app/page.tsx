"use client";

import { useRef, useState, useEffect } from "react";
import UploadBox from "./components/UploadBox";
import ProcessingSteps from "./components/ProcessingSteps";
import ResultCards, { AnalysisResult } from "./components/ResultCards";
import CivicLensLogo from "./components/CivicLensLogo";

/* ── Chat types ──────────────────────────────────────────────────── */
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function Home() {
  const [rejFile, setRejFile] = useState<File | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Chat state */
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const howRef = useRef<HTMLElement>(null);
  const uploadRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLElement | HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* Auto-scroll chat */
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatThinking]);

  const handleAnalyze = async () => {
    if (!rejFile || !appFile) {
      setError("Please upload both the rejection letter and your application document before proceeding.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setStep(0);

    const iv = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 7000);

    try {
      const fd = new FormData();
      fd.append("rejection_letter", rejFile);
      fd.append("application_doc", appFile);

      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      clearInterval(iv);
      setStep(3);

      if (!res.ok || data.error) {
        setError(data.error ?? "An unexpected error occurred. Please try again.");
      } else {
        setResult(data as AnalysisResult);
        setTimeout(() => scroll(resultsRef), 400);
      }
    } catch {
      clearInterval(iv);
      setError("Could not connect to the backend. Please ensure the CivicLens service is running.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRejFile(null); setAppFile(null);
    setResult(null); setError(null); setStep(0);
  };

  /* Chat send */
  const chatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatThinking || !result) return;
    setChatInput("");
    setChatError(null);
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context: result }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setChatError(data.error ?? "An error occurred. Please try again.");
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      }
    } catch {
      setChatError("Could not reach the CivicLens service. Is Flask running on port 5000?");
    } finally {
      setChatThinking(false);
    }
  };

  const chatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend(); }
  };

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--white)", color: "var(--text)" }}>

      {/* ════════════════════════════════ NAVIGATION ════════════════════════════════ */}
      <nav className="nav-bar" aria-label="Main navigation">
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
          height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <CivicLensLogo inline />
          </a>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {[
              { label: "How It Works", ref: howRef },
              { label: "Upload", ref: uploadRef },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => scroll(link.ref)}
                style={{
                  fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px",
                  color: "var(--navy-mid)", background: "none", border: "none",
                  cursor: "pointer", transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--navy-mid)")}
              >
                {link.label}
              </button>
            ))}
            <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
            <span style={{
              fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px",
              color: "var(--text-muted)", fontStyle: "italic",
            }}>
              Informational use only
            </span>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════ HERO ════════════════════════════════════ */}
      <section
        style={{
          background: "var(--navy)",
          position: "relative",
          minHeight: "88vh",
          overflow: "hidden",
        }}
        aria-labelledby="hero-heading"
      >
        {/* Pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 50px)",
          pointerEvents: "none",
        }} />

        <div className="hero-grid" style={{
          maxWidth: "1200px", margin: "0 auto", padding: "80px 24px",
          display: "flex", alignItems: "center", gap: "64px",
          position: "relative", zIndex: 1,
        }}>
          {/* LEFT COLUMN */}
          <div style={{ flex: 1 }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "var(--gold-light)", color: "var(--gold)",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px",
              textTransform: "uppercase", letterSpacing: "0.08em",
              borderRadius: "8px", padding: "8px 16px",
            }}>
              ⚡ Powered by Amazon Nova AI
            </div>

            {/* H1 */}
            <h1 id="hero-heading" style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              marginTop: "20px", lineHeight: 1.05,
            }}>
              <span style={{ display: "block", fontSize: "clamp(42px, 5vw, 68px)", color: "var(--gold)" }}>
                Know Your Rights
              </span>
              <span style={{ display: "block", fontSize: "clamp(42px, 5vw, 68px)", color: "#ffffff" }}>
                When the Government
              </span>
              <span style={{ display: "block", fontSize: "clamp(42px, 5vw, 68px)", color: "rgba(255,255,255,0.9)" }}>
                Says No.
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "18px",
              color: "rgba(255,255,255,0.7)", maxWidth: "480px",
              marginTop: "20px", lineHeight: 1.7,
            }}>
              CivicLens analyzes government rejection letters, identifies the governing rules, and
              helps you prepare a structured appeal — in seconds.
            </p>

            {/* Stat badges */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "28px" }}>
              {["📋 5 Case Types Supported", "🤖 AI-Powered Analysis"].map((text) => (
                <span key={text} style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px",
                  borderRadius: "8px", padding: "8px 16px",
                  backdropFilter: "blur(8px)",
                }}>
                  {text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => scroll(uploadRef)}
              style={{
                marginTop: "32px",
                background: "var(--gold)", color: "var(--navy)",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "18px",
                borderRadius: "12px", padding: "16px 32px",
                border: "none", cursor: "pointer",
                boxShadow: "var(--shadow-lg)",
                display: "inline-flex", alignItems: "center", gap: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.05)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Analyze My Case →
            </button>
          </div>

          {/* RIGHT COLUMN — decorative */}
          <div className="hero-right" style={{
            width: "420px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {/* Outer ring */}
            <div style={{
              width: "360px", height: "360px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* Inner circle */}
              <div style={{
                width: "280px", height: "280px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.3))", opacity: 0.95 }}>
                  <CivicLensLogo className="w-[140px]" />
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "100px", height: "130px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              transform: "rotate(12deg)",
            }} />
            <div style={{
              position: "absolute", bottom: "32px", right: "32px",
              width: "90px", height: "120px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              transform: "rotate(-6deg)",
            }} />
            <div style={{
              position: "absolute", top: "64px", left: 0,
              width: "80px", height: "110px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              transform: "rotate(-8deg)",
            }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ HOW IT WORKS ═════════════════════════════ */}
      <section
        id="how-it-works"
        ref={howRef}
        style={{ background: "var(--off-white)", padding: "96px 24px" }}
        aria-labelledby="how-heading"
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px",
            textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)",
          }}>
            THE PROCESS
          </p>
          <h2 id="how-heading" style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "44px",
            color: "var(--navy)", marginTop: "12px",
          }}>
            Four Steps to Your Appeal
          </h2>

          <div className="how-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px", marginTop: "56px", textAlign: "left",
          }}>
            {[
              { n: 1, icon: "📤", title: "Upload Documents", body: "Upload your rejection letter and original application. Supported formats: PDF, JPG, PNG." },
              { n: 2, icon: "⚡", title: "AI Analysis", body: "Four specialized agents analyze your case against the governing law and check for procedural violations." },
              { n: 3, icon: "📋", title: "Get Your Appeal", body: "Download a ready-to-file appeal letter and RTI application with step-by-step guidance." },
              { n: 4, icon: "💬", title: "Ask CivicLens", body: "Chat with our AI assistant to understand your case, ask follow-up questions, and get personalized guidance." },
            ].map((card) => (
              <div
                key={card.n}
                style={{
                  background: "var(--white)",
                  boxShadow: "var(--shadow-sm)",
                  borderRadius: "16px",
                  padding: "32px",
                  borderTop: "4px solid var(--navy)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Watermark number */}
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "96px",
                  color: "var(--navy)", opacity: 0.06,
                  position: "absolute", top: "8px", right: "16px", lineHeight: 1,
                  pointerEvents: "none",
                }}>
                  {card.n}
                </span>

                <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>
                  {card.icon}
                </span>
                <h3 style={{
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "18px",
                  color: "var(--navy)",
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
                  color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.6,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ UPLOAD / PROCESSING ══════════════════════ */}
      <section
        id="upload"
        ref={uploadRef}
        style={{ background: "var(--white)", padding: "96px 24px" }}
        aria-labelledby="upload-heading"
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          {loading ? (
            /* ── Processing state ── */
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px",
                textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)",
              }}>
                ANALYZING YOUR CASE
              </p>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "36px",
                color: "var(--navy)", marginTop: "8px",
              }}>
                CivicLens Agent Pipeline
              </h2>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "16px",
                color: "var(--text-muted)", marginTop: "8px",
              }}>
                Four specialized AI agents analyzing your case
              </p>

              <div style={{
                background: "var(--white)", borderRadius: "16px",
                boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)",
                padding: "32px", marginTop: "32px",
              }}>
                <ProcessingSteps currentStep={step} />
              </div>
            </div>
          ) : (
            /* ── Upload form ── */
            <div>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px",
                textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)",
              }}>
                ANALYZE YOUR CASE
              </p>
              <h2
                id="upload-heading"
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "40px",
                  color: "var(--navy)", marginTop: "12px",
                }}
              >
                Upload Your Documents
              </h2>

              {/* Disclaimer */}
              <div style={{
                marginTop: "24px",
                borderLeft: "4px solid var(--gold)",
                background: "var(--gold-light)",
                borderRadius: "0 12px 12px 0",
                padding: "16px 20px",
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
                color: "var(--text)",
              }}>
                <strong>Note:</strong> CivicLens provides automated analysis based on publicly
                available regulations. Results are informational and should be verified before
                submitting any legal appeal.
              </div>

              {/* Upload areas */}
              <div className="upload-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "16px", marginTop: "32px",
              }}>
                <div>
                  <label
                    htmlFor="rejection-upload"
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      color: "var(--navy)", opacity: 0.5,
                      marginBottom: "8px", display: "block", cursor: "pointer",
                    }}
                  >
                    Rejection Letter <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <UploadBox
                    id="rejection-upload"
                    label="Rejection Letter"
                    description="Upload the official rejection order from the department"
                    file={rejFile}
                    onFileChange={setRejFile}
                  />
                </div>
                <div>
                  <label
                    htmlFor="application-upload"
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      color: "var(--navy)", opacity: 0.5,
                      marginBottom: "8px", display: "block", cursor: "pointer",
                    }}
                  >
                    Your Application <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <UploadBox
                    id="application-upload"
                    label="Your Application"
                    description="Upload your original application or supporting documents"
                    file={appFile}
                    onFileChange={setAppFile}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="notice-danger" style={{
                  padding: "16px", fontSize: "14px", marginTop: "16px",
                  color: "var(--danger)",
                }}>
                  {error}
                </div>
              )}

              {/* Analyze button */}
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !rejFile || !appFile}
                style={{
                  width: "100%", marginTop: "24px",
                  background: "var(--navy)", color: "#ffffff",
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "18px",
                  borderRadius: "16px", padding: "20px",
                  border: "none", cursor: loading || !rejFile || !appFile ? "not-allowed" : "pointer",
                  boxShadow: "var(--shadow-md)",
                  opacity: loading || !rejFile || !appFile ? 0.4 : 1,
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Analyze My Case →
              </button>

              {result && (
                <button
                  onClick={reset}
                  style={{
                    width: "100%", marginTop: "12px",
                    background: "transparent", color: "var(--navy)",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px",
                    borderRadius: "16px", padding: "16px",
                    border: "2px solid var(--navy)",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--navy-light)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Start Over
                </button>
              )}

              {/* Privacy */}
              <p style={{
                marginTop: "14px", textAlign: "center",
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px",
                color: "var(--text-muted)",
              }}>
                🔒 Your documents are processed securely and deleted after analysis.
              </p>

              {/* Download Samples for Testers */}
              <div style={{
                marginTop: "32px", paddingTop: "24px",
                borderTop: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px",
                  color: "var(--navy)", opacity: 0.8, marginBottom: "16px",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Testing CivicLens?
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                  <a
                    href="/rejection_letter.pdf"
                    download="Sample_Rejection_Letter.pdf"
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
                      color: "var(--navy)", textDecoration: "none",
                      background: "rgba(15, 36, 68, 0.04)", 
                      border: "2px solid var(--navy)",
                      padding: "10px 20px", borderRadius: "10px",
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--navy)";
                      e.currentTarget.style.color = "var(--white)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(15, 36, 68, 0.04)";
                      e.currentTarget.style.color = "var(--navy)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    📄 Sample Rejection Letter
                  </a>
                  <a
                    href="/application.pdf"
                    download="Sample_Application.pdf"
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
                      color: "var(--navy)", textDecoration: "none",
                      background: "rgba(15, 36, 68, 0.04)", 
                      border: "2px solid var(--navy)",
                      padding: "10px 20px", borderRadius: "10px",
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--navy)";
                      e.currentTarget.style.color = "var(--white)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(15, 36, 68, 0.04)";
                      e.currentTarget.style.color = "var(--navy)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    📄 Sample Application
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════ RESULTS ══════════════════════════════════ */}
      {result && (
        <section
          style={{ background: "var(--off-white)", padding: "64px 24px" }}
          aria-labelledby="results-heading"
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }} ref={resultsRef}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "32px",
            }}>
              <h2
                id="results-heading"
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "32px",
                  color: "var(--navy)",
                }}
              >
                Analysis Results
              </h2>
              <span style={{
                background: "var(--gold)", color: "var(--navy)",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "12px",
                textTransform: "uppercase", borderRadius: "8px",
                padding: "4px 12px",
              }}>
                COMPLETE
              </span>
            </div>
            <ResultCards result={result} />
          </div>
        </section>
      )}

      {/* ════════════════════════════════ FLOATING CHAT ═════════════════════════════ */}
      {result && (
        <>
          {/* Chat Toggle Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              position: "fixed", bottom: "24px", right: "24px",
              width: "56px", height: "56px",
              background: "var(--navy)", borderRadius: "50%",
              boxShadow: "var(--shadow-lg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", border: "none",
              zIndex: 40,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(15,36,68,0.25)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            aria-label="Open chat assistant"
          >
            <span style={{ fontSize: "24px", color: "#ffffff" }}>⚖️</span>
            {/* Gold notification dot */}
            <span style={{
              position: "absolute", top: "-4px", right: "-4px",
              width: "10px", height: "10px",
              background: "var(--gold)", borderRadius: "50%",
              border: "2px solid #ffffff",
            }} />
          </button>

          {/* Chat Panel */}
          <div style={{
            position: "fixed", right: 0, top: 0, bottom: 0,
            width: "380px",
            background: "var(--white)",
            boxShadow: chatOpen ? "var(--shadow-lg)" : "none",
            zIndex: 50,
            display: "flex", flexDirection: "column",
            transform: chatOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            {/* Header */}
            <div style={{
              background: "var(--navy)", padding: "16px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px", color: "#ffffff" }}>⚖️</span>
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px",
                  color: "#ffffff",
                }}>
                  CivicLens Assistant
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.7)", fontSize: "20px",
                  padding: "4px", lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatScrollRef}
              style={{
                flex: 1, overflowY: "auto", padding: "16px",
                display: "flex", flexDirection: "column", gap: "12px",
                background: "var(--off-white)",
              }}
            >
              {chatMessages.length === 0 && !chatThinking && (
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "14px",
                  color: "var(--text-muted)", textAlign: "center",
                  margin: "32px 0",
                }}>
                  Ask a question about your case — e.g. &quot;What documents am I missing?&quot; or &quot;How do I file an appeal?&quot;
                </p>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
                    lineHeight: 1.5,
                    ...(msg.role === "user"
                      ? {
                          background: "var(--navy)", color: "#ffffff",
                          borderRadius: "16px 16px 4px 16px",
                        }
                      : {
                          background: "var(--white)", color: "var(--text)",
                          boxShadow: "var(--shadow-sm)",
                          borderRadius: "16px 16px 16px 4px",
                        }),
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {chatThinking && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "12px 16px",
                    background: "var(--white)", boxShadow: "var(--shadow-sm)",
                    borderRadius: "16px 16px 16px 4px",
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

              {/* Error */}
              {chatError && (
                <div style={{
                  padding: "8px 16px", borderRadius: "8px",
                  background: "var(--danger-light)", color: "var(--danger)",
                  fontFamily: "var(--font-body)", fontSize: "13px",
                }}>
                  {chatError}
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{
              background: "var(--white)",
              borderTop: "1px solid var(--border)",
              padding: "12px 16px",
              display: "flex", gap: "8px",
              flexShrink: 0,
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={chatKeyDown}
                placeholder="Ask a question about your case..."
                disabled={chatThinking}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
                  border: "1px solid var(--border)", borderRadius: "10px",
                  padding: "8px 16px",
                  outline: "none",
                  transition: "border-color 0.15s",
                  color: "var(--text)", background: "var(--white)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                onClick={chatSend}
                disabled={chatThinking || !chatInput.trim()}
                style={{
                  background: "var(--navy)", color: "#ffffff",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px",
                  borderRadius: "10px", padding: "8px 16px",
                  border: "none", cursor: chatThinking || !chatInput.trim() ? "not-allowed" : "pointer",
                  opacity: chatThinking || !chatInput.trim() ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {chatThinking ? "..." : "Send"}
              </button>
            </div>

            {/* Disclaimer */}
            <p style={{
              fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px",
              color: "var(--text-muted)", textAlign: "center",
              padding: "0 16px 12px",
              flexShrink: 0,
            }}>
              CivicLens provides informational guidance only. <strong>Not a substitute for legal advice.</strong>
            </p>
          </div>
        </>
      )}

      {/* ════════════════════════════════ FOOTER ═══════════════════════════════════ */}
      <footer style={{ background: "var(--navy)", paddingTop: "56px", paddingBottom: "32px" }} aria-label="Site footer">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div className="footer-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "48px",
          }}>
            {/* Brand */}
            <div>
              <div style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                <CivicLensLogo className="w-[110px]" />
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "15px",
                color: "rgba(255,255,255,0.5)", marginTop: "16px",
                maxWidth: "260px", lineHeight: 1.6,
              }}>
                Helping citizens understand administrative decisions and navigate appeal procedures.
              </p>
            </div>

            {/* Links */}
            <div>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px",
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "var(--gold)", marginBottom: "20px",
              }}>
                NAVIGATE
              </p>
              {[
                { label: "How It Works", action: () => scroll(howRef) },
                { label: "Upload", action: () => scroll(uploadRef) },
                { label: "Disclaimer", action: () => scroll(uploadRef) },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  style={{
                    display: "block",
                    fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "15px",
                    color: "rgba(255,255,255,0.6)",
                    background: "none", border: "none", cursor: "pointer",
                    padding: 0, marginBottom: "12px",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* About */}
            <div>
              <p style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px",
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "var(--gold)", marginBottom: "20px",
              }}>
                ABOUT
              </p>
              <a
                href="https://amazon-nova.devpost.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "15px",
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              >
                Built for Amazon Nova AI Hackathon 2026 ↗
              </a>
            </div>
          </div>

          {/* Divider + disclaimer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: "40px", paddingTop: "24px",
          }}>
            <p style={{
              fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
              color: "rgba(255,255,255,0.35)", textAlign: "center",
              maxWidth: "800px", margin: "0 auto", lineHeight: 1.6,
            }}>
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>Disclaimer:</strong> CivicLens is an
              informational tool powered by AI. The analysis provided does not constitute legal advice
              and should not be relied upon as a substitute for professional legal counsel. Always
              consult a qualified legal professional before taking action on any legal matter.{" "}
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>Not a substitute for legal advice.</strong>
            </p>

            {/* Developer Credit */}
             <div style={{
              marginTop: "24px", textAlign: "center",
              fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px",
              color: "rgba(255,255,255,0.35)",
            }}>
              Built by{" "}
              <a
                href="https://shamanth-s.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              >
                Shamanth Sheni
              </a>
              {" "}· All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
