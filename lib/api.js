const API = 'https://ai-model-api-production-aa9d.up.railway.app';

export async function getModels() {
  const r = await fetch(API + '/models?limit=100', { next: { revalidate: 3600 } });
  const d = await r.json();
  return d.data || d;
}

export async function getBenchmarks() {
  const r = await fetch(API + '/benchmarks', { next: { revalidate: 3600 } });
  return r.json();
}

export async function getLeaderboard(slug) {
  const r = await fetch(API + '/leaderboard/' + slug, { next: { revalidate: 3600 } });
  if (!r.ok) return [];
  return r.json();
}
