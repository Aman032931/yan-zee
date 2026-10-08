
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SellerCategories() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your product categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
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