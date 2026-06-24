import React, { useState } from "react";
import { Plus, Minus, Save, RotateCcw, AlertTriangle, Edit2, ShieldAlert } from "lucide-react";
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  categories: string[];
  size?: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newStock: number) => Promise<void>;
  onEditProduct?: (id: string) => void;
  isAdmin?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onUpdateStock,
  onEditProduct,
  isAdmin = false,
}) => {
  // Store local state of stocks being modified to support quick saving
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const handleStockChange = (id: string, value: number) => {
    setEditingStocks((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const saveStockChange = async (id: string, originalStock: number) => {
    const newStock = editingStocks[id];
    if (newStock === undefined || newStock === originalStock) return;

    setSavingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await onUpdateStock(id, newStock);
      // Remove from editing state once saved
      setEditingStocks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      console.error("Failed to update stock", e);
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "danger" as const };
    if (stock <= 10) return { label: "Low Stock", variant: "warning" as const };
    return { label: "Healthy", variant: "success" as const };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-bold text-primary-dark">Physical Inventory Tracker</h4>
          <p className="text-xs text-cream-900/50 mt-0.5">
            Monitor and adjust real-time stock levels of physical products in the factory warehouse.
          </p>
        </div>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Product Details</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Stock Status</TableHeaderCell>
            <TableHeaderCell className="text-center">Modify Stock Level</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const currentStock = editingStocks[item.id] !== undefined ? editingStocks[item.id] : item.stockQuantity;
            const hasChanges = editingStocks[item.id] !== undefined && editingStocks[item.id] !== item.stockQuantity;
            const status = getStockStatus(item.stockQuantity);
            const isSaving = savingIds[item.id] || false;

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-semibold text-primary-dark">{item.name}</div>
                  {item.size && (
                    <div className="text-[10px] text-cream-900/50 mt-0.5 font-bold tracking-wide uppercase">
                      Size: {item.size}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.categories.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-cream-100 text-cream-900/70 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {item.stockQuantity <= 10 && (
                      <AlertTriangle className={`w-4 h-4 ${item.stockQuantity === 0 ? 'text-red-700' : 'text-amber-500'}`} />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleStockChange(item.id, currentStock - 1)}
                      className="p-1 border border-cream-300 rounded bg-white hover:bg-cream-100 text-cream-900/70"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center text-sm font-bold border border-cream-300 rounded focus:border-primary"
                    />
                    <button
                      onClick={() => handleStockChange(item.id, currentStock + 1)}
                      className="p-1 border border-cream-300 rounded bg-white hover:bg-cream-100 text-cream-900/70"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {hasChanges && (
                      <>
                        <button
                          onClick={() => {
                            setEditingStocks((prev) => {
                              const copy = { ...prev };
                              delete copy[item.id];
                              return copy;
                            });
                          }}
                          className="p-2 text-cream-900/50 hover:text-red-700 rounded-lg hover:bg-red-50"
                          title="Discard changes"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <Button
                          size="sm"
                          isLoading={isSaving}
                          onClick={() => saveStockChange(item.id, item.stockQuantity)}
                          className="flex items-center gap-1 py-1.5 px-2.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </Button>
                      </>
                    )}

                    {!hasChanges && onEditProduct && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAdmin}
                        onClick={() => onEditProduct(item.id)}
                        className={`flex items-center gap-1 py-1.5 px-2.5 ${!isAdmin ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title={isAdmin ? "Edit details" : "Admin access only"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Details
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
    </div>
  );
};
