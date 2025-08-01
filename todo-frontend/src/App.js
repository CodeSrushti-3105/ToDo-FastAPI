import React, { useEffect, useState } from 'react';
import './App.css'; // Your custom CSS

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ new state
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLogin, setIsLogin] = useState(true); // login/signup toggle

  //const API_BASE = "http://127.0.0.1:8000";
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // ✅ Login function
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

  // ✅ Signup with validation
  const signupUser = async (e) => {
    e.preventDefault();

    if (username.length < 3) {
      alert("❌ Username must be at least 3 characters.");
      return;
    }
    if (password.length < 5) {
      alert("❌ Password must be at least 5 characters.");
      return;
    }
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }

    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email: `${username}@test.com`,
        hashed_password: password
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Signup successful! Now login.");
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
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

      {/* ✅ Login / Signup Form */}
      {!token && (
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
          {!isLogin && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          )}
          <button type="submit">{isLogin ? "Login" : "Signup"}</button>
          <p>
            {isLogin ? "New user?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Signup here" : "Login here"}
            </button>
          </p>
        </form>
      )}

      {/* ✅ Logout and Task Form */}
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
