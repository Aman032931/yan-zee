
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SellerOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Manage categories using the existing backend API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Category management will be implemented here.
        </CardContent>
      </Card>
    </div>
  );
}