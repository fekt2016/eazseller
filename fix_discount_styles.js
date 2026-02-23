import * as fs from 'fs';

const FILE_PATH = '/Users/mac/Desktop/Saiisai/eazseller/src/features/products/DiscountProducts.jsx';
let content = fs.readFileSync(FILE_PATH, 'utf-8');

// Colors
const colorMap = {
  '#f9fafb': 'var(--color-grey-50)',
  '#f3f4f6': 'var(--color-grey-100)',
  '#e5e7eb': 'var(--color-grey-200)',
  '#d1d5db': 'var(--color-grey-300)',
  '#9ca3af': 'var(--color-grey-400)',
  '#6b7280': 'var(--color-grey-500)',
  '#4b5563': 'var(--color-grey-600)',
  '#374151': 'var(--color-grey-700)',
  '#1f2937': 'var(--color-grey-800)',
  '#111827': 'var(--color-grey-900)',

  '#3b82f6': 'var(--color-primary-500)',
  '#2563eb': 'var(--color-primary-600)',
  '#1d4ed8': 'var(--color-primary-700)',
  '#1e40af': 'var(--color-primary-800)',
  '#eff6ff': 'var(--color-primary-50)',
  '#dbeafe': 'var(--color-primary-100)',

  '#10b981': 'var(--color-green-500)',
  '#059669': 'var(--color-green-600)',
  '#065f46': 'var(--color-green-700)',
  '#d1fae5': 'var(--color-green-100)',

  '#ef4444': 'var(--color-red-500)',
  '#dc2626': 'var(--color-red-600)',
  '#b91c1c': 'var(--color-red-700)',
  '#fee2e2': 'var(--color-red-100)',

  '#f59e0b': 'var(--color-yellow-500)',
  '#d97706': 'var(--color-yellow-600)',
  '#b45309': 'var(--color-yellow-700)',
  '#fef3c7': 'var(--color-yellow-100)'
};

for (const [hex, cssVar] of Object.entries(colorMap)) {
  const regex = new RegExp(`['"]?${hex}['"]?`, 'gi');
  content = content.replace(regex, `'${cssVar}'`).replace(/'var\(/g, 'var(').replace(/\)'/g, ')');
}

// Spacing
const spaceMap = {
  'padding: 8px': 'padding: var(--spacing-sm)',
  'padding: 16px': 'padding: var(--spacing-md)',
  'padding: 24px': 'padding: var(--spacing-lg)',
  'padding: 32px': 'padding: var(--spacing-xl)',
  'padding: 40px': 'padding: var(--spacing-2xl)',
  'gap: 8px': 'gap: var(--spacing-sm)',
  'gap: 16px': 'gap: var(--spacing-md)',
  'gap: 24px': 'gap: var(--spacing-lg)'
};

for (const [px, cssVar] of Object.entries(spaceMap)) {
  const regex = new RegExp(px, 'g');
  content = content.replace(regex, cssVar);
}

fs.writeFileSync(FILE_PATH, content, 'utf-8');
console.log('Fixed styles in DiscountProducts.jsx');
