"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/studio/post";

export type StudioNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

const POLL_MS = 30_000;
const ICON: Record<string, string> = { "design.submitted": "◧", "design.approved": "✓", "design.changes": "!", "design.message": "✉" };
const TONE: Record<string, string> = { "design.submitted": "review", "design.approved": "approved", "design.changes": "changes", "design.message": "message" };

/** "3 min ago", "yesterday", or the date. */
export function ago(value: string) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 172800) return "yesterday";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Loads the signed-in user's notifications and keeps them fresh. */
export function useNotifications(take = 15) {
  const [items, setItems] = useState<StudioNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/studio/notifications?take=${take}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: StudioNotification[]; unread: number };
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      // Offline for a moment: the next poll tries again.
    }
  }, [take]);
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, POLL_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => { clearTimeout(first); clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [load]);
  const markRead = useCallback(async (ids?: string[]) => {
    setItems((list) => list?.map((n) => (!ids || ids.includes(n.id) ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)) ?? null);
    setUnread((count) => (ids ? Math.max(0, count - ids.length) : 0));
    await postJson("/notifications/read", ids ? { ids } : {});
    void load();
  }, [load]);
  return { items, unread, markRead, reload: load };
}

/** One notification row: icon by kind, title, message, time; unread ones marked. */
export function NotificationItem({ item, onOpen }: { item: StudioNotification; onOpen: (item: StudioNotification) => void }) {
  return (
    <button type="button" className="studio-note" data-unread={!item.readAt} data-tone={TONE[item.type] ?? "message"} onClick={() => onOpen(item)}>
      <span className="studio-note-icon" aria-hidden="true">{ICON[item.type] ?? "•"}</span>
      <span className="studio-note-text">
        <span className="studio-note-title">{item.title}</span>
        {item.body && <span className="studio-note-body">{item.body}</span>}
        <span className="studio-note-time">{ago(item.createdAt)}</span>
      </span>
      {!item.readAt && <span className="studio-note-dot" aria-label="Unread" />}
    </button>
  );
}

/** The bell in the top bar: the unread count, and the latest notifications in a panel. */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { items, unread, markRead } = useNotifications();

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", close); };
  }, [open]);

  function openItem(item: StudioNotification) {
    if (!item.readAt) void markRead([item.id]);
    setOpen(false);
    if (item.link) router.push(item.link);
  }

  return (
    <div className="studio-bell-wrap" ref={box}>
      <button type="button" className="studio-bell" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" /></svg>
        {unread > 0 && <span className="studio-bell-count">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="studio-bell-panel" role="dialog" aria-label="Notifications">
          <div className="studio-bell-head">
            <strong>Notifications</strong>
            {unread > 0 && <button type="button" onClick={() => void markRead()}>Mark all as read</button>}
          </div>
          <div className="studio-bell-list">
            {items === null ? <p className="studio-bell-empty">Loading…</p>
              : items.length === 0 ? <p className="studio-bell-empty">Nothing yet. You will see new designs, decisions and messages here.</p>
              : items.map((item) => <NotificationItem key={item.id} item={item} onOpen={openItem} />)}
          </div>
          <Link href="/studio/notifications" className="studio-bell-all" onClick={() => setOpen(false)}>See all notifications →</Link>
        </div>
      )}
    </div>
  );
}
