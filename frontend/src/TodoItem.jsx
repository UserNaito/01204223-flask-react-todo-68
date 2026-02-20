import './App.css'
import { useState } from 'react'

function TodoItem({todo, toggleDone, deleteTodo, addNewComment}) {
    const [newComment, setNewComment] = useState("");
  return (
    <li>
      <span className={todo.done ? "done" : ""}>{todo.title}</span>
      <button onClick={() => {toggleDone(todo.id)}}>Toggle</button>
      <button onClick={() => {deleteTodo(todo.id)}}>❌</button>
      {(todo.comments) && (todo.comments.length > 0) && (
        <>
                <b>Comments: {todo.comments.length}</b>
                <ul>
                  {todo.comments.map(comment => (
                    <li key={comment.id}>{comment.message}</li>
                  ))}
                </ul>
              </>
      )}

    {(todo.comments) && (todo.comments.length == 0) && (
        <span>No comments</span>
      )}

      <div className="new-comment-forms">
        <input
                type="text"
                value={newComment} 
                onChange={(e) => {
                  const value = e.target.value;
                  setNewComment(value); 
                }}
              />
        <button onClick={() => {                       
          addNewComment(todo.id, newComment);
          setNewComment("");
        }}>Add Comment</button>
      </div>
    </li>
  )
}

export default TodoItem