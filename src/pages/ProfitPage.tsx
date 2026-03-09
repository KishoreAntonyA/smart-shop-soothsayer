import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import StatCard from "@/components/StatCard";
import { TrendingUp, TrendingDown, IndianRupee, BarChart3 } from "lucide-react";
import { dailyProfitData, expenses as mockExpenses, formatCurrency } from "@/lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfitPage() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Weekly data (existing mock)
  const totalSales = dailyProfitData.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = dailyProfitData.reduce((s, d) => s + d.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  // Today
  const todayData = dailyProfitData.find((d) => d.day === format(today, "EEE")) || { sales: 0, expenses: 0, profit: 0 };

  // Monthly tally from mock expenses
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthlyExpenses = useMemo(
    () => mockExpenses.filter((e) => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })),
    []
  );
  const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlySalesEstimate = monthlyExpenseTotal * 2.5; // estimate from weekly ratio
  const monthlyProfit = monthlySalesEstimate - monthlyExpenseTotal;

  // Yearly tally
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const yearlyExpenses = useMemo(
    () => mockExpenses.filter((e) => isWithinInterval(parseISO(e.date), { start: yearStart, end: yearEnd })),
    []
  );
  const yearlyExpenseTotal = yearlyExpenses.reduce((s, e) => s + e.amount, 0);
  const yearlySalesEstimate = yearlyExpenseTotal * 2.5;
  const yearlyProfit = yearlySalesEstimate - yearlyExpenseTotal;

  // Monthly breakdown for yearly view
  const monthlyBreakdown = useMemo(() => {
    const months: Record<string, { sales: number; expenses: number; profit: number }> = {};
    yearlyExpenses.forEach((e) => {
      const m = format(parseISO(e.date), "MMM");
      if (!months[m]) months[m] = { sales: 0, expenses: 0, profit: 0 };
      months[m].expenses += e.amount;
      months[m].sales += e.amount * 2.5;
      months[m].profit += e.amount * 1.5;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [yearlyExpenses]);

  const SummaryCards = ({ sales, expenses, profit }: { sales: number; expenses: number; profit: number }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard title="Total Sales" value={formatCurrency(sales)} icon={IndianRupee} variant="info" />
      <StatCard title="Total Expenses" value={formatCurrency(expenses)} icon={TrendingDown} variant="destructive" />
      <StatCard title="Net Profit" value={formatCurrency(profit)} icon={TrendingUp} variant="success" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profit Dashboard</h2>
        <p className="text-sm text-muted-foreground">Track your profits — today, monthly & yearly</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        {/* Today */}
        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Profit</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(todayData.profit)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{format(today, "dd MMM yyyy")}</p>
          </div>
          <SummaryCards sales={todayData.sales} expenses={todayData.expenses} profit={todayData.profit} />
        </TabsContent>

        {/* Weekly */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          <SummaryCards sales={totalSales} expenses={totalExpenses} profit={totalProfit} />
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-base font-semibold text-card-foreground">Sales vs Expenses (This Week)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="sales" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Monthly */}
        <TabsContent value="monthly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><BarChart3 className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Profit — {format(today, "MMMM yyyy")}</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(monthlyProfit)}</p>
              </div>
            </div>
          </div>
          <SummaryCards sales={monthlySalesEstimate} expenses={monthlyExpenseTotal} profit={monthlyProfit} />
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-card-foreground">Expense Breakdown</h4>
            {monthlyExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{e.category} · {e.date}</p>
                </div>
                <span className="text-sm font-bold text-destructive">{formatCurrency(e.amount)}</span>
              </div>
            ))}
            {monthlyExpenses.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No expenses this month</p>}
          </div>
        </TabsContent>

        {/* Yearly */}
        <TabsContent value="yearly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><BarChart3 className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Yearly Profit — {format(today, "yyyy")}</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(yearlyProfit)}</p>
              </div>
            </div>
          </div>
          <SummaryCards sales={yearlySalesEstimate} expenses={yearlyExpenseTotal} profit={yearlyProfit} />
          {monthlyBreakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-base font-semibold text-card-foreground">Monthly Breakdown</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="sales" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="hsl(152, 55%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
