import { useState } from "react";
import { Phone, AlertTriangle, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customers, transactions, formatCurrency } from "@/lib/mockData";

const riskColors = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function UdharPage() {
  const [search, setSearch] = useState("");
  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Udhar Management</h2>
          <p className="text-sm text-muted-foreground">Track credit given to customers</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="rounded-xl border border-border bg-card p-5 animate-fade-in"
          >
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
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                Add Credit
              </Button>
              <Button size="sm" className="flex-1 text-xs">
                Record Payment
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const customer = customers.find((c) => c.id === tx.customerId);
            return (
              <div key={tx.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{customer?.name}</p>
                  <p className="text-xs text-muted-foreground">{tx.description} · {tx.date}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "credit" ? "text-destructive" : "text-success"
                  }`}
                >
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
