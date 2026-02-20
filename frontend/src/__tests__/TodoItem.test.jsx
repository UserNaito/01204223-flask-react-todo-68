import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'
import TodoItem from '../TodoItem.jsx'

const baseTodo = {             // ** TodoItem พื้นฐานสำหรับทดสอบ
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};

describe('TodoItem', () => {
  it('renders with no comments correctly', () => {
    render(
      <TodoItem todo={baseTodo} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
  });
});