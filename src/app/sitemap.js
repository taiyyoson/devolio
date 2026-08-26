import { getPosts } from "@/lib/blog";
import { getProjectSlugs } from "@/lib/projects";

const SITE = "https://taiyyoson.com";

export default function sitemap() {
  const posts = getPosts().map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const projects = getProjectSlugs().map((slug) => ({
    url: `${SITE}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: `${SITE}/projects`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...projects,
    { url: `${SITE}/experience`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${SITE}/blog`,
      lastModified: posts[0]?.lastModified ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts,
  ];
}
