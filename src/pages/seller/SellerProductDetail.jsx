
import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { getProductById } from "../../services/productService";
import { useCategories } from "../../hooks/useCategories";

function formatText(value, fallback = "Not available") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? `Nrs ${number.toLocaleString()}`
    : "Not available";
}

function getImage(product) {
  if (typeof product?.image === "string" && product.image.trim()) {
    return product.image;
  }

  if (typeof product?.imageUrl === "string" && product.imageUrl.trim()) {
    return product.imageUrl;
  }

  if (Array.isArray(product?.imageUrls)) {
    const image = product.imageUrls.find(
      (url) => typeof url === "string" && url.trim()
    );

    if (image) return image;
  }

  if (Array.isArray(product?.images)) {
    const image = product.images.find(
      (item) =>
        (typeof item === "string" && item.trim()) ||
        (typeof item?.url === "string" && item.url.trim())
    );

    if (typeof image === "string") return image;
    if (image?.url) return image.url;
  }

  return "";
}

function DetailField({ label, children }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <div className="break-words text-sm text-gray-800">
        {children}
      </div>
    </div>
  );
}

export default function SellerProductDetail() {
  const { id } = useParams();
  const { shop } = useOutletContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: categories = [] } = useCategories(shop?.id, {
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    let cancelled = false;

    if (!shop?.id || !id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await getProductById(id, shop.id);

        const result =
          response?.data?.product ??
          response?.data ??
          null;

        if (!cancelled) {
          if (!result || !result.id) {
            throw new Error("Product not found.");
          }

          setProduct(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, shop?.id]);

  const image = getImage(product);

  const sellingPrice = product?.sellingPrice ?? product?.price;
  const crossedPrice = product?.crossedPrice ?? product?.discountPrice;
  const stock = product?.quantity ?? product?.totalStock;

  const categoryIds = Array.isArray(product?.categoryIds)
    ? product.categoryIds
    : product?.categoryId
      ? [product.categoryId]
      : [];

  const categoryNames = [
    ...(Array.isArray(product?.categories)
      ? product.categories.map((item) =>
          typeof item === "string"
            ? item
            : item?.name ?? item?.category?.name
        )
      : []),
    typeof product?.category === "string"
      ? product.category
      : product?.category?.name,
    ...categoryIds.map((categoryId) =>
      categories.find(
        (item) => String(item.id) === String(categoryId)
      )?.name
    ),
  ].filter(Boolean);

  const uniqueCategoryNames = [...new Set(categoryNames)];

  const status = formatText(product?.status, "UNKNOWN").toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Back navigation */}
      <div>
        <Button variant="ghost" asChild className="-ml-3 mb-3">
          <Link to="/seller/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">
          Product details
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View information about this product.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />

          <Card>
            <CardContent className="space-y-5 p-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      ) : !product ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-400" />

            <h2 className="mt-3 font-semibold">
              Product not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              This product may have been deleted or may not belong
              to your store.
            </p>

            <Button asChild className="mt-5">
              <Link to="/seller/products">
                Return to products
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product image */}
            <Card>
              <CardContent className="p-5">
                {image ? (
                  <img
                    src={image}
                    alt={product.name || "Product"}
                    className="aspect-square w-full rounded-lg border bg-white object-contain"
                  />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg border bg-gray-50">
                    <ImageOff className="h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-400">
                      No product image
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {formatText(product.name, "Unnamed product")}
                </CardTitle>

                <div className="pt-2">
                  <Badge variant="secondary">
                    {status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <DetailField label="Product ID">
                  {formatText(product.id)}
                </DetailField>

                <DetailField label="Slug">
                  {formatText(product.slug)}
                </DetailField>

                <DetailField label="Selling price">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(sellingPrice)}
                  </span>
                </DetailField>

                <DetailField label="Original / crossed price">
                  {formatPrice(crossedPrice)}
                </DetailField>

                <DetailField label="Available stock">
                  {formatText(stock)}
                </DetailField>

                <DetailField label="Audience">
                  {formatText(product.audience).replace(/_/g, " ")}
                </DetailField>

                <DetailField label="Categories">
                  {uniqueCategoryNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {uniqueCategoryNames.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "Uncategorized"
                  )}
                </DetailField>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Product description
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {formatText(
                  product.description,
                  "No description provided."
                )}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
