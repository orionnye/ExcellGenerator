import React from 'react';

export const highlightSearchTerms = (
  text: string,
  searchTerm: string,
  caseSensitive: boolean = false
): React.ReactNode[] => {
  if (!searchTerm.trim()) {
    return [text];
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    flags
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Use exec in a loop to handle all matches
  const regexCopy = new RegExp(regex.source, regex.flags);
  while ((match = regexCopy.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted match
    parts.push(
      React.createElement(
        'mark',
        { key: match.index, className: 'search-highlight' },
        match[0]
      )
    );

    lastIndex = match.index + match[0].length;

    // Prevent infinite loop on zero-length matches
    if (match[0].length === 0) {
      regexCopy.lastIndex++;
    }
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

export const getMatchCount = (
  text: string,
  searchTerm: string,
  caseSensitive: boolean = false
): number => {
  if (!searchTerm.trim()) {
    return 0;
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    flags
  );

  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

