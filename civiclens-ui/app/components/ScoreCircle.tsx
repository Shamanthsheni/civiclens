"use client";

import { useEffect, useState } from "react";

interface Props { score: number; size?: number; }

export default function ScoreCircle({ score, size = 148 }: Props) {
    const [displayed, setDisplayed] = useState(0);
    const [animate, setAnimate] = useState(false);
    const radius = 44;
    const circ = 2 * Math.PI * radius; // ≈ 276.5
    const isGood = score >= 50;
    const color = isGood ? "var(--success)" : "var(--danger)";
    const glowClass = isGood ? "score-glow-success" : "score-glow-danger";
    const targetOffset = circ - (score / 100) * circ;

    useEffect(() => {
        // Small delay so the CSS transition fires after mount
        const t = setTimeout(() => setAnimate(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        let val = 0;
        const step = Math.max(1, Math.ceil(score / 55));
        const iv = setInterval(() => {
            val = Math.min(val + step, score);
            setDisplayed(val);
            if (val >= score) clearInterval(iv);
        }, 18);
        return () => clearInterval(iv);
    }, [score]);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`rounded-full p-1 ${glowClass}`} style={{ borderRadius: "50%" }}>
                <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Score: ${score}/100`}>
                    {/* Track */}
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="#30363d" strokeWidth="8" />
                    {/* Progress */}
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={animate ? targetOffset : circ}
                        transform="rotate(-90 50 50)"
                        style={{
                            transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)",
                            filter: `drop-shadow(0 0 6px ${isGood ? "#3fb950" : "#f85149"})`,
                        }}
                    />
                    {/* Score */}
                    <text x="50" y="45" textAnchor="middle" dominantBaseline="middle"
                        fontSize="22" fontWeight="800" fill={color} fontFamily="DM Sans, sans-serif">
                        {displayed}
                    </text>
                    <text x="50" y="61" textAnchor="middle" fontSize="8"
                        fill="#8b949e" fontFamily="DM Sans, sans-serif">
                        / 100
                    </text>
                </svg>
            </div>
            <span className={`badge ${isGood ? "badge-success" : "badge-danger"}`}>
                {isGood ? "Consistent" : "Inconsistent"}
            </span>
        </div>
    );
}
