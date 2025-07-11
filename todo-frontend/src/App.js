import React, { useEffect, useState } from 'react';
import './App.css'; // ✅ Link your custom CSS file here

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLogin, setIsLogin] = useState(true); // ✅ Toggle login/signup

  const API_BASE = "http://127.0.0.1:8000";

  const loginUser = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      alert("✅ Logged in!");
    } else {
      alert("❌ Login failed");
    }
  };

  // ✅ Signup user
  const signupUser = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email: `${username}@test.com`, hashed_password: password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Signup successful, now login!");
      setIsLogin(true);
    } else {
      alert(`❌ Signup failed: ${data.detail}`);
    }
  };

  const fetchTasks = async () => {
    const res = await fetch(`${API_BASE}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, completed: false }),
    });
    setTitle("");
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await fetch(`${API_BASE}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  // ✅ Logout user
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
    alert("👋 Logged out!");
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  return (
    <div className="container">
      <h2>🛡️ Secure Todo App</h2>

      {/* ✅ Login / Signup Toggle */}
      {!token && (
        <>
          <form onSubmit={isLogin ? loginUser : signupUser} className="auth-form">
            <h3>{isLogin ? "🔐 Login" : "📝 Signup"}</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit">{isLogin ? "Login" : "Signup"}</button>
            <p>
              {isLogin ? "New user?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Signup here" : "Login here"}
              </button>
            </p>
          </form>
        </>
      )}

      {/* ✅ Logout + Task Input */}
      {token && (
        <>
          <button onClick={logout} className="logout-btn">Logout</button>
          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task"
              required
            />
            <button type="submit">Add Task</button>
          </form>
        </>
      )}

      {/* ✅ Task List */}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} {task.completed ? "✅" : "❌"}
            <button onClick={() => toggleComplete(task)}>Toggle</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
