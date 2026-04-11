import { getModels, getBenchmarks, getLeaderboard } from '../lib/api';
import LeaderboardClient from './LeaderboardClient';
export const revalidate = 3600;
export default async function Home() {
  const [models, benchmarks, leaderboard] = await Promise.all([
    getModels(), getBenchmarks(), getLeaderboard('swe-bench')
  ]);
  return <LeaderboardClient models={models} benchmarks={benchmarks} initialLeaderboard={leaderboard} />;
}
