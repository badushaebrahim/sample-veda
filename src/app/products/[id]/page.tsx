import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductById, getRelatedProducts } from "@/lib/product-data";
import ProductDetailClient from "./ProductDetailClient";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Product Not Found | Pharmpill Biotech" };
  }

  return {
    title: `${product.name} | Pharmpill Biotech`,
    description: product.description,
  };
}

// Server component that fetches product data with caching
async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    id,
    product.categories,
    3
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <Link href="/" className="font-bold text-2xl text-secondary">
            Pharmpill Biotech
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-on-surface-variant hover:text-secondary transition-colors text-sm font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              All Remedies
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-secondary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <Link href="/" className="hover:text-secondary transition-colors">
            Remedies
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square bg-surface-container-high rounded-2xl overflow-hidden group border border-soft-sage/10">
            <Image
              src={product.imageUrls[0] || ""}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
              priority
            />
            {product.categories[0] && (
              <div className="absolute top-6 left-6 bg-warm-ochre text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {product.categories[0]}
              </div>
            )}
            {product.metadata?.size && (
              <div className="absolute bottom-6 right-6 bg-inverse-surface/80 text-inverse-on-surface text-xs font-bold px-3 py-1.5 rounded-lg">
                {product.metadata.size}
              </div>
            )}
          </div>

          {/* Details - Client interactive component */}
          <ProductDetailClient product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-outline-variant/20 pt-12">
            <h2 className="text-2xl font-bold text-primary mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className="product-card bg-card-surface rounded-xl overflow-hidden border border-soft-sage/20 group"
                >
                  <div className="aspect-square relative overflow-hidden bg-surface-container">
                    <Image
                      src={rp.imageUrls[0] || ""}
                      alt={rp.name}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[12px] font-bold text-soft-sage uppercase tracking-widest">
                      {rp.categories[0]}
                    </span>
                    <h3 className="font-bold text-primary mt-1 mb-1">
                      {rp.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                      {rp.description}
                    </p>
                    <span className="font-bold text-secondary text-lg">
                      ₹{rp.price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Loading skeleton for the product detail page
function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <div className="w-44 h-8 bg-soft-sage/15 rounded-lg animate-pulse" />
          <div className="w-28 h-5 bg-soft-sage/10 rounded animate-pulse" />
        </div>
      </nav>
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="w-64 h-5 bg-soft-sage/10 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="aspect-square bg-soft-sage/10 rounded-2xl animate-pulse" />
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="w-32 h-4 bg-soft-sage/10 rounded animate-pulse" />
              <div className="w-full h-10 bg-soft-sage/15 rounded-lg animate-pulse" />
              <div className="w-48 h-5 bg-warm-ochre/15 rounded animate-pulse" />
              <div className="w-full h-16 bg-soft-sage/10 rounded animate-pulse" />
            </div>
            <div className="w-28 h-10 bg-secondary/15 rounded-lg animate-pulse" />
            <div className="bg-surface-container-low rounded-xl p-6 border border-soft-sage/10 space-y-4">
              <div className="w-full h-12 bg-soft-sage/10 rounded animate-pulse" />
              <div className="w-full h-8 bg-soft-sage/10 rounded animate-pulse" />
            </div>
            <div className="w-full h-14 bg-secondary/15 rounded-lg animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
