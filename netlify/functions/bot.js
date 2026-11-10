export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "NEXORA Bot Active" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text.trim();

      if (text.startsWith("/start")) {
        let inviter = "";
        if (text.startsWith("/start nex_") || text.startsWith("/start ref_")) {
          inviter = text.split("_")[1].trim();
        }

        const webAppUrl = inviter 
          ? `https://io-mining-app.netlify.app?inviter=${inviter}`
          : "https://io-mining-app.netlify.app";

        const welcomeText = 
          "⚡ <b>Welcome to NEXORA Network ($NEX)!</b>\n\n" +
          "🔸 Cloud Mine $NEX automatically 24/7\n" +
          "🔸 Complete Missions to unlock instant allocations\n" +
          "🔸 Invite friends & earn 10% lifetime referral yields\n" +
          "🔒 <b>DEX Listing & Withdrawals: January 1, 2027</b>\n\n" +
          "Tap below to start your mining node!\n👇";

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⚡ Launch NEXORA Node", web_app: { url: webAppUrl } }],
                [{ text: "📢 Official Channel", url: "https://t.me/IO_Mining_bot" }]
              ]
            }
          })
        });
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    return { statusCode: 200, body: "Handled" };
  }
}
