"use client";

import { useState } from "react";
import Image from "next/image";

// Types
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
  accountAge: {
    years: number;
    months: number;
    days: number;
    createdAt: string;
  };
}

// Language colors
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

// Icons
const GithubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ForkIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5 2a2 2 0 00-2 2v2.5a.5.5 0 001 0V4a1 1 0 011-1h8a1 1 0 011 1v2.5a.5.5 0 001 0V4a2 2 0 00-2-2H5zm8 10a2 2 0 100-4 2 2 0 000 4zm0 1a3 3 0 001-5.83V6a1 1 0 10-2 0v1.17A3.001 3.001 0 0113 13zm-8-2a2 2 0 11-4 0 2 2 0 014 0zm0 1a3.001 3.001 0 01-2.83-2H1a1 1 0 100 2h1.17A3.001 3.001 0 005 12zm0-6a2 2 0 100-4 2 2 0 000 4z"
      clipRule="evenodd"
    />
  </svg>
);

const RepoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 4.75A2.75 2.75 0 014.75 2h10.5a.75.75 0 01.75.75v14.5a.75.75 0 01-.75.75H4.75A2.75 2.75 0 012 15.25V4.75zM4.75 3.5A1.25 1.25 0 003.5 4.75v10.5c0 .69.56 1.25 1.25 1.25h9.75V3.5H4.75z" />
  </svg>
);

const CommitIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 2a3 3 0 10-2.83 4h-.007A3.001 3.001 0 0010 9.83V18a1 1 0 102 0V9.83A3.001 3.001 0 0012.837 6h-.006A3 3 0 0010 2zm0 4a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
      clipRule="evenodd"
    />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

const FireIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.616-.604 1.306-.814 2.024-.168.627-.27 1.283-.314 1.948a11.924 11.924 0 00-.14 2.59c.1 1.358.39 2.485.815 3.412.24.52.502.966.78 1.334.27.365.56.668.855.933.293.264.587.486.873.68.32.21.632.38.927.52.3.14.59.25.86.32a4.4 4.4 0 001.46.1c.41-.05.82-.15 1.22-.27.4-.13.78-.29 1.15-.49.37-.2.72-.43 1.06-.68.34-.26.66-.54.96-.84.3-.3.58-.62.83-.96.25-.34.48-.69.68-1.05.2-.36.36-.74.49-1.12.13-.38.22-.77.27-1.16.05-.4.0-.8-.1-1.2-.1-.4-.2-.8-.3-1.18-.1-.38-.2-.75-.3-1.1-.1-.36-.2-.7-.3-1.02-.1-.32-.2-.62-.3-.9-.1-.28-.2-.54-.3-.78-.1-.24-.2-.46-.3-.66-.1-.2-.2-.38-.3-.54-.1-.16-.2-.3-.3-.42-.1-.12-.2-.22-.3-.3-.1-.08-.2-.14-.3-.18-.1-.04-.2-.06-.3-.06s-.2.02-.3.06c-.1.04-.2.1-.3.18-.1.08-.2.18-.3.3-.1.12-.2.26-.3.42-.1.16-.2.34-.3.54-.1.2-.2.42-.3.66-.1.24-.2.5-.3.78-.1.28-.2.58-.3.9-.1.32-.2.66-.3 1.02-.1.35-.2.72-.3 1.1-.1.38-.2.78-.3 1.18-.1.4-.15.8-.1 1.2.05.39.14.78.27 1.16.13.38.29.76.49 1.12.2.36.43.71.68 1.05.25.34.53.66.83.96.3.3.62.58.96.84.34.25.69.48 1.06.68.37.2.75.36 1.15.49.4.12.81.22 1.22.27a4.4 4.4 0 001.46-.1c.27-.07.56-.18.86-.32.295-.14.607-.31.927-.52.286-.194.58-.416.873-.68.295-.265.585-.568.855-.933.28-.368.54-.814.78-1.334.425-.927.715-2.054.815-3.412a11.924 11.924 0 00-.14-2.59c-.044-.665-.146-1.321-.314-1.948-.21-.718-.48-1.408-.814-2.024-.167-.403-.356-.786-.57-1.116-.208-.322-.477-.65-.822-.88a1 1 0 00-1.45.385z"
      clipRule="evenodd"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Components
