/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./userContext.jsx";

const TodoContext = createContext({
    todos: [],
    userTodos: [],
    otherUsersTodos: [],
    addTodo: (todo) => {},
    updateTodo: (id, todo) => {},
    deleteTodo: (id) => {},
    toggleComplete: (id) => {},
    isLoading: false
});

// Custom hook for handling storage events
const useStorageSync = (callback) => {
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "todos") {
                callback(JSON.parse(e.newValue || "[]"));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [callback]);
};

export const TodoProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    // Memoized filtered todos
    const userTodos = todos.filter(todo => todo.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const otherUsersTodos = todos.filter(todo => todo.userId !== user?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Handle storage sync
    const handleStorageUpdate = useCallback((newTodos) => {
        setTodos(newTodos);
    }, []);

    useStorageSync(handleStorageUpdate);

    const saveTodos = useCallback((newTodos) => {
        try {
            const todosToSave = typeof newTodos === 'function' 
                ? newTodos(todos) 
                : newTodos;
            
            localStorage.setItem("todos", JSON.stringify(todosToSave));
            setTodos(todosToSave);
            return true;
        } catch (error) {
            console.error('Error saving todos:', error);
            return false;
        }
    }, [todos]);

    const addTodo = useCallback(async (todo) => {
        try {
            const newTodo = {
                id: Date.now(),
                userId: user?.id,
                userName: user?.name,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                ...todo
            };
            
            const success = saveTodos(prevTodos => [newTodo, ...prevTodos]);
            if (!success) {
                throw new Error('Failed to save todo');
            }
            
            return newTodo;
        } catch (error) {
            console.error('Error adding todo:', error);
            throw error;
        }
    }, [user, saveTodos]);

    const updateTodo = useCallback((id, todo) => {
        try {
            const success = saveTodos(prevTodos => 
                prevTodos.map(prevTodo => 
                    prevTodo.id === id && prevTodo.userId === user?.id
                        ? { 
                            ...prevTodo,
                            ...todo,
                            lastModified: new Date().toISOString()
                        }
                        : prevTodo
                )
            );
            
            if (!success) {
                throw new Error('Failed to update todo');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    }, [user, saveTodos]);

    const deleteTodo = useCallback((id) => {
        try {
            const success = saveTodos(prevTodos => 
                prevTodos.filter(todo => 
                    !(todo.id === id && todo.userId === user?.id)
                )
            );
            
            if (!success) {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }, [user, saveTodos]);

    const toggleComplete = useCallback((id) => {
        try {
            const success = saveTodos(prevTodos => 
                prevTodos.map(prevTodo => 
                    prevTodo.id === id && prevTodo.userId === user?.id
                        ? { 
                            ...prevTodo, 
                            completed: !prevTodo.completed,
                            lastModified: new Date().toISOString()
                        }
                        : prevTodo
                )
            );
            
            if (!success) {
                throw new Error('Failed to toggle todo completion');
            }
        } catch (error) {
            console.error('Error toggling todo completion:', error);
            throw error;
        }
    }, [user, saveTodos]);

    // Initial load
    useEffect(() => {
        const loadTodos = () => {
            setIsLoading(true);
            try {
                const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
                setTodos(savedTodos);
            } catch (error) {
                console.error("Error loading todos:", error);
                setTodos([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTodos();
        
        // Set up periodic sync
        const syncInterval = setInterval(loadTodos, 2000);
        return () => clearInterval(syncInterval);
    }, []);

    return (
        <TodoContext.Provider 
            value={{
                todos,
                userTodos,
                otherUsersTodos,
                addTodo,
                updateTodo,
                deleteTodo,
                toggleComplete,
                isLoading
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error("useTodo must be used within a TodoProvider");
    }
    return context;
};
