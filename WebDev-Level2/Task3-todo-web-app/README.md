# Task Manager – To-Do Web App

A simple and responsive Task Manager built with HTML, CSS, and vanilla JavaScript. It helps users organize daily activities by managing pending and completed tasks.

## Features

- **Add Tasks:** Create new tasks using the input field or Enter key.
- **Complete Tasks:** Mark tasks as completed and move them to the Completed Tasks section.
- **Undo Completion:** Move completed tasks back to the Pending Tasks section.
- **Edit Tasks:** Update task descriptions inline.
- **Delete Tasks:** Remove tasks when they are no longer needed.
- **Task Counters:** Display the number of pending and completed tasks.
- **Timestamps:** Show when tasks were created and completed.
- **Local Storage:** Automatically save tasks in the browser so they remain available after refreshing the page.
- **Empty States:** Display helpful messages when there are no pending or completed tasks.
- **Responsive Design:** Adapt the layout to different screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Browser Local Storage

## Project Structure

```text
Task3-todo-web-app/
│
├── index.html
├── README.md
│
├── css/
│   └── style.css
│
└── js/
    └── script.js
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/alemuneima4-oss/OIBSIP.git
```

### 2. Navigate to the Project Folder

```bash
cd OIBSIP/WebDev-Level2/Task3-todo-web-app
```

### 3. Run the Application

Open `index.html` in your browser.

Alternatively, open the project in Visual Studio Code and use the Live Server extension.

## How It Works

The application uses JavaScript to manage tasks dynamically through DOM manipulation.

Tasks are stored as JavaScript objects containing:

- `id`: Unique task identifier.
- `text`: Task description.
- `completed`: Completion status.
- `createdAt`: Task creation timestamp.
- `completedAt`: Task completion timestamp.

The application uses `localStorage` to save and retrieve task data, allowing tasks to persist when the browser page is refreshed.

## Author

**Neima Alemu**

GitHub: [alemuneima4-oss](https://github.com/alemuneima4-oss)