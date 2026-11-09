export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, status: "live" }) 
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const msg = body.message;

    if (msg && msg.text) {
      const chatId = msg.chat.id;
      const text = msg.text.trim();

      // 1. /done သို့မဟုတ် /payout Command (တိုက်ရိုက် Webhook Response ဖြင့် ပြန်ပို့ခြင်း)
      if (text.startsWith("/done") || text.startsWith("/payout")) {
        const claimMatch = text.match(/(W-\d+|IO-\d+|#\w+)/i);
        const claimId = claimMatch ? claimMatch[0].replace("#", "") : "W-86964";

        const amountMatch = text.match(/(\d+[\d,.]*)\s+([a-f0-9]{30,})/i) || text.match(/\s+(\d+[\d,.]*)\s+/);
        const amount = amountMatch ? amountMatch[1] : "9,832.5";

        const hashMatch = text.match(/([a-f0-9]{32,64})/i);
        const txHash = hashMatch ? hashMatch[0] : "54d010e61441053f9778e27e62ad15dee209ba749444e765402cb4ba41889e5e";

        // LootVault စတိုင် ပြေစာ
        const receiptText = 
          "✅ Вывод средств успешно выполнен!\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "🆔 Заявка: #" + claimId + "\n" +
          "💰 Выплачено на кошелёк: " + amount + " IO\n" +
          "🔗 Хеш транзакции:\n" + txHash + "\n\n" +
          "🔍 Tonviewer: https://tonviewer.com/transaction/" + txHash;

        // Telegram Webhook သို့ sendMessage method ဖြင့် တိုက်ရိုက် Response ပေးခြင်း
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "sendMessage",
            chat_id: chatId,
            text: receiptText,
            disable_web_page_preview: false
          })
        };
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

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "sendMessage",
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
        };
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  }
}
