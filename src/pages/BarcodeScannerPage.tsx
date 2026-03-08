import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Keyboard, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { products as mockProducts, formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  name: string;
  price: number;
  qty: number;
  barcode: string;
}

const barcodeDB: Record<string, { name: string; price: number }> = {
  "8901030796432": { name: "Rice (25kg)", price: 1200 },
  "8901030797149": { name: "Sugar (1kg)", price: 45 },
  "8901030797156": { name: "Cooking Oil (5L)", price: 650 },
  "8901030797163": { name: "Wheat Flour (10kg)", price: 420 },
  "8901030797170": { name: "Tea (500g)", price: 280 },
  "8901030797187": { name: "Soap Bar", price: 35 },
};

export default function BarcodeScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<any>(null);

  const processBarcode = useCallback((code: string) => {
    const product = barcodeDB[code];
    if (product) {
      setCart((prev) => {
        const existing = prev.find((i) => i.barcode === code);
        if (existing) return prev.map((i) => i.barcode === code ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { ...product, qty: 1, barcode: code }];
      });
      setLastScanned(product.name);
      toast({ title: "Product found", description: `${product.name} added to cart` });
    } else {
      toast({ title: "Unknown barcode", description: `Barcode ${code} not found in inventory`, variant: "destructive" });
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrCode.current = new Html5Qrcode("barcode-reader");
      await html5QrCode.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText: string) => {
          processBarcode(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch {
      toast({ title: "Camera error", description: "Could not access camera. Try manual entry.", variant: "destructive" });
    }
  }, [processBarcode]);

  const stopScanning = useCallback(async () => {
    if (html5QrCode.current) {
      try { await html5QrCode.current.stop(); } catch {}
      html5QrCode.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => { return () => { stopScanning(); }; }, [stopScanning]);

  const handleManualEntry = () => {
    if (!manualBarcode.trim()) return;
    processBarcode(manualBarcode.trim());
    setManualBarcode("");
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Barcode Scanner</h2>
        <p className="text-sm text-muted-foreground">Scan products for quick billing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex gap-2 mb-4">
              <Button onClick={scanning ? stopScanning : startScanning} className="gap-2" variant={scanning ? "destructive" : "default"}>
                <Camera className="h-4 w-4" /> {scanning ? "Stop Camera" : "Start Camera"}
              </Button>
            </div>

            <div id="barcode-reader" ref={scannerRef} className={`rounded-lg overflow-hidden ${scanning ? "" : "hidden"}`} />

            {!scanning && (
              <div className="flex items-center justify-center h-40 rounded-lg bg-muted/50 text-muted-foreground text-sm">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Start Camera" to scan barcodes</p>
                </div>
              </div>
            )}

            {lastScanned && (
              <p className="mt-3 text-sm text-success font-medium">✓ Last scanned: {lastScanned}</p>
            )}
          </div>

          {/* Manual entry */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-card-foreground flex items-center gap-2"><Keyboard className="h-4 w-4" /> Manual Entry</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter barcode number" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleManualEntry()} />
              <Button onClick={handleManualEntry} disabled={!manualBarcode.trim()}><Search className="h-4 w-4" /></Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Try: 8901030796432, 8901030797149, 8901030797156</p>
          </div>
        </div>

        {/* Cart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Cart
            {cart.length > 0 && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{cart.length}</Badge>}
          </h3>

          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Scan products to add to cart</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.barcode} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} × {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-card-foreground">{formatCurrency(item.price * item.qty)}</p>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-semibold text-card-foreground">Total</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(cartTotal)}</span>
              </div>
              <Button className="w-full" onClick={() => { setCart([]); setLastScanned(null); toast({ title: "Sale completed!" }); }}>
                Complete Sale
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
