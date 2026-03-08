// Mock data for Smart Business Manager

export const dashboardStats = {
  todaySales: 24500,
  todayExpenses: 8200,
  totalUdharGiven: 156000,
  totalUdharReceived: 42000,
  todayProfit: 16300,
  lowStockItems: 5,
  pendingDeliveries: 3,
};

export const customers = [
  { id: "1", name: "Rajesh Kumar", phone: "9876543210", balance: 12500, lastPayment: "2026-03-01", riskLevel: "low" },
  { id: "2", name: "Sunita Devi", phone: "9876543211", balance: 8000, lastPayment: "2026-02-15", riskLevel: "medium" },
  { id: "3", name: "Amit Sharma", phone: "9876543212", balance: 25000, lastPayment: "2026-01-20", riskLevel: "high" },
  { id: "4", name: "Priya Patel", phone: "9876543213", balance: 3500, lastPayment: "2026-03-05", riskLevel: "low" },
  { id: "5", name: "Vikram Singh", phone: "9876543214", balance: 18000, lastPayment: "2026-02-01", riskLevel: "high" },
];

export const transactions = [
  { id: "1", customerId: "1", type: "credit" as const, amount: 5000, date: "2026-03-08", description: "Grocery items" },
  { id: "2", customerId: "1", type: "payment" as const, amount: 2000, date: "2026-03-07", description: "Cash payment" },
  { id: "3", customerId: "3", type: "credit" as const, amount: 8000, date: "2026-03-06", description: "Monthly supplies" },
  { id: "4", customerId: "2", type: "payment" as const, amount: 3000, date: "2026-03-05", description: "UPI payment" },
  { id: "5", customerId: "5", type: "credit" as const, amount: 4500, date: "2026-03-04", description: "Electronics" },
];

export const expenses = [
  { id: "1", category: "Rent", amount: 15000, date: "2026-03-01", description: "Shop rent" },
  { id: "2", category: "Electricity", amount: 3200, date: "2026-03-03", description: "March bill" },
  { id: "3", category: "Transport", amount: 1500, date: "2026-03-05", description: "Delivery van fuel" },
  { id: "4", category: "Supplies", amount: 8500, date: "2026-03-07", description: "Stock purchase" },
  { id: "5", category: "Staff", amount: 12000, date: "2026-03-01", description: "Helper salary" },
  { id: "6", category: "Miscellaneous", amount: 800, date: "2026-03-08", description: "Packaging material" },
];

export const products = [
  { id: "1", name: "Rice (25kg)", price: 1200, stock: 8, minStock: 5, sold: 45 },
  { id: "2", name: "Sugar (1kg)", price: 45, stock: 3, minStock: 10, sold: 120 },
  { id: "3", name: "Cooking Oil (5L)", price: 650, stock: 12, minStock: 5, sold: 38 },
  { id: "4", name: "Wheat Flour (10kg)", price: 420, stock: 2, minStock: 8, sold: 85 },
  { id: "5", name: "Tea (500g)", price: 280, stock: 15, minStock: 5, sold: 62 },
  { id: "6", name: "Soap Bar", price: 35, stock: 50, minStock: 20, sold: 200 },
  { id: "7", name: "Milk Powder (1kg)", price: 380, stock: 1, minStock: 5, sold: 28 },
  { id: "8", name: "Dal (1kg)", price: 140, stock: 20, minStock: 10, sold: 95 },
];

export const deliveries = [
  { id: "1", customer: "Rajesh Kumar", address: "12, MG Road, Sector 5", items: "Rice, Oil, Sugar", status: "pending" as const, assignedTo: "Ramu", date: "2026-03-08" },
  { id: "2", customer: "Sunita Devi", address: "45, Gandhi Nagar", items: "Flour, Tea, Soap", status: "in_transit" as const, assignedTo: "Shyam", date: "2026-03-08" },
  { id: "3", customer: "Amit Sharma", address: "78, Nehru Colony", items: "Monthly supplies", status: "delivered" as const, assignedTo: "Ramu", date: "2026-03-07" },
  { id: "4", customer: "Vikram Singh", address: "23, Station Road", items: "Dal, Rice, Oil", status: "pending" as const, assignedTo: "Shyam", date: "2026-03-08" },
];

export const dailyProfitData = [
  { day: "Mon", sales: 22000, expenses: 7500, profit: 14500 },
  { day: "Tue", sales: 18000, expenses: 6000, profit: 12000 },
  { day: "Wed", sales: 28000, expenses: 9000, profit: 19000 },
  { day: "Thu", sales: 21000, expenses: 8500, profit: 12500 },
  { day: "Fri", sales: 32000, expenses: 10000, profit: 22000 },
  { day: "Sat", sales: 35000, expenses: 11000, profit: 24000 },
  { day: "Sun", sales: 24500, expenses: 8200, profit: 16300 },
];

export const monthlySalesData = [
  { month: "Sep", sales: 520000 },
  { month: "Oct", sales: 580000 },
  { month: "Nov", sales: 610000 },
  { month: "Dec", sales: 720000 },
  { month: "Jan", sales: 550000 },
  { month: "Feb", sales: 640000 },
  { month: "Mar", sales: 480000 },
];

export const expenseCategoryData = [
  { name: "Rent", value: 15000, fill: "hsl(217, 91%, 50%)" },
  { name: "Electricity", value: 3200, fill: "hsl(152, 55%, 45%)" },
  { name: "Transport", value: 1500, fill: "hsl(38, 92%, 55%)" },
  { name: "Supplies", value: 8500, fill: "hsl(199, 89%, 48%)" },
  { name: "Staff", value: 12000, fill: "hsl(0, 72%, 55%)" },
  { name: "Other", value: 800, fill: "hsl(215, 15%, 50%)" },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
