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
  const { userTodos, otherUsersTodos, isLoading } = useTodo();
  const [activeTab, setActiveTab] = useState('my-todos'); // 'my-todos' or 'team-todos'

  return (
    <div className="bg-[#172842] min-h-screen py-8">
      <div className="w-full max-w-4xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
        <div className="flex justify-between items-center mb-8 mt-2">
          <h1 className="text-2xl font-bold">Collaborative Todo App</h1>
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

        {/* Mobile Tab Switcher */}
        <div className="md:hidden mb-6">
          <div className="flex rounded-lg bg-gray-700 p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'my-todos' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('my-todos')}
            >
              My Todos
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'team-todos' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('team-todos')}
            >
              Team's Todos
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User's Todos Section */}
          <div className={`${activeTab === 'team-todos' ? 'hidden md:block' : ''}`}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Your Todos</h2>
              <TodoForm />
            </div>
            <div className="flex flex-col gap-y-3">
              {isLoading ? (
                <TodoSkeleton />
              ) : userTodos.length > 0 ? (
                userTodos.map((todo) => (
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

          {/* Other Users' Todos Section */}
          <div className={`${activeTab === 'my-todos' ? 'hidden md:block' : ''}`}>
            <h2 className="text-xl font-semibold mb-4">Team's Todos</h2>
            <div className="flex flex-col gap-y-3">
              {isLoading ? (
                <TodoSkeleton />
              ) : otherUsersTodos.length > 0 ? (
                otherUsersTodos.map((todo) => (
                  <div key={todo.id} className="relative transform transition-all duration-200 hover:scale-[1.02]">
                    <TodoItem todo={todo} readonly={true} />
                    <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                      By: {todo.userName}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No team todos yet. Your teammates will add them soon!
                </div>
              )}
            </div>
          </div>
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