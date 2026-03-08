import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products, formatCurrency } from "@/lib/mockData";

export default function InventoryPage() {
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Total value: {formatCurrency(totalValue)}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
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
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        In Stock
                      </Badge>
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
