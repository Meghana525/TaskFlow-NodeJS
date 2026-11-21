
const API = "/api/tasks";

let tasks = [];
let currentFilter = "all";

const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

async function loadTasks() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Unable to load tasks");

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        taskList.innerHTML = `<p class="empty">Unable to load tasks. Please refresh.</p>`;
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) throw new Error("Could not add task");

        form.reset();
        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
});

async function updateTask(id, data) {
    const response = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        alert("Could not update task");
        return;
    }

    await loadTasks();
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("Could not delete task");
        return;
    }

    await loadTasks();
}

function renderTasks() {
    document.getElementById("total").textContent = tasks.length;

    document.getElementById("pending").textContent =
        tasks.filter(t => !t.completed).length;

    document.getElementById("completed").textContent =
        tasks.filter(t => t.completed).length;

    const filtered = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        taskList.innerHTML = `<div class="empty">No tasks found. Add a new task!</div>`;
        return;
    }

    taskList.innerHTML = filtered.map(task => `
        <div class="task-card ${task.completed ? "done" : ""}">
            <div>
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description)}</p>
                <p>${task.completed ? "Completed" : "Pending"}</p>
            </div>

            <div class="task-actions">
                <button onclick="toggleTask('${task.id}')">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button class="edit-btn"
                    onclick="editTask('${task.id}')">Edit</button>

                <button class="delete-btn"
                    onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join("");
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);

    if (task) {
        await updateTask(id, { completed: !task.completed });
    }
}

async function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const title = prompt("Edit task title:", task.title);
    if (title === null) return;

    const description = prompt("Edit description:", task.description);
    if (description === null) return;

    await updateTask(id, { title, description });
}

document.querySelectorAll(".filters button").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filters button")
            .forEach(b => b.classList.remove("active"));

        button.classList.add("active");
        renderTasks();
    });
});

loadTasks();
