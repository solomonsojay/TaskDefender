import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskList from '../../components/tasks/TaskList';
import { AppProvider } from '../../contexts/AppContext';

// Mock the hooks
vi.mock('../../hooks/useSarcasticPrompts', () => ({
  useSarcasticPrompts: () => ({
    getCriticalTasks: () => [],
    getProcrastinatingTasks: () => [],
    getTaskAnalysis: () => null,
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    renderWithProvider(<TaskList />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders filter tabs', () => {
    renderWithProvider(<TaskList />);
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });
});