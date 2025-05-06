document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.querySelector(".title").style.color = "white";
  }
});

function addRow(subject = "", grade = "", units = "") {
  const table = document.getElementById("subjectsBody");
  const row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" class="subject-input" value="${subject}" placeholder="Subject Name"></td>
    <td><input type="number" class="grade-input" step="0.01" min="1.0" max="3.0" value="${grade}" placeholder="Grade" oninput="calculateGWA()"></td>
    <td><input type="number" class="unit-input" min="1" value="${units}" placeholder="Units" oninput="calculateGWA()"></td>
    <td><button class="btn btn-danger" onclick="deleteRow(this)">❌</button></td>
  `;
}

function deleteRow(btn) {
  btn.closest("tr").remove();
  calculateGWA();
  saveData();
}

function calculateGWA() {
  const grades = document.querySelectorAll(".grade-input");
  const units = document.querySelectorAll(".unit-input");

  let totalUnits = 0, weightedSum = 0;

  grades.forEach((gradeInput, index) => {
    const grade = parseFloat(gradeInput.value);
    const unit = parseFloat(units[index].value);

    if (!isNaN(grade) && !isNaN(unit) && grade >= 1.0 && grade <= 3.0) {
      weightedSum += grade * unit;
      totalUnits += unit;
    }
  });

  const finalGWA = totalUnits > 0 ? (weightedSum / totalUnits).toFixed(2) : "-";
  document.getElementById("gwaResult").textContent = finalGWA;
  saveData();
}

function saveData() {
  const subjects = [];
  document.querySelectorAll("#subjectsTable tbody tr").forEach(row => {
    subjects.push({
      subject: row.querySelector(".subject-input").value,
      grade: row.querySelector(".grade-input").value,
      units: row.querySelector(".unit-input").value
    });
  });
  localStorage.setItem("gwaData", JSON.stringify(subjects));
}

function loadSavedData() {
  const savedData = JSON.parse(localStorage.getItem("gwaData") || "[]");
  savedData.forEach(data => addRow(data.subject, data.grade, data.units));
  calculateGWA();
}

function resetTable() {
  document.getElementById("subjectsBody").innerHTML = "";
  document.getElementById("gwaResult").textContent = "-";
  localStorage.removeItem("gwaData");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const title = document.querySelector(".title");
  title.style.color = document.body.classList.contains("dark-mode") ? "white" : "#4b0082";
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function exportData() {
  const savedData = JSON.parse(localStorage.getItem("gwaData") || "[]");
  if (savedData.length === 0) return alert("No data to export!");

  const csvContent = [
    "Subject,Grade,Units",
    ...savedData.map(item => `"${item.subject.replace(/"/g, '""')}",${item.grade},${item.units}`),
    `\nGWA,${document.getElementById("gwaResult").textContent}`
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ctu_grades.csv";
  link.click();
    }
