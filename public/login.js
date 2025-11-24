// login.js

const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      loginMsg.textContent = data.message || "Login failed";
      loginMsg.className = "message error";
      return;
    }

    // Save token and role
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("name", data.user.name);

    // Go to main dashboard
    window.location.href = "index.html";
  } catch (err) {
    loginMsg.textContent = "Server error";
    loginMsg.className = "message error";
  }
});
