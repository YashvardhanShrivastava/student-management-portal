// signup.js

const signupForm = document.getElementById("signup-form");
const signupMsg = document.getElementById("signup-message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const role = document.getElementById("signup-role").value;

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      signupMsg.textContent = data.message || "Signup failed";
      signupMsg.className = "message error";
      return;
    }

    // Save token & role
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("name", data.user.name);

    // Redirect
    window.location.href = "index.html";
  } catch (err) {
    signupMsg.textContent = "Server error";
    signupMsg.className = "message error";
  }
});
