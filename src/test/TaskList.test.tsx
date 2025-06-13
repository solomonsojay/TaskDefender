import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskList from '../components/tasks/TaskList';
import { AppProvider } from '../contexts/AppContext';

describe('TaskList', () => {
  it('renders task list component', () => {
    render(
      <AppProvider>
        <TaskList />
      </AppProvider>
    );
    expect(screen.getByText(/Your Tasks/i)).toBeInTheDocument();
  });
});