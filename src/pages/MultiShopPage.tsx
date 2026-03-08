import { useState } from "react";
import { Plus, Building2, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatCard from "@/components/StatCard";
import { IndianRupee, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface Shop {
  id: string;
  name: string;
  address: string;
  manager: string;
  revenue: number;
  profit: number;
  products: number;
  staff: { name: string; role: string }[];
}

const initialShops: Shop[] = [
  {
    id: "1", name: "Main Store - MG Road", address: "12, MG Road, Sector 5",
    manager: "You (Owner)", revenue: 480000, profit: 130000, products: 45,
    staff: [{ name: "Ramu", role: "Staff" }, { name: "Shyam", role: "Staff" }],
  },
  {
    id: "2", name: "Branch - Gandhi Nagar", address: "78, Gandhi Nagar",
    manager: "Suresh Kumar", revenue: 320000, profit: 85000, products: 32,
    staff: [{ name: "Suresh Kumar", role: "Manager" }, { name: "Mohan", role: "Staff" }],
  },
];

const roleColors = { Owner: "bg-primary/10 text-primary border-primary/20", Manager: "bg-warning/10 text-warning border-warning/20", Staff: "bg-muted text-muted-foreground" };

export default function MultiShopPage() {
  const [shops, setShops] = useState(initialShops);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [manager, setManager] = useState("");

  const totalRevenue = shops.reduce((s, sh) => s + sh.revenue, 0);
  const totalProfit = shops.reduce((s, sh) => s + sh.profit, 0);

  const handleAdd = () => {
    if (!name.trim() || !address.trim()) return;
    setShops([...shops, {
      id: String(Date.now()), name: name.trim(), address: address.trim(),
      manager: manager.trim() || "Unassigned", revenue: 0, profit: 0, products: 0, staff: [],
    }]);
    setName(""); setAddress(""); setManager(""); setDialogOpen(false);
    toast({ title: "Branch added", description: `${name.trim()} has been created.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Multi-Shop Management</h2>
          <p className="text-sm text-muted-foreground">Manage all your branches</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Branch</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Branch</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Branch Name</Label><Input placeholder="e.g. Branch - Station Road" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Address</Label><Input placeholder="e.g. 45, Station Road" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="space-y-2"><Label>Manager</Label><Input placeholder="e.g. Suresh Kumar" value={manager} onChange={(e) => setManager(e.target.value)} /></div>
              <Button className="w-full" onClick={handleAdd} disabled={!name.trim() || !address.trim()}>Add Branch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue (All)" value={formatCurrency(totalRevenue)} icon={IndianRupee} variant="info" />
        <StatCard title="Total Profit (All)" value={formatCurrency(totalProfit)} icon={TrendingUp} variant="success" />
        <StatCard title="Total Branches" value={String(shops.length)} icon={Building2} variant="default" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shops.map((shop) => (
          <div key={shop.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{shop.name}</h3>
                <p className="text-xs text-muted-foreground">{shop.address}</p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{shop.manager}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-sm font-bold text-card-foreground">{formatCurrency(shop.revenue)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="text-sm font-bold text-success">{formatCurrency(shop.profit)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-sm font-bold text-card-foreground">{shop.products}</p>
              </div>
            </div>

            {shop.staff.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Staff</p>
                <div className="flex flex-wrap gap-1.5">
                  {shop.staff.map((s) => (
                    <Badge key={s.name} variant="outline" className={`text-[10px] ${roleColors[s.role as keyof typeof roleColors] || roleColors.Staff}`}>
                      {s.name} ({s.role})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
