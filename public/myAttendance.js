// =======================
// AUTH CHECK
// =======================

const token = localStorage.getItem("token");
const userRole = localStorage.getItem("role");
const userName = localStorage.getItem("name");

if (!token) {
  window.location.href = "login.html";
}

// =======================
// NAVBAR USER INFO + LOGOUT
// =======================

const userInfoEl = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");

if (userInfoEl && userName) {
  userInfoEl.textContent = `Logged in as ${userName} (${userRole})`;
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "login.html";
  });
}

// =======================
// LOAD MY ATTENDANCE
// =======================

const tableBody = document.getElementById("attendance-history-table");

async function loadMyAttendance() {
  try {
    const res = await fetch("/api/attendance/my-attendance", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    tableBody.innerHTML = "";

    data.forEach((day) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${day.date}</td>
        <td style="color: ${day.status === "Present" ? "green" : "red"};">
          ${day.status}
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading attendance:", err);
  }
}

loadMyAttendance();
