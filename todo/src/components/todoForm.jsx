/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react'
import { useTodo } from '../contexts/todoContext.jsx';

function TodoForm() {
    const [todo, setTodo] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [customTime, setCustomTime] = useState("")
    const [isCustomFocused, setIsCustomFocused] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {addTodo, isLoading} = useTodo()
    const customInputRef = useRef(null)

    const handleTimeSelection = (minutes) => {
        if (!minutes) {
            setDueDate("");
            setCustomTime("");
            return;
        }

        const now = new Date();
        const newDueDate = new Date(now.getTime() + minutes * 60000);
        setDueDate(newDueDate.toISOString());
    };

    const handleCustomTimeChange = (e) => {
        const value = e.target.value;
        // Remove leading zeros
        const cleanValue = value.replace(/^0+/, '');
        setCustomTime(cleanValue);
        
        if (!cleanValue) {
            setDueDate("");
            return;
        }

        // Convert input minutes to milliseconds and add to current time
        const minutes = parseInt(cleanValue);
        if (!isNaN(minutes) && minutes > 0) {
            const now = new Date();
            const newDueDate = new Date(now.getTime() + minutes * 60000);
            setDueDate(newDueDate.toISOString());
        }
    };

    const handleCustomTimeKeyDown = (e) => {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            // Allow: home, end, left, right, up, down
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        // Ensure that it is a number and stop the keypress if not
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
            (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    };

    const formatDueTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const diffMins = Math.round(diffMs / (1000 * 60));

        if (diffMins < 60) {
            return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
        } else if (diffMins < 1440) { // less than 24 hours
            const hours = Math.round(diffMins / 60);
            return `${hours} hr${hours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.round(diffMins / 1440);
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    };

    const add = async (e) => {
        e.preventDefault()
        const trimmedTodo = todo.trim()
        if (!trimmedTodo) return;

        try {
            setIsSubmitting(true)
            await addTodo({ 
                todo: trimmedTodo, 
                completed: false,
                priority: 'normal',
                dueDate: dueDate || null
            })

            setTodo("")
            setDueDate("")
            setCustomTime("")
        } catch (error) {
            console.error('Failed to add todo:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={add} className="flex flex-col gap-3">
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Write Todo..."
                        className={`w-full border border-black/10 rounded-lg px-3 outline-none duration-150 
                            ${isLoading ? 'bg-gray-100' : 'bg-white/20'} 
                            py-1.5 focus:border-blue-400`}
                        value={todo}
                        onChange={(e) => setTodo(e.target.value)}
                        disabled={isLoading || isSubmitting}
                        maxLength={100}
                    />
                    <div className="text-right text-xs text-gray-400">
                        {todo.length}/100 characters
                    </div>
                </div>

                <button 
                    type="submit" 
                    className={`rounded-lg px-6 py-1.5 text-white shrink-0 transition-colors
                        ${isLoading || isSubmitting || !todo.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                        }`}
                    disabled={isLoading || isSubmitting || !todo.trim()}
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1.5">
                    <button
                        type="button"
                        onClick={() => handleTimeSelection(15)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors
                            ${dueDate && new Date(dueDate).getTime() === new Date().getTime() + 15 * 60000 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                        15m
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTimeSelection(30)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors
                            ${dueDate && new Date(dueDate).getTime() === new Date().getTime() + 30 * 60000 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                        30m
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTimeSelection(60)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors
                            ${dueDate && new Date(dueDate).getTime() === new Date().getTime() + 60 * 60000 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                        1h
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            ref={customInputRef}
                            type="number"
                            placeholder="Set time"
                            className={`w-[88px] text-sm px-3 py-1.5 rounded-lg 
                                outline-none transition-all duration-200
                                ${isCustomFocused 
                                    ? 'border-2 border-blue-400 bg-white/20' 
                                    : 'border border-black/10 bg-white/10'}
                                text-white font-medium tracking-wide
                                placeholder-gray-400/70 placeholder:font-normal
                                focus:ring-2 focus:ring-blue-400/20
                                [appearance:textfield]
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none`}
                            value={customTime}
                            onChange={handleCustomTimeChange}
                            onKeyDown={handleCustomTimeKeyDown}
                            onFocus={() => setIsCustomFocused(true)}
                            onBlur={() => setIsCustomFocused(false)}
                            min="1"
                            max="10080" // 1 week in minutes
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium
                            transition-colors duration-200
                            ${isCustomFocused ? 'text-blue-300' : 'text-gray-400/70'}`}>
                            min
                        </span>
                    </div>
                    {dueDate && (
                        <>
                            <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg
                                border border-blue-500/20">
                                Due in: {formatDueTime(dueDate)}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleTimeSelection(0)}
                                className="text-sm w-8 h-8 rounded-lg bg-red-500/20 text-red-300 
                                    hover:bg-red-500/30 transition-colors flex items-center justify-center
                                    border border-red-500/20"
                            >
                                ✕
                            </button>
                        </>
                    )}
                </div>
            </div>
        </form>
    );
}

export default TodoForm;