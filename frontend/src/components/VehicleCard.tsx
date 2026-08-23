import { useState, useEffect } from 'react';
import type { Vehicle } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  SEDAN: 'bg-blue-900/50 text-blue-300 border-blue-700',
  SUV: 'bg-green-900/50 text-green-300 border-green-700',
  TRUCK: 'bg-orange-900/50 text-orange-300 border-orange-700',
  HATCHBACK: 'bg-purple-900/50 text-purple-300 border-purple-700',
  COUPE: 'bg-pink-900/50 text-pink-300 border-pink-700',
};

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-900/50 border border-red-700 text-red-300">Out of Stock</span>;
  if (quantity <= 2)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-900/50 border border-amber-700 text-amber-300">Low Stock</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300">In Stock</span>;
}

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (id: number) => Promise<void>;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onRestock: (vehicle: Vehicle) => void;
  purchasing: boolean;
}

export default function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock, purchasing }: Props) {
  const [displayQty, setDisplayQty] = useState(vehicle.quantity);
  const [purchased, setPurchased] = useState(false);

  // Sync when parent refreshes vehicle data after server round-trip
  useEffect(() => {
    setDisplayQty(vehicle.quantity);
  }, [vehicle.quantity]);

  const categoryClass = CATEGORY_COLORS[vehicle.category] ?? 'bg-gray-800 text-gray-300 border-gray-600';
  const outOfStock = displayQty === 0;

  async function handlePurchase() {
    // Optimistic update
    setDisplayQty(q => Math.max(0, q - 1));
    try {
      await onPurchase(vehicle.id);
      setPurchased(true);
      setTimeout(() => setPurchased(false), 3000);
    } catch {
      // Revert on error — parent will also reload
      setDisplayQty(vehicle.quantity);
    }
  }

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white leading-tight truncate">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryClass}`}>
            {vehicle.category}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-white">${vehicle.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Stock info */}
      <div className="flex items-center justify-between">
        <StockBadge quantity={displayQty} />
        <span className="text-xs text-gray-500">{displayQty} unit{displayQty !== 1 ? 's' : ''}</span>
      </div>

      {/* Purchase success */}
      {purchased && (
        <div role="status" className="text-xs text-emerald-400 font-medium bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-1.5">
          ✓ Purchase successful!
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-1">
        {!isAdmin && (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={outOfStock || purchasing}
            aria-label={`Purchase ${vehicle.make} ${vehicle.model}`}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {purchasing ? 'Processing…' : outOfStock ? 'Out of Stock' : 'Purchase'}
          </button>
        )}

        {isAdmin && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
              className="py-2 px-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onRestock(vehicle)}
              aria-label={`Restock ${vehicle.make} ${vehicle.model}`}
              className="py-2 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Restock
            </button>
            <button
              type="button"
              onClick={() => onDelete(vehicle.id)}
              aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
              className="py-2 px-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
