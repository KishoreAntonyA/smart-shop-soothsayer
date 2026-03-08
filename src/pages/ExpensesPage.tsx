import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { expenses, formatCurrency } from "@/lib/mockData";

const categoryColors: Record<string, string> = {
  Rent: "bg-primary/10 text-primary",
  Electricity: "bg-warning/10 text-warning",
  Transport: "bg-info/10 text-info",
  Supplies: "bg-success/10 text-success",
  Staff: "bg-destructive/10 text-destructive",
  Miscellaneous: "bg-muted text-muted-foreground",
};

export default function ExpensesPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground">Total this month: {formatCurrency(total)}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in"
          >
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
