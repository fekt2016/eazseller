import React from 'react';
import { describe, test, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePageTitle from '../../shared/hooks/usePageTitle';

function TestSEO({ config }) {
  usePageTitle(config);
  return null;
}

const renderWithRoute = (route, config) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <TestSEO config={config} />
    </MemoryRouter>
  );

describe('usePageTitle', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll('[data-dynamic="true"]')
      .forEach((tag) => tag.remove());
    document.title = 'Default Title';
  });

  test('sets title, canonical, and social tags', () => {
    renderWithRoute('/dashboard', {
      title: 'Seller Dashboard - Saiisai',
      description: 'Manage your store on Saiisai.',
      canonical: 'https://seller.saiisai.com/dashboard',
      image: 'https://seller.saiisai.com/og.png',
    });

    expect(document.title).toBe('Seller Dashboard - Saiisai');

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical.getAttribute('href')).toBe(
      'https://seller.saiisai.com/dashboard'
    );

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Seller Dashboard - Saiisai');
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute('content')
    ).toBe('Seller Dashboard - Saiisai');
  });

  test('applies robots noindex,nofollow when configured', () => {
    renderWithRoute('/dashboard/orders', {
      title: 'Orders - Seller Dashboard',
      noIndex: true,
      noFollow: true,
    });

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toBeTruthy();
    expect(robots.getAttribute('content')).toContain('noindex');
    expect(robots.getAttribute('content')).toContain('nofollow');
  });
});
