"use client";

import { useState } from "react";
import Image from "next/image";

// ── Types ───────────────────────────────────────────────────────────────────
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

interface ProfileAnalytics {
  user: GitHubUser;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  totalOpenIssues: number;
  topLanguages: { language: string; count: number; percentage: number }[];
  recentLanguages: { language: string; count: number; percentage: number }[];
  topTopics: { topic: string; count: number }[];
  commitStats: {
    estimatedTotalCommits: number;
    averageCommitsPerDay: number;
    averageCommitsPerWeek: number;
    averageCommitsPerMonth: number;
    averageCommitsPerYear: number;
    commitsByYear: { year: number; count: number }[];
  };
  repoStats: {
    averageStars: number;
    averageForks: number;
    averageSize: number;
    mostStarred: GitHubRepo | null;
    mostForked: GitHubRepo | null;
    recentlyActive: GitHubRepo[];
    oldest: GitHubRepo | null;
    newest: GitHubRepo | null;
  };
  activityScore: number;
  languageDiversity: number;
  accountAge: { years: number; months: number; days: number; createdAt: string };
}

// ── Language colors — preserved palette ────────────────────────────────────
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  Lua: "#000080",
  R: "#198CE7",
  MATLAB: "#e16737",
  Jupyter: "#F37642",
  default: "#6b7280",
};

