import React, { useEffect, useState } from 'react';
import './index.css'; // ✅ This links the CSS to your app


function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const API_BASE = "http://127.0.0.1:8000";  // Your FastAPI backend

  // 🔃 Load tasks from FastAPI
  const fetchTasks = async () => {
    const res = await fetch(`${API_BASE}/tasks/`);
    const data = await res.json();
    setTasks(data);
  };

  // ➕ Add a new task
  const addTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false })
    });
    setTitle("");
    fetchTasks();  // Reload after adding
  };

  // ✅ ADDED: Toggle completion status
  const toggleComplete = async (task) => {
    await fetch(`${API_BASE}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...task,
        completed: !task.completed
      }),
    });
    fetchTasks();
  };

  // ✅ ADDED: Delete a task
  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE"
    });
    fetchTasks();
  };

  // ✅ UPDATED: UI with buttons to toggle and delete
  return (
    <div style={{ padding: "2rem" }}>
      <h2>📝 Todo List</h2>

      <form onSubmit={addTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task"
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} {task.completed ? "✅" : "❌"}
            <button onClick={() => toggleComplete(task)}>Toggle</button> {/* ✅ ADDED */}
            <button onClick={() => deleteTask(task.id)}>Delete</button> {/* ✅ ADDED */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
