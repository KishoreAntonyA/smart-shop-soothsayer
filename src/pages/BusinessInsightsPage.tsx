import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import StatCard from "@/components/StatCard";
import { TrendingUp, Users, Package, IndianRupee, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { useExpenses, useTransactions, useCustomers, useProducts } from "@/hooks/useBusinessData";

const PIE_COLORS = [
  "hsl(217, 91%, 50%)", "hsl(0, 72%, 55%)", "hsl(152, 55%, 45%)",
  "hsl(38, 92%, 55%)", "hsl(199, 89%, 48%)", "hsl(215, 15%, 50%)",
];

export default function BusinessInsightsPage() {
  const { data: expenses = [], isLoading: le } = useExpenses();
  const { data: transactions = [], isLoading: lt } = useTransactions();
  const { data: customers = [], isLoading: lc } = useCustomers();
  const { data: products = [], isLoading: lp } = useProducts();
  const isLoading = le || lt || lc || lp;
  const now = new Date();

  // This month
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthlyRevenue = useMemo(() =>
    transactions.filter((t) => t.type === "credit" && isWithinInterval(parseISO(t.created_at), { start: monthStart, end: monthEnd }))
      .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]);
  const monthlyExpenseTotal = useMemo(() =>
    expenses.filter((e) => isWithinInterval(parseISO(e.created_at), { start: monthStart, end: monthEnd }))
      .reduce((s, e) => s + Number(e.amount), 0),
    [expenses]);
  const monthlyProfit = monthlyRevenue - monthlyExpenseTotal;

  // 6-month trend
  const monthlyGrowth = useMemo(() => {
    const data: { month: string; revenue: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = startOfMonth(subMonths(now, i));
      const mEnd = endOfMonth(subMonths(now, i));
      const rev = transactions.filter((t) => t.type === "credit" && isWithinInterval(parseISO(t.created_at), { start: mStart, end: mEnd }))
        .reduce((s, t) => s + Number(t.amount), 0);
      const exp = expenses.filter((e) => isWithinInterval(parseISO(e.created_at), { start: mStart, end: mEnd }))
        .reduce((s, e) => s + Number(e.amount), 0);
      data.push({ month: format(mStart, "MMM"), revenue: rev, profit: rev - exp });
    }
    return data;
  }, [transactions, expenses]);

  // Expense breakdown (all time, grouped)
  const expensePatterns = useMemo(() => {
    const tally: Record<string, number> = {};
    expenses.forEach((e) => { tally[e.category] = (tally[e.category] || 0) + Number(e.amount); });
    return Object.entries(tally).map(([name, value], i) => ({ name, value, fill: PIE_COLORS[i % PIE_COLORS.length] }));
  }, [expenses]);

  // Top selling products
  const topProducts = useMemo(() =>
    [...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p) => ({ name: p.name, sold: p.sold, revenue: p.sold * Number(p.price) })),
    [products]);

  // Top debtors
  const topDebtors = useMemo(() =>
    [...customers].filter((c) => Number(c.balance) > 0).sort((a, b) => Number(b.balance) - Number(a.balance)).slice(0, 5),
    [customers]);

  // Inventory turnover (simplified: total sold / total stock)
  const inventoryTurnover = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const totalSold = products.reduce((s, p) => s + p.sold, 0);
    return totalStock > 0 ? (totalSold / totalStock).toFixed(1) + "x" : "0x";
  }, [products]);

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
        <h2 className="text-2xl font-bold text-foreground">Business Insights</h2>
        <p className="text-sm text-muted-foreground">Analytics based on your real business entries</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={IndianRupee} variant="info" />
        <StatCard title="Monthly Profit" value={formatCurrency(monthlyProfit)} icon={TrendingUp} variant={monthlyProfit >= 0 ? "success" : "destructive"} />
        <StatCard title="Total Customers" value={String(customers.length)} icon={Users} variant="default" />
        <StatCard title="Inventory Turnover" value={inventoryTurnover} icon={Package} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue & Profit Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Revenue & Profit Trend (6 Months)</h3>
          <div className="h-64">
            {monthlyGrowth.some((d) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(152, 55%, 45%)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Add transactions to see trends</div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Expense Breakdown</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {expensePatterns.length > 0 ? (
              <>
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensePatterns} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                        {expensePatterns.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expensePatterns.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 w-full items-center justify-center text-sm text-muted-foreground">Add expenses to see breakdown</div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Top Selling Products</h3>
          <div className="h-64">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                  <Tooltip formatter={(v: number) => v} />
                  <Bar dataKey="sold" fill="hsl(217, 91%, 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Add products to see top sellers</div>
            )}
          </div>
        </div>

        {/* Top Debtors */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Customers with Highest Udhar</h3>
          <div className="space-y-3">
            {topDebtors.length > 0 ? topDebtors.map((debtor, idx) => (
              <div key={debtor.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                  <span className="text-sm font-medium text-card-foreground">{debtor.name}</span>
                </div>
                <span className="text-sm font-bold text-destructive">{formatCurrency(Number(debtor.balance))}</span>
              </div>
            )) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No udhar entries yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
