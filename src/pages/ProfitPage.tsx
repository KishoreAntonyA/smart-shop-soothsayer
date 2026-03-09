import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO, isToday, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import StatCard from "@/components/StatCard";
import { TrendingUp, TrendingDown, IndianRupee, BarChart3, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses, useTransactions } from "@/hooks/useBusinessData";

export default function ProfitPage() {
  const { data: expenses = [], isLoading: loadingExp } = useExpenses();
  const { data: transactions = [], isLoading: loadingTx } = useTransactions();
  const isLoading = loadingExp || loadingTx;
  const today = new Date();

  // Helper: get sales & expenses for a date range
  const calcRange = (start: Date, end: Date) => {
    const rangeExp = expenses.filter((e) => isWithinInterval(parseISO(e.created_at), { start, end }));
    const rangeTx = transactions.filter((t) => isWithinInterval(parseISO(t.created_at), { start, end }));
    const sales = rangeTx.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
    const expTotal = rangeExp.reduce((s, e) => s + Number(e.amount), 0);
    return { sales, expenses: expTotal, profit: sales - expTotal, expenseList: rangeExp };
  };

  // Today
  const todayData = useMemo(() => {
    const todayExp = expenses.filter((e) => isToday(parseISO(e.created_at)));
    const todayTx = transactions.filter((t) => isToday(parseISO(t.created_at)));
    const sales = todayTx.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
    const expTotal = todayExp.reduce((s, e) => s + Number(e.amount), 0);
    return { sales, expenses: expTotal, profit: sales - expTotal };
  }, [expenses, transactions]);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const days: { day: string; sales: number; expenses: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dayStr = format(d, "yyyy-MM-dd");
      const daySales = transactions
        .filter((t) => t.type === "credit" && format(parseISO(t.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((s, t) => s + Number(t.amount), 0);
      const dayExp = expenses
        .filter((e) => format(parseISO(e.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((s, e) => s + Number(e.amount), 0);
      days.push({ day: format(d, "EEE"), sales: daySales, expenses: dayExp });
    }
    return days;
  }, [transactions, expenses]);

  const weeklyTotals = useMemo(() => {
    const s = weeklyData.reduce((a, d) => a + d.sales, 0);
    const e = weeklyData.reduce((a, d) => a + d.expenses, 0);
    return { sales: s, expenses: e, profit: s - e };
  }, [weeklyData]);

  // Monthly
  const monthlyData = useMemo(() => calcRange(startOfMonth(today), endOfMonth(today)), [expenses, transactions]);

  // Yearly
  const yearlyData = useMemo(() => calcRange(startOfYear(today), endOfYear(today)), [expenses, transactions]);

  // Monthly breakdown for yearly chart
  const monthlyBreakdown = useMemo(() => {
    const months: Record<string, { sales: number; expenses: number; profit: number }> = {};
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const yearExp = expenses.filter((e) => isWithinInterval(parseISO(e.created_at), { start: yearStart, end: yearEnd }));
    const yearTx = transactions.filter((t) => isWithinInterval(parseISO(t.created_at), { start: yearStart, end: yearEnd }));

    yearExp.forEach((e) => {
      const m = format(parseISO(e.created_at), "MMM");
      if (!months[m]) months[m] = { sales: 0, expenses: 0, profit: 0 };
      months[m].expenses += Number(e.amount);
    });
    yearTx.filter((t) => t.type === "credit").forEach((t) => {
      const m = format(parseISO(t.created_at), "MMM");
      if (!months[m]) months[m] = { sales: 0, expenses: 0, profit: 0 };
      months[m].sales += Number(t.amount);
    });
    Object.values(months).forEach((v) => { v.profit = v.sales - v.expenses; });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [expenses, transactions]);

  const SummaryCards = ({ sales, expenses, profit }: { sales: number; expenses: number; profit: number }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard title="Total Sales" value={formatCurrency(sales)} icon={IndianRupee} variant="info" />
      <StatCard title="Total Expenses" value={formatCurrency(expenses)} icon={TrendingDown} variant="destructive" />
      <StatCard title="Net Profit" value={formatCurrency(profit)} icon={TrendingUp} variant={profit >= 0 ? "success" : "destructive"} />
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
          {todayData.sales === 0 && todayData.expenses === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">No entries today. Add transactions & expenses to see profit.</p>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <SummaryCards sales={weeklyTotals.sales} expenses={weeklyTotals.expenses} profit={weeklyTotals.profit} />
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-base font-semibold text-card-foreground">Sales vs Expenses (Last 7 Days)</h3>
            <div className="h-72">
              {weeklyData.some((d) => d.sales > 0 || d.expenses > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="sales" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Add data to see chart</div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><BarChart3 className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Profit — {format(today, "MMMM yyyy")}</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(monthlyData.profit)}</p>
              </div>
            </div>
          </div>
          <SummaryCards sales={monthlyData.sales} expenses={monthlyData.expenses} profit={monthlyData.profit} />
          {monthlyData.expenseList.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-sm font-semibold text-card-foreground">This Month's Expenses</h4>
              {monthlyData.expenseList.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.category} · {format(parseISO(e.created_at), "dd MMM")}</p>
                  </div>
                  <span className="text-sm font-bold text-destructive">{formatCurrency(Number(e.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5"><BarChart3 className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Yearly Profit — {format(today, "yyyy")}</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(yearlyData.profit)}</p>
              </div>
            </div>
          </div>
          <SummaryCards sales={yearlyData.sales} expenses={yearlyData.expenses} profit={yearlyData.profit} />
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
