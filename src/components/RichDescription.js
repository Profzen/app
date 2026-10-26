import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { isHtml, legacyToHtml, stripMarkdown } from '../utils/markdownUtils';

/**
 * Decodes standard HTML entities into human-readable characters.
 */
function decodeEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

/**
 * Checks if text is predominantly Arabic (RTL).
 */
function isArabicText(text) {
  if (!text || typeof text !== 'string') return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Lightweight in-house HTML parser for the product description allowlist:
 * Allowed tags: p, br, strong/b, em/i, u, s, h2, h3, ul, ol, li, blockquote
 * Allowed attributes: style="text-align: left|center|right|justify" on p, h2, h3
 * All other tags: inner text preserved, tag formatting ignored.
 * Links (<a>): inner text rendered as plain, non-pressable text.
 * Images (<img>): discarded.
 */
function parseHtmlToAst(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return [];

  // Remove dangerous or non-content tags completely
  const clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const root = { type: 'root', children: [] };
  const stack = [root];
  const tagRegex = /<(\/)?([a-zA-Z0-9]+)([^>]*)>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(clean)) !== null) {
    const textBefore = clean.slice(lastIndex, match.index);
    if (textBefore) {
      stack[stack.length - 1].children.push({
        type: 'text',
        text: decodeEntities(textBefore),
      });
    }

    const isClosing = match[1] === '/';
    const rawTag = match[2].toLowerCase();
    const rawAttrs = match[3] || '';
    lastIndex = tagRegex.lastIndex;

    // Normalization of aliases
    const tag = rawTag === 'b' ? 'strong' : rawTag === 'i' ? 'em' : rawTag;

    if (tag === 'br') {
      stack[stack.length - 1].children.push({ type: 'br' });
      continue;
    }

    if (tag === 'img') {
      // Discard image tags completely
      continue;
    }

    if (isClosing) {
      // Find matching tag in stack
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag || (tag === 'strong' && stack[i].tag === 'b') || (tag === 'em' && stack[i].tag === 'i')) {
          stack.length = i;
          break;
        }
      }
    } else {
      // Extract text-align style if present
      let textAlign = null;
      const alignMatch = rawAttrs.match(/style=["'][^"']*text-align\s*:\s*(left|center|right|justify)/i);
      if (alignMatch) {
        textAlign = alignMatch[1].toLowerCase();
      }

      const node = {
        type: 'element',
        tag,
        textAlign,
        children: [],
      };

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }
  }

  const remainingText = clean.slice(lastIndex);
  if (remainingText) {
    stack[stack.length - 1].children.push({
      type: 'text',
      text: decodeEntities(remainingText),
    });
  }

  return root.children;
}

/**
 * RichDescription Component
 *
 * Renders sanitized HTML, Markdown, or plain text product descriptions
 * with full visual formatting, theme tokens, nested lists, RTL support,
 * and a 3-line preview with expandable toggle.
 */
