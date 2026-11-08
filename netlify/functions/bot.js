export async function handler(event, context) {
  // Webhook check (GET request ဖြင့် စစ်ဆေးပါက 200 ပြန်ပေးရန်)
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Telegram Bot Webhook is running!" };
  }

  try {
    const body = JSON.parse(event.body);

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Configuration
      const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";
      const WEBAPP_URL = "https://io-mining-app.netlify.app";
      
      // STON.fi Direct Swap Link (GRAM -> IO)
      const STONFI_SWAP_URL = "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE";

      if (text.startsWith("/start")) {
        const welcomeText = 
          "⛏️ *Welcome to Infinite Orbit (IO)!*\n\n" +
          "🔸 Mine IO automatically 24/7\n" +
          "🔸 Hold IO — get mining boost & higher tier\n" +
          "🔸 Build Orbit Spire nodes for extra yields\n" +
          "🔸 Invite friends — get 5% referral claims\n\n" +
          "Tap the button below to start mining!\n👇";

        const replyMarkup = {
          inline_keyboard: [
            // အပေါ်ဆုံး WebApp ခလုတ်ကြီး
            [
              { text: "⛏️ Open Infinite Orbit", web_app: { url: WEBAPP_URL } }
            ],
            // အလယ်က STON.fi DEX တိုက်ရိုက် Swap ခလုတ် နှင့် Community
            [
              { text: "📦 Community", url: "https://t.me/IO_Mining_bot" },
              { text: "💎 STON.fi", url: STONFI_SWAP_URL }
            ],
            // အောက်ဆုံး News Channel
            [
              { text: "📢 News Channel", url: "https://t.me/IO_Mining_bot" }
            ]
          ]
        };

        // Telegram Bot API သို့ စာပြန်ပို့ခြင်း
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "Markdown",
            reply_markup: replyMarkup
          })
        });
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}
