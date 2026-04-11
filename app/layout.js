import { Space_Mono, DM_Sans } from 'next/font/google';
import './globals.css';

const mono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' });
const sans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-sans' });

export const metadata = {
  title: 'AI Model Intelligence — LLM Leaderboard',
  description: 'Live benchmarks, pricing, and performance rankings for every major LLM. Updated nightly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mono.variable + ' ' + sans.variable}>
      <body>{children}</body>
    </html>
  );
}
