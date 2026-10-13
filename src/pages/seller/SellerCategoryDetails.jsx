import { Link, useParams, useOutletContext } from "react-router-dom"
import { ArrowLeft, Layers, Package } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useCategories } from "../../hooks/useCategories"

export default function SellerCategoryDetail() {
  const { id } = useParams()
  const { shop } = useOutletContext()

  const {
    data: categories = [],
    isLoading,
    error,
  } = useCategories(shop?.id)

  const category = categories.find(
    (item) => String(item.id) === String(id)
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-3">
          <Link to="/seller/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to categories
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">
          Category details
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View information about this category.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full max-w-sm" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      ) : error ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Failed to load categories: {error.message}
        </div>
      ) : !category ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-semibold">Category not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This category may have been deleted or may not belong to this shop.
            </p>
            <Button asChild className="mt-4">
              <Link to="/seller/categories">Return to categories</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <Card>
            <CardContent className="p-5">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="aspect-square w-full rounded-lg border bg-white object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-gray-50">
                  <Layers className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {category.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Category ID
                </p>
                <p className="mt-1 break-all text-sm">{category.id}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Slug
                </p>
                <p className="mt-1 break-all text-sm">
                  {category.slug || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {category.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Availability
                </p>
                <div className="mt-2">
                  <Badge
                    variant={category.isAvailable ? "secondary" : "outline"}
                  >
                    {category.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Products in this category
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {category._count?.products ?? 0} products
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}