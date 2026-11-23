export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryContrast: string;
  danger: string;
  star: string;
}

export const lightPalette: Palette = {
  background: '#f6f8fa',
  surface: '#ffffff',
  surfaceMuted: '#eef1f4',
  border: '#d0d7de',
  text: '#1f2328',
  textMuted: '#59636e',
  primary: '#0969da',
  primaryContrast: '#ffffff',
  danger: '#cf222e',
  star: '#bf8700',
};

export const darkPalette: Palette = {
  background: '#0d1117',
  surface: '#161b22',
  surfaceMuted: '#21262d',
  border: '#30363d',
  text: '#e6edf3',
  textMuted: '#9198a1',
  primary: '#4493f8',
  primaryContrast: '#0d1117',
  danger: '#f85149',
  star: '#e3b341',
};

// A small subset of GitHub's linguist colours for the most common languages.
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Kotlin: '#a97bff',
  Swift: '#f05138',
  Dart: '#00b4ab',
  Java: '#b07219',
  Python: '#3572a5',
  Go: '#00add8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4f5d95',
  HTML: '#e34c26',
  CSS: '#663399',
  Shell: '#89e051',
  Vue: '#41b883',
};

export function languageColor(language: string | null | undefined): string {
  return (language && languageColors[language]) || '#8b949e';
}
