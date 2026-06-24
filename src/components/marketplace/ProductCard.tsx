import React from "react";
import Image from "next/image";
import { ShoppingCart, Leaf, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categories: string[];
  imageUrls: string[];
  metadata: {
    ingredients?: string[];
    dosage?: string;
    size?: string;
  };
  onAddToCart?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  stockQuantity,
  categories,
  imageUrls,
  metadata,
  onAddToCart,
}) => {
  const isOutOfStock = stockQuantity <= 0;
  const primaryImage = imageUrls[0] || "/images/placeholder-herbs.jpg"; // fallback

  return (
    <Card className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-300">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square w-full bg-cream-100/40 overflow-hidden border-b border-cream-200/40">
        <Image
          src={primaryImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false}
          unoptimized // To allow loading mock paths or arbitrary URL strings safely in dev
        />
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-cream-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-700 text-cream-50 font-semibold tracking-wider text-xs px-3 py-1.5 rounded-lg shadow-md uppercase">
              Out of Stock
            </span>
          </div>
        )}
        {/* Categories Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-24px)]">
          {categories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="primary" className="bg-primary/90 text-cream-50 border-none shadow-sm backdrop-blur-md">
              {cat}
            </Badge>
          ))}
        </div>
        {/* Size Badge */}
        {metadata.size && (
          <div className="absolute bottom-3 right-3 bg-cream-900/80 text-cream-50 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            {metadata.size}
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="flex flex-col flex-grow p-5 gap-3">
        <div>
          <h4 className="text-base font-bold text-primary-dark tracking-tight line-clamp-1">
            {name}
          </h4>
          <p className="text-xs text-cream-900/50 line-clamp-2 mt-1 min-h-[32px] font-sans leading-relaxed">
            {description}
          </p>
        </div>

        {/* Ayurvedic Metadata Snippet */}
        {((metadata.ingredients && metadata.ingredients.length > 0) || metadata.dosage) && (
          <div className="bg-cream-100/40 rounded-lg p-2.5 text-[11px] flex flex-col gap-1.5 border border-cream-200/30">
            {metadata.ingredients && metadata.ingredients.length > 0 && (
              <div className="flex items-start gap-1">
                <Leaf className="w-3.5 h-3.5 text-primary-light shrink-0 mt-0.5" />
                <span className="text-cream-900/80 font-sans leading-tight">
                  <strong className="text-primary font-semibold">Active Herbs:</strong>{" "}
                  {metadata.ingredients.slice(0, 3).join(", ")}
                </span>
              </div>
            )}
            {metadata.dosage && (
              <div className="flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                <span className="text-cream-900/80 font-sans leading-tight">
                  <strong className="text-secondary font-semibold">Directions:</strong>{" "}
                  {metadata.dosage}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-cream-900/40 uppercase tracking-wider">
              Price
            </span>
            <span className="text-lg font-bold text-primary-dark">
              ${price.toFixed(2)}
            </span>
          </div>

          {/* Add to Cart CTA */}
          <Button
            size="sm"
            disabled={isOutOfStock}
            onClick={() => onAddToCart && onAddToCart(id)}
            className="flex items-center gap-1.5 px-3 py-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
