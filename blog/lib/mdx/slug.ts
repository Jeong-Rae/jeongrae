import GithubSlugger from "github-slugger";

const slugger = new GithubSlugger();

export function slugify(title: string): string {
  return slugger.slug(title);
}

export function resetSlugger() {
  slugger.reset();
}
