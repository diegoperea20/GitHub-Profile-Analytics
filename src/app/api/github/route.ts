import { NextRequest, NextResponse } from "next/server";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
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
  size: number;
  default_branch: string;
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface CommitActivity {
  total: number;
  week: number;
  days: number[];
}

interface Contributor {
  login: string;
  contributions: number;
}

interface LanguageStats {
  [language: string]: number;
}

interface TopicStats {
  [topic: string]: number;
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

async function fetchGitHub<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Profile-Analytics",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  try {
    // Fetch user data
    const user: GitHubUser = await fetchGitHub(
      `https://api.github.com/users/${username}`,
    );

    // Fetch all repositories
    let allRepos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const repos: GitHubRepo[] = await fetchGitHub(
        `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      );

      if (repos.length === 0) break;
      allRepos = [...allRepos, ...repos];

      if (repos.length < perPage) break;
      page++;
    }

    // Calculate statistics
    const totalStars = allRepos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0,
    );
    const totalForks = allRepos.reduce(
      (sum, repo) => sum + repo.forks_count,
      0,
    );
    const totalWatchers = allRepos.reduce(
      (sum, repo) => sum + repo.watchers_count,
      0,
    );
    const totalOpenIssues = allRepos.reduce(
      (sum, repo) => sum + repo.open_issues_count,
      0,
    );

    // Language statistics (all repos)
    const languageStats: LanguageStats = {};
    allRepos.forEach((repo) => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    });

    const totalLanguageCount = Object.values(languageStats).reduce(
      (a, b) => a + b,
      0,
    );
    const topLanguages = Object.entries(languageStats)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / totalLanguageCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Language statistics (recent 10 repos)
    const recentRepos = allRepos.slice(0, 10);
    const recentLanguageStats: LanguageStats = {};
    recentRepos.forEach((repo) => {
      if (repo.language) {
        recentLanguageStats[repo.language] =
          (recentLanguageStats[repo.language] || 0) + 1;
      }
    });

    const recentTotalLanguageCount = Object.values(recentLanguageStats).reduce(
      (a, b) => a + b,
      0,
    );
    const recentLanguages = Object.entries(recentLanguageStats)
      .map(([language, count]) => ({
        language,
        count,
        percentage:
          recentTotalLanguageCount > 0
            ? Math.round((count / recentTotalLanguageCount) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Topic statistics
    const topicStats: TopicStats = {};
    allRepos.forEach((repo) => {
      repo.topics?.forEach((topic) => {
        topicStats[topic] = (topicStats[topic] || 0) + 1;
      });
    });

    const topTopics = Object.entries(topicStats)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Fetch commit activity using contributors endpoint (more reliable)
    let totalCommits = 0;
    const commitsByYear: { [year: number]: number } = {};

    // Only fetch commit data for top 30 repos by stars to avoid rate limiting
    const topReposByStars = [...allRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 30);

    for (const repo of topReposByStars) {
      try {
        // Use contributors endpoint - more reliable than commit_activity
        const contributors: Contributor[] = await fetchGitHub(
          `https://api.github.com/repos/${repo.full_name}/contributors?per_page=100`,
        );

        if (contributors && Array.isArray(contributors)) {
          // Sum contributions from all contributors
          contributors.forEach((contributor) => {
            totalCommits += contributor.contributions;
          });
        }

