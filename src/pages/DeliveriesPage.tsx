import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deliveries as initialDeliveries } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delivered: "bg-success/10 text-success border-success/20",
};
const statusLabels = { pending: "Pending", in_transit: "In Transit", delivered: "Delivered" };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleAdd = () => {
    if (!customer.trim() || !address.trim() || !items.trim()) return;
    setDeliveries((prev) => [
      {
        id: String(Date.now()),
        customer: customer.trim(),
        address: address.trim(),
        items: items.trim(),
        status: "pending" as const,
        assignedTo: assignedTo.trim() || "Unassigned",
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setCustomer("");
    setAddress("");
    setItems("");
    setAssignedTo("");
    setDialogOpen(false);
    toast({ title: "Delivery created", description: `Delivery for ${customer.trim()} added.` });
  };

  const updateStatus = (id: string, status: "pending" | "in_transit" | "delivered") => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Deliveries</h2>
          <p className="text-sm text-muted-foreground">Manage local deliveries</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Delivery</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Delivery</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input placeholder="e.g. Rajesh Kumar" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Input placeholder="e.g. 12, MG Road, Sector 5" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Items</Label>
                <Input placeholder="e.g. Rice, Oil, Sugar" value={items} onChange={(e) => setItems(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Input placeholder="e.g. Ramu" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={!customer.trim() || !address.trim() || !items.trim()}>
                Create Delivery
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {deliveries.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{d.customer}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {d.address}
                </p>
              </div>
              <Badge variant="outline" className={statusStyles[d.status]}>
                {statusLabels[d.status]}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Items: {d.items}</p>
              <p>Assigned: {d.assignedTo} · {d.date}</p>
            </div>
            {d.status !== "delivered" && (
              <div className="mt-3 flex gap-2">
                {d.status === "pending" && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(d.id, "in_transit")}>
                    Mark In Transit
                  </Button>
                )}
                <Button size="sm" className="text-xs" onClick={() => updateStatus(d.id, "delivered")}>
                  Mark Delivered
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
