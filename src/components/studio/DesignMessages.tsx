"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ago, NotificationItem, useNotifications, type StudioNotification } from "@/components/studio/NotificationBell";
import { postJson } from "@/lib/studio/post";
import { useRouter } from "next/navigation";

type Message = { id: string; authorName: string; fromStaff: boolean; body: string; createdAt: string };

/**
 * The conversation about one design between the client and the OLIVED team. `path` is the API path of the
 * design for this side: "/designs/ID" for the client, "/admin/designs/ID" for the OLIVED team.
 */
export function DesignMessages({ path, side, canWrite = true }: { path: string; side: "client" | "staff"; canWrite?: boolean }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/studio${path}/messages`, { cache: "no-store" });
      if (res.ok) setMessages(((await res.json()) as { messages: Message[] }).messages);
    } catch {
      // The next refresh tries again.
    }
  }, [path]);
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, 20_000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [load]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages?.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setError("");
    const result = await postJson<{ message: Message }>(`${path}/messages`, { body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText("");
    setMessages((list) => [...(list ?? []), result.data.message]);
  }

  const mine = (m: Message) => (side === "staff" ? m.fromStaff : !m.fromStaff);
  return (
    <section id="messages" className="studio-thread" aria-label="Messages">
      <div className="studio-thread-head">
        <strong>{side === "staff" ? "Messages with the client" : "Messages with the OLIVED team"}</strong>
        <span>{side === "staff" ? "The client is told in the Studio." : "The OLIVED team is told in the Studio."}</span>
      </div>
      <div className="studio-thread-list">
        {messages === null ? <p className="studio-thread-empty">Loading…</p>
          : messages.length === 0 ? (
            <p className="studio-thread-empty">
              {side === "staff" ? "No messages yet. Ask the client a question or explain a change." : "No messages yet. Ask the OLIVED team anything about this design."}
            </p>
          ) : messages.map((m) => (
            <div key={m.id} className="studio-bubble" data-mine={mine(m)} data-staff={m.fromStaff}>
              <span className="studio-bubble-meta">{m.fromStaff ? `${m.authorName} · OLIVED` : m.authorName} · {ago(m.createdAt)}</span>
              <p>{m.body}</p>
            </div>
          ))}
        <div ref={end} />
      </div>
      {canWrite && (
        <form className="studio-thread-form" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <textarea className="input py-2" rows={2} maxLength={4000} value={text} placeholder="Write a message…" aria-label="Message"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-mid">Ctrl + Enter to send</span>
            <button type="submit" className="studio-cta min-h-10" disabled={busy || !text.trim()}>{busy ? "Sending…" : "Send"}</button>
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </form>
      )}
    </section>
  );
}

/** The full list of the user's notifications, with an unread filter. */
export function NotificationsList() {
  const router = useRouter();
  const { items, unread, markRead } = useNotifications(100);
  const [only, setOnly] = useState<"all" | "unread">("all");
  const shown = (items ?? []).filter((n) => only === "all" || !n.readAt);
  function open(item: StudioNotification) {
    if (!item.readAt) void markRead([item.id]);
    if (item.link) router.push(item.link);
  }
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="studio-segment" aria-label="Show">
          <button type="button" aria-pressed={only === "all"} onClick={() => setOnly("all")}>All</button>
          <button type="button" aria-pressed={only === "unread"} onClick={() => setOnly("unread")}>Unread{unread ? ` (${unread})` : ""}</button>
        </div>
        {unread > 0 && <button type="button" className="btn btn-outline min-h-10" onClick={() => void markRead()}>Mark all as read</button>}
      </div>
      <div className="studio-notes-page">
        {items === null ? <p className="studio-bell-empty">Loading…</p>
          : shown.length === 0 ? <p className="studio-bell-empty">{only === "unread" ? "Everything is read." : "No notifications yet."}</p>
          : shown.map((item) => <NotificationItem key={item.id} item={item} onOpen={open} />)}
      </div>
    </div>
  );
}
