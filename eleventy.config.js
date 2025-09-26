const sass = require('sass');
const path = require('node:path');
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {

  // --------------------------------------
  // 1. Passthrough Copy
  // --------------------------------------
  // Copy static folders to the output folder (_site)
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
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

      // Only compile main.scss
      if (parsedPath.base !== 'main.scss') {
        return async () => ''; // Do not output CSS for partials
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsedPath.dir || '.', this.config.dir.includes],
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
  // Example: date formatting
  const { DateTime } = require("luxon");
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("LLLL dd, yyyy");
  });

  // Example: slugify a string
  const slugify = require("slugify");
  eleventyConfig.addFilter("slugify", (str) => slugify(str, { lower: true, strict: true }));

  // --------------------------------------
  // 4. Shortcodes
  // --------------------------------------
  // Example: responsive image shortcode
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
  // 4. Collections
  // --------------------------------------
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/articles/*.md").sort((a, b) => b.date - a.date);
  });

  // --------------------------------------
  // 5. Watch Targets
  // --------------------------------------
  eleventyConfig.addWatchTarget("src/js/");
  eleventyConfig.addWatchTarget("src/img/");
  eleventyConfig.addWatchTarget("src/fonts/");
  eleventyConfig.addWatchTarget("src/styles/**/*");

  // --------------------------------------
  // 6. Return Eleventy Config
  // --------------------------------------
  return {
    dir: {
      input: "src",         // Source files directory
      output: "_site",      // Output directory
      includes: "_includes",// Includes/partials directory
      data: "_data",        // Data files directory
    },
    templateFormats: ["html", "njk", "md", "liquid"], // Valid: html, njk, md, liquid, 11ty.js, etc.
    htmlTemplateEngine: "liquid",      // Valid: njk, liquid, handlebars, etc.
    markdownTemplateEngine: "liquid",  // Valid: njk, liquid, handlebars, etc.
    passthroughFileCopy: true       // true or false
  };
};