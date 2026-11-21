
const express = require("express");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary in-memory task storage
let tasks = [];

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Add a new task
app.post("/api/tasks", (req, res) => {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const task = {
        id: randomUUID(),
        title: title.trim(),
        description: description || "",
        completed: false,
        createdAt: new Date()
    };

    tasks.push(task);
    res.status(201).json(task);
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, description, completed } = req.body;

    if (title !== undefined) {
        if (!title.trim()) {
            return res.status(400).json({
                message: "Task title cannot be empty"
            });
        }
        task.title = title.trim();
    }

    if (description !== undefined) {
        task.description = description;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const initialLength = tasks.length;

    tasks = tasks.filter(t => t.id !== req.params.id);

    if (tasks.length === initialLength) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({ message: "Task deleted successfully" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow running on port ${PORT}`);
});
