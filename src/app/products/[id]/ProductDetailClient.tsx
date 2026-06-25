"use client";

import React, { useState } from "react";
import type { ProductData } from "@/lib/product-data";

export default function ProductDetailClient({
  product,
}: {
  product: ProductData;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {product.categories.map((cat) => (
            <span
              key={cat}
              className="text-xs font-bold text-soft-sage uppercase tracking-widest"
            >
              {cat}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 text-warm-ochre mb-4">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star_half
          </span>
          <span className="text-sm font-semibold text-on-surface-variant ml-1">
            4.8 (128 reviews)
          </span>
        </div>
        <p className="text-on-surface-variant leading-relaxed font-serif text-base">
          {product.description}
        </p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-secondary">
          ₹{product.price.toFixed(2)}
        </span>
        {product.stockQuantity > 0 ? (
          <span className="text-sm font-semibold text-secondary-container bg-primary-container px-2 py-0.5 rounded">
            {product.stockQuantity} in stock
          </span>
        ) : (
          <span className="text-sm font-semibold text-error">Out of stock</span>
        )}
      </div>

      {/* Ingredients & Dosage */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-soft-sage/10 space-y-4">
        {product.metadata?.ingredients &&
          product.metadata.ingredients.length > 0 && (
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
                eco
              </span>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  Active Ingredients
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.metadata.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-3 py-1 bg-secondary-container/30 text-on-secondary-container text-xs font-semibold rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        {product.metadata?.benefits && product.metadata.benefits.length > 0 && (
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
              favorite
            </span>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Key Benefits
              </span>
              <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-1">
                {product.metadata.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {product.metadata?.dosage && (
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-warm-ochre text-xl shrink-0 mt-0.5">
              medication
            </span>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Dosage & Directions
              </span>
              <p className="text-sm text-on-surface-variant">
                {product.metadata.dosage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quantity + CTA */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <span className="px-5 py-3 font-bold text-on-surface text-sm min-w-[48px] text-center">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity(Math.min(product.stockQuantity, quantity + 1))
            }
            className="px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
        <button
          disabled={product.stockQuantity <= 0}
          className="flex-1 py-3.5 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-lg">
            add_shopping_cart
          </span>
          Add to Cart — ₹{(product.price * quantity).toFixed(2)}
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-outline-variant/30">
        {[
          { icon: "verified", text: "Purity Certified" },
          { icon: "local_shipping", text: "Free Shipping" },
          { icon: "autorenew", text: "Easy Returns" },
        ].map((badge) => (
          <div
            key={badge.text}
            className="flex flex-col items-center gap-1 text-center"
          >
            <span className="material-symbols-outlined text-secondary text-xl">
              {badge.icon}
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant">
              {badge.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
