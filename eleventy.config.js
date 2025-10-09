const sass = require('sass');
const path = require('node:path');
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // --------------------------------------
  // 1. Passthrough Copy
  // --------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  // Do NOT passthrough raw SCSS source; we compile it
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });

  // --------------------------------------
  // 2. SCSS Compilation
  // --------------------------------------
  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    compile: async function (inputContent, inputPath) {
      const fs = require('fs');
      const parsedPath = path.parse(inputPath);

      // Only compile the entrypoint main.scss
      if (parsedPath.base !== 'main.scss') {
        return async () => ''; // ignore partials
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsedPath.dir || '.', path.join(process.cwd(), 'src', 'styles')],
      });

      // Write compiled CSS to _site/styles/main.css
      const outDir = path.join('_site', 'styles');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, 'main.css');
      fs.writeFileSync(outFile, result.css);

      return async (data) => result.css;
    },
  });

  // --------------------------------------
  // 3. Custom Filters
  // --------------------------------------
  const { DateTime } = require("luxon");
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("LLLL dd, yyyy");
  });

  const slugify = require("slugify");
  eleventyConfig.addFilter("slugify", (str) => slugify(str, { lower: true, strict: true }));
  // also expose a simple "slug" filter if you prefer
  eleventyConfig.addFilter("slug", (str = "") =>
    slugify(String(str), { lower: true, strict: true })
  );

  // --------------------------------------
  // 4. Shortcodes
  // --------------------------------------
  eleventyConfig.addNunjucksAsyncShortcode("image", async (src, alt, widths = [300, 600, 900], formats = ["avif", "jpeg"]) => {
    if (!alt) {
      throw new Error(`Missing \`alt\` on image: ${src}`);
    }

    let metadata = await Image(src, {
      widths: widths,
      formats: formats,
      outputDir: "./_site/images/",
      urlPath: "/images/"
    });

    return Image.generateHTML(metadata, {
      alt,
      sizes: "100vw",
      loading: "lazy",
      decoding: "async"
    });
  });

  // --------------------------------------
  // 5. Collections
  // --------------------------------------
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date);
  });

  // tagList: unique tag names
  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (!item.data || !item.data.tags) return;
      const tags = Array.isArray(item.data.tags) ? item.data.tags : [item.data.tags];
      tags.forEach(tag => {
        if (!tag) return;
        const t = String(tag).trim().toLowerCase();
        if (["general", "nav", "draft", "posts", "post"].includes(t)) return;
        tagSet.add(t);
      });
    });
    return [...tagSet].sort();
  });

  // tagMap: map of tag => items
  eleventyConfig.addCollection("tagMap", function (collectionApi) {
    const map = {};
    collectionApi.getAll().forEach(item => {
      if (!item.data || !item.data.tags) return;
      const tags = Array.isArray(item.data.tags) ? item.data.tags : [item.data.tags];
      tags.forEach(tag => {
        if (!tag) return;
        const t = String(tag).trim().toLowerCase();
        if (["general", "nav", "draft", "posts", "post"].includes(t)) return;
        map[t] = map[t] || [];
        map[t].push(item);
      });
    });
    return map;
  });

  // --------------------------------------
  // 6. Watch Targets
  // --------------------------------------
  eleventyConfig.addWatchTarget("src/js/");
  eleventyConfig.addWatchTarget("src/img/");
  eleventyConfig.addWatchTarget("src/fonts/");
  // watch entire styles tree so partial edits trigger rebuild
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.addWatchTarget("src/styles/**/*");

  // --------------------------------------
  // 7. Return Eleventy Config
  // --------------------------------------
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // include 11ty.js so .11ty.js files (e.g. tag.11ty.js) are executed/compiled
    templateFormats: ["html", "njk", "md", "liquid", "11ty.js"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    passthroughFileCopy: true
  };
};