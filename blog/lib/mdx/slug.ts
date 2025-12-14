import GithubSlugger from "github-slugger";

const slugger = new GithubSlugger();

export function slugify(title: string): string {
  return slugger.slug(title);
}

export function slugifyOnce(text: string): string {
  const slugger = new GithubSlugger();
  return slugger.slug(text);
}

export function resetSlugger() {
  slugger.reset();
}
