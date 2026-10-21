
const express = require("express");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Mening AI agentim serveri ishlayapti!",
    status: "OK"
  });
});

// Vazifani bazaga saqlash
app.post("/tasks", (req, res) => {
  const { task } = req.body;

  if (typeof task !== "string" || !task.trim()) {
    return res.status(400).json({
      error: "Vazifani yozing"
    });
  }

  const result = db.prepare(
    "INSERT INTO tasks (task) VALUES (?)"
  ).run(task.trim());

  res.json({
    message: "Vazifa bazaga saqlandi!",
    id: result.lastInsertRowid,
    task: task.trim()
  });
});

// Bazadagi vazifalarni ko'rish
app.get("/tasks", (req, res) => {
  const tasks = db.prepare(
    "SELECT * FROM tasks ORDER BY id DESC"
  ).all();

  res.json(tasks);
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: port ${PORT}`);
});
