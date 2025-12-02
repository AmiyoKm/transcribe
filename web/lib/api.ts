export function createWebSocket(token: string): WebSocket {
    const url = `${process.env.NEXT_PUBLIC_API_URL.replace(
        "http",
        "ws"
    )}/ws/transcribe?token=${token}`;
    return new WebSocket(url);
}

export async function fetchLatestSession(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();
    // Assume data is an array of sessions sorted by created_at descending
    return data[0] || null;
}
