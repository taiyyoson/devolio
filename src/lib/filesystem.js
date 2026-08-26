import projects from "@/data/projects.json";
import experience from "@/data/experience.json";
import { ABOUT_TEXT } from "@/data/about";
import { CONTACT_TEXT } from "@/data/contact";

const EXPERIENCE_SLUGS = {
  "VGL Research Assistant": "research-assistant",
  "CS Tutor & Teaching Assistant": "cs-tutor",
  "Founding Executive Director": "hack4impact",
  "Embedded Software Engineering Intern": "fastly",
  "Software Developer Intern": "pacxa",
  "B.S. Computer Science": "usfca",
  "M.S. Computer Science (4+1) (currently on LOA)": "usfca"
};

const CONTEXT_LABELS = [
  ["company", "Where"],
  ["team", "Team "],
  ["role", "Role "],
  ["timeline", "When "],
];

function formatProject(p) {
  let text = `${p.title}\n${"=".repeat(p.title.length)}\n\n`;
  text += `${p.description}\n\n`;

  if (p.context) {
    for (const [key, label] of CONTEXT_LABELS) {
      if (p.context[key]) text += `${label}: ${p.context[key]}\n`;
    }
    text += "\n";
  }

  if (p.problem) text += `PROBLEM\n${p.problem}\n\n`;
  if (p.solution) text += `SOLUTION\n${p.solution}\n\n`;
  if (p.longDescription) text += `OVERVIEW\n${p.longDescription}\n\n`;
  if (p.impact?.length) {
    text += "IMPACT\n";
    for (const item of p.impact) text += `  - ${item}\n`;
    text += "\n";
  }

  text += `Tags: ${p.tags.join(", ")}\n`;
  if (p.github) text += `GitHub: ${p.github}\n`;
  if (p.live) text += `Live:   ${p.live}\n`;
  return text;
}

function formatExperience(e) {
  let text = `${e.role}\n${"=".repeat(e.role.length)}\n`;
  text += `${e.company} — ${e.location}\n`;
  const start = e.startDate || "?";
  const end = e.endDate || "Present";
  text += `${start} to ${end}\n\n`;
  text += `${e.description}\n\n`;
  text += `Tags: ${e.tags.join(", ")}\n`;
  return text;
}

const PUBLICATION_CONTENT = `Nala: An AI Health Coaching Chatbot
====================================

Coauthored publication entry submitted to ACM CHI 2026.

Nala is an intelligent health coaching assistant combining RAG-based
conversational AI with evidence-based wellness coaching. It guides users
through a structured 4-week wellness program for stress management and
habit building.

Architecture: React Native frontend, FastAPI backend with PostgreSQL,
RAG pipeline using pgvector for semantic search over a curated coaching
example database.

Tags: AI, HCI, RAG, Health Tech, CHI 2026
`;

export function buildFileSystem() {
  const projectChildren = {};
  for (const p of projects) {
    projectChildren[p.slug] = {
      type: "directory",
      children: {
        "README.md": { type: "file", content: formatProject(p) },
      },
    };
  }

  const experienceChildren = {};
  for (const e of experience) {
    const slug = EXPERIENCE_SLUGS[e.role] || e.role.toLowerCase().replace(/\s+/g, "-");
    experienceChildren[slug] = {
      type: "directory",
      children: {
        "README.md": { type: "file", content: formatExperience(e) },
      },
    };
  }

  return {
    type: "directory",
    children: {
      "about.txt": { type: "file", content: ABOUT_TEXT },
      "contact.txt": { type: "file", content: CONTACT_TEXT },
      projects: { type: "directory", children: projectChildren },
      experience: { type: "directory", children: experienceChildren },
      publications: {
        type: "directory",
        children: {
          "nala-chi-2026": {
            type: "directory",
            children: {
              "README.md": { type: "file", content: PUBLICATION_CONTENT },
            },
          },
        },
      },
    },
  };
}