function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function LanguageBar({
  language,
  percentage,
  count,
}: {
  language: string;
  percentage: number;
  count: number;
}) {
  const color = languageColors[language] || languageColors.default;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          ></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {count} repos ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}

function TopicBadge({ topic, count }: { topic: string; count: number }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white mr-2 mb-2">
      {topic}{" "}
      <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    </span>
  );
}

function ActivityScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke={getColor(score)}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute mt-8">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {score}
        </span>
      </div>
    </div>
  );
}

function CommitsChart({
  commitsByYear,
}: {
  commitsByYear: { year: number; count: number }[];
}) {
  const maxCount = Math.max(...commitsByYear.map((c) => c.count), 1);

  return (
    <div className="flex items-end justify-between h-40 gap-2">
      {commitsByYear.slice(-10).map(({ year, count }) => (
        <div key={year} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
            style={{
              height: `${(count / maxCount) * 100}%`,
              minHeight: count > 0 ? "8px" : "0",
            }}
          ></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {year}
          </span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
    >
      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
        {repo.name}
      </h4>
      {repo.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {repo.description}
        </p>
      )}
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  languageColors[repo.language] || languageColors.default,
              }}
            ></span>
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <StarIcon /> {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <ForkIcon /> {repo.forks_count}
        </span>
      </div>
    </a>
  );
}

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
      const response = await fetch(
        `/api/github?username=${encodeURIComponent(username)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }

      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-gray-900">
                <a href="https://github.com/diegoperea20/GitHub-Profile-Analytics" target="_blank" rel="noopener noreferrer">
                  <GithubIcon  />
                </a>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  GitHub Profile Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analyze any GitHub profile in depth
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username (e.g., torvalds, gaearon, sindresorhus)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SearchIcon />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="mt-8 space-y-8">
            {/* User Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Image
                  src={analytics.user.avatar_url}
                  alt={analytics.user.login}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.user.name || analytics.user.login}
                    </h2>
                    <a
                      href={analytics.user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <GithubIcon />
                    </a>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{analytics.user.login}
                  </p>
                  {analytics.user.bio && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {analytics.user.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {analytics.user.location && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {analytics.user.location}
                      </span>
                    )}
                    {analytics.user.company && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3-1h1v1H7V3zm1 3H7v1h1V6zm0 3H7v1h1V9zm0 3H7v1h1v-1zm3-6h-1v1h1V6zm0 3h-1v1h1V9zm0 3h-1v1h1v-1zm3-6h-1v1h1V6zm0 3h-1v1h1V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {analytics.user.company}
                      </span>
                    )}
                    {analytics.user.blog && (
                      <a
                        href={
                          analytics.user.blog.startsWith("http")
                            ? analytics.user.blog
                            : `https://${analytics.user.blog}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-500"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.235A7.009 7.009 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.235A7.009 7.009 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.497.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.235c.454-1.265.748-2.689.837-4.235h1.946a7.009 7.009 0 01-2.783 4.235zm-6.268 0c-.454-1.265-.748-2.689-.837-4.235H4.083a7.009 7.009 0 002.783 4.235z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Website
                      </a>
                    )}
                    {analytics.user.twitter_username && (
                      <a
                        href={`https://twitter.com/${analytics.user.twitter_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-400"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        @{analytics.user.twitter_username}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ActivityScoreCircle score={analytics.activityScore} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Activity Score
                  </p>
                </div>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Repositories"
                value={analytics.totalRepos}
                icon={<RepoIcon />}
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                title="Total Stars"
                value={analytics.totalStars.toLocaleString()}
                icon={<StarIcon />}
                color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
              />
              <StatCard
                title="Total Forks"
                value={analytics.totalForks.toLocaleString()}
                icon={<ForkIcon />}
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <StatCard
                title="Followers"
                value={analytics.user.followers.toLocaleString()}
                icon={<UsersIcon />}
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Following"
                value={analytics.user.following.toLocaleString()}
                icon={<UsersIcon />}
                color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              />
              <StatCard
                title="Open Issues"
                value={analytics.totalOpenIssues.toLocaleString()}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                }
                color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              />
              <StatCard
                title="Language Diversity"
                value={`${analytics.languageDiversity}%`}
                icon={<ChartIcon />}
                color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                subtitle={`${analytics.topLanguages.length} languages`}
              />
              <StatCard
                title="Account Age"
                value={`${analytics.accountAge.years}y ${analytics.accountAge.months}m`}
                icon={<CalendarIcon />}
                color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                subtitle={`Since ${new Date(analytics.accountAge.createdAt).getFullYear()}`}
              />
            </div>

            {/* Commit Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CommitIcon />
                Commit Statistics (Estimated)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.commitStats.estimatedTotalCommits.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Commits
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.commitStats.averageCommitsPerDay}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Per Day
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.commitStats.averageCommitsPerMonth}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Per Month
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.commitStats.averageCommitsPerYear}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Per Year
                  </p>
                </div>
              </div>

             
            </div>

            {/* Languages Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* All Languages */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ChartIcon />
                  Top Languages (All Repositories)
                </h3>
                <div className="space-y-3">
                  {analytics.topLanguages.map((lang) => (
                    <LanguageBar
                      key={lang.language}
                      language={lang.language}
                      percentage={lang.percentage}
                      count={lang.count}
                    />
                  ))}
                </div>
              </div>

              {/* Recent Languages */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FireIcon />
                  Languages (Last 10 Repositories)
                </h3>
                <div className="space-y-3">
                  {analytics.recentLanguages.length > 0 ? (
                    analytics.recentLanguages.map((lang) => (
                      <LanguageBar
                        key={lang.language}
                        language={lang.language}
                        percentage={lang.percentage}
                        count={lang.count}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No language data available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Topics Section */}
            {analytics.topTopics.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TagIcon />
                  Repository Topics / Themes
                </h3>
                <div className="flex flex-wrap">
                  {analytics.topTopics.map((topic) => (
                    <TopicBadge
                      key={topic.topic}
                      topic={topic.topic}
                      count={topic.count}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Repository Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Starred */}
              {analytics.repoStats.mostStarred && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <StarIcon />
                    Most Starred Repository
                  </h3>
                  <RepoCard repo={analytics.repoStats.mostStarred} />
                </div>
              )}

              {/* Most Forked */}
              {analytics.repoStats.mostForked && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ForkIcon />
                    Most Forked Repository
                  </h3>
                  <RepoCard repo={analytics.repoStats.mostForked} />
                </div>
              )}
            </div>

            {/* Recently Active Repositories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FireIcon />
                Recently Active Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.repoStats.recentlyActive.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            </div>

            {/* Repository Averages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Repository Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.repoStats.averageStars}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Average Stars per Repo
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.repoStats.averageForks}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Average Forks per Repo
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {analytics.repoStats.averageSize} KB
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Average Repo Size
                  </p>
                </div>
              </div>
            </div>

            {/* First & Last Repository */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.repoStats.oldest && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon />
                    First Repository
                  </h3>
                  <RepoCard repo={analytics.repoStats.oldest} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Created{" "}
                    {new Date(
                      analytics.repoStats.oldest.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {analytics.repoStats.newest && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FireIcon />
                    Latest Repository
                  </h3>
                  <RepoCard repo={analytics.repoStats.newest} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Created{" "}
                    {new Date(
                      analytics.repoStats.newest.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <a href="https://github.com/diegoperea20" target="_blank" rel="noopener noreferrer">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Created by <span className="font-semibold">Diego Ivan Perea Montealegre</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
