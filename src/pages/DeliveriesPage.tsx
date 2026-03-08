import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deliveries } from "@/lib/mockData";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delivered: "bg-success/10 text-success border-success/20",
};
const statusLabels = { pending: "Pending", in_transit: "In Transit", delivered: "Delivered" };

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Deliveries</h2>
          <p className="text-sm text-muted-foreground">Manage local deliveries</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Delivery
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {deliveries.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{d.customer}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {d.address}
                </p>
              </div>
              <Badge variant="outline" className={statusStyles[d.status]}>
                {statusLabels[d.status]}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Items: {d.items}</p>
              <p>Assigned: {d.assignedTo} · {d.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
