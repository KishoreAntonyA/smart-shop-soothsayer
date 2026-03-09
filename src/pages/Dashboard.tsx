import { useMemo } from "react";
import {
  IndianRupee, Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, AlertTriangle, Truck, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { format, startOfDay, subDays, parseISO, isToday, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import StatCard from "@/components/StatCard";
import { formatCurrency } from "@/lib/mockData";
import { useExpenses, useTransactions, useCustomers, useProducts, useDeliveries } from "@/hooks/useBusinessData";

const PIE_COLORS = [
  "hsl(217, 91%, 50%)", "hsl(152, 55%, 45%)", "hsl(38, 92%, 55%)",
  "hsl(199, 89%, 48%)", "hsl(0, 72%, 55%)", "hsl(215, 15%, 50%)",
];

export default function Dashboard() {
  const { data: expenses = [], isLoading: loadingExp } = useExpenses();
  const { data: transactions = [], isLoading: loadingTx } = useTransactions();
  const { data: customers = [], isLoading: loadingCust } = useCustomers();
  const { data: products = [], isLoading: loadingProd } = useProducts();
  const { data: deliveries = [], isLoading: loadingDel } = useDeliveries();

  const isLoading = loadingExp || loadingTx || loadingCust || loadingProd || loadingDel;

  // Today's calculations
  const todayExpenses = useMemo(() => expenses.filter((e) => isToday(parseISO(e.created_at))), [expenses]);
  const todayExpenseTotal = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const todayTransactions = useMemo(() => transactions.filter((t) => isToday(parseISO(t.created_at))), [transactions]);
  const todaySales = todayTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const todayPayments = todayTransactions.filter((t) => t.type === "payment").reduce((s, t) => s + Number(t.amount), 0);
  const todayProfit = todaySales - todayExpenseTotal;

  // Udhar
  const totalUdharGiven = customers.reduce((s, c) => s + Math.max(0, Number(c.balance)), 0);
  const totalUdharReceived = transactions.filter((t) => t.type === "payment").reduce((s, t) => s + Number(t.amount), 0);

  // Stock alerts
  const lowStockItems = products.filter((p) => p.stock < p.min_stock).length;
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length;

  // Weekly profit data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { day: string; sales: number; expenses: number; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dayStr = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE");
      const daySales = transactions
        .filter((t) => t.type === "credit" && format(parseISO(t.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((s, t) => s + Number(t.amount), 0);
      const dayExp = expenses
        .filter((e) => format(parseISO(e.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((s, e) => s + Number(e.amount), 0);
      days.push({ day: label, sales: daySales, expenses: dayExp, profit: daySales - dayExp });
    }
    return days;
  }, [transactions, expenses]);

  // Expense category breakdown (this month)
  const expenseCategoryData = useMemo(() => {
    const now = new Date();
    const monthExp = expenses.filter((e) =>
      isWithinInterval(parseISO(e.created_at), { start: startOfMonth(now), end: endOfMonth(now) })
    );
    const tally: Record<string, number> = {};
    monthExp.forEach((e) => { tally[e.category] = (tally[e.category] || 0) + Number(e.amount); });
    return Object.entries(tally).map(([name, value], i) => ({
      name,
      value,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [expenses]);

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
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Today's business overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Today's Sales" value={formatCurrency(todaySales)} icon={IndianRupee} variant="success" />
        <StatCard title="Today's Expenses" value={formatCurrency(todayExpenseTotal)} icon={Wallet} variant="destructive" />
        <StatCard title="Udhar Given" value={formatCurrency(totalUdharGiven)} icon={ArrowUpRight} variant="warning" />
        <StatCard title="Udhar Received" value={formatCurrency(totalUdharReceived)} icon={ArrowDownLeft} variant="info" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Today's Profit" value={formatCurrency(todayProfit)} icon={TrendingUp} variant="success" />
        <StatCard title="Low Stock Items" value={String(lowStockItems)} icon={AlertTriangle} variant="warning" />
        <StatCard title="Pending Deliveries" value={String(pendingDeliveries)} icon={Truck} variant="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Daily Profit (Last 7 Days)</h3>
          <div className="h-64">
            {weeklyData.some((d) => d.sales > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="profit" fill="hsl(152, 55%, 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Add transactions & expenses to see profit chart
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Expense Breakdown (This Month)</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {expenseCategoryData.length > 0 ? (
              <>
                <div className="h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {expenseCategoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3">
                  {expenseCategoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-56 w-full items-center justify-center text-sm text-muted-foreground">
                Add expenses to see breakdown
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
