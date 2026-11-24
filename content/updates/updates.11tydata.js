// Every content/updates/YYYY-MM-DD_slug.md gets these defaults.
// URL = /updates/YYYY-MM-DD_slug/ ; the path header shows the .md file name.
const base = (data) => data.page.filePathStem.split("/").pop();

export default {
  layout: "post.njk",
  cdup: "/updates/",
  eleventyComputed: {
    fileName: (data) => base(data) + ".md",
    permalink: (data) => `/updates/${base(data)}/`,
    pathbar: (data) => `~/updates/${base(data)}.md`,
  },
};
