import { useState } from "react";
import { Phone, AlertTriangle, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { customers as initialCustomers, transactions as initialTransactions, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const riskColors = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function UdharPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const [txns, setTxns] = useState(initialTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDesc, setPaymentDesc] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const newCustomer = {
      id: String(Date.now()),
      name: newName.trim(),
      phone: newPhone.trim(),
      balance: 0,
      lastPayment: new Date().toISOString().split("T")[0],
      riskLevel: "low",
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setNewName("");
    setNewPhone("");
    setDialogOpen(false);
    toast({ title: "Customer added", description: `${newCustomer.name} has been added.` });
  };

  const handleAddCredit = () => {
    const amount = Number(creditAmount);
    if (!amount || !selectedCustomerId) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomerId ? { ...c, balance: c.balance + amount } : c))
    );
    setTxns((prev) => [
      { id: String(Date.now()), customerId: selectedCustomerId, type: "credit" as const, amount, date: new Date().toISOString().split("T")[0], description: creditDesc || "Credit sale" },
      ...prev,
    ]);
    setCreditAmount("");
    setCreditDesc("");
    setCreditDialogOpen(false);
    toast({ title: "Credit added", description: `${formatCurrency(amount)} credit recorded.` });
  };

  const handleRecordPayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || !selectedCustomerId) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomerId ? { ...c, balance: c.balance - amount, lastPayment: new Date().toISOString().split("T")[0] } : c))
    );
    setTxns((prev) => [
      { id: String(Date.now()), customerId: selectedCustomerId, type: "payment" as const, amount, date: new Date().toISOString().split("T")[0], description: paymentDesc || "Payment received" },
      ...prev,
    ]);
    setPaymentAmount("");
    setPaymentDesc("");
    setPaymentDialogOpen(false);
    toast({ title: "Payment recorded", description: `${formatCurrency(amount)} payment received.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Udhar Management</h2>
          <p className="text-sm text-muted-foreground">Track credit given to customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input placeholder="e.g. Rajesh Kumar" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="e.g. 9876543210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAddCustomer} disabled={!newName.trim() || !newPhone.trim()}>
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Credit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Credit Sale</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" placeholder="e.g. 5000" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Grocery items" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleAddCredit} disabled={!creditAmount}>Add Credit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" placeholder="e.g. 2000" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Cash payment" value={paymentDesc} onChange={(e) => setPaymentDesc(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleRecordPayment} disabled={!paymentAmount}>Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((customer) => (
          <div key={customer.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{customer.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" /> {customer.phone}
                </p>
              </div>
              <Badge variant="outline" className={riskColors[customer.riskLevel as keyof typeof riskColors]}>
                {customer.riskLevel === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
                {customer.riskLevel}
              </Badge>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Balance Due</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(customer.balance)}</p>
              </div>
              <p className="text-xs text-muted-foreground">Last: {customer.lastPayment}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setSelectedCustomerId(customer.id); setCreditDialogOpen(true); }}>
                Add Credit
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={() => { setSelectedCustomerId(customer.id); setPaymentDialogOpen(true); }}>
                Record Payment
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Recent Transactions</h3>
        <div className="space-y-3">
          {txns.slice(0, 10).map((tx) => {
            const customer = customers.find((c) => c.id === tx.customerId);
            return (
              <div key={tx.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{customer?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{tx.description} · {tx.date}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === "credit" ? "text-destructive" : "text-success"}`}>
                  {tx.type === "credit" ? "-" : "+"}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
