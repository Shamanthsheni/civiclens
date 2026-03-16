"use client";

import { useRef, useState, DragEvent } from "react";

interface UploadBoxProps {
    label: string;
    description: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    id: string;
}

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const fmt = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 ** 2)).toFixed(1)} MB`;

export default function UploadBox({ label, description, file, onFileChange, id }: UploadBoxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (f: File | null) => {
        if (!f) return;
        if (!ACCEPTED.includes(f.type)) {
            alert("Please upload a PDF or image file (JPG or PNG).");
            return;
        }
        onFileChange(f);
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0] ?? null);
    };

    return (
        <div
            className={`upload-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label={`Upload ${label}`}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
                <div className="flex flex-col items-center gap-2 text-center">
                    <span style={{ fontSize: "2rem", color: "var(--success)" }}>✓</span>
                    <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--success)" }}>
                            {file.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{fmt(file.size)}</p>
                    </div>
                    <button
                        className="text-xs px-3 py-1 rounded border mt-1 hover:bg-gray-100 transition-colors"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "#fff" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onFileChange(null);
                            if (inputRef.current) inputRef.current.value = "";
                        }}
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                    <span style={{ fontSize: "2.2rem", color: "var(--text-muted)" }}>📄</span>
                    <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{label}</p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--border-dark)" }}>
                        PDF · JPG · PNG — click or drag to upload
                    </p>
                </div>
            )}
        </div>
    );
}
