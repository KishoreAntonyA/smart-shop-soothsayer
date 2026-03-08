import { useState } from "react";
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deliveries as initialDeliveries } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const statusStyles = { pending: "bg-warning/10 text-warning border-warning/20", in_transit: "bg-info/10 text-info border-info/20", delivered: "bg-success/10 text-success border-success/20" };
const statusLabels = { pending: "Pending", in_transit: "In Transit", delivered: "Delivered" };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const resetForm = () => { setCustomer(""); setAddress(""); setItems(""); setAssignedTo(""); };

  const handleAdd = () => {
    if (!customer.trim() || !address.trim() || !items.trim()) return;
    setDeliveries((prev) => [{ id: String(Date.now()), customer: customer.trim(), address: address.trim(), items: items.trim(), status: "pending" as const, assignedTo: assignedTo.trim() || "Unassigned", date: new Date().toISOString().split("T")[0] }, ...prev]);
    resetForm(); setDialogOpen(false);
    toast({ title: "Delivery created" });
  };

  const openEdit = (id: string) => {
    const d = deliveries.find((d) => d.id === id);
    if (!d) return;
    setEditId(id); setCustomer(d.customer); setAddress(d.address); setItems(d.items); setAssignedTo(d.assignedTo);
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!customer.trim() || !address.trim() || !items.trim() || !editId) return;
    setDeliveries((prev) => prev.map((d) => d.id === editId ? { ...d, customer: customer.trim(), address: address.trim(), items: items.trim(), assignedTo: assignedTo.trim() || "Unassigned" } : d));
    resetForm(); setEditId(null); setEditDialogOpen(false);
    toast({ title: "Delivery updated" });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setDeliveries((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Delivery deleted" });
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
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Delivery</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Delivery</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Customer Name</Label><Input placeholder="e.g. Rajesh Kumar" value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
              <div className="space-y-2"><Label>Delivery Address</Label><Input placeholder="e.g. 12, MG Road" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="space-y-2"><Label>Items</Label><Input placeholder="e.g. Rice, Oil, Sugar" value={items} onChange={(e) => setItems(e.target.value)} /></div>
              <div className="space-y-2"><Label>Assign To</Label><Input placeholder="e.g. Ramu" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} /></div>
              <Button className="w-full" onClick={handleAdd} disabled={!customer.trim() || !address.trim() || !items.trim()}>Create Delivery</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { resetForm(); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Delivery</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Customer Name</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
            <div className="space-y-2"><Label>Delivery Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label>Items</Label><Input value={items} onChange={(e) => setItems(e.target.value)} /></div>
            <div className="space-y-2"><Label>Assign To</Label><Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} /></div>
            <Button className="w-full" onClick={handleEdit} disabled={!customer.trim() || !address.trim() || !items.trim()}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Delivery?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 sm:grid-cols-2">
        {deliveries.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{d.customer}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {d.address}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className={statusStyles[d.status]}>{statusLabels[d.status]}</Badge>
                <button onClick={() => openEdit(d.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDeleteId(d.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Items: {d.items}</p>
              <p>Assigned: {d.assignedTo} · {d.date}</p>
            </div>
            {d.status !== "delivered" && (
              <div className="mt-3 flex gap-2">
                {d.status === "pending" && <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(d.id, "in_transit")}>Mark In Transit</Button>}
                <Button size="sm" className="text-xs" onClick={() => updateStatus(d.id, "delivered")}>Mark Delivered</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
