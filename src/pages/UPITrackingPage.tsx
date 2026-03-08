import { useState } from "react";
import { Plus, Search, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatCard from "@/components/StatCard";
import { IndianRupee, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface UPIPayment {
  id: string;
  transactionId: string;
  amount: number;
  from: string;
  provider: string;
  status: "confirmed" | "pending" | "failed";
  date: string;
  linkedInvoice?: string;
}

const initialPayments: UPIPayment[] = [
  { id: "1", transactionId: "UPI1234567890", amount: 4470, from: "Rajesh Kumar", provider: "Google Pay", status: "confirmed", date: "2026-03-08", linkedInvoice: "INV-001" },
  { id: "2", transactionId: "UPI0987654321", amount: 2000, from: "Sunita Devi", provider: "PhonePe", status: "confirmed", date: "2026-03-07" },
  { id: "3", transactionId: "UPI1122334455", amount: 5000, from: "Amit Sharma", provider: "Paytm", status: "pending", date: "2026-03-08" },
  { id: "4", transactionId: "UPI5566778899", amount: 1500, from: "Priya Patel", provider: "Google Pay", status: "confirmed", date: "2026-03-06" },
];

const providerIcons: Record<string, string> = { "Google Pay": "🟦", "PhonePe": "🟪", "Paytm": "🟦" };
const statusStyles = { confirmed: "bg-success/10 text-success border-success/20", pending: "bg-warning/10 text-warning border-warning/20", failed: "bg-destructive/10 text-destructive border-destructive/20" };

export default function UPITrackingPage() {
  const [payments, setPayments] = useState(initialPayments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("");
  const [provider, setProvider] = useState("Google Pay");

  const totalReceived = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const handleAdd = () => {
    if (!txnId.trim() || !Number(amount) || !from.trim()) return;
    setPayments([{
      id: String(Date.now()), transactionId: txnId.trim(), amount: Number(amount),
      from: from.trim(), provider, status: "confirmed", date: new Date().toISOString().split("T")[0],
    }, ...payments]);
    setTxnId(""); setAmount(""); setFrom(""); setDialogOpen(false);
    toast({ title: "Payment recorded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">UPI Payment Tracking</h2>
          <p className="text-sm text-muted-foreground">Track all UPI payments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Record Payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record UPI Payment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>UPI Transaction ID</Label><Input placeholder="e.g. UPI1234567890" value={txnId} onChange={(e) => setTxnId(e.target.value)} /></div>
              <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div className="space-y-2"><Label>From (Customer)</Label><Input placeholder="e.g. Rajesh Kumar" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>UPI Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Google Pay">Google Pay</SelectItem><SelectItem value="PhonePe">PhonePe</SelectItem><SelectItem value="Paytm">Paytm</SelectItem></SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={!txnId.trim() || !Number(amount) || !from.trim()}>Record Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Received" value={formatCurrency(totalReceived)} icon={CheckCircle} variant="success" />
        <StatCard title="Pending" value={formatCurrency(pendingAmount)} icon={Clock} variant="warning" />
        <StatCard title="Today's UPI" value={formatCurrency(payments.filter((p) => p.date === new Date().toISOString().split("T")[0]).reduce((s, p) => s + p.amount, 0))} icon={Smartphone} variant="info" />
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-lg">{providerIcons[payment.provider] || "💳"}</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-card-foreground">{payment.from}</p>
                  <Badge variant="outline" className={statusStyles[payment.status]}>{payment.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{payment.provider} · {payment.transactionId} · {payment.date}</p>
                {payment.linkedInvoice && <p className="text-xs text-primary">Linked: {payment.linkedInvoice}</p>}
              </div>
            </div>
            <p className="text-sm font-bold text-success">{formatCurrency(payment.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
