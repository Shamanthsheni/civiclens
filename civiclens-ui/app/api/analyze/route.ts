import { NextRequest, NextResponse } from "next/server";

const FLASK_URL = process.env.FLASK_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const response = await fetch(`${FLASK_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const err = await response.text();
            return NextResponse.json(
                { error: `Backend error (${response.status}): ${err}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/analyze]", message);
        return NextResponse.json(
            { error: "Could not reach the CivicLens backend. Make sure Flask is running on port 5000." },
            { status: 502 }
        );
    }
}
