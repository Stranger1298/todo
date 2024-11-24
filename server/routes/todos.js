const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all todos (including team todos)
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's todos
router.get('/my', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create todo
router.post('/', auth, async (req, res) => {
    try {
        const todo = new Todo({
            ...req.body,
            userId: req.user._id,
            userName: req.user.name
        });
        await todo.save();
        
        // Emit socket event
        req.app.get('io').emit('newTodo', todo);
        
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update todo
router.patch('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        Object.assign(todo, req.body);
        await todo.save();
        
        // Emit socket event
        req.app.get('io').emit('updateTodo', todo);
        
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }
        
        // Emit socket event
        req.app.get('io').emit('deleteTodo', { id: req.params.id });
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle todo completion
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        todo.completed = !todo.completed;
        await todo.save();
        
        // Emit socket event
        req.app.get('io').emit('updateTodo', todo);
        
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
