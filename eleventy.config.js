import fs from "node:fs";
import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const site = JSON.parse(fs.readFileSync("./_data/site.json", "utf8"));

// ---- helpers -------------------------------------------------------------
// path slugs: lowercase, spaces → _      keyword slugs: lowercase, spaces → -
const slugify = (s) => String(s ?? "").toLowerCase().trim().replace(/\s+/g, "_");
const kwSlug = (s) => String(s ?? "").toLowerCase().trim().replace(/\s+/g, "-");
const asList = (v) => (v == null || v === "" ? [] : Array.isArray(v) ? v : [v]);

const catIndex = (item) => {
  const i = site.categories.indexOf((item.data.categories || [])[0]);
  return i === -1 ? site.categories.length : i;
};
// default sort: newest start year first, then title
const byNewest = (a, b) =>
  (Number(b.data.start) || 0) - (Number(a.data.start) || 0) ||
  String(a.data.title).localeCompare(String(b.data.title));
const byDateDesc = (a, b) => b.date - a.date || b.inputPath.localeCompare(a.inputPath);

export default function (eleventyConfig) {
  // ---- plugins -----------------------------------------------------------
  eleventyConfig.addPlugin(HtmlBasePlugin); // honours pathPrefix for <username>.github.io/<repo>
  eleventyConfig.addPlugin(pluginRss);
  // Any <img src="/content/..."> in the output is resized and converted to WebP + JPEG.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [480, 960, 1600],
    failOnError: false,
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
    },
  });

  // ---- files -------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" }); // cv.pdf, portrait, CNAME
  eleventyConfig.addPassthroughCopy("src/images"); // uploads from Pages CMS, kept at /src/images/… so social previews can link them
  eleventyConfig.addWatchTarget("src/assets/");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("PLAN.md");

  // ---- collections (all generated from frontmatter) ----------------------
  const projects = (api) => api.getFilteredByGlob(["content/projects/*.md", "content/projects/*/index.md"]);
  eleventyConfig.addCollection("projects", (api) => projects(api).sort(byNewest));
  // nav order: grouped by first category (in site.json order), newest first inside each
  eleventyConfig.addCollection("projectsNav", (api) =>
    projects(api).sort((a, b) => catIndex(a) - catIndex(b) || byNewest(a, b))
  );
  eleventyConfig.addCollection("updates", (api) =>
    api.getFilteredByGlob("content/updates/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("keywords", (api) => {
    const seen = new Map();
    for (const p of projects(api)) {
      for (const k of asList(p.data.keywords)) seen.set(kwSlug(k), k);
    }
    return [...seen.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  });
  eleventyConfig.addCollection("about", (api) => api.getFilteredByGlob("content/about.md"));

  // ---- filters -----------------------------------------------------------
  eleventyConfig.addFilter("slug", slugify);
  eleventyConfig.addFilter("kwslug", kwSlug);
  eleventyConfig.addFilter("aslist", asList);
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  eleventyConfig.addFilter("years", (data) => {
    if (data.years) return data.years;
    const { start, end } = data;
    if (!end || end === "present") return `${start}–now`;
    return String(end) === String(start) ? String(start) : `${start}–${end}`;
  });

  eleventyConfig.addFilter("inCategory", (items, cat) =>
    (items || []).filter((p) => asList(p.data.categories).includes(cat))
  );

  eleventyConfig.addFilter("neighbours", (items, url) => {
    const i = items.findIndex((p) => p.url === url);
    if (i === -1 || items.length < 2) return null;
    return {
      prev: items[(i - 1 + items.length) % items.length],
      next: items[(i + 1) % items.length],
    };
  });

  eleventyConfig.addFilter("indexOfUrl", (items, url) => (items || []).findIndex((p) => p.url === url));

  eleventyConfig.addFilter("projectBySlug", (items, slug) =>
    (items || []).find((p) => p.data.slug === slug)
  );

  eleventyConfig.addFilter("relatedUpdates", (updates, slug) =>
    (updates || []).filter((u) => asList(u.data.project).includes(slug))
  );

  // "~/projects/research/" → [{label:"~/",href:"/"}, {label:"projects/",href:"/projects/"}, {label:"research/"}]
  eleventyConfig.addFilter("crumbs", (str) => {
    const rest = String(str).replace(/^~\//, "");
    const parts = rest.split("/").filter(Boolean);
    const out = [{ label: "~/", href: "/" }];
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1 && !rest.endsWith("/");
      out.push({
        label: isFile ? part : part + "/",
        href: "/" + parts.slice(0, i + 1).join("/") + "/",
      });
    });
    delete out[out.length - 1].href; // current location isn't a link
    return out;
  });

  // Returns a site-root path for an image next to a content file, or null if it doesn't exist yet
  // (templates then draw a grey placeholder instead).
  eleventyConfig.addFilter("imgSrc", (file, inputPath) => {
    if (!file) return null;
    const src = typeof file === "object" ? file.src : file;
    if (!src) return null;
    if (/^https?:/.test(src)) return src;
    // "/src/images/x.jpg" (Pages CMS uploads) is from the project root; anything else is next to the content file
    const full = src.startsWith("/") ? path.join(".", src) : path.join(path.dirname(inputPath), src);
    if (!fs.existsSync(full)) return null;
    return "/" + path.relative(".", full).split(path.sep).join("/");
  });
  eleventyConfig.addFilter("imgAlt", (file, fallback) =>
    (file && typeof file === "object" && file.alt) || fallback || ""
  );

  eleventyConfig.addGlobalData("build", () => {
    const d = new Date();
    return { date: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` };
  });

  return {
    dir: { input: ".", includes: "src/_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
