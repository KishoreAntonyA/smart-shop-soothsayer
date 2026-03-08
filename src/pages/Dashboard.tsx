import {
  IndianRupee,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  AlertTriangle,
  Truck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "@/components/StatCard";
import {
  dashboardStats,
  dailyProfitData,
  monthlySalesData,
  expenseCategoryData,
  formatCurrency,
} from "@/lib/mockData";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Today's business overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(dashboardStats.todaySales)}
          icon={IndianRupee}
          trend="+12% from yesterday"
          variant="success"
        />
        <StatCard
          title="Today's Expenses"
          value={formatCurrency(dashboardStats.todayExpenses)}
          icon={Wallet}
          variant="destructive"
        />
        <StatCard
          title="Udhar Given"
          value={formatCurrency(dashboardStats.totalUdharGiven)}
          icon={ArrowUpRight}
          variant="warning"
        />
        <StatCard
          title="Udhar Received"
          value={formatCurrency(dashboardStats.totalUdharReceived)}
          icon={ArrowDownLeft}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          title="Today's Profit"
          value={formatCurrency(dashboardStats.todayProfit)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Low Stock Items"
          value={String(dashboardStats.lowStockItems)}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Pending Deliveries"
          value={String(dashboardStats.pendingDeliveries)}
          icon={Truck}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Profit */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Daily Profit (This Week)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProfitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="profit" fill="hsl(152, 55%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Monthly Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(217, 91%, 50%)"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(217, 91%, 50%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Expense Breakdown</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {expenseCategoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}
