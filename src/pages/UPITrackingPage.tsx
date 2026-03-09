import { useState } from "react";
import { Plus, Smartphone, Link2, Copy, CheckCheck, Settings2, QrCode, Download, MessageCircle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatCard from "@/components/StatCard";
import { CheckCircle, Clock } from "lucide-react";
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
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("");
  const [provider, setProvider] = useState("Google Pay");
  const [upiId, setUpiId] = useState("");
  const [savedUpiId, setSavedUpiId] = useState<string | null>(null);
  const [upiProvider, setUpiProvider] = useState("Google Pay");
  const [copied, setCopied] = useState(false);
  const [qrAmount, setQrAmount] = useState("");

  const handleConnectUpi = () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      toast({ title: "Invalid UPI ID", description: "Enter a valid UPI ID (e.g. yourname@upi)", variant: "destructive" });
      return;
    }
    setSavedUpiId(upiId.trim());
    setUpiDialogOpen(false);
    toast({ title: "UPI ID Connected", description: `${upiId.trim()} via ${upiProvider} is now linked.` });
  };

  const handleCopyUpi = () => {
    if (savedUpiId) {
      navigator.clipboard.writeText(savedUpiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    }
  };

  const upiDeepLink = savedUpiId
    ? `upi://pay?pa=${encodeURIComponent(savedUpiId)}&pn=${encodeURIComponent("Shop")}&cu=INR${qrAmount ? `&am=${qrAmount}` : ""}`
    : "";

  const handleDownloadQr = () => {
    const canvas = document.querySelector("#upi-qr-canvas canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `upi-qr-${savedUpiId}.png`;
    a.click();
    toast({ title: "QR code downloaded" });
  };

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

      {/* UPI Connection Card */}
      <div className="rounded-xl border border-border bg-card p-4">
        {savedUpiId ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><Link2 className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Connected UPI ID</p>
                <p className="text-sm font-bold text-card-foreground">{savedUpiId}</p>
                <p className="text-xs text-muted-foreground">via {upiProvider}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setQrDialogOpen(true)} className="gap-1.5">
                <QrCode className="h-3.5 w-3.5" /> Show QR
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyUpi} className="gap-1.5">
                {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setUpiDialogOpen(true)}>
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5"><Smartphone className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">Connect your UPI ID</p>
                <p className="text-xs text-muted-foreground">Link your UPI to receive & track payments</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setUpiDialogOpen(true)} className="gap-1.5">
              <Link2 className="h-4 w-4" /> Connect UPI
            </Button>
          </div>
        )}
      </div>

      {/* Connect UPI Dialog */}
      <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect UPI ID</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Your UPI ID</Label>
              <Input placeholder="e.g. yourshop@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              <p className="text-xs text-muted-foreground">This is the UPI ID where you receive payments</p>
            </div>
            <div className="space-y-2">
              <Label>UPI Provider</Label>
              <Select value={upiProvider} onValueChange={setUpiProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Pay">Google Pay</SelectItem>
                  <SelectItem value="PhonePe">PhonePe</SelectItem>
                  <SelectItem value="Paytm">Paytm</SelectItem>
                  <SelectItem value="BHIM">BHIM</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleConnectUpi} disabled={!upiId.trim()}>
              {savedUpiId ? "Update UPI ID" : "Connect UPI ID"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Payment QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div id="upi-qr-canvas" className="rounded-xl border border-border bg-white p-4">
              <QRCodeCanvas value={upiDeepLink} size={200} level="H" includeMargin />
            </div>
            <p className="text-sm font-semibold text-card-foreground">{savedUpiId}</p>
            <div className="w-full space-y-2">
              <Label>Amount (optional)</Label>
              <Input type="number" placeholder="e.g. 500" value={qrAmount} onChange={(e) => setQrAmount(e.target.value)} />
              <p className="text-xs text-muted-foreground">Set amount to generate a fixed-amount QR</p>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={handleDownloadQr}>
              <Download className="h-4 w-4" /> Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
