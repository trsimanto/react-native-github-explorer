import { useMemo } from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { resolveRelativeLinks } from '../../lib/readme';
import { radius, spacing, useTheme, type Palette } from '../../theme';

interface Props {
  markdown: string;
  owner: string;
  repo: string;
  branch: string;
}

export function ReadmeView({ markdown, owner, repo, branch }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createMarkdownStyles(colors), [colors]);
  const content = useMemo(
    () => resolveRelativeLinks(markdown, owner, repo, branch),
    [markdown, owner, repo, branch],
  );

  return (
    <Markdown
      style={styles}
      onLinkPress={(url) => {
        void Linking.openURL(url);
        return false;
      }}
    >
      {content}
    </Markdown>
  );
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

function createMarkdownStyles(colors: Palette) {
  return StyleSheet.create({
    body: { color: colors.text, fontSize: 15, lineHeight: 22 },
    heading1: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      paddingBottom: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    heading3: { fontSize: 17, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.xs },
    link: { color: colors.primary },
    blockquote: {
      backgroundColor: 'transparent',
      borderLeftWidth: 3,
      borderLeftColor: colors.border,
      paddingLeft: spacing.md,
      marginLeft: 0,
    },
    code_inline: {
      fontFamily: mono,
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    code_block: {
      fontFamily: mono,
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      borderWidth: 0,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    fence: {
      fontFamily: mono,
      fontSize: 13,
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      borderWidth: 0,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    hr: { backgroundColor: colors.border, marginVertical: spacing.lg },
    table: { borderColor: colors.border },
    tr: { borderColor: colors.border },
    th: { padding: spacing.xs },
    td: { padding: spacing.xs },
    image: { borderRadius: radius.sm },
  });
}
