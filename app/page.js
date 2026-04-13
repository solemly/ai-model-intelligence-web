import { getModels, getBenchmarks, getLeaderboard, getInsights } from '../lib/api';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 3600;

export default async function Home() {
  const [models, benchmarks, leaderboard, insights] = await Promise.all([
    getModels(), getBenchmarks(), getLeaderboard('swe-bench'), getInsights()
  ]);
  return <LeaderboardClient models={models} benchmarks={benchmarks} initialLeaderboard={leaderboard} insights={insights} />;
}
