import { useState, useEffect, type FormEvent } from 'react';
import type { Vehicle } from '../types';

const CATEGORIES = ['SEDAN', 'SUV', 'TRUCK', 'HATCHBACK', 'COUPE'];

interface Props {
  vehicle: Vehicle | null; // null = create mode
  onSave: (data: Omit<Vehicle, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function VehicleModal({ vehicle, onSave, onClose }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('SEDAN');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setCategory(vehicle.category);
      setPrice(String(vehicle.price));
      setQuantity(String(vehicle.quantity));
    }
  }, [vehicle]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!make.trim() || !model.trim()) { setError('Make and model are required.'); return; }
    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(priceNum) || priceNum <= 0) { setError('Price must be a positive number.'); return; }
    if (isNaN(qtyNum) || qtyNum < 0) { setError('Quantity must be 0 or more.'); return; }
    setLoading(true);
    try {
      await onSave({ make: make.trim(), model: model.trim(), category, price: priceNum, quantity: qtyNum });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
        <h2 id="modal-title" className="text-lg font-bold text-white mb-5">
          {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        </h2>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="v-make" className="block text-sm font-medium text-gray-300 mb-1">Make</label>
              <input id="v-make" type="text" required value={make} onChange={e => setMake(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota" />
            </div>
            <div>
              <label htmlFor="v-model" className="block text-sm font-medium text-gray-300 mb-1">Model</label>
              <input id="v-model" type="text" required value={model} onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Camry" />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="v-category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select id="v-category" value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="v-price" className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
              <input id="v-price" type="number" min="0.01" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25000" />
            </div>
            <div>
              <label htmlFor="v-qty" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
              <input id="v-qty" type="number" min="0" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400">
              {loading ? 'Saving…' : vehicle ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
