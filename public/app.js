// ==========================
// AUTH CHECK
// ==========================
const token = localStorage.getItem("token");
const userRole = localStorage.getItem("role");
const userName = localStorage.getItem("name");

if (!token) window.location.href = "login.html";

const API_BASE = "/api/students";

// Form Elements
const studentForm = document.getElementById("student-form");
const studentsTableBody = document.getElementById("students-table-body");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const idInput = document.getElementById("student-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const yearInput = document.getElementById("year");
const rollInput = document.getElementById("rollNumber");


// ==========================
// DASHBOARD SETUP
// ==========================
document.addEventListener("DOMContentLoaded", () => {

  // Top Bar Info
  const userInfoEl = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (userInfoEl && userName) {
    userInfoEl.textContent = `Logged in as ${userName} (${userRole})`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // Dashboard Titles
  const title = document.getElementById("dashboard-title");
  const subtitle = document.getElementById("dashboard-subtitle");
  const cards = document.getElementById("dashboard-cards");

  title.textContent = `Welcome, ${userName}`;
  subtitle.textContent =
    userRole === "coordinator"
      ? "You have full access to manage students."
      : "You can view the student records.";

  // Coordinator Cards
  if (userRole === "coordinator") {
    cards.innerHTML = `
      <div class="card-box">
        <div class="card-title">Total Students</div>
        <div class="card-value" id="count-students">0</div>
      </div>

      <div class="card-box">
        <div class="card-title">Unique Courses</div>
        <div class="card-value" id="count-courses">0</div>
      </div>

      <div class="card-box">
        <div class="card-title">Final Year Students</div>
        <div class="card-value" id="count-final">0</div>
      </div>
    `;
  }

  // Student → Hide Add/Edit Form
  if (userRole !== "coordinator") {
    const formCard = document.querySelector(".form-card");
    if (formCard) formCard.style.display = "none";
  }

  // Student → Show "My Attendance" Only
  const myAttendanceLink = document.getElementById("student-attendance-link");
  if (userRole !== "student") {
    if (myAttendanceLink) myAttendanceLink.style.display = "none";
  }

  // Load students
  loadStudents();
});


// ==========================
// LOAD STUDENTS
// ==========================
async function loadStudents() {
  try {
    const res = await fetch(API_BASE, {
      headers: { Authorization: "Bearer " + token },
    });

    const students = await res.json();
    renderStudents(students);

    if (userRole === "coordinator") {
      document.getElementById("count-students").textContent = students.length;

      const courses = new Set(students.map((s) => s.course));
      document.getElementById("count-courses").textContent = courses.size;

      const finalYear = students.filter((s) => Number(s.year) === 4).length;
      document.getElementById("count-final").textContent = finalYear;
    }

  } catch (err) {
    showMessage("Error loading students", "error");
  }
}


// ==========================
// RENDER STUDENT TABLE
// ==========================
function renderStudents(students) {
  studentsTableBody.innerHTML = "";

  if (students.length === 0) {
    studentsTableBody.innerHTML =
      '<tr><td colspan="6">No students found.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>${student.year}</td>
      <td>${student.rollNumber}</td>
      <td>
        ${
          userRole === "coordinator"
            ? `
              <button class="action-btn edit" data-id="${student._id}">Edit</button>
              <button class="action-btn delete" data-id="${student._id}">Delete</button>
            `
            : "No Access"
        }
      </td>
    `;

    studentsTableBody.appendChild(tr);
  });

  if (userRole === "coordinator") {
    document.querySelectorAll(".action-btn.edit")
      .forEach((btn) => btn.addEventListener("click", () => startEdit(btn.dataset.id)));

    document.querySelectorAll(".action-btn.delete")
      .forEach((btn) => btn.addEventListener("click", () => deleteStudent(btn.dataset.id)));
  }
}


// ==========================
// ADD / UPDATE STUDENT
// ==========================
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = idInput.value;

  const payload = {
    name: nameInput.value,
    email: emailInput.value,
    course: courseInput.value,
    year: Number(yearInput.value),
    rollNumber: rollInput.value,
  };

  if (!payload.name || !payload.email || !payload.course || !payload.year || !payload.rollNumber) {
    showMessage("Please fill all fields", "error");
    return;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };

    const res = await fetch(id ? `${API_BASE}/${id}` : API_BASE, {
      method: id ? "PUT" : "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Error occurred", "error");
      return;
    }

    showMessage(id ? "Student updated" : "Student added", "success");
    resetForm();
    loadStudents();

  } catch (err) {
    showMessage("Server error", "error");
  }
});


// ==========================
// EDIT STUDENT
// ==========================
async function startEdit(id) {
  const res = await fetch(API_BASE, {
    headers: { Authorization: "Bearer " + token },
  });

  const students = await res.json();
  const student = students.find((s) => s._id === id);

  if (!student) return;

  idInput.value = student._id;
  nameInput.value = student.name;
  emailInput.value = student.email;
  courseInput.value = student.course;
  yearInput.value = student.year;
  rollInput.value = student.rollNumber;

  submitBtn.textContent = "Update Student";
  cancelEditBtn.style.display = "inline-block";
}


// ==========================
// DELETE STUDENT
// ==========================
async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  const data = await res.json();

  if (!res.ok) {
    showMessage(data.message || "Error deleting", "error");
  } else {
    showMessage("Student deleted", "success");
    loadStudents();
  }
}


// ==========================
// HELPER FUNCTIONS
// ==========================
function showMessage(msg, type) {
  messageEl.textContent = msg;
  messageEl.className = "message " + type;

  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.className = "message";
  }, 3000);
}

function resetForm() {
  idInput.value = "";
  studentForm.reset();
  submitBtn.textContent = "Add Student";
  cancelEditBtn.style.display = "none";
}


// ==========================
// ATTENDANCE SYSTEM
// ==========================
const attendanceSection = document.getElementById("attendance-section");
const attendanceDateInput = document.getElementById("attendance-date");
const attendanceTableBody = document.getElementById("attendance-table-body");
const saveAttendanceBtn = document.getElementById("save-attendance-btn");

// Students cannot see attendance panel
if (userRole !== "coordinator") {
  if (attendanceSection) attendanceSection.style.display = "none";
}

if (attendanceDateInput) {
  attendanceDateInput.addEventListener("change", loadAttendanceForDate);
}

async function loadAttendanceForDate() {
  const date = attendanceDateInput.value;
  if (!date) return;

  const resStudents = await fetch(API_BASE, {
    headers: { Authorization: "Bearer " + token },
  });
  const students = await resStudents.json();

  const resAttendance = await fetch(`/api/attendance/day/${date}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const attendance = await resAttendance.json();

  attendanceTableBody.innerHTML = "";

  students.forEach((student) => {
    const existingEntry =
      attendance?.records?.find((r) => r.studentId._id === student._id) || null;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.rollNumber}</td>
      <td>
        <select data-id="${student._id}">
          <option value="Present" ${existingEntry?.status === "Present" ? "selected" : ""}>Present</option>
          <option value="Absent" ${existingEntry?.status === "Absent" ? "selected" : ""}>Absent</option>
        </select>
      </td>
    `;

    attendanceTableBody.appendChild(row);
  });
}

// Save Attendance
if (saveAttendanceBtn) {
  saveAttendanceBtn.addEventListener("click", saveAttendance);
}

async function saveAttendance() {
  const date = attendanceDateInput.value;
  if (!date) return alert("Please select a date");

  const rows = attendanceTableBody.querySelectorAll("tr");
  const records = [];

  rows.forEach((row) => {
    const select = row.querySelector("select");
    records.push({
      studentId: select.getAttribute("data-id"),
      status: select.value,
    });
  });

  try {
    const res = await fetch("/api/attendance/mark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ date, records }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Attendance saved successfully");
    } else {
      alert(data.message || "Error saving attendance");
    }
  } catch (err) {
    alert("Server error");
  }
}
