import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = {
  text: string;
  themeColor?: string;
  baseColor?: string;
  fontSize?: number;
};

// Regex to detect RTL characters (Arabic, Hebrew, etc.)
const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

/**
 * Parses inline markdown: **bold text**, [1] or 【1】 citations, and regular text
 */
function renderInlineContent(
  line: string,
  keyPrefix: string,
  themeColor: string,
  baseColor: string,
  fontSize: number
) {
  // Regex to match **bold** or citations like [1], [2], 【1】, etc.
  const regex = /(\*\*.*?\*\*|\[\d+\]|【\d+】)/g;
  const parts = line.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    const key = `${keyPrefix}-part-${index}`;

    // Bold text **word**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <Text
          key={key}
          style={[
            styles.bold,
            { color: '#ffffff', fontSize }
          ]}
        >
          {boldText}
        </Text>
      );
    }

    // Citation [1] or 【1】
    if ((part.startsWith('[') && part.endsWith(']')) || (part.startsWith('【') && part.endsWith('】'))) {
      const citationNum = part.slice(1, -1);
      return (
        <Text
          key={key}
          style={[
            styles.citationChip,
            { color: themeColor, backgroundColor: `${themeColor}22` }
          ]}
        >
          {` [${citationNum}] `}
        </Text>
      );
    }

    // Normal text
    return (
      <Text key={key} style={[styles.regular, { color: baseColor, fontSize }]}>
        {part}
      </Text>
    );
  });
}

export default function FormattedClinicalText({
  text,
  themeColor = Colors.accent,
  baseColor = Colors.textBody,
  fontSize = 14,
}: Props) {
  if (!text) return null;

  // Clean raw artifacts
  const cleaned = text
    .replace(/##END##/gi, '')
    .replace(/【(\d+)】/g, '[$1]')
    .trim();

  const lines = cleaned.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((rawLine, lineIndex) => {
        const line = rawLine.trim();
        if (!line) {
          return <View key={`empty-${lineIndex}`} style={styles.paragraphSpacer} />;
        }

        const isRTL = rtlRegex.test(line);
        const textAlign = isRTL ? 'right' : 'left';
        const writingDirection = isRTL ? 'rtl' : 'ltr';

        // Bullet point: • or - or *
        const bulletMatch = line.match(/^([•\-\*]|\d+\.)\s+(.*)$/);
        if (bulletMatch) {
          const bulletSymbol = bulletMatch[1].includes('.') ? bulletMatch[1] : '•';
          const content = bulletMatch[2];

          return (
            <View key={`line-${lineIndex}`} style={[styles.bulletRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text
                style={[
                  styles.bulletSymbol,
                  { 
                    color: themeColor, 
                    fontSize: bulletSymbol === '•' ? fontSize + 4 : fontSize - 1,
                    textAlign: isRTL ? 'right' : 'left',
                    marginLeft: isRTL ? 8 : 0,
                    marginRight: isRTL ? 0 : 8,
                    width: 'auto',
                  }
                ]}
              >
                {bulletSymbol}
              </Text>
              <Text style={[styles.bulletText, { fontSize, lineHeight: fontSize * 1.55, textAlign, writingDirection }]}>
                {renderInlineContent(content, `b-${lineIndex}`, themeColor, baseColor, fontSize)}
              </Text>
            </View>
          );
        }

        // Subheader line (e.g. "Initial Workup:" or starts with bold heading on single line)
        if (line.endsWith(':') && line.length < 50) {
          return (
            <View key={`line-${lineIndex}`} style={[styles.subHeaderRow, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.subHeaderText, { color: themeColor, fontSize: fontSize + 0.5, textAlign, writingDirection }]}>
                {line}
              </Text>
            </View>
          );
        }

        // Normal paragraph line
        return (
          <Text
            key={`line-${lineIndex}`}
            style={[
              styles.regular,
              {
                color: baseColor,
                fontSize,
                lineHeight: fontSize * 1.55,
                marginBottom: 6,
                textAlign,
                writingDirection
              }
            ]}
          >
            {renderInlineContent(line, `p-${lineIndex}`, themeColor, baseColor, fontSize)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraphSpacer: {
    height: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 6,
  },
  bulletSymbol: {
    marginTop: -1,
    fontFamily: 'PlexSans_700Bold',
  },
  bulletText: {
    flex: 1,
    fontFamily: 'PlexSans_400Regular',
  },
  subHeaderRow: {
    marginTop: 6,
    marginBottom: 6,
  },
  subHeaderText: {
    fontFamily: 'PlexSans_700Bold',
    letterSpacing: 0.3,
  },
  regular: {
    fontFamily: 'PlexSans_400Regular',
  },
  bold: {
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
  },
  citationChip: {
    fontFamily: 'PlexMono_500Medium',
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
