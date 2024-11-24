const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all todos (including team todos)
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({
            $or: [
                { userId: req.user._id },
                { isTeamTodo: true }
            ]
        }).sort({ createdAt: -1 });
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
            userName: req.user.name,
            isTeamTodo: req.body.isTeamTodo || false
        });
        await todo.save();
        
        // Emit socket event
        const io = req.app.get('io');
        if (todo.isTeamTodo) {
            io.emit('newTodo', todo); // Broadcast to all users if it's a team todo
        } else {
            io.emit('newTodo', { ...todo.toObject(), userId: req.user._id }); // Send to specific user
        }
        
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update todo
router.patch('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.user._id },
                { isTeamTodo: true }
            ]
        });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        // Only allow the creator to update non-completion fields of team todos
        if (todo.isTeamTodo && todo.userId.toString() !== req.user._id.toString()) {
            const allowedUpdates = ['completed'];
            Object.keys(req.body).forEach(key => {
                if (!allowedUpdates.includes(key)) {
                    delete req.body[key];
                }
            });
        }

        Object.assign(todo, req.body);
        await todo.save();
        
        // Emit socket event
        const io = req.app.get('io');
        if (todo.isTeamTodo) {
            io.emit('updateTodo', todo);
        } else {
            io.emit('updateTodo', { ...todo.toObject(), userId: req.user._id });
        }
        
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.user._id },
                { isTeamTodo: true, userId: req.user._id } // Only creator can delete team todos
            ]
        });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        await todo.deleteOne();
        
        // Emit socket event
        const io = req.app.get('io');
        if (todo.isTeamTodo) {
            io.emit('deleteTodo', { id: req.params.id });
        } else {
            io.emit('deleteTodo', { id: req.params.id, userId: req.user._id });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle todo completion
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            $or: [
                { userId: req.user._id },
                { isTeamTodo: true }
            ]
        });
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        todo.completed = !todo.completed;
        if (todo.isTeamTodo) {
            todo.lastCompletedBy = req.user.name;
            todo.lastCompletedAt = new Date();
        }
        await todo.save();
        
        // Emit socket event
        const io = req.app.get('io');
        if (todo.isTeamTodo) {
            io.emit('updateTodo', todo);
        } else {
            io.emit('updateTodo', { ...todo.toObject(), userId: req.user._id });
        }
        
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
