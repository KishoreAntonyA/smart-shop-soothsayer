import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import StatCard from "@/components/StatCard";
import { TrendingUp, Users, Package, IndianRupee, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";

const topProducts = [
  { name: "Soap Bar", sold: 200, revenue: 7000 },
  { name: "Sugar (1kg)", sold: 120, revenue: 5400 },
  { name: "Dal (1kg)", sold: 95, revenue: 13300 },
  { name: "Wheat Flour", sold: 85, revenue: 35700 },
  { name: "Tea (500g)", sold: 62, revenue: 17360 },
];

const monthlyGrowth = [
  { month: "Oct", revenue: 580000, profit: 145000 },
  { month: "Nov", revenue: 610000, profit: 160000 },
  { month: "Dec", revenue: 720000, profit: 195000 },
  { month: "Jan", revenue: 550000, profit: 120000 },
  { month: "Feb", revenue: 640000, profit: 170000 },
  { month: "Mar", revenue: 480000, profit: 130000 },
];

const expensePatterns = [
  { name: "Rent", value: 45000, fill: "hsl(217, 91%, 50%)" },
  { name: "Staff", value: 36000, fill: "hsl(0, 72%, 55%)" },
  { name: "Supplies", value: 25500, fill: "hsl(152, 55%, 45%)" },
  { name: "Electricity", value: 9600, fill: "hsl(38, 92%, 55%)" },
  { name: "Transport", value: 4500, fill: "hsl(199, 89%, 48%)" },
  { name: "Other", value: 2400, fill: "hsl(215, 15%, 50%)" },
];

const topDebtors = [
  { name: "Amit Sharma", balance: 25000 },
  { name: "Vikram Singh", balance: 18000 },
  { name: "Rajesh Kumar", balance: 12500 },
  { name: "Sunita Devi", balance: 8000 },
  { name: "Priya Patel", balance: 3500 },
];

export default function BusinessInsightsPage() {
  const totalExpenses = expensePatterns.reduce((s, e) => s + e.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Business Insights</h2>
        <p className="text-sm text-muted-foreground">AI-powered analytics for your business</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value={formatCurrency(480000)} icon={IndianRupee} trend="+8% from last month" variant="info" />
        <StatCard title="Monthly Profit" value={formatCurrency(130000)} icon={TrendingUp} variant="success" />
        <StatCard title="Total Customers" value="5" icon={Users} variant="default" />
        <StatCard title="Inventory Turnover" value="3.2x" icon={Package} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue & Profit Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Revenue & Profit Trend</h3>
          <div className="h-64">
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
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Quarterly Expense Breakdown</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
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
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Top Selling Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                <Tooltip formatter={(v: number) => v} />
                <Bar dataKey="sold" fill="hsl(217, 91%, 50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Debtors */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Customers with Highest Udhar</h3>
          <div className="space-y-3">
            {topDebtors.map((debtor, idx) => (
              <div key={debtor.name} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                  <span className="text-sm font-medium text-card-foreground">{debtor.name}</span>
                </div>
                <span className="text-sm font-bold text-destructive">{formatCurrency(debtor.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
