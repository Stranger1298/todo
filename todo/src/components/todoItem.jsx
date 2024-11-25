/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useTodo } from '../contexts/todoContext.jsx'

function TodoItem({ todo, readonly = false }) {
  const [isTodoEditable, setIsTodoEditable] = useState(false)
  const [todoMsg, setTodoMsg] = useState(todo.todo)
  const {updateTodo, deleteTodo, toggleComplete} = useTodo()

  const editTodo = () => {
    updateTodo(todo.id, {...todo, todo: todoMsg})
    setIsTodoEditable(false)
  }

  const toggleCompleted = () => {
    if (!readonly) {
      toggleComplete(todo.id)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  const getDueStatus = () => {
    if (!todo.dueDate || todo.completed) return null;
    
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const timeDiff = dueDate - now;
    const hoursLeft = timeDiff / (1000 * 60 * 60);

    if (timeDiff < 0) {
      return { status: 'overdue', color: 'text-red-500' };
    } else if (hoursLeft <= 24) {
      return { status: 'due-soon', color: 'text-yellow-500' };
    }
    return { status: 'upcoming', color: 'text-green-500' };
  }

  const dueStatus = getDueStatus();

  return (
    <div
      className={`group relative flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black
        ${todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"}
        ${readonly ? "opacity-80" : ""}
        hover:shadow-md transition-all`}
    >
      <input
        type="checkbox"
        className={`cursor-pointer w-5 h-5 mt-1 accent-green-600
          ${readonly ? "cursor-not-allowed opacity-60" : ""}`}
        checked={todo.completed}
        onChange={toggleCompleted}
        disabled={readonly}
      />
      <div className="flex-1 flex flex-col gap-1">
        <input
          type="text"
          className={`border outline-none w-full bg-transparent rounded-lg
            ${isTodoEditable ? "border-black/10 px-2" : "border-transparent"}
            ${todo.completed ? "line-through text-gray-700" : ""}
            ${readonly ? "cursor-default" : ""}`}
          value={todoMsg}
          onChange={(e) => setTodoMsg(e.target.value)}
          readOnly={readonly || !isTodoEditable}
        />
        <div className="flex gap-2 items-center text-[10px] text-gray-500">
          <span>Created: {formatDate(todo.createdAt)}</span>
          {todo.lastModified && todo.lastModified !== todo.createdAt && (
            <span>• Modified: {formatDate(todo.lastModified)}</span>
          )}
          {todo.dueDate && (
            <span className={`${dueStatus?.color || ''}`}>
              • Due: {formatDate(todo.dueDate)}
              {dueStatus && ` (${dueStatus.status})`}
            </span>
          )}
        </div>
      </div>
      
      {!readonly && (
        <div className="flex gap-2 items-start">
          <button
            className={`inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center
              ${todo.completed 
                ? "bg-gray-200 cursor-not-allowed" 
                : "bg-gray-50 hover:bg-gray-100"}
              transition-colors shrink-0`}
            onClick={() => {
              if (todo.completed) return;
              if (isTodoEditable) {
                editTodo();
              } else {
                setIsTodoEditable((prev) => !prev);
              }
            }}
            disabled={todo.completed}
            title={isTodoEditable ? "Save" : "Edit"}
          >
            {isTodoEditable ? "📁" : "✏️"}
          </button>
          <button
            className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center
              bg-gray-50 hover:bg-red-100 transition-colors shrink-0"
            onClick={() => deleteTodo(todo.id)}
            title="Delete"
          >
            ❌
          </button>
        </div>
      )}
    </div>
  );
}

export default TodoItem;