// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    excerpt: { type: "string", required: true },
    date: { type: "date", required: true },
    category: {
      type: "enum",
      options: ["travel-guide", "remote-work", "income-report", "gear", "photography"],
      required: true
    },
    tags: { type: "list", of: { type: "string" }, default: [] },
    location: { type: "string" },
    coverImage: { type: "string" },
    isDraft: { type: "boolean", default: false },
    isFeatured: { type: "boolean", default: false }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => post._raw.sourceFileName.replace(/\.mdx$/, "")
    },
    readingTime: {
      type: "number",
      resolve: (post) => Math.ceil(post.body.raw.split(" ").length / 200)
    },
    url: {
      type: "string",
      resolve: (post) => `/blog/${post._raw.sourceFileName.replace(/\.mdx$/, "")}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Post]
});
export {
  Post,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-CZ4MHE6M.mjs.map
