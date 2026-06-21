import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Backend_Root_Url } from "../config/AdminUrl.js";
import { resolveAssetUrl } from "../lib/assetUrl.js";

const sortFeaturedProjects = (projectsList) => {
  const withOrder = [];
  const withoutOrder = [];
  const usedPositions = new Set();

  projectsList.forEach((project) => {
    const numericOrder = Number(project.FeaturedDisplayOrder);
    const hasValidOrder =
      Number.isFinite(numericOrder) &&
      numericOrder >= 0 &&
      !usedPositions.has(numericOrder);

    if (hasValidOrder) {
      withOrder.push({ ...project, FeaturedDisplayOrder: numericOrder });
      usedPositions.add(numericOrder);
    } else {
      withoutOrder.push(project);
    }
  });

  withOrder.sort((a, b) => a.FeaturedDisplayOrder - b.FeaturedDisplayOrder);
  withoutOrder.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return [...withOrder, ...withoutOrder];
};

const groupArchitectureData = (skills) => {
  const grouped = {};
  const order = [];
  (skills || []).forEach(skill => {
    const cat = skill?.Category;
    const catName = cat?.name?.trim ? cat.name.trim() : (typeof cat === "string" ? cat.trim() : "");
    const catIcon = cat?.icon || "Code2";
    if (!catName) return;
    if (!grouped[catName]) {
      grouped[catName] = { icon: catIcon, items: [] };
      order.push(catName);
    }
    grouped[catName].items.push({ name: skill.SkillName, detail: skill.Detail || "", level: skill.Skill_Level || 0 });
  });
  return order.map(catName => ({ category: catName, icon: grouped[catName].icon, items: grouped[catName].items }));
};

export default function useHomeData() {
  const [MainHomeData, setMainHomeData] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archData, setArchData] = useState([]);
  const [archLoading, setArchLoading] = useState(true);
  const [archError, setArchError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [gitStats, setGitStats] = useState({ stars: 0, streak: 0, commits: 0, repos: 0, contributions: 0, languages: [], loading: true });

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setLoading(true);

      const [homeRes, cvRes, projectsRes, skillsRes, githubRes] = await Promise.allSettled([
        axios.get(`${Backend_Root_Url}/api/home/main/data`),
        axios.get(`${Backend_Root_Url}/api/show/cv/`),
        axios.get(`${Backend_Root_Url}/api/show/projects`),
        axios.get(`${Backend_Root_Url}/api/show/skills`),
        axios.get(`${Backend_Root_Url}/api/home/github/stats`),
      ]);

      if (!isMounted) return;

      if (homeRes.status === "fulfilled") {
        setMainHomeData(homeRes.value.data);
        setError(null);
      } else {
        setError("Failed to load data.");
        setMainHomeData({
          DisplayName: "Developer",
          MainRoles: {
            role1: "Full-Stack Developer",
            role2: "Backend Engineer",
            role3: "Systems Builder",
          },
          TechStack: "MERN · Next.js · TypeScript",
          FocusArea: "Systems Design · Clean Architecture",
          AvailabilityStatus: "Available for hire",
          HomeLogo: "default-logo.png",
        });
      }

      if (cvRes.status === "fulfilled") {
        setCvData(cvRes.value.data);
      } else {
        setCvData(null);
      }

      if (projectsRes.status === "fulfilled") {
        const allProjectsData = Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [];
        const transformed = allProjectsData.map((p) => ({
          _id: p._id,
          Title: p.Title,
          Description: p.Description,
          ShortDescription: p.ShortDescription || p.Description || "",
          Image: p.Image,
          Project_technologies: Array.isArray(p.Project_technologies) ? p.Project_technologies : [],
          ProjectLiveUrl: p.ProjectLiveUrl || "",
          GithubUrl: p.GithubUrl || "",
          Status: p.Project_Status || "",
          Featured: p.Featured === true || p.Featured === "true",
          FeaturedDisplayOrder: p.FeaturedDisplayOrder ?? null,
          createdAt: p.createdAt,
        }));
        setAllProjects(transformed);
        setFeaturedProjects(sortFeaturedProjects(transformed.filter((p) => p.Featured)));
      } else {
        setFeaturedProjects([]);
      }
      setProjectsLoading(false);

      if (skillsRes.status === "fulfilled") {
        const raw = skillsRes.value.data;
        const skillsArray = Array.isArray(raw) ? raw : raw?.SkillsData || raw?.data || raw?.skills || [];
        setArchData(groupArchitectureData(skillsArray));
      } else {
        setArchError("Failed to load architecture data.");
      }
      setArchLoading(false);



      if (githubRes.status === "fulfilled") {
        setGitStats({ ...githubRes.value.data, loading: false });
      } else {
        // API unavailable — show zeroed stats so the UI can hide or indicate unavailability
        // Never show fake fabricated numbers as if they were real
        setGitStats({
          stars: 0, streak: 0, commits: 0, repos: 0, contributions: 0,
          languages: [],
          loading: false,
          unavailable: true,
        });
      }

      setLoading(false);
    };

    loadAll();
    return () => { isMounted = false; };
  }, []);

  const GetRoles = useMemo(() => {
    if (!MainHomeData?.MainRoles) return [];
    return Object.values(MainHomeData.MainRoles);
  }, [MainHomeData?.MainRoles]);

  const githubUrl = useMemo(() => {
    return MainHomeData?.footersociallinks?.FooterSocialLinks?.find(
      (l) => l.SocialIcon === "Github"
    )?.SocialLink || "https://github.com/omarmohamed-909";
  }, [MainHomeData?.footersociallinks?.FooterSocialLinks]);

  const HomeLogo = useMemo(() => {
    return resolveAssetUrl(
      MainHomeData?.HomeLogo,
      `${Backend_Root_Url}/uploads/logo/`
    );
  }, [MainHomeData?.HomeLogo]);

  const handleDownloadCV = async () => {
    if (!cvData?.FindCv?.Cv) return;
    setIsDownloading(true);
    const cvUrl = resolveAssetUrl(
      cvData.FindCv.Cv,
      `${Backend_Root_Url}/uploads/mycv/`
    );
    if (!cvUrl) { setIsDownloading(false); return; }
    try {
      const response = await fetch(cvUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${MainHomeData?.DisplayName || "CV"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      if (cvUrl) window.open(cvUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleProjectView = (project) => setSelectedProject(project);
  const handleCloseModal = () => setSelectedProject(null);

  const handleSkillClick = (skillName) => {
    setSelectedSkill(skillName);
    setIsSkillModalOpen(true);
  };

  const handleSkillModalClose = () => {
    setIsSkillModalOpen(false);
    setSelectedSkill(null);
  };

  const handleSkillProjectClick = (project) => {
    setIsSkillModalOpen(false);
    const fullProject = allProjects.find((p) => p._id === project.id);
    if (fullProject) setSelectedProject(fullProject);
  };

  const getProjectsBySkill = (skillName) => {
    const lowerSkill = skillName.toLowerCase();
    return allProjects.filter((p) =>
      p.Project_technologies?.some((tech) => {
        const lowerTech = tech.toLowerCase();
        return lowerSkill.includes(lowerTech) || lowerTech.includes(lowerSkill);
      })
    ).map((p) => ({
      id: p._id,
      title: p.Title,
      shortDescription: p.ShortDescription,
      technologies: p.Project_technologies,
      status: p.Status,
    }));
  };

  const retryFetch = () => { setError(null); window.location.reload(); };

  return {
    MainHomeData,
    cvData,
    isDownloading,
    featuredProjects,
    projectsLoading,
    projectsError,
    loading,
    error,
    archData,
    archLoading,
    archError,
    allProjects,
    selectedProject,
    selectedSkill,
    isSkillModalOpen,
    gitStats,
    GetRoles,
    githubUrl,
    HomeLogo,
    handleDownloadCV,
    handleProjectView,
    handleCloseModal,
    handleSkillClick,
    handleSkillModalClose,
    handleSkillProjectClick,
    getProjectsBySkill,
    retryFetch,
  };
}
