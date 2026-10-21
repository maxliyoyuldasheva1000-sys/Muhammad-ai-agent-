
const express = require("express");
const db = require("./db");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Muhammad AI Agent ishlayapti!",
    status: "OK"
  });
});

// AI bilan suhbat
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Xabar matnini yuboring"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY sozlanmagan"
    });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "Sen Muhammad AI Agent nomli yordamchisan. O'zbek tilida sodda va foydali javob ber.",
      input: message.trim()
    });

    res.json({
      reply: response.output_text
    });
  } catch (error) {
    console.error("AI xatosi:", error.status || error.message);

    res.status(500).json({
      error: "AI javob bermadi. API kaliti, billing va modelni tekshiring."
    });
  }
});

// Vazifani saqlash
app.post("/tasks", (req, res) => {
  const { task } = req.body || {};

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

// Vazifalarni ko'rish
app.get("/tasks", (req, res) => {
  const tasks = db.prepare(
    "SELECT * FROM tasks ORDER BY id DESC"
  ).all();

  res.json(tasks);
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: port ${PORT}`);
});
