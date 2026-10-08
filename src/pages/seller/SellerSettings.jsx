
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SellerSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setting Management</CardTitle>
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