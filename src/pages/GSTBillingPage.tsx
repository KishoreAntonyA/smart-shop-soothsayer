import { useState } from "react";
import { Plus, FileText, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  gstRate: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  customer: string;
  gstNo: string;
  items: InvoiceItem[];
  gstType: "intra" | "inter";
  date: string;
  total: number;
  gstAmount: number;
}

const initialInvoices: Invoice[] = [
  {
    id: "1", invoiceNo: "INV-001", customer: "Rajesh Kumar", gstNo: "27AABCU9603R1ZM",
    items: [{ name: "Rice (25kg)", qty: 2, price: 1200, gstRate: 5 }, { name: "Cooking Oil (5L)", qty: 3, price: 650, gstRate: 12 }],
    gstType: "intra", date: "2026-03-08", total: 4470, gstAmount: 354,
  },
  {
    id: "2", invoiceNo: "INV-002", customer: "Amit Sharma", gstNo: "07AAACN0834R1ZK",
    items: [{ name: "Wheat Flour (10kg)", qty: 5, price: 420, gstRate: 5 }],
    gstType: "inter", date: "2026-03-07", total: 2205, gstAmount: 105,
  },
];

export default function GSTBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [gstType, setGstType] = useState<"intra" | "inter">("intra");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, price: 0, gstRate: 5 }]);

  const totalTaxable = invoices.reduce((s, i) => s + (i.total - i.gstAmount), 0);
  const totalGST = invoices.reduce((s, i) => s + i.gstAmount, 0);

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0, gstRate: 5 }]);

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const calcTotal = () => {
    let subtotal = 0, gst = 0;
    items.forEach((item) => {
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;
      gst += lineTotal * (item.gstRate / 100);
    });
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleCreate = () => {
    if (!customer.trim() || items.some((i) => !i.name.trim() || !i.price)) return;
    const { gst, total } = calcTotal();
    const newInvoice: Invoice = {
      id: String(Date.now()),
      invoiceNo: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      customer: customer.trim(), gstNo, gstType, items, date: new Date().toISOString().split("T")[0],
      total, gstAmount: gst,
    };
    setInvoices([newInvoice, ...invoices]);
    setCustomer(""); setGstNo(""); setItems([{ name: "", qty: 1, price: 0, gstRate: 5 }]);
    setDialogOpen(false);
    toast({ title: "Invoice created", description: `${newInvoice.invoiceNo} for ${customer.trim()}` });
  };

  const { subtotal, gst, total } = calcTotal();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">GST Billing</h2>
          <p className="text-sm text-muted-foreground">Create GST-ready invoices</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Customer Name</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Rajesh Kumar" /></div>
                <div className="space-y-2"><Label>GST Number</Label><Input value={gstNo} onChange={(e) => setGstNo(e.target.value)} placeholder="e.g. 27AABCU..." /></div>
              </div>
              <div className="space-y-2">
                <Label>GST Type</Label>
                <Select value={gstType} onValueChange={(v) => setGstType(v as "intra" | "inter")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intra">Intra-State (CGST + SGST)</SelectItem>
                    <SelectItem value="inter">Inter-State (IGST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Items</Label><Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add Item</Button></div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4"><Input placeholder="Item name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.qty || ""} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} /></div>
                    <div className="col-span-3"><Input type="number" placeholder="Price" value={item.price || ""} onChange={(e) => updateItem(idx, "price", Number(e.target.value))} /></div>
                    <div className="col-span-2">
                      <Select value={String(item.gstRate)} onValueChange={(v) => updateItem(idx, "gstRate", Number(v))}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">{items.length > 1 && <Button variant="ghost" size="sm" className="text-destructive h-10 w-full p-0" onClick={() => removeItem(idx)}>×</Button>}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{formatCurrency(subtotal)}</span></div>
                {gstType === "intra" ? (
                  <><div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>{formatCurrency(gst / 2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>{formatCurrency(gst / 2)}</span></div></>
                ) : (
                  <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>{formatCurrency(gst)}</span></div>
                )}
                <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={!customer.trim() || items.some((i) => !i.name.trim() || !i.price)}>Create Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Taxable Sales" value={formatCurrency(totalTaxable)} icon={IndianRupee} variant="info" />
        <StatCard title="GST Collected" value={formatCurrency(totalGST)} icon={Receipt} variant="success" />
        <StatCard title="Total Revenue" value={formatCurrency(totalTaxable + totalGST)} icon={TrendingUp} variant="default" />
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5"><FileText className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-card-foreground">{inv.invoiceNo}</p>
                  <Badge variant="outline" className={inv.gstType === "intra" ? "bg-info/10 text-info border-info/20" : "bg-warning/10 text-warning border-warning/20"}>
                    {inv.gstType === "intra" ? "CGST+SGST" : "IGST"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{inv.customer} · {inv.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-card-foreground">{formatCurrency(inv.total)}</p>
                <p className="text-xs text-muted-foreground">GST: {formatCurrency(inv.gstAmount)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "PDF generation", description: "PDF export coming soon with Cloud integration" })}><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: "Share", description: "WhatsApp sharing coming soon" })}><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
