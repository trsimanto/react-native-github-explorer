const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

/**
 * READMEs often reference images and docs with repo-relative paths, which mean
 * nothing outside github.com. Rewrite them to absolute URLs so they render.
 */
export function resolveRelativeLinks(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
): string {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;

  return markdown.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g,
    (match, bang: string, text: string, url: string, title: string) => {
      if (ABSOLUTE.test(url)) return match;
      const path = url.replace(/^\.?\//, '');
      return `${bang}[${text}](${bang ? rawBase : blobBase}${path}${title})`;
    },
  );
}
