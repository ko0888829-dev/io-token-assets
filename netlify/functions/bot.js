export async function handler(event, context) {
  // Webhook Health Check
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 200, 
      body: JSON.stringify({ status: "alive", message: "IO Bot is online" }) 
    };
  }

  const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const update = JSON.parse(event.body);

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // 1. /done သို့မဟုတ် /payout Command
      if (text.startsWith("/done") || text.startsWith("/payout")) {
        const parts = text.split(/\s+/);

        let targetId = chatId;
        let claimId = "IO-1";
        let amount = "9,832.5";
        let txHash = "tonviewer_tx";

        if (parts.length >= 5) {
          targetId = parts[1].trim();
          claimId = parts[2].trim();
          amount = parts[3].trim();
          txHash = parts[4].trim();
        } else if (parts.length === 4) {
          claimId = parts[1].trim();
          amount = parts[2].trim();
          txHash = parts[3].trim();
        }

        // Parse Mode မသုံးဘဲ ရိုးရိုး Text စစ်စစ်ဖြင့် ပို့ခြင်း (Telegram Syntax Error ၁၀၀% ကင်းဝေးစေရန်)
        const receiptText = 
          "✅ Вывод средств успешно выполнен!\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "🆔 Заявка: " + claimId + "\n" +
          "💰 Выплачено на кошелёк: " + amount + " IO\n" +
          "🔗 Хеш транзакции:\n" + txHash + "\n\n" +
          "🔍 Tonviewer: https://tonviewer.com/transaction/" + txHash;

        // Command ရိုက်ပို့သူထံ စာပြန်ပို့ခြင်း
        await fetch(TELEGRAM_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: receiptText,
            disable_web_page_preview: false
          })
        });

        // Target User ထံသို့လည်း စာပို့ခြင်း
        if (String(targetId) !== String(chatId)) {
          try {
            await fetch(TELEGRAM_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: targetId,
                text: receiptText,
                disable_web_page_preview: false
              })
            });
          } catch(e) {}
        }

        return { statusCode: 200, body: "OK" };
      }

      // 2. /start Command
      if (text.startsWith("/start")) {
        let inviter = "";
        if (text.startsWith("/start ref_")) {
          inviter = text.split("ref_")[1].trim();
        }

        const webAppUrl = inviter 
          ? `https://io-mining-app.netlify.app?inviter=${inviter}`
          : "https://io-mining-app.netlify.app";

        const welcomeText = 
          "⛏️ Welcome to Infinite Orbit (IO)!\n\n" +
          "🔸 Mine IO automatically 24/7\n" +
          "🔸 Hold IO — get mining boost & higher tier\n" +
          "🔸 Build Orbit Spire nodes for extra yields\n" +
          "🔸 Invite friends — get 5% referral claims\n\n" +
          "Tap the button below to start mining!\n👇";

        await fetch(TELEGRAM_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            reply_markup: {
              inline_keyboard: [
                [{ text: "⛏️ Open Infinite Orbit", web_app: { url: webAppUrl } }],
                [
                  { text: "📦 Community", url: "https://t.me/IO_Mining_bot" },
                  { text: "💎 STON.fi", url: "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE" }
                ],
                [{ text: "📢 News Channel", url: "https://t.me/IO_Mining_bot" }]
              ]
            }
          })
        });

        return { statusCode: 200, body: "OK" };
      }
    }

    return { statusCode: 200, body: "No Message" };
  } catch (err) {
    return { statusCode: 200, body: err.toString() };
  }
}