        // Also try to get commit activity for yearly breakdown
        try {
          const activity: CommitActivity[] = await fetchGitHub(
            `https://api.github.com/repos/${repo.full_name}/stats/commit_activity`,
          );

          if (activity && Array.isArray(activity)) {
            activity.forEach((week) => {
              const year = new Date(week.week * 1000).getFullYear();
              commitsByYear[year] = (commitsByYear[year] || 0) + week.total;
            });
          }
        } catch {
          // Skip yearly stats if not available
        }
      } catch {
        // Skip if contributors not available
      }
    }

    // Calculate account age FIRST (needed for commits calculation)
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const ageDiff = now.getTime() - createdAt.getTime();
    const accountAgeDays = Math.floor(ageDiff / (1000 * 60 * 60 * 24));
    const accountAgeYears = Math.floor(accountAgeDays / 365);
    const accountAgeMonths = Math.floor((accountAgeDays % 365) / 30);
    const remainingDays = accountAgeDays % 30;

    // Estimate total commits based on sampled repos
    const sampledRepos = topReposByStars.length;
    const estimatedTotalCommits =
      sampledRepos > 0
        ? Math.round(totalCommits * (allRepos.length / sampledRepos))
        : totalCommits;

    // Calculate commits by year - if API data is insufficient, estimate based on total
    let commitsByYearArray: { year: number; count: number }[] = [];

    if (Object.keys(commitsByYear).length > 0) {
      // Use actual data from API
      commitsByYearArray = Object.entries(commitsByYear)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);
    } else if (estimatedTotalCommits > 0) {
      // Estimate distribution by year based on account age and activity
      const startYear = createdAt.getFullYear();
      const currentYear = now.getFullYear();
      const yearsActive = currentYear - startYear + 1;

      // Create an estimated distribution
      // Earlier years typically have fewer commits, recent years more
      for (let year = startYear; year <= currentYear; year++) {
        const yearIndex = year - startYear;
        // Weight: earlier years get less, recent years get more
        const weight =
          (yearIndex + 1) / ((yearsActive * (yearsActive + 1)) / 2);
        const yearEstimate = Math.round(estimatedTotalCommits * weight);
        commitsByYearArray.push({ year, count: yearEstimate });
      }
    }

    // Ensure we have entries for recent years even if empty
    const currentYear = now.getFullYear();
    const recentYears = [currentYear - 1, currentYear];
    for (const year of recentYears) {
      if (!commitsByYearArray.find((y) => y.year === year)) {
        commitsByYearArray.push({ year, count: 0 });
      }
    }

    // Sort and remove empty years at the beginning
    commitsByYearArray = commitsByYearArray
      .filter((y) => y.count > 0 || y.year >= currentYear - 1)
      .sort((a, b) => a.year - b.year);

    // Calculate averages
    const totalDays = accountAgeDays || 1;
    const totalWeeks = Math.max(1, Math.floor(totalDays / 7));
    const totalMonths = Math.max(1, Math.floor(totalDays / 30));
    const totalYears = Math.max(1, accountAgeYears + accountAgeMonths / 12);

    const averageCommitsPerDay =
      Math.round((estimatedTotalCommits / totalDays) * 100) / 100;
    const averageCommitsPerWeek =
      Math.round((estimatedTotalCommits / totalWeeks) * 100) / 100;
    const averageCommitsPerMonth =
      Math.round((estimatedTotalCommits / totalMonths) * 100) / 100;
    const averageCommitsPerYear =
      Math.round((estimatedTotalCommits / totalYears) * 100) / 100;

    const averageStars =
      allRepos.length > 0
        ? Math.round((totalStars / allRepos.length) * 100) / 100
        : 0;
    const averageForks =
      allRepos.length > 0
        ? Math.round((totalForks / allRepos.length) * 100) / 100
        : 0;
    const averageSize =
      allRepos.length > 0
        ? Math.round(
            (allRepos.reduce((sum, repo) => sum + repo.size, 0) /
              allRepos.length) *
              100,
          ) / 100
        : 0;

    const sortedByStars = [...allRepos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count,
    );
    const sortedByForks = [...allRepos].sort(
      (a, b) => b.forks_count - a.forks_count,
    );
    const sortedByDate = [...allRepos].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const sortedByUpdated = [...allRepos].sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    );

    // Activity score (0-100)
    const starsScore = Math.min(30, totalStars / 10);
    const reposScore = Math.min(30, allRepos.length / 2);
    const commitsScore = Math.min(20, estimatedTotalCommits / 100);
    const followersScore = Math.min(20, user.followers / 10);
    const activityScore = Math.min(
      100,
      Math.round(starsScore + reposScore + commitsScore + followersScore),
    );

    // Language diversity (0-100)
    const uniqueLanguages = Object.keys(languageStats).length;
    const languageDiversity = Math.min(100, uniqueLanguages * 10);

    const analytics: ProfileAnalytics = {
      user,
      totalRepos: allRepos.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalOpenIssues,
      topLanguages,
      recentLanguages,
      topTopics,
      commitStats: {
        estimatedTotalCommits,
        averageCommitsPerDay,
        averageCommitsPerWeek,
        averageCommitsPerMonth,
        averageCommitsPerYear,
        commitsByYear: commitsByYearArray,
      },
      repoStats: {
        averageStars,
        averageForks,
        averageSize,
        mostStarred: sortedByStars[0] || null,
        mostForked: sortedByForks[0] || null,
        recentlyActive: sortedByUpdated.slice(0, 5),
        oldest: sortedByDate[0] || null,
        newest: sortedByDate[sortedByDate.length - 1] || null,
      },
      activityScore,
      languageDiversity,
      accountAge: {
        years: accountAgeYears,
        months: accountAgeMonths,
        days: remainingDays,
        createdAt: user.created_at,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch GitHub data. Please check the username and try again.",
      },
      { status: 500 },
    );
  }
}
