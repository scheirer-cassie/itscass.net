// Every content/updates/YYYY-MM-DD-slug.md gets these defaults.
// URL = /updates/YYYY-MM-DD-slug/ ; the path header shows the .md file name.
// (inputPath, not filePathStem: Eleventy drops a leading YYYY-MM-DD- from the stem)
const base = (data) => data.page.inputPath.split("/").pop().replace(/\.md$/, "");

export default {
  layout: "post.njk",
  cdup: "/updates/",
  eleventyComputed: {
    fileName: (data) => base(data) + ".md",
    permalink: (data) => `/updates/${base(data)}/`,
    pathbar: (data) => `~/updates/${base(data)}.md`,
  },
};
