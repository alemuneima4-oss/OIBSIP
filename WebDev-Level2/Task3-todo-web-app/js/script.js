
// ========================================
// 1. GET HTML ELEMENTS
// ========================================

const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task-btn");

const pendingList = document.getElementById("pending-list");
const completedList = document.getElementById("completed-list");

const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

const currentYear = document.getElementById("current-year");


// ========================================
// 2. APPLICATION STATE
// ========================================

// Load previously saved tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let editingTaskId = null;

currentYear.textContent = new Date().getFullYear();


// ========================================
// 3. SAVE TASKS TO LOCAL STORAGE
// ========================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// ========================================
// 4. ADD A NEW TASK
// ========================================

function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.push(task);

    saveTasks();

    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

addTaskButton.addEventListener("click", addTask);


// Allow Enter key to add a task
taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});


// ========================================
// 5. FORMAT TIMESTAMPS
// ========================================

function formatDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString();
}


// ========================================
// 6. RENDER ALL TASKS
// ========================================

function renderTasks() {

    // Clear both lists before rendering
    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    // Separate pending and completed tasks
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    // Update task counters
    pendingCount.textContent = `${pendingTasks.length} pending`;
    completedCount.textContent = `${completedTasks.length} completed`;

    // Display empty messages
    if (pendingTasks.length === 0) {
        pendingList.innerHTML = `
            <p class="empty-state">No pending tasks. You're all caught up!</p>
        `;
    }

    if (completedTasks.length === 0) {
        completedList.innerHTML = `
            <p class="empty-state">No completed tasks yet.</p>
        `;
    }

    // Render pending tasks
    pendingTasks.forEach(task => {
        renderTask(task, pendingList);
    });

    // Render completed tasks
    completedTasks.forEach(task => {
        renderTask(task, completedList);
    });
}


// ========================================
// 7. RENDER AN INDIVIDUAL TASK
// ========================================

function renderTask(task, list) {

    const taskElement = document.createElement("div");

    taskElement.classList.add("task-item");

    if (task.completed) {
        taskElement.classList.add("completed-task");
    }

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    // Inline editing mode
    if (editingTaskId === task.id) {

        const editInput = document.createElement("input");

        editInput.type = "text";
        editInput.value = task.text;
        editInput.classList.add("edit-input");

        taskInfo.appendChild(editInput);

        setTimeout(() => editInput.focus(), 0);

        editInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                saveEdit(task.id, editInput.value);
            }

            if (event.key === "Escape") {
                editingTaskId = null;
                renderTasks();
            }
        });

        const actions = document.createElement("div");
        actions.classList.add("task-actions");

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-btn");

        saveButton.addEventListener("click", () => {
            saveEdit(task.id, editInput.value);
        });

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-btn");

        cancelButton.addEventListener("click", () => {
            editingTaskId = null;
            renderTasks();
        });

        actions.append(saveButton, cancelButton);

        taskElement.append(taskInfo, actions);

        list.appendChild(taskElement);

        return;
    }

    // Display task text
    const taskText = document.createElement("p");

    taskText.classList.add("task-text");
    taskText.textContent = task.text;

    taskInfo.appendChild(taskText);

    // Display timestamps
    const taskMeta = document.createElement("p");

    taskMeta.classList.add("task-meta");

    taskMeta.textContent = `Added: ${formatDate(task.createdAt)}`;

    if (task.completedAt) {
        taskMeta.textContent += ` | Completed: ${formatDate(task.completedAt)}`;
    }

    taskInfo.appendChild(taskMeta);


    // ========================================
    // TASK ACTION BUTTONS
    // ========================================

    const actions = document.createElement("div");
    actions.classList.add("task-actions");


    // Complete / Undo button
    const completeButton = document.createElement("button");

    completeButton.textContent = task.completed
        ? "Undo"
        : "Mark Complete";

    completeButton.classList.add("complete-btn");

    completeButton.addEventListener("click", () => {
        toggleTask(task.id);
    });


    // Edit button
    const editButton = document.createElement("button");

    editButton.textContent = "Edit";
    editButton.classList.add("edit-btn");

    editButton.addEventListener("click", () => {

        editingTaskId = task.id;

        renderTasks();
    });


    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });


    actions.append(completeButton, editButton, deleteButton);

    taskElement.append(taskInfo, actions);

    list.appendChild(taskElement);
}


// ========================================
// 8. MARK TASK COMPLETE OR PENDING
// ========================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            const newStatus = !task.completed;

            return {
                ...task,
                completed: newStatus,
                completedAt: newStatus
                    ? new Date().toISOString()
                    : null
            };
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// ========================================
// 9. EDIT TASK
// ========================================

function saveEdit(id, newText) {

    const updatedText = newText.trim();

    if (updatedText === "") {
        alert("Task cannot be empty!");
        return;
    }

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                text: updatedText
            };
        }

        return task;
    });

    editingTaskId = null;

    saveTasks();

    renderTasks();
}


// ========================================
// 10. DELETE TASK
// ========================================

function deleteTask(id) {

    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}


// ========================================
// 11. INITIAL RENDER
// ========================================

// Display saved tasks when the page loads
renderTasks();
