import { useState } from "react";
import { Bell, AlertTriangle, CreditCard, Package, FileText, TrendingDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "low_stock" | "overdue" | "high_expense" | "unpaid_invoice" | "summary";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "low_stock", title: "Low Stock: Milk Powder (1kg)", description: "Only 1 unit left. Minimum stock level is 5.", time: "2 min ago", read: false },
  { id: "2", type: "overdue", title: "Overdue Payment: Amit Sharma", description: "₹25,000 outstanding for 47 days. Last payment on Jan 20.", time: "15 min ago", read: false },
  { id: "3", type: "low_stock", title: "Low Stock: Wheat Flour (10kg)", description: "Only 2 units left. Minimum stock level is 8.", time: "1 hr ago", read: false },
  { id: "4", type: "high_expense", title: "High Expense Alert", description: "Today's expenses (₹8,200) are 15% higher than your weekly average.", time: "2 hr ago", read: true },
  { id: "5", type: "unpaid_invoice", title: "Unpaid Invoice: INV-002", description: "Invoice for Amit Sharma (₹2,205) is pending for 1 day.", time: "3 hr ago", read: true },
  { id: "6", type: "overdue", title: "Overdue Payment: Vikram Singh", description: "₹18,000 outstanding for 35 days.", time: "5 hr ago", read: true },
  { id: "7", type: "summary", title: "Daily Business Summary", description: "Sales: ₹24,500 | Expenses: ₹8,200 | Profit: ₹16,300 | 3 pending deliveries", time: "Yesterday", read: true },
  { id: "8", type: "low_stock", title: "Low Stock: Sugar (1kg)", description: "Only 3 units left. Minimum stock level is 10.", time: "Yesterday", read: true },
];

const typeConfig = {
  low_stock: { icon: Package, color: "text-warning", bg: "bg-warning/10" },
  overdue: { icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" },
  high_expense: { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
  unpaid_invoice: { icon: FileText, color: "text-info", bg: "bg-info/10" },
  summary: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <Check className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <div
              key={notification.id}
              className={`flex items-start gap-3 rounded-xl border p-4 animate-fade-in transition-colors cursor-pointer ${
                notification.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
              }`}
              onClick={() => markRead(notification.id)}
            >
              <div className={`rounded-lg p-2.5 ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${notification.read ? "text-card-foreground" : "text-foreground"}`}>{notification.title}</p>
                  {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{notification.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
