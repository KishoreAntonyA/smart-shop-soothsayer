import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, CalendarIcon, TrendingDown, BarChart3, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/hooks/useBusinessData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const categories = ["Rent", "Electricity", "Transport", "Supplies", "Staff", "Miscellaneous"];
const categoryColors: Record<string, string> = {
  Rent: "bg-primary/10 text-primary", Electricity: "bg-warning/10 text-warning", Transport: "bg-info/10 text-info",
  Supplies: "bg-success/10 text-success", Staff: "bg-destructive/10 text-destructive", Miscellaneous: "bg-muted text-muted-foreground",
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading } = useExpenses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const expensesWithDate = useMemo(() =>
    expenses.map((e) => ({ ...e, date: format(parseISO(e.created_at), "yyyy-MM-dd") })),
    [expenses]
  );

  const todayExpenses = useMemo(() => expensesWithDate.filter((e) => e.date === todayStr), [expensesWithDate, todayStr]);
  const todayTotal = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthlyExpenses = useMemo(
    () => expensesWithDate.filter((e) => isWithinInterval(parseISO(e.created_at), { start: monthStart, end: monthEnd })),
    [expensesWithDate]
  );
  const monthlyTotal = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const monthlyCategoryTally = useMemo(() => {
    const tally: Record<string, number> = {};
    monthlyExpenses.forEach((e) => { tally[e.category] = (tally[e.category] || 0) + Number(e.amount); });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]);
  }, [monthlyExpenses]);

  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearlyExpenses = useMemo(
    () => expensesWithDate.filter((e) => isWithinInterval(parseISO(e.created_at), { start: yearStart, end: yearEnd })),
    [expensesWithDate]
  );
  const yearlyTotal = yearlyExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const yearlyCategoryTally = useMemo(() => {
    const tally: Record<string, number> = {};
    yearlyExpenses.forEach((e) => { tally[e.category] = (tally[e.category] || 0) + Number(e.amount); });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]);
  }, [yearlyExpenses]);

  const resetForm = () => { setCategory(""); setAmount(""); setDescription(""); setSelectedDate(new Date()); };

  const handleAdd = async () => {
    const amt = Number(amount);
    if (!amt || !category || !description.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      category,
      amount: amt,
      description: description.trim(),
      user_id: user.id,
      created_at: selectedDate.toISOString(),
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    resetForm(); setDialogOpen(false);
    toast({ title: "Expense added" });
  };

  const openEdit = (id: string) => {
    const e = expenses.find((e) => e.id === id);
    if (!e) return;
    setEditId(id); setCategory(e.category); setAmount(String(e.amount)); setDescription(e.description || "");
    setEditDate(parseISO(e.created_at));
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    const amt = Number(amount);
    if (!amt || !category || !description.trim() || !editId) return;
    setSaving(true);
    const { error } = await supabase.from("expenses").update({
      category, amount: amt, description: description.trim(), created_at: editDate.toISOString(),
    }).eq("id", editId);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    resetForm(); setEditId(null); setEditDialogOpen(false);
    toast({ title: "Expense updated" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    setDeleteId(null);
    toast({ title: "Expense deleted" });
  };

  const ExpenseForm = ({ onSubmit, submitLabel, date, setDate }: { onSubmit: () => void; submitLabel: string; date: Date; setDate: (d: Date) => void }) => (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
      <div className="space-y-2"><Label>Description</Label><Input placeholder="e.g. Shop rent" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <Button className="w-full" onClick={onSubmit} disabled={!amount || !category || !description.trim() || saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );

  const renderExpenseList = (list: typeof expensesWithDate) => (
    <div className="space-y-3">
      {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No expenses found. Add your first expense above!</p>}
      {list.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${categoryColors[expense.category] || categoryColors.Miscellaneous}`}>{expense.category}</span>
            <div>
              <p className="text-sm font-medium text-card-foreground">{expense.description}</p>
              <p className="text-xs text-muted-foreground">{expense.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-destructive">{formatCurrency(Number(expense.amount))}</p>
            <button onClick={() => openEdit(expense.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => setDeleteId(expense.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCategoryTally = (tally: [string, number][], total: number) => (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-card-foreground">Category Breakdown</h4>
        <span className="text-sm font-bold text-destructive">{formatCurrency(total)}</span>
      </div>
      {tally.length === 0 && <p className="py-2 text-center text-sm text-muted-foreground">No data yet</p>}
      {tally.map(([cat, amt]) => (
        <div key={cat} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${categoryColors[cat] || categoryColors.Miscellaneous}`}>{cat}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-destructive/70" style={{ width: `${total > 0 ? (amt / total) * 100 : 0}%` }} />
            </div>
            <span className="text-sm font-medium text-card-foreground w-20 text-right">{formatCurrency(amt)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground">Track and manage all your expenses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <ExpenseForm onSubmit={handleAdd} submitLabel="Add Expense" date={selectedDate} setDate={setSelectedDate} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { resetForm(); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          <ExpenseForm onSubmit={handleEdit} submitLabel="Save Changes" date={editDate} setDate={setEditDate} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Expense?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2.5"><TrendingDown className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
                <p className="text-xl font-bold text-card-foreground">{formatCurrency(todayTotal)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{format(today, "dd MMM yyyy")}</p>
          </div>
          {renderExpenseList(todayExpenses)}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2.5"><BarChart3 className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-sm text-muted-foreground">This Month's Total</p>
                <p className="text-xl font-bold text-card-foreground">{formatCurrency(monthlyTotal)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{format(today, "MMMM yyyy")}</p>
          </div>
          {renderCategoryTally(monthlyCategoryTally, monthlyTotal)}
          {renderExpenseList(monthlyExpenses)}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2.5"><BarChart3 className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-sm text-muted-foreground">This Year's Total</p>
                <p className="text-xl font-bold text-card-foreground">{formatCurrency(yearlyTotal)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{format(today, "yyyy")}</p>
          </div>
          {renderCategoryTally(yearlyCategoryTally, yearlyTotal)}
          {renderExpenseList(yearlyExpenses)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
