import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import StorefrontClient from "@/components/marketplace/StorefrontClient";
import { getAllProducts, getAllCategories } from "@/lib/product-data";

// Cached server component that fetches all products & categories from DB
async function StorefrontData() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  // Pick first product as featured (or one with highest stock)
  const featuredProduct =
    products.length > 0
      ? products.reduce((best, p) =>
          p.stockQuantity > best.stockQuantity ? p : best
        )
      : null;

  return (
    <StorefrontClient
      products={products}
      categories={categories}
      featuredProduct={featuredProduct}
    />
  );
}

// Loading skeleton for the storefront
function StorefrontSkeleton() {
  return (
    <div className="flex-grow">
      {/* Navbar placeholder */}
      <Navbar />

      {/* Hero Skeleton */}
      <section className="bg-surface-container-low py-20 px-6 md:px-12 border-b border-soft-sage/10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-56 h-7 bg-soft-sage/20 rounded-full animate-pulse" />
            <div className="space-y-3">
              <div className="w-full max-w-md h-12 bg-soft-sage/15 rounded-lg animate-pulse" />
              <div className="w-3/4 max-w-sm h-12 bg-soft-sage/15 rounded-lg animate-pulse" />
            </div>
            <div className="w-full max-w-lg h-6 bg-soft-sage/10 rounded animate-pulse" />
            <div className="w-36 h-12 bg-secondary/20 rounded-lg animate-pulse" />
          </div>
          <div className="aspect-video lg:aspect-square w-full rounded-2xl bg-soft-sage/10 animate-pulse" />
        </div>
      </section>

      {/* Catalog Skeleton */}
      <section className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-48 h-8 bg-soft-sage/15 rounded-lg animate-pulse mx-auto mb-3" />
          <div className="w-80 h-5 bg-soft-sage/10 rounded animate-pulse mx-auto" />
        </div>

        {/* Filter Chips Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-24 h-9 bg-soft-sage/10 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-card-surface rounded-xl overflow-hidden border border-soft-sage/20"
            >
              <div className="aspect-square bg-soft-sage/10 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="w-3/4 h-5 bg-soft-sage/15 rounded animate-pulse" />
                <div className="w-full h-4 bg-soft-sage/10 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="w-16 h-6 bg-secondary/15 rounded animate-pulse" />
                  <div className="w-9 h-9 bg-soft-sage/10 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Suspense fallback={<StorefrontSkeleton />}>
        <StorefrontData />
      </Suspense>
    </div>
  );
}
