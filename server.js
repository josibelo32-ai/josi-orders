const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("JOSI Orders Server is running!");
});

app.post("/order", async (req, res) => {
  try {
    const { name, phone, location, items, total } = req.body;

    // የTelegram መረጃዎች በRender Environment Variables ውስጥ ይቀመጣሉ
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        success: false,
        message: "Telegram configuration is missing."
      });
    }

    const orderItems = Array.isArray(items)
      ? items.map(item => `• ${item.name} × ${item.quantity}`).join("\n")
      : "No items";

    const message = `
🛍️ NEW ORDER – JOSI LIFESTYLE & ACCESSORIES

👤 Customer: ${name}
📞 Phone: ${phone}
📍 Delivery Location: ${location}

📦 PRODUCTS:
${orderItems}

💰 TOTAL: ${total} ETB
`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      throw new Error("Telegram message failed to send.");
    }

    res.json({
      success: true,
      message: "Order sent successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send order."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