// ── Icons (stroke 1.6, minimal) ────────────────────────────────────────────
const GithubIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);
const SearchIcon = ({ className = "w-[16px] h-[16px]" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const StarIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);
const ForkIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 12a2 2 0 100 4 2 2 0 000-4zm10-8a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100-4 2 2 0 000 4zm10 8v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
);
const RepoIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
);
const UsersIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 11a3 3 0 100-6 3 3 0 000 6zM6 19a5 5 0 0110 0v1H6v-1zM18 11a2 2 0 100-4 2 2 0 000 4zM20 19v-1a5 5 0 00-3-4.5" /></svg>
);
const CalendarIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const ChartIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 19V7m6 12V11m6 8V5m6 14V9" /></svg>
);
const CommitIcon = (p: { className?: string }) => (
  <svg className={p.className ?? "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 16a2 2 0 100-4 2 2 0 000 4zM12 8V4m0 16v-4M8 12H4m16 0h-4" /></svg>
);

// ── Primitives ──────────────────────────────────────────────────────────────
function Eyebrow({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-mono tracking-[0.14em] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      {action}
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

// ── Metric strip cell ──────────────────────────────────────────────────────
function MetricCell({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-5 py-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.12em] text-zinc-500 dark:text-zinc-400 font-medium">
          {label}
        </span>
        <span className="w-7 h-7 grid place-items-center rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
          {icon}
        </span>
      </div>
      <div>
        <div className="text-[26px] font-semibold tracking-[-0.02em] leading-none tabular text-zinc-900 dark:text-white">
          {value}
        </div>
        {sub && <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">{sub}</div>}
      </div>
    </div>
  );
}

// ── Activity dial — signature element ─────────────────────────────────────
function ActivityDial({ score }: { score: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = c - (score / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#2563eb" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex flex-col items-center">
      <svg width={112} height={112} className="-rotate-90" viewBox="0 0 112 112" role="img" aria-label={`Activity score ${score} out of 100`}>
        <circle cx={56} cy={56} r={r} stroke="currentColor" strokeWidth={6} fill="none" className="text-zinc-100 dark:text-zinc-800" />
        {/* tick marks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * 2 * Math.PI - Math.PI / 2;
          const x1 = 56 + Math.cos(a) * 52;
          const y1 = 56 + Math.sin(a) * 52;
          const x2 = 56 + Math.cos(a) * 48;
          const y2 = 56 + Math.sin(a) * 48;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 5 === 0 ? 1.2 : 0.7} className="text-zinc-200 dark:text-zinc-700" />;
        })}
        <circle
          cx={56}
          cy={56}
          r={r}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[30px] font-semibold tracking-[-0.03em] leading-none tabular text-zinc-900 dark:text-white">{score}</div>
          <div className="text-[9px] font-mono tracking-[0.16em] text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">/ 100</div>
        </div>
      </div>
    </div>
  );
}

// ── Language viz ───────────────────────────────────────────────────────────
function LanguageSpine({ items }: { items: { language: string; percentage: number }[] }) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {items.map((l) => (
        <div
          key={l.language}
          title={`${l.language} ${l.percentage}%`}
          style={{ width: `${l.percentage}%`, backgroundColor: languageColors[l.language] ?? languageColors.default }}
        />
      ))}
    </div>
  );
}
function LanguageRow({ language, percentage, count }: { language: string; percentage: number; count: number }) {
  const color = languageColors[language] ?? languageColors.default;
  return (
    <div className="group flex items-center gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 min-w-0 flex-1 truncate">{language}</span>
      <span className="text-[12px] font-mono tabular text-zinc-500 dark:text-zinc-400">
        {count} · {percentage}%
      </span>
      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Repo artifact card ─────────────────────────────────────────────────────
function RepoArtifact({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[13.5px] font-semibold leading-5 text-zinc-900 dark:text-zinc-100 group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa] transition-colors line-clamp-1">
          {repo.name}
        </h4>
        <span className="shrink-0 w-6 h-6 grid place-items-center rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400 group-hover:text-zinc-600 transition-colors">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M7 17L17 7M17 7H9m8 0v8" /></svg>
        </span>
      </div>
      {repo.description && (
        <p className="text-[12.5px] leading-5 text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-2 min-h-[40px]">
          {repo.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[repo.language] ?? languageColors.default }} />
            {repo.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular text-zinc-500 dark:text-zinc-400">
          <StarIcon className="w-3.5 h-3.5" /> {repo.stargazers_count.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular text-zinc-500 dark:text-zinc-400">
          <ForkIcon className="w-3.5 h-3.5" /> {repo.forks_count.toLocaleString()}
        </span>
        {repo.open_issues_count > 0 && (
          <span className="text-[11px] font-mono tabular text-amber-600 dark:text-amber-400">
            {repo.open_issues_count} issues
          </span>
        )}
      </div>
    </a>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Page() {
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setAnalytics(null);
    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not fetch profile");
      setAnalytics(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const suggestions = ["torvalds","diegoperea20"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — 56px rule, editorial */}
      <header className="sticky top-0 z-40 backdrop-blur-[12px] bg-white/85 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="https://github.com/diegoperea20/GitHub-Profile-Analytics" target="_blank" rel="noopener noreferrer" className="w-8 h-8 grid place-items-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0">
              <GithubIcon className="w-[18px] h-[18px]" />
            </a>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-[14px] font-semibold tracking-[-0.015em] leading-none text-zinc-900 dark:text-white">GitHub Profile Analytics</h1>
               
              </div>
             
            </div>
          </div>
          <a href="https://github.com/diegoperea20" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            by Diego Perea →
          </a>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Hero — thesis */}
          <div className="max-w-[720px]">
            
            <h2 className="mt-4 text-[30px] sm:text-[36px] font-semibold tracking-[-0.03em] leading-[0.95] text-zinc-900 dark:text-white">
              Analyze any
              <br />
              <span className="font-mono font-medium tracking-[-0.04em] text-zinc-500 dark:text-zinc-400">GitHub profile</span> in seconds.
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-zinc-600 dark:text-zinc-400 max-w-[560px]">
              Not a generic dashboard. A technical dossier: weighted languages, topics, and repositories as artifacts  built from live GitHub data.
            </p>
          </div>

          {/* Search — command palette */}
          <SectionCard className="mt-7 p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors">
                  <SearchIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GitHub username — e.g. torvalds"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full h-11 pl-10 pr-28 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                />
                <span className="hidden sm:inline-flex absolute right-1.5 top-1.5 bottom-1.5 items-center gap-1 px-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono text-zinc-500">
                  ↵ Enter
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 text-white text-[13px] font-semibold tracking-[-0.01em] hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                style={loading ? { background: "#18181b", color: "#ffffff" } as React.CSSProperties : { background: "linear-gradient(135deg,#2563eb 0%,#9333ea 100%)", color: "#ffffff" } as React.CSSProperties}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    <span className="text-white">Analyzing…</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Analyze <span className="hidden sm:inline">profile</span> <span aria-hidden>→</span></span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono tracking-[0.08em] text-zinc-400">TRY</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setUsername(s)}
                  className="text-[12px] font-mono px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </SectionCard>

          {error && (
            <div className="mt-4 rounded-xl border-l-[3px] border-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-[13px] leading-5 text-red-800 dark:text-red-200">
              <span className="font-semibold">Failed to load:</span> {error}
            </div>
          )}

          {/* Empty state */}
          {!analytics && !error && !loading && (
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-[13px]">
              {[
                { k: "Languages", v: "Real distribution by repository count, not estimated bytes. Spine + per-language detail." },
                { k: "Topics", v: "Recurring themes extracted from repository topics — the vocabulary of the profile." },
                { k: "Activity", v: "Score 0–100 based on stars, repositories, commits and followers. Objective and auditable." },
              ].map((c) => (
                <div key={c.k} className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                  <div className="text-[11px] font-mono tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{c.k.toUpperCase()}</div>
                  <div className="mt-1.5 leading-5 text-zinc-600 dark:text-zinc-400">{c.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Dashboard */}
          {analytics && (
            <div className="mt-8 space-y-6 animate-in">
              {/* Profile dossier */}
              <SectionCard className="p-5 sm:p-6">
                <Eyebrow>PROFILE — DOSSIER</Eyebrow>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                    <Image
                      src={analytics.user.avatar_url}
                      alt={analytics.user.login}
                      width={88}
                      height={88}
                      className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-white leading-none">
                          {analytics.user.name || analytics.user.login}
                        </h3>
                        <a href={analytics.user.html_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 grid place-items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                        <span className="text-[12px] font-mono px-2 py-1 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">@{analytics.user.login}</span>
                      </div>
                      {analytics.user.bio && <p className="mt-2 text-[13.5px] leading-6 text-zinc-600 dark:text-zinc-300 max-w-[560px]">{analytics.user.bio}</p>}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-mono text-zinc-500 dark:text-zinc-400">
                        {analytics.user.location && <span className="inline-flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-zinc-400" />{analytics.user.location}</span>}
                        {analytics.user.company && <span className="inline-flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-zinc-400" />{analytics.user.company}</span>}
                        {analytics.user.blog && (
                          <a href={analytics.user.blog.startsWith("http") ? analytics.user.blog : `https://${analytics.user.blog}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 underline-offset-4">website</a>
                        )}
                        {analytics.user.twitter_username && (
                          <a href={`https://twitter.com/${analytics.user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100">@{analytics.user.twitter_username}</a>
                        )}
                        <span className="inline-flex items-center gap-1.5">{analytics.user.followers.toLocaleString()} followers · {analytics.user.following.toLocaleString()} following</span>
                      </div>
                      <div className="mt-2 text-[11px] font-mono tracking-[0.06em] text-zinc-400">
                        MEMBER SINCE {new Date(analytics.accountAge.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })} · {analytics.accountAge.years}y {analytics.accountAge.months}m
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-[280px] shrink-0 flex lg:flex-col items-center lg:items-center gap-5 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-800 lg:pl-6 py-2">
                    <ActivityDial score={analytics.activityScore} />
                    <div className="text-left lg:text-center">
                      <div className="text-[11px] font-mono tracking-[0.14em] text-zinc-500 dark:text-zinc-400">ACTIVITY SCORE</div>
                      <div className="text-[12px] leading-5 text-zinc-600 dark:text-zinc-400 mt-1 max-w-[200px]">
                        Weighted percentile across stars, volume and community. {analytics.activityScore >= 80 ? "Highly active profile." : analytics.activityScore >= 60 ? "Solid activity." : "Growing."}
                      </div>
                      <div className="mt-2 inline-flex text-[11px] font-mono px-2 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {analytics.totalStars.toLocaleString()} ★ · {analytics.totalRepos} repos
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Metric strip — primary */}
              <SectionCard className="overflow-hidden">
                <div className="px-5 sm:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono tracking-[0.14em] text-zinc-500 dark:text-zinc-400">METRICS — OVERVIEW</span>
                  <span className="text-[11px] font-mono text-zinc-400">{analytics.totalWatchers.toLocaleString()} watchers · {analytics.totalOpenIssues.toLocaleString()} open issues</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-zinc-200 dark:divide-zinc-800">
                  <MetricCell label="REPOSITORIES" value={analytics.totalRepos} sub={`${analytics.user.public_gists} gists`} icon={<RepoIcon />} />
                  <MetricCell label="TOTAL STARS" value={analytics.totalStars.toLocaleString()} sub={`~${analytics.repoStats.averageStars} / repo`} icon={<StarIcon />} />
                  <MetricCell label="TOTAL FORKS" value={analytics.totalForks.toLocaleString()} sub={`~${analytics.repoStats.averageForks} / repo`} icon={<ForkIcon />} />
                  <MetricCell label="FOLLOWERS" value={analytics.user.followers.toLocaleString()} sub={`${analytics.user.following.toLocaleString()} following`} icon={<UsersIcon />} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
                  <MetricCell label="FOLLOWING" value={analytics.user.following.toLocaleString()} icon={<UsersIcon />} />
                  <MetricCell label="OPEN ISSUES" value={analytics.totalOpenIssues.toLocaleString()} icon={<span className="w-2 h-2 rounded-full bg-amber-500" />} />
                  <MetricCell label="DIVERSITY" value={`${analytics.languageDiversity}%`} sub={`${analytics.topLanguages.length} languages`} icon={<ChartIcon />} />
                  <MetricCell label="ACCOUNT AGE" value={`${analytics.accountAge.years}y ${analytics.accountAge.months}m`} sub={`Since ${new Date(analytics.accountAge.createdAt).getFullYear()}`} icon={<CalendarIcon />} />
                </div>
              </SectionCard>

              {/* Commit history — KPIs only, no chart */}
              <SectionCard className="p-5 sm:p-6">
                <Eyebrow
                  action={
                    <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300">
                      estimated · sampling top 30 repos
                    </span>
                  }
                >
                  COMMIT HISTORY
                </Eyebrow>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total estimated", value: analytics.commitStats.estimatedTotalCommits.toLocaleString() },
                    { label: "Per day", value: analytics.commitStats.averageCommitsPerDay },
                    { label: "Per month", value: analytics.commitStats.averageCommitsPerMonth },
                    { label: "Per year", value: analytics.commitStats.averageCommitsPerYear },
                  ].map((k) => (
                    <div key={k.label} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 px-3 py-3">
                      <div className="text-[11px] font-mono tracking-[0.08em] text-zinc-500 dark:text-zinc-400">{k.label.toUpperCase()}</div>
                      <div className="text-[18px] font-semibold tabular tracking-[-0.02em] text-zinc-900 dark:text-white mt-1">{k.value}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-mono leading-4 text-zinc-500 dark:text-zinc-400">
                  Annual distribution derived from contributors + commit_activity. If the API does not expose history, values are interpolated and weighted by account age.
                </p>
              </SectionCard>

              {/* Languages */}
              <div className="grid lg:grid-cols-2 gap-6">
                {[
                  { title: "Top languages — all repositories", items: analytics.topLanguages, icon: <ChartIcon /> },
                  { title: "Recent focus — last 10 repositories", items: analytics.recentLanguages, icon: <CommitIcon /> },
                ].map((col) => (
                  <SectionCard key={col.title} className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 grid place-items-center rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"><span className="scale-75">{col.icon}</span></span>
                      <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-zinc-900 dark:text-white">{col.title}</h3>
                    </div>
                    {col.items.length > 0 ? (
                      <>
                        <LanguageSpine items={col.items} />
                        <div className="mt-4">
                          {col.items.map((l) => (
                            <LanguageRow key={l.language} language={l.language} percentage={l.percentage} count={l.count} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">No language data</p>
                    )}
                  </SectionCard>
                ))}
              </div>

              {/* Topics */}
              {analytics.topTopics.length > 0 && (
                <SectionCard className="p-5 sm:p-6">
                  <Eyebrow>TOPICS — RECURRING THEMES</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topTopics.map((t) => (
                      <span key={t.topic} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[12px] font-mono font-medium text-zinc-700 dark:text-zinc-200 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                        #{t.topic}
                        <span className="min-w-5 h-5 grid place-items-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] px-1.5">{t.count}</span>
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Highlights */}
              <div className="grid lg:grid-cols-2 gap-6">
                {analytics.repoStats.mostStarred && (
                  <SectionCard className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 grid place-items-center rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><StarIcon className="w-3.5 h-3.5" /></span>
                      <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">Most starred</h3>
                    </div>
                    <RepoArtifact repo={analytics.repoStats.mostStarred} />
                  </SectionCard>
                )}
                {analytics.repoStats.mostForked && (
                  <SectionCard className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 grid place-items-center rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800"><ForkIcon className="w-3.5 h-3.5" /></span>
                      <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">Most forked</h3>
                    </div>
                    <RepoArtifact repo={analytics.repoStats.mostForked} />
                  </SectionCard>
                )}
              </div>

              {/* Recently active */}
              <SectionCard className="p-5 sm:p-6">
                <Eyebrow action={<span className="text-[11px] font-mono text-zinc-400">sorted: pushed_at ↓</span>}>RECENT ACTIVITY</Eyebrow>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.repoStats.recentlyActive.map((r) => (
                    <RepoArtifact key={r.id} repo={r} />
                  ))}
                </div>
              </SectionCard>

              {/* Footprint + timeline */}
              <div className="grid lg:grid-cols-3 gap-6">
                <SectionCard className="p-5 sm:p-6 lg:col-span-1">
                  <h3 className="text-[12px] font-mono tracking-[0.1em] text-zinc-500 dark:text-zinc-400 mb-4">FOOTPRINT — AVERAGES</h3>
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-400">Stars / repo</span>
                      <span className="text-[16px] font-semibold tabular text-zinc-900 dark:text-white">{analytics.repoStats.averageStars}</span>
                    </div>
                    <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-400">Forks / repo</span>
                      <span className="text-[16px] font-semibold tabular text-zinc-900 dark:text-white">{analytics.repoStats.averageForks}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-400">Avg. size</span>
                      <span className="text-[16px] font-semibold tabular text-zinc-900 dark:text-white">{analytics.repoStats.averageSize} KB</span>
                    </div>
                  </div>
                </SectionCard>

                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                  {analytics.repoStats.oldest && (
                    <SectionCard className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[11px] font-mono tracking-[0.1em] text-zinc-500 dark:text-zinc-400">FIRST REPOSITORY</span>
                      </div>
                      <RepoArtifact repo={analytics.repoStats.oldest} />
                      <div className="mt-2 text-[11px] font-mono text-zinc-400">Created on {new Date(analytics.repoStats.oldest.created_at).toLocaleDateString("en-US")}</div>
                    </SectionCard>
                  )}
                  {analytics.repoStats.newest && (
                    <SectionCard className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CommitIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[11px] font-mono tracking-[0.1em] text-zinc-500 dark:text-zinc-400">LATEST REPOSITORY</span>
                      </div>
                      <RepoArtifact repo={analytics.repoStats.newest} />
                      <div className="mt-2 text-[11px] font-mono text-zinc-400">Created on {new Date(analytics.repoStats.newest.created_at).toLocaleDateString("en-US")}</div>
                    </SectionCard>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between gap-4">
          <a href="https://github.com/diegoperea20" target="_blank" rel="noopener noreferrer" className="text-[12px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Created by <span className="font-semibold text-zinc-700 dark:text-zinc-200">Diego Ivan Perea Montealegre</span>
          </a>
          <span className="hidden sm:inline text-[11px] font-mono text-zinc-400">Data via GitHub REST API</span>
        </div>
      </footer>
    </div>
  );
}
