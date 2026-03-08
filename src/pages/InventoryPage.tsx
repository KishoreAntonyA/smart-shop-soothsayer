import { useState } from "react";
import { Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { products as initialProducts, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("5");

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const resetForm = () => { setName(""); setPrice(""); setStock(""); setMinStock("5"); };

  const handleAdd = () => {
    if (!name.trim() || !Number(price) || !Number(stock)) return;
    setProducts((prev) => [...prev, { id: String(Date.now()), name: name.trim(), price: Number(price), stock: Number(stock), minStock: Number(minStock) || 5, sold: 0 }]);
    resetForm(); setDialogOpen(false);
    toast({ title: "Product added" });
  };

  const openEdit = (id: string) => {
    const p = products.find((p) => p.id === id);
    if (!p) return;
    setEditId(id); setName(p.name); setPrice(String(p.price)); setStock(String(p.stock)); setMinStock(String(p.minStock));
    setEditDialogOpen(true);
  };

  const handleEdit = () => {
    if (!name.trim() || !Number(price) || !editId) return;
    setProducts((prev) => prev.map((p) => p.id === editId ? { ...p, name: name.trim(), price: Number(price), stock: Number(stock), minStock: Number(minStock) || 5 } : p));
    resetForm(); setEditId(null); setEditDialogOpen(false);
    toast({ title: "Product updated" });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Product deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Total value: {formatCurrency(totalValue)}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Product Name</Label><Input placeholder="e.g. Rice (25kg)" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" placeholder="e.g. 1200" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Stock Qty</Label><Input type="number" placeholder="e.g. 10" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Min Stock Alert</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></div>
              <Button className="w-full" onClick={handleAdd} disabled={!name.trim() || !Number(price) || !Number(stock)}>Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { resetForm(); setEditId(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Product Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
              <div className="space-y-2"><Label>Stock Qty</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Min Stock Alert</Label><Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></div>
            <Button className="w-full" onClick={handleEdit} disabled={!name.trim() || !Number(price)}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sold</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
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
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">In Stock</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(product.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(product.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
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
