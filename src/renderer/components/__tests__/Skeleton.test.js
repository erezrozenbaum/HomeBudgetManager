import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, StockListSkeleton, StockDetailsSkeleton } from '../Skeleton';

describe('Skeleton Component', () => {
  test('renders text skeleton with default width', () => {
    render(<Skeleton type="text" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4 w-full');
  });

  test('renders text skeleton with custom width', () => {
    render(<Skeleton type="text" width="w-1/2" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4 w-1/2');
  });

  test('renders title skeleton', () => {
    render(<Skeleton type="title" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-6 w-3/4');
  });

  test('renders avatar skeleton', () => {
    render(<Skeleton type="avatar" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-10 w-10 rounded-full');
  });

  test('renders card skeleton', () => {
    render(<Skeleton type="card" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-32 w-full');
  });

  test('renders table skeleton', () => {
    render(<Skeleton type="table" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-12 w-full');
  });

  test('renders chart skeleton', () => {
    render(<Skeleton type="chart" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-64 w-full');
  });
});

describe('StockListSkeleton Component', () => {
  test('renders 5 stock list skeletons', () => {
    render(<StockListSkeleton />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(5);
  });

  test('each skeleton has correct classes', () => {
    render(<StockListSkeleton />);
    const skeletons = screen.getAllByTestId('skeleton');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('h-16 w-full');
    });
  });
});

describe('StockDetailsSkeleton Component', () => {
  test('renders all required skeleton elements', () => {
    render(<StockDetailsSkeleton />);
    
    // Check for title skeleton
    const titleSkeleton = screen.getByTestId('skeleton-title');
    expect(titleSkeleton).toHaveClass('h-8 w-1/2');
    
    // Check for text skeletons
    const textSkeletons = screen.getAllByTestId('skeleton-text');
    expect(textSkeletons).toHaveLength(3);
    textSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('h-4 w-full');
    });
    
    // Check for chart skeleton
    const chartSkeleton = screen.getByTestId('skeleton-chart');
    expect(chartSkeleton).toHaveClass('h-64 w-full');
  });
}); 