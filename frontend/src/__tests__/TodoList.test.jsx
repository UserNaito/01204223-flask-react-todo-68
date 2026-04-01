import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'

// Import components
import TodoList from '../TodoList.jsx'
import TodoItem from '../TodoItem.jsx'
import { useAuth } from '../context/AuthContext'

// --- ส่วนที่ 1: Mocking & Setup ---

// Mock ตัว AuthContext เพื่อจำลองการ Login
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockResponse = (body, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
});

// ข้อมูลจำลองสำหรับทดสอบ
const todoItem1 = { id: 1, title: 'First todo', done: false, comments: [] };
const todoItem2 = { id: 2, title: 'Second todo', done: false, comments: [
  { id: 1, message: 'First comment' },
  { id: 2, message: 'Second comment' },
] };
const originalTodoList = [todoItem1, todoItem2];

const baseTodo = {
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};

// --- ส่วนที่ 2: TodoList Tests (Integration) ---

describe('TodoList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    
    // จำลองว่า User ล็อกอินอยู่เสมอด้วย fake-token
    useAuth.mockReturnValue({
      username: 'testuser',
      accessToken: 'fake-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders correctly', async () => {
    global.fetch.mockImplementationOnce(() => mockResponse(originalTodoList));
    render(<TodoList apiUrl="http://mock-api/" />);

    expect(await screen.findByText('First todo')).toBeInTheDocument();
    expect(await screen.findByText('Second todo')).toBeInTheDocument();
    expect(await screen.findByText('First comment')).toBeInTheDocument();
    expect(await screen.findByText('Second comment')).toBeInTheDocument();
  });

  it('toggles done on a todo item', async() => {
    const toggledTodoItem1 = { ...todoItem1, done: true };
    global.fetch
      .mockImplementationOnce(() => mockResponse(originalTodoList))    
      .mockImplementationOnce(() => mockResponse(toggledTodoItem1));

    render(<TodoList apiUrl="http://mock-api/" />);
    
    expect(await screen.findByText('First todo')).not.toHaveClass('done');

    const toggleButtons = await screen.findAllByRole('button', { name: /toggle/i })
    toggleButtons[0].click();

    expect(await screen.findByText('First todo')).toHaveClass('done');
    
    // ตรวจสอบว่าเรียก fetch ถูกต้อง (ใช้ expect.anything() เพราะมี Header Authorization เพิ่มเข้ามา)
    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/1\/toggle/), 
      expect.anything()
    );
  });
});

// --- ส่วนที่ 3: TodoItem Tests (Unit) ---

describe('TodoItem', () => {
  it('renders with no comments correctly', () => {
    render(<TodoItem todo={baseTodo} />);
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
  });

  it('renders with comments correctly and shows assertion', () => {
    const todoWithComment = {
      ...baseTodo,
      comments: [
        {id: 1, message: 'First comment'},
        {id: 2, message: 'Another comment'},
      ]
    };
    render(<TodoItem todo={todoWithComment} />);
    
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument(); // เช็คจำนวนคอมเมนต์
    
    // เพิ่ม Assertion ตาม TODO ของอาจารย์
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();
  });

  it('makes callback to toggleDone when Toggle button is clicked', () => {
    const onToggleDone = vi.fn();
    render(<TodoItem todo={baseTodo} toggleDone={onToggleDone} />);
    
    const button = screen.getByRole('button', { name: /toggle/i });
    button.click();
    expect(onToggleDone).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to deleteTodo when delete button is clicked', () => {
    const onDeleteTodo = vi.fn();
    render(<TodoItem todo={baseTodo} deleteTodo={onDeleteTodo} />);
    
    const button = screen.getByRole('button', { name: '❌' });
    button.click();
    expect(onDeleteTodo).toHaveBeenCalledWith(baseTodo.id);
  });

  it('makes callback to addNewComment when a new comment is added', async () => {
    const onAddNewComment = vi.fn();
    render(<TodoItem todo={baseTodo} addNewComment={onAddNewComment} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'New comment');

    const button = screen.getByRole('button', { name: /add comment/i });
    fireEvent.click(button);

    expect(onAddNewComment).toHaveBeenCalledWith(baseTodo.id, 'New comment');
  });
});