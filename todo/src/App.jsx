/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { TodoProvider } from './contexts/todoContext.jsx'
import { UserProvider } from './contexts/userContext.jsx'
import { useUser } from './contexts/userContext.jsx'
import { useTodo } from './contexts/todoContext.jsx'
import { TodoForm, TodoItem, Auth } from './components'

// Loading skeleton component
function TodoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function TodoApp() {
  const { user, logout } = useUser();
  const { todos, isLoading } = useTodo();

  return (
    <div className="bg-[#172842] min-h-screen py-8">
      <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
        <div className="flex justify-between items-center mb-8 mt-2">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name}!</span>
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-4">
          <TodoForm />
        </div>
        
        <div className="flex flex-col gap-y-3">
          {isLoading ? (
            <TodoSkeleton />
          ) : todos.length > 0 ? (
            todos.map((todo) => (
              <div key={todo.id} className="transform transition-all duration-200 hover:scale-[1.02]">
                <TodoItem todo={todo} />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No todos yet. Add your first todo above!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </UserProvider>
  )
}

function AppContent() {
  const { user } = useUser();
  return user ? <TodoApp /> : <Auth />;
}

export default App