import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { expenses as initialExpenses, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const categories = ["Rent", "Electricity", "Transport", "Supplies", "Staff", "Miscellaneous"];
const categoryColors: Record<string, string> = {
  Rent: "bg-primary/10 text-primary", Electricity: "bg-warning/10 text-warning", Transport: "bg-info/10 text-info",
  Supplies: "bg-success/10 text-success", Staff: "bg-destructive/10 text-destructive", Miscellaneous: "bg-muted text-muted-foreground",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    const amt = Number(amount);
    if (!amt || !category || !description.trim()) return;
    setExpenses((prev) => [{ id: String(Date.now()), category, amount: amt, date: new Date().toISOString().split("T")[0], description: description.trim() }, ...prev]);
    setCategory(""); setAmount(""); setDescription(""); setDialogOpen(false);
    toast({ title: "Expense added" });
  };

  const openEdit = (id: string) => {
    const e = expenses.find((e) => e.id === id);
    if (!e) return;
    setEditId(id); setCategory(e.category); setAmount(String(e.amount)); setDescription(e.description);
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    const amt = Number(amount);
    if (!amt || !category || !description.trim() || !editId) return;
    setExpenses((prev) => prev.map((e) => e.id === editId ? { ...e, category, amount: amt, description: description.trim() } : e));
    setCategory(""); setAmount(""); setDescription(""); setEditId(null); setEditDialogOpen(false);
    toast({ title: "Expense updated" });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setExpenses((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Expense deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground">Total this month: {formatCurrency(total)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setCategory(""); setAmount(""); setDescription(""); } }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Input placeholder="e.g. Shop rent" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <Button className="w-full" onClick={handleAdd} disabled={!amount || !category || !description.trim()}>Add Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { setCategory(""); setAmount(""); setDescription(""); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button className="w-full" onClick={handleEdit} disabled={!amount || !category || !description.trim()}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Expense?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${categoryColors[expense.category] || categoryColors.Miscellaneous}`}>{expense.category}</span>
              <div>
                <p className="text-sm font-medium text-card-foreground">{expense.description}</p>
                <p className="text-xs text-muted-foreground">{expense.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-destructive">{formatCurrency(expense.amount)}</p>
              <button onClick={() => openEdit(expense.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteId(expense.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
