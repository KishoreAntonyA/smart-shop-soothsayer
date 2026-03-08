import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { products as initialProducts, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("5");

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const handleAdd = () => {
    if (!name.trim() || !Number(price) || !Number(stock)) return;
    setProducts((prev) => [
      ...prev,
      { id: String(Date.now()), name: name.trim(), price: Number(price), stock: Number(stock), minStock: Number(minStock) || 5, sold: 0 },
    ]);
    setName("");
    setPrice("");
    setStock("");
    setMinStock("5");
    setDialogOpen(false);
    toast({ title: "Product added", description: `${name.trim()} added to inventory.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Total value: {formatCurrency(totalValue)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Rice (25kg)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="e.g. 1200" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Qty</Label>
                  <Input type="number" placeholder="e.g. 10" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Min Stock Alert</Label>
                <Input type="number" placeholder="e.g. 5" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={!name.trim() || !Number(price) || !Number(stock)}>
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sold</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isLow = product.stock < product.minStock;
              return (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-card-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-right text-card-foreground">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-right text-card-foreground">{product.stock}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{product.sold}</td>
                  <td className="px-4 py-3 text-right">
                    {isLow ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">In Stock</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
