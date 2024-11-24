/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useTodo } from '../contexts/todoContext.jsx';

function TodoForm() {
    const [todo, setTodo] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {addTodo, isLoading} = useTodo()

    const add = async (e) => {
        e.preventDefault()

        // Trim the todo text
        const trimmedTodo = todo.trim()
        
        // Validate input
        if (!trimmedTodo) {
            return
        }

        try {
            setIsSubmitting(true)
            
            // Add the todo
            await addTodo({ 
                todo: trimmedTodo, 
                completed: false,
                priority: 'normal'
            })

            // Clear the input on success
            setTodo("")
        } catch (error) {
            console.error('Failed to add todo:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={add} className="flex flex-col gap-2">
            <div className="flex">
                <input
                    type="text"
                    placeholder="Write Todo..."
                    className={`w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 
                        ${isLoading ? 'bg-gray-100' : 'bg-white/20'} 
                        py-1.5 focus:border-blue-400`}
                    value={todo}
                    onChange={(e) => setTodo(e.target.value)}
                    disabled={isLoading || isSubmitting}
                    maxLength={100}
                />
                <button 
                    type="submit" 
                    className={`rounded-r-lg px-3 py-1 text-white shrink-0 transition-colors
                        ${isLoading || isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                        }`}
                    disabled={isLoading || isSubmitting || !todo.trim()}
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </button>
            </div>
            <div className="text-right text-xs text-gray-400">
                {todo.length}/100 characters
            </div>
        </form>
    );
}

export default TodoForm;