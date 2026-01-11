/**
 * ResponsiveDataTable Component Tests
 * 
 * Tests for the ResponsiveDataTable component:
 * - Renders table with data
 * - Displays columns correctly
 * - Handles empty state
 * - Handles loading state
 */

import React from 'react';
import { screen, render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import ResponsiveDataTable from '../../shared/components/ui/ResponsiveDataTable';

const mockColumns = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status' },
];

const mockData = [
  { id: '1', name: 'John Doe', email: 'john@test.com', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'Inactive' },
];

describe('ResponsiveDataTable', () => {
  test('renders table with data', () => {
    render(<ResponsiveDataTable columns={mockColumns} data={mockData} />);
    // Data appears in both desktop and mobile views
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('jane@test.com').length).toBeGreaterThan(0);
  });

  test('displays column headers', () => {
    render(<ResponsiveDataTable columns={mockColumns} data={mockData} />);
    // Headers appear in both desktop and mobile views
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
  });

  test('handles empty data', () => {
    render(<ResponsiveDataTable columns={mockColumns} data={[]} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  test('renders custom cell renderer', () => {
    const columnsWithRenderer = [
      ...mockColumns,
      {
        key: 'actions',
        title: 'Actions',
        render: (row) => <button>Edit {row.name}</button>,
      },
    ];

    render(<ResponsiveDataTable columns={columnsWithRenderer} data={mockData} />);
    // Should find at least one "Edit John Doe" button
    const editButtons = screen.getAllByText(/edit john doe/i);
    expect(editButtons.length).toBeGreaterThan(0);
  });
});

