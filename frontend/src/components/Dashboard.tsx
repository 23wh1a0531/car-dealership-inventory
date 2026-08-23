import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../AuthContext';
import type { Vehicle } from '../types';
import {
  getVehicles,
  searchVehicles,
  purchaseVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from '../api';
import VehicleCard from './VehicleCard';
import VehicleModal from './VehicleModal';

const CATEGORIES = ['', 'SEDAN', 'SUV', 'TRUCK', 'HATCHBACK', 'COUPE'];

interface RestockState { vehicle: Vehicle; amount: string; error: string; loading: boolean; }
interface Toast { message: string; type: 'success' | 'error'; }

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token, role, logout } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loadError, setLoadError] = useState('');
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Search filters
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals
  const [editVehicle, setEditVehicle] = useState<Vehicle | null | undefined>(undefined);
  const [restock, setRestock] = useState<RestockState | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(async () => {
    if (!token) return;
    setLoadError('');
    try {
      const params: Record<string, string> = {};
      if (make) params.make = make;
      if (model) params.model = model;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const data = Object.keys(params).length
        ? await searchVehicles(token, params)
        : await getVehicles(token);
      setVehicles(data);
      if (!Object.keys(params).length) setAllVehicles(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load vehicles');
    }
  }, [token, make, model, category, minPrice, maxPrice]);

  useEffect(() => { load(); }, [load]);

  // Summary stats derived from allVehicles
  const totalVehicles = allVehicles.length;
  const availableVehicles = allVehicles.filter(v => v.quantity > 0).length;
  const outOfStockCount = allVehicles.filter(v => v.quantity === 0).length;
  const inventoryValue = allVehicles.reduce((sum, v) => sum + v.price * v.quantity, 0);

  async function handlePurchase(id: number) {
    if (!token) return;
    setPurchasing(id);
    try {
      await purchaseVehicle(token, id);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Purchase failed', 'error');
    } finally {
      setPurchasing(null);
    }
  }

  async function handleSave(data: Omit<Vehicle, 'id'>) {
    if (!token) return;
    try {
      if (editVehicle) {
        await updateVehicle(token, editVehicle.id, data);
        showToast(`${data.make} ${data.model} updated successfully.`);
      } else {
        await createVehicle(token, data);
        showToast(`${data.make} ${data.model} added to inventory.`);
      }
      await load();
    } catch (err) {
      throw err; // let modal handle it
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    const vehicle = vehicles.find(v => v.id === id);
    const label = vehicle ? `${vehicle.make} ${vehicle.model}` : 'this vehicle';
    if (!confirm(`Delete ${label}? This action cannot be undone.`)) return;
    try {
      await deleteVehicle(token, id);
      showToast(`${label} removed from inventory.`);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  async function handleRestock(e: FormEvent) {
    e.preventDefault();
    if (!token || !restock) return;
    const amount = parseInt(restock.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      setRestock(r => r ? { ...r, error: 'Amount must be a positive integer.' } : r);
      return;
    }
    setRestock(r => r ? { ...r, loading: true, error: '' } : r);
    try {
      await restockVehicle(token, restock.vehicle.id, amount);
      showToast(`${restock.vehicle.make} ${restock.vehicle.model} restocked by ${amount}.`);
      setRestock(null);
      await load();
    } catch (err) {
      setRestock(r => r ? { ...r, loading: false, error: err instanceof Error ? err.message : 'Restock failed' } : r);
    }
  }

  function clearFilters() {
    setMake(''); setModel(''); setCategory(''); setMinPrice(''); setMaxPrice('');
  }

  const hasFilters = make || model || category || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">AutoVault</h1>
            <p className="text-xs text-gray-500 mt-0.5">Vehicle Inventory Management</p>
          </div>
          {isAdmin && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-900/50 border border-amber-700 text-amber-300">
              ADMIN
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditVehicle(null)}
              className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              + Add Vehicle
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="py-1.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Total Models" value={totalVehicles} />
          <SummaryCard label="Available" value={availableVehicles} accent="text-emerald-400" />
          <SummaryCard label="Out of Stock" value={outOfStockCount} accent={outOfStockCount > 0 ? 'text-red-400' : 'text-white'} />
          <SummaryCard label="Inventory Value" value={`$${inventoryValue.toLocaleString()}`} accent="text-blue-400" />
        </div>

        {/* Filters */}
        <section aria-label="Search filters" className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
            <input
              type="text" placeholder="Make" value={make} onChange={e => setMake(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text" placeholder="Model" value={model} onChange={e => setModel(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={category} onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
            </select>
            <input
              type="number" placeholder="Min Price ($)" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0"
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number" placeholder="Max Price ($)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0"
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {hasFilters
                ? `${vehicles.length} result${vehicles.length !== 1 ? 's' : ''} matching filters`
                : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} in inventory`}
            </p>
            <button
              type="button" onClick={clearFilters}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                hasFilters
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-800 text-gray-600 cursor-default'
              }`}
              disabled={!hasFilters}
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Error */}
        {loadError && (
          <div role="alert" className="px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {loadError}
          </div>
        )}

        {/* Vehicle grid */}
        {vehicles.length === 0 && !loadError ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No vehicles found.</p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                purchasing={purchasing === v.id}
                onPurchase={handlePurchase}
                onEdit={vehicle => setEditVehicle(vehicle)}
                onDelete={handleDelete}
                onRestock={vehicle => setRestock({ vehicle, amount: '', error: '', loading: false })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {editVehicle !== undefined && (
        <VehicleModal
          vehicle={editVehicle}
          onSave={handleSave}
          onClose={() => setEditVehicle(undefined)}
        />
      )}

      {/* Restock modal */}
      {restock && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="restock-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={e => { if (e.target === e.currentTarget) setRestock(null); }}
        >
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <h2 id="restock-title" className="text-lg font-bold text-white mb-1">Restock Vehicle</h2>
            <p className="text-sm text-gray-400 mb-4">{restock.vehicle.make} {restock.vehicle.model}</p>

            {restock.error && (
              <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
                {restock.error}
              </div>
            )}

            <form onSubmit={handleRestock} noValidate>
              <label htmlFor="restock-amount" className="block text-sm font-medium text-gray-300 mb-1">Amount to add</label>
              <input
                id="restock-amount" type="number" min="1" step="1" required
                value={restock.amount}
                onChange={e => setRestock(r => r ? { ...r, amount: e.target.value } : r)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setRestock(null)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={restock.loading}
                  className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {restock.loading ? 'Restocking…' : 'Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
              : 'bg-red-900/90 border-red-700 text-red-200'
          }`}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}
    </div>
  );
}
