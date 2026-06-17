import express from "express";

const Router = express.Router();
const GITHUB_USERNAME = "omarmohamed-909";

const LANGUAGE_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", HTML: "#e34f26",
  CSS: "#563d7c", Python: "#3572A5", Java: "#b07219",
  Go: "#00ADD8", Rust: "#dea584", C: "#555555", "C++": "#f34b7d",
  "C#": "#178600", Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138",
  Kotlin: "#A97BFF", Dart: "#00B4AB", Lua: "#000080", Scala: "#c22d40",
  Shell: "#89e051", PowerShell: "#012456", R: "#198CE7",
  Dockerfile: "#384d54", Makefile: "#427819",
};

const FALLBACK = {
  stars: 5, streak: 4, commits: 42, repos: 14, contributions: 60,
  languages: [
    { name: "TypeScript", percentage: 62, color: "#3178c6" },
    { name: "JavaScript", percentage: 24, color: "#f7df1e" },
    { name: "HTML",        percentage: 7,  color: "#e34f26" },
    { name: "CSS",         percentage: 7,  color: "#563d7c" },
  ],
};

const currentYear = new Date().getFullYear();
const GRAPHQL_QUERY = `query {
  user(login: "${GITHUB_USERNAME}") {
    contributionsCollection(
      from: "${currentYear}-01-01T00:00:00Z"
      to: "${currentYear}-12-31T23:59:59Z"
    ) {
      totalCommitContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

Router.get("/home/github/stats", async (req, res) => {
  if (!process.env.GITHUB_TOKEN) {
    console.warn("⚠️  GITHUB_TOKEN missing from .env — returning fallback GitHub stats");
    return res.json(FALLBACK);
  }

  try {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "portfolio-app",
    };

    const [userRes, reposRes, gqlRes] = await Promise.all([
      fetch("https://api.github.com/user", { headers }),
      fetch("https://api.github.com/user/repos?per_page=100&type=all", { headers }),
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ query: GRAPHQL_QUERY }),
      }),
    ]);

    if (!userRes.ok || !reposRes.ok || !gqlRes.ok) {
      console.error("❌ GitHub API returned non-OK status", {
        user: userRes.status,
        repos: reposRes.status,
        gql: gqlRes.status,
      });
      return res.json(FALLBACK);
    }

    const userData = await userRes.json();
    const reposData = await reposRes.json();
    const gqlBody = await gqlRes.json();

    if (gqlBody.errors || !gqlBody.data?.user?.contributionsCollection) {
      console.error("❌ GraphQL returned errors", gqlBody.errors);
      return res.json(FALLBACK);
    }

    const cc = gqlBody.data.user.contributionsCollection;
    const repos = Array.isArray(reposData) ? reposData : [];

    const stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const allDays = (cc.contributionCalendar?.weeks || [])
      .flatMap(w => w.contributionDays || [])
      .filter(d => d.contributionCount > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    let streak = 0;
    if (allDays.length > 0) {
      let currentRun = 1;
      for (let i = 1; i < allDays.length; i++) {
        const curr = new Date(allDays[i].date);
        const prev = new Date(allDays[i - 1].date);
        const diff = Math.round((curr - prev) / 86400000);
        if (diff === 1) currentRun++;
        else {
          if (currentRun > streak) streak = currentRun;
          currentRun = 1;
        }
      }
      if (currentRun > streak) streak = currentRun;
    }

    const langCount = {};
    repos.forEach(r => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const totalLang = Object.values(langCount).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        percentage: totalLang ? Math.round((count / totalLang) * 100) : 0,
        color: LANGUAGE_COLORS[name] || "#6b7280",
      }));

    return res.json({
      stars,
      streak,
      commits: cc.totalCommitContributions || 0,
      repos: (userData.public_repos || 0) + (userData.total_private_repos || 0),
      contributions: cc.contributionCalendar?.totalContributions || 0,
      languages,
    });
  } catch (error) {
    console.error("❌ GitHub stats fetch failed:", error.message);
    return res.json(FALLBACK);
  }
});

export default Router;
