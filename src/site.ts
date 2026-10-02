// Everything personal that appears in more than one place lives here.

export const site = {
  name: "Labdhi Shah",
  description:
    "Labdhi Shah — AI & Data Science, Mumbai. I'm interested in what happens after you call the model: grounding, evaluation, and the checks around it.",
  email: "labdhishah.proffesional@gmail.com",
  github: "https://github.com/labdhishahp",
  linkedin: "https://www.linkedin.com/in/labdhishahsp/",
  // Served from /public. Replace public/resume.pdf with the final résumé.
  resume: "resume.pdf",
};

export const nav = [
  { label: "Journey", path: "journey/", key: "journey" },
  { label: "Work", path: "work/", key: "work" },
  { label: "Writing", path: "writing/", key: "writing" },
] as const;

/** Prefix an internal path with the deployment base (/PORTFOLIO). */
export function url(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
