
const express = require("express");
const db = require("./db");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

app.use(express.json({ limit: "1mb" }));

const SYSTEM_PROMPT = `
Sen Muhammad AI Agent nomli professional AI yordamchisan.
Foydalanuvchiga o'zbek tilida sodda, aniq va foydali javob ber.
Dasturlashda HTML, CSS, JavaScript, Python va Node.js
bo'yicha yordam ber.
Kod yozganda to'liq kod, fayl nomi va ishga tushirish
qadamlarini tushuntir.
Xatolarni tahlil qil va yechimni bosqichma-bosqich ko'rsat.
Bajarmagan ishingni bajardim deb aytma.
`;

app.get("/", (req, res) => {
  res.json({
    message: "Muhammad AI Agent ishlayapti!",
    status: "OK",
    features: ["AI chat", "task manager", "task planning"]
  });
});

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

async function askAI(message, instructions = SYSTEM_PROMPT) {
  const client = getClient();

  const response = await client.responses.create({
    model: MODEL,
    instructions,
    input: message
  });

  return response.output_text || "AI matnli javob qaytarmadi.";
}

// AI bilan suhbat
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Xabar matnini yuboring."
    });
  }

  try {
    const reply = await askAI(message.trim());
    res.json({ reply });
  } catch (error) {
    console.error("Chat xatosi:", {
      status: error.status,
      code: error.code,
      message: error.message
    });

    if (error.message === "OPENAI_API_KEY_MISSING") {
      return res.status(500).json({
        error: "Serverda OPENAI_API_KEY sozlanmagan."
      });
    }

    res.status(error.status === 429 ? 429 : 500).json({
      error: "AI so'rovini bajarib bo'lmadi.",
      reason:
        error.status === 429
          ? "Kredit, foydalanish limiti yoki tezlik limitini tekshiring."
          : "Server jurnali va API sozlamalarini tekshiring."
    });
  }
});

// Katta vazifani rejalashtirish
app.post("/plan", async (req, res) => {
  const { task } = req.body || {};

  if (typeof task !== "string" || !task.trim()) {
    return res.status(400).json({
      error: "Rejalashtiriladigan vazifani yozing."
    });
  }

  try {
    const reply = await askAI(
      task.trim(),
      `Sen Muhammad AI Agentning rejalashtiruvchisisan.
Vazifani kichik, bajarish mumkin bo'lgan bosqichlarga ajrat.
Har bosqichda maqsad, kerakli vositalar va tekshiruvni yoz.
Xavfli yoki pul sarflaydigan amal uchun avval foydalanuvchi
ruxsatini talab qil. Amallarni bajargandek ko'rsatma.
Javobni o'zbek tilida ber.`
    );

    res.json({
      task: task.trim(),
      plan: reply
    });
  } catch (error) {
    console.error("Rejalashtirish xatosi:", {
      status: error.status,
      code: error.code,
      message: error.message
    });

    res.status(error.status === 429 ? 429 : 500).json({
      error: "Reja tuzilmadi. API sozlamalari va kreditni tekshiring."
    });
  }
});

// Vazifani bazaga saqlash
app.post("/tasks", (req, res) => {
  try {
    const { task } = req.body || {};

    if (typeof task !== "string" || !task.trim()) {
      return res.status(400).json({
        error: "Vazifani yozing."
      });
    }

    const result = db.prepare(
      "INSERT INTO tasks (task) VALUES (?)"
    ).run(task.trim());

    res.status(201).json({
      message: "Vazifa saqlandi.",
      id: result.lastInsertRowid,
      task: task.trim()
    });
  } catch (error) {
    console.error("Vazifa saqlash xatosi:", error.message);
    res.status(500).json({
      error: "Vazifani bazaga saqlab bo'lmadi."
    });
  }
});

// Saqlangan vazifalarni ko'rish
app.get("/tasks", (req, res) => {
  try {
    const tasks = db.prepare(
      "SELECT * FROM tasks ORDER BY id DESC"
    ).all();

    res.json(tasks);
  } catch (error) {
    console.error("Vazifalarni olish xatosi:", error.message);
    res.status(500).json({
      error: "Vazifalarni olishda xato yuz berdi."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Muhammad AI Agent serveri ${PORT} portda ishlayapti.`);
});
