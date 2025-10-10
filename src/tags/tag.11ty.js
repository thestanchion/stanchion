// src/tags/tag.11ty.js
const slugify = require("slugify");

module.exports = class {
  data() {
    return {
      pagination: {
        data: "collections.tagList", // <-- array of tag names
        size: 1,
        alias: "tag"
      },
      // permalink for each generated tag page
      permalink: data => `/tags/${slugify(data.tag, { lower: true, strict: true })}/`,
      // pick whatever layout you have (or remove layout to return pure HTML)
      layout: "tag-listing.html"
    };
  }

  render(data) {
    const tag = data.tag;
    // posts for this tag from tagMap
    const posts = (data.collections.tagMap && data.collections.tagMap[tag]) || [];
    const orderedPosts = posts.sort((a, b) => b.data.date - a.data.date);
    var options = { year: 'numeric', month: 'short', day: 'numeric' };

    return `
      <h1 class="heading--section heading--tag-listing">Posts tagged "${tag}"</h1>

      <div class="post-list">
          <ul class="post-list__list">
          ${orderedPosts.map(post => {
              if (post.data.published === true) {
                var postDate = new Date(post.data.date).toLocaleDateString("en-US", options);
                return `<li class="post-list__item" style="background-image: url(/img/${ post.data.hero });">
                          <a class="post-list__link" href="${ post.url }">
                            <h3 class="heading--post">${ post.data.title }</h3>
                            <span class="post__date">${ postDate }</span>
                          </a>
                        </li>`;
              }
            }).join("")}</ul>
      </div>
    `;
  }
};