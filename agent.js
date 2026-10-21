
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const agent = {
  name: "Mening AI agentim",
  version: "0.2.0",
  tasks: [],

  start() {
    console.log(`\n${this.name} ishga tushdi!`);
    console.log("Versiya:", this.version);
    console.log("Vazifa yozing yoki /help deb yozing.\n");
    this.ask();
  },

  ask() {
    rl.question("Siz > ", (text) => {
      const task = text.trim();

      if (!task) {
        console.log("Iltimos, vazifa yozing.");
        return this.ask();
      }

      if (task === "/exit") {
        console.log("Agent to'xtatildi.");
        return rl.close();
      }

      if (task === "/help") {
        console.log(
          "\nBuyruqlar:\n" +
          "/help - yordam\n" +
          "/tasks - vazifalar ro'yxati\n" +
          "/exit - chiqish\n"
        );
        return this.ask();
      }

      if (task === "/tasks") {
        console.log("\nVazifalar:");
        if (this.tasks.length === 0) {
          console.log("Hozircha vazifa yo'q.");
        } else {
          this.tasks.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
          });
        }
        return this.ask();
      }

      this.tasks.push(task);

      console.log("\nVazifa qabul qilindi:", task);
      console.log("Holati: Rejalashtirish uchun saqlandi.\n");

      this.ask();
    });
  }
};

agent.start();
