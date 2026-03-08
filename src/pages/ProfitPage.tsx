import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/StatCard";
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { dailyProfitData, formatCurrency } from "@/lib/mockData";

export default function ProfitPage() {
  const totalSales = dailyProfitData.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = dailyProfitData.reduce((s, d) => s + d.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profit Dashboard</h2>
        <p className="text-sm text-muted-foreground">Weekly performance overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} icon={IndianRupee} variant="info" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} variant="destructive" />
        <StatCard title="Net Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} variant="success" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Sales vs Expenses</h3>
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
    </div>
  );
}
