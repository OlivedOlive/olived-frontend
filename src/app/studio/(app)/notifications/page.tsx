import type { Metadata } from "next";
import { NotificationsList } from "@/components/studio/DesignMessages";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <div>
        <p className="ws-section-title">OLIVED Studio</p>
        <h1 className="text-5xl">Notifications</h1>
        <p className="mt-1 text-sm text-mid">New designs, decisions and messages. Click one to open it.</p>
      </div>
      <NotificationsList />
    </div>
  );
}