export default function RichDescription({
  content = '',
  numberOfLines = 3,
  isExpanded = false,
  onToggleExpand,
  isRtl: isRtlProp,
  fallback = 'No description available for this product.',
  style,
  textStyle,
}) {
  const isRtl = useMemo(() => {
    if (typeof isRtlProp === 'boolean') return isRtlProp;
    return I18nManager.isRTL || isArabicText(content);
  }, [isRtlProp, content]);

  // Convert plain-text / Markdown into HTML if needed
  const normalizedHtml = useMemo(() => {
    if (!content || typeof content !== 'string' || !content.trim()) return '';
    return isHtml(content) ? content : legacyToHtml(content);
  }, [content]);

  // Parse HTML into AST tree
  const ast = useMemo(() => {
    if (!normalizedHtml) return [];
    return parseHtmlToAst(normalizedHtml);
  }, [normalizedHtml]);

  // Plain text fallback for collapsed preview or empty content
  const plainText = useMemo(() => {
    if (!content) return fallback;
    return stripMarkdown(content) || fallback;
  }, [content, fallback]);

  if (!content || !content.trim()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.fallback, textStyle]}>{fallback}</Text>
      </View>
    );
  }

  // ── Render inline nodes (nested within <Text>) ───────────────────────────
  const renderInlineNodes = (nodes, parentKey = 'inline') => {
    return nodes.map((node, idx) => {
      const key = `${parentKey}-${idx}`;
      if (node.type === 'text') {
        return <Text key={key}>{node.text}</Text>;
      }
      if (node.type === 'br') {
        return '\n';
      }
      if (node.type === 'element') {
        switch (node.tag) {
          case 'strong':
            return (
              <Text key={key} style={styles.strong}>
                {renderInlineNodes(node.children, key)}
              </Text>
            );
          case 'em':
            return (
              <Text key={key} style={styles.em}>
                {renderInlineNodes(node.children, key)}
              </Text>
            );
          case 'u':
            return (
              <Text key={key} style={styles.underline}>
                {renderInlineNodes(node.children, key)}
              </Text>
            );
          case 's':
            return (
              <Text key={key} style={styles.strikethrough}>
                {renderInlineNodes(node.children, key)}
              </Text>
            );
          default:
            // Non-allowlist tag (e.g. <a>, <span>): render inner text only without styling or pressability
            return <Text key={key}>{renderInlineNodes(node.children, key)}</Text>;
        }
      }
      return null;
    });
  };

  // ── Render list items (with full nested list support) ────────────────────
  const renderList = (listNode, depth = 0, parentKey = 'list') => {
    const isOl = listNode.tag === 'ol';
    let itemCounter = 0;

    return (
      <View key={parentKey} style={[styles.listContainer, { marginStart: depth * 14 }]}>
        {listNode.children.map((child, idx) => {
          if (child.type !== 'element') return null;

          if (child.tag === 'li') {
            itemCounter += 1;
            const bulletLabel = isOl ? `${itemCounter}.` : '•';
            const itemKey = `${parentKey}-li-${idx}`;

            // Separate inline children from nested list children
            const inlineChildren = [];
            const nestedListChildren = [];
            (child.children || []).forEach((c) => {
              if (c.type === 'element' && (c.tag === 'ul' || c.tag === 'ol')) {
                nestedListChildren.push(c);
              } else {
                inlineChildren.push(c);
              }
            });

            return (
              <View key={itemKey} style={styles.listItemWrap}>
                <View style={[styles.listItemRow, isRtl && styles.rowReverse]}>
                  <Text style={[styles.bullet, isRtl ? styles.bulletRtl : styles.bulletLtr]}>
                    {bulletLabel}
                  </Text>
                  <Text
                    style={[
                      styles.listItemText,
                      textStyle,
                      isRtl && styles.textRtl,
                    ]}
                  >
                    {renderInlineNodes(inlineChildren, itemKey)}
                  </Text>
                </View>

                {/* Render nested lists with increased depth indentation */}
                {nestedListChildren.map((nestedList, nIdx) =>
                  renderList(nestedList, depth + 1, `${itemKey}-nested-${nIdx}`)
                )}
              </View>
            );
          }

          // If a list tag is nested directly without an li wrapper
          if (child.tag === 'ul' || child.tag === 'ol') {
            return renderList(child, depth + 1, `${parentKey}-sub-${idx}`);
          }

          return null;
        })}
      </View>
    );
  };

  // ── Render block-level AST nodes ─────────────────────────────────────────
  const renderBlockNode = (node, idx) => {
    const key = `block-${idx}`;

    if (node.type === 'text') {
      if (!node.text.trim()) return null;
      return (
        <Text key={key} style={[styles.paragraph, textStyle, isRtl && styles.textRtl]}>
          {node.text}
        </Text>
      );
    }

    if (node.type === 'element') {
      const alignStyle = node.textAlign
        ? { textAlign: node.textAlign === 'justify' ? 'left' : node.textAlign }
        : isRtl
        ? styles.textRtl
        : styles.textLtr;

      switch (node.tag) {
        case 'p':
          return (
            <Text key={key} style={[styles.paragraph, textStyle, alignStyle]}>
              {renderInlineNodes(node.children, key)}
            </Text>
          );
        case 'h2':
          return (
            <Text key={key} style={[styles.heading2, alignStyle]}>
              {renderInlineNodes(node.children, key)}
            </Text>
          );
        case 'h3':
          return (
            <Text key={key} style={[styles.heading3, alignStyle]}>
              {renderInlineNodes(node.children, key)}
            </Text>
          );
        case 'blockquote':
          return (
            <View
              key={key}
              style={[
                styles.blockquote,
                isRtl ? styles.blockquoteRtl : styles.blockquoteLtr,
              ]}
            >
              <Text
                style={[
                  styles.blockquoteText,
                  alignStyle,
                ]}
              >
                {renderInlineNodes(node.children, key)}
              </Text>
            </View>
          );
        case 'ul':
        case 'ol':
          return renderList(node, 0, key);
        default:
          // Fallback block: render as paragraph
          return (
            <Text key={key} style={[styles.paragraph, textStyle, alignStyle]}>
              {renderInlineNodes(node.children, key)}
            </Text>
          );
      }
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {isExpanded ? (
        <View style={styles.expandedContent}>
          {ast.map((node, idx) => renderBlockNode(node, idx))}
        </View>
      ) : (
        <Text
          style={[styles.previewText, textStyle, isRtl && styles.textRtl]}
          numberOfLines={numberOfLines}
        >
          {plainText}
        </Text>
      )}

      {onToggleExpand && (
        <TouchableOpacity
          onPress={onToggleExpand}
          activeOpacity={0.7}
          style={[styles.toggleBtn, isRtl && styles.rowReverse]}
        >
          <Text style={styles.toggleText}>
            {isExpanded ? 'Show less' : 'Read more'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.colors.primary}
            style={isRtl ? { marginRight: 4 } : { marginLeft: 4 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  expandedContent: {
    width: '100%',
  },
  fallback: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  previewText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    textAlign: 'left',
  },
  paragraph: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 8,
    textAlign: 'left',
  },
  heading2: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.sizes.base,
    color: '#1A2840',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'left',
  },
  heading3: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.sizes.sm,
    color: '#1A2840',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'left',
  },
  strong: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: '700',
    color: '#1A2840',
  },
  em: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  listContainer: {
    marginTop: 2,
    marginBottom: 6,
  },
  listItemWrap: {
    marginVertical: 2,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#1A2840',
    minWidth: 16,
    lineHeight: 20,
  },
  bulletLtr: {
    marginRight: 6,
    textAlign: 'left',
  },
  bulletRtl: {
    marginLeft: 6,
    textAlign: 'right',
  },
  listItemText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#1A2840',
    lineHeight: 20,
    textAlign: 'left',
  },
  blockquote: {
    marginVertical: 6,
    backgroundColor: '#FFFDF5',
    borderRadius: 4,
    paddingVertical: 6,
  },
  blockquoteLtr: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    paddingLeft: 10,
    paddingRight: 6,
  },
  blockquoteRtl: {
    borderRightWidth: 3,
    borderRightColor: theme.colors.accent,
    paddingRight: 10,
    paddingLeft: 6,
  },
  blockquoteText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  textLtr: {
    textAlign: 'left',
  },
  textRtl: {
    textAlign: 'right',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  toggleText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
});
