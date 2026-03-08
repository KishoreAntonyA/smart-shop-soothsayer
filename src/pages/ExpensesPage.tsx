import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { expenses as initialExpenses, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const categories = ["Rent", "Electricity", "Transport", "Supplies", "Staff", "Miscellaneous"];

const categoryColors: Record<string, string> = {
  Rent: "bg-primary/10 text-primary",
  Electricity: "bg-warning/10 text-warning",
  Transport: "bg-info/10 text-info",
  Supplies: "bg-success/10 text-success",
  Staff: "bg-destructive/10 text-destructive",
  Miscellaneous: "bg-muted text-muted-foreground",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    const amt = Number(amount);
    if (!amt || !category || !description.trim()) return;
    setExpenses((prev) => [
      { id: String(Date.now()), category, amount: amt, date: new Date().toISOString().split("T")[0], description: description.trim() },
      ...prev,
    ]);
    setCategory("");
    setAmount("");
    setDescription("");
    setDialogOpen(false);
    toast({ title: "Expense added", description: `${formatCurrency(amt)} in ${category}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground">Total this month: {formatCurrency(total)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="e.g. Shop rent payment" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={!amount || !category || !description.trim()}>
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${categoryColors[expense.category] || categoryColors.Miscellaneous}`}>
                {expense.category}
              </span>
              <div>
                <p className="text-sm font-medium text-card-foreground">{expense.description}</p>
                <p className="text-xs text-muted-foreground">{expense.date}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-destructive">{formatCurrency(expense.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
