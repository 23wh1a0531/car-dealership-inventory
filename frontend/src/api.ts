const API = '/api';

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Registration failed');
  return json.data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Login failed');
  return json.data.token as string;
}

export async function getVehicles(token: string) {
  const res = await fetch(`${API}/vehicles`, { headers: authHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to load vehicles');
  return json.data;
}

export async function searchVehicles(token: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/vehicles/search?${qs}`, { headers: authHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Search failed');
  return json.data;
}

export async function purchaseVehicle(token: string, id: number) {
  const res = await fetch(`${API}/vehicles/${id}/purchase`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Purchase failed');
  return json.data;
}

export async function createVehicle(token: string, data: object) {
  const res = await fetch(`${API}/vehicles`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Create failed');
  return json.data;
}

export async function updateVehicle(token: string, id: number, data: object) {
  const res = await fetch(`${API}/vehicles/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Update failed');
  return json.data;
}

export async function deleteVehicle(token: string, id: number) {
  const res = await fetch(`${API}/vehicles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Delete failed');
  return json.data;
}

export async function restockVehicle(token: string, id: number, amount: number) {
  const res = await fetch(`${API}/vehicles/${id}/restock`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ amount }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Restock failed');
  return json.data;
}
