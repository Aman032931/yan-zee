
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SellerBrands() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Brand
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your product brands.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
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