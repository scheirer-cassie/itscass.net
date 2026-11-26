// Every project file gets these defaults. A project is either
//   content/projects/<slug>.md            (what Pages CMS creates), or
//   content/projects/<slug>/index.md      (folder layout, still supported)
// It can sit inside any folder (e.g. content/projects/Research/<slug>.md);
// folders only tidy the editor and never change the page address.
// URL = /projects/<first category>/<slug>/  (matches the ~/ path header)
const fileSlug = (data) => {
  const parts = data.page.filePathStem.split("/");
  const last = parts.pop();
  return last === "index" ? parts.pop() : last;
};
const slugOf = (data) => data.slug || fileSlug(data);
const cat = (data) => (data.categories || ["misc"])[0];

export default {
  layout: "project.njk",
  eleventyComputed: {
    slug: slugOf,
    permalink: (data) => `/projects/${cat(data)}/${slugOf(data)}/`,
    pathbar: (data) => `~/projects/${cat(data)}/${slugOf(data)}/`,
    navCat: (data) => (data.categories || [])[0],
    cdup: (data) => `/projects/${cat(data)}/`,
  },
};
