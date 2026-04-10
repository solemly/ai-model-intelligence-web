const API_BASE = 'https://ai-model-api-production-aa9d.up.railway.app';

export async function getModels() {
  const res = await fetch(`${API_BASE}/models`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.data || data;
}

export async function getBenchmarks() {
  const res = await fetch(`${API_BASE}/benchmarks`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function getLeaderboard(benchmarkSlug) {
  const res = await fetch(`${API_BASE}/leaderboard/${benchmarkSlug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function compareModels(ids) {
  const res = await fetch(`${API_BASE}/models/compare?ids=${ids.join(',')}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}
