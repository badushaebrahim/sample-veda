"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/lib/products";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = PRODUCTS.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-soft-sage mb-4 block">search_off</span>
          <h1 className="text-2xl font-bold text-primary mb-2">Product Not Found</h1>
          <p className="text-on-surface-variant mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="px-6 py-3 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary transition-all">Back to Store</Link>
        </div>
      </div>
    );
  }

  const relatedProducts = PRODUCTS.filter((p) => p.id !== id && p.categories.some((c) => product.categories.includes(c))).slice(0, 3);
  if (relatedProducts.length < 3) {
    const remaining = PRODUCTS.filter((p) => p.id !== id && !relatedProducts.includes(p)).slice(0, 3 - relatedProducts.length);
    relatedProducts.push(...remaining);
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <Link href="/" className="font-bold text-2xl text-secondary">Pharmpill Biotech</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-on-surface-variant hover:text-secondary transition-colors text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              All Remedies
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link href="/" className="hover:text-secondary transition-colors">Remedies</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-on-surface font-semibold">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square bg-surface-container-high rounded-2xl overflow-hidden group border border-soft-sage/10">
            <Image
              src={product.imageUrls[0]}
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
            {product.metadata.size && (
              <div className="absolute bottom-6 right-6 bg-inverse-surface/80 text-inverse-on-surface text-xs font-bold px-3 py-1.5 rounded-lg">{product.metadata.size}</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categories.map((cat) => (
                  <span key={cat} className="text-xs font-bold text-soft-sage uppercase tracking-widest">{cat}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 text-warm-ochre mb-4">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                <span className="text-sm font-semibold text-on-surface-variant ml-1">4.8 (128 reviews)</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed font-serif text-base">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-secondary">${product.price.toFixed(2)}</span>
              {product.stockQuantity > 0 ? (
                <span className="text-sm font-semibold text-secondary-container bg-primary-container px-2 py-0.5 rounded">{product.stockQuantity} in stock</span>
              ) : (
                <span className="text-sm font-semibold text-error">Out of stock</span>
              )}
            </div>

            {/* Ingredients & Dosage */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-soft-sage/10 space-y-4">
              {product.metadata.ingredients && product.metadata.ingredients.length > 0 && (
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">eco</span>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Active Ingredients</span>
                    <div className="flex flex-wrap gap-2">
                      {product.metadata.ingredients.map((ing) => (
                        <span key={ing} className="px-3 py-1 bg-secondary-container/30 text-on-secondary-container text-xs font-semibold rounded-full">{ing}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {product.metadata.dosage && (
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-warm-ochre text-xl shrink-0 mt-0.5">medication</span>
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Dosage & Directions</span>
                    <p className="text-sm text-on-surface-variant">{product.metadata.dosage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="px-5 py-3 font-bold text-on-surface text-sm min-w-[48px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className="px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <button disabled={product.stockQuantity <= 0} className="flex-1 py-3.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-outline-variant/30">
              {[
                { icon: "verified", text: "Purity Certified" },
                { icon: "local_shipping", text: "Free Shipping" },
                { icon: "autorenew", text: "Easy Returns" },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-1 text-center">
                  <span className="material-symbols-outlined text-secondary text-xl">{badge.icon}</span>
                  <span className="text-[11px] font-semibold text-on-surface-variant">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-outline-variant/20 pt-12">
            <h2 className="text-2xl font-bold text-primary mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.id}`} className="product-card bg-card-surface rounded-xl overflow-hidden border border-soft-sage/20 group">
                  <div className="aspect-square relative overflow-hidden bg-surface-container">
                    <Image src={rp.imageUrls[0]} alt={rp.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  </div>
                  <div className="p-5">
                    <span className="text-[12px] font-bold text-soft-sage uppercase tracking-widest">{rp.categories[0]}</span>
                    <h3 className="font-bold text-primary mt-1 mb-1">{rp.name}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{rp.description}</p>
                    <span className="font-bold text-secondary text-lg">${rp.price.toFixed(2)}</span>
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
