import { cacheLife, cacheTag } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { PRODUCTS } from "@/lib/products";

export interface ProductData {
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
    benefits?: string[];
    size?: string;
  };
}

// Serialize a Mongoose document to a plain object
function serializeProduct(doc: any): ProductData {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    stockQuantity: doc.stockQuantity,
    categories: doc.categories || [],
    imageUrls: doc.imageUrls || [],
    metadata: {
      ingredients: doc.metadata?.ingredients || [],
      dosage: doc.metadata?.dosage || "",
      benefits: doc.metadata?.benefits || [],
      size: doc.metadata?.size || "",
    },
  };
}

/**
 * Fetch all products from DB. Auto-seeds if empty.
 * Cached for 5 minutes via `use cache`.
 */
export async function getAllProducts(): Promise<ProductData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  await dbConnect();

  let products = await Product.find({}).sort({ createdAt: -1 }).lean();

  // Auto-seed if DB is empty
  if (products.length === 0) {
    const count = await Product.countDocuments();
    if (count === 0) {
      const productsToSeed = PRODUCTS.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        stockQuantity: p.stockQuantity,
        categories: p.categories,
        imageUrls: p.imageUrls,
        metadata: p.metadata,
      }));
      await Product.insertMany(productsToSeed);
      products = await Product.find({}).sort({ createdAt: -1 }).lean();
    }
  }

  return products.map(serializeProduct);
}

/**
 * Fetch a single product by ID.
 * Cached for 5 minutes via `use cache`.
 */
export async function getProductById(
  id: string
): Promise<ProductData | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`product-${id}`);

  await dbConnect();

  try {
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return serializeProduct(product);
  } catch {
    return null;
  }
}

/**
 * Get all unique categories from products in DB.
 * Cached for 5 minutes.
 */
export async function getAllCategories(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");

  await dbConnect();

  const products = await Product.find({}, { categories: 1 }).lean();
  const categorySet = new Set<string>();
  for (const p of products) {
    for (const cat of p.categories || []) {
      categorySet.add(cat);
    }
  }
  return Array.from(categorySet).sort();
}

/**
 * Fetch related products (same category, excluding current).
 */
export async function getRelatedProducts(
  productId: string,
  categories: string[],
  limit = 3
): Promise<ProductData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  await dbConnect();

  // Find products in the same categories
  let related = await Product.find({
    _id: { $ne: productId },
    categories: { $in: categories },
  })
    .limit(limit)
    .lean();

  // Fill remaining spots with any other products
  if (related.length < limit) {
    const existingIds = related.map((p: any) => p._id);
    existingIds.push(productId);
    const remaining = await Product.find({
      _id: { $nin: existingIds },
    })
      .limit(limit - related.length)
      .lean();
    related = [...related, ...remaining];
  }

  return related.map(serializeProduct);
}
