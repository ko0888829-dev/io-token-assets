export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "IO Mining Bot Running" };
  }

  try {
    const body = JSON.parse(event.body);
    const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";
    const STONFI_SWAP_URL = "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE";

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = (body.message.text || "").trim();

      // နည်းလမ်း ၁ - Admin Command ဖြင့် ပြေစာပို့ခြင်း
      // ပုံစံ: /done <USER_ID> <CLAIM_ID> <AMOUNT> <TX_HASH>
      if (text.startsWith("/done") || text.startsWith("/payout")) {
        const parts = text.split(/\s+/);
        if (parts.length >= 5) {
          const targetUserId = parts[1].trim();
          const claimId = parts[2].trim().replace("#", "");
          const amount = parts[3].trim();
          const txHash = parts[4].trim();

          const formattedAmount = Number(amount) ? Number(amount).toLocaleString() : amount;

          const receiptHtml = 
            `✅ <b>Вывод средств успешно выполнен!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 <b>Заявка:</b> #${claimId}\n` +
            `💰 <b>Выплачено на кошелёк:</b> <b>${formattedAmount} IO</b>\n` +
            `🔗 <b>Хеш транзакции:</b>\n<code>${txHash}</code>\n\n` +
            `🔍 <a href="https://tonviewer.com/transaction/${txHash}">Посмотреть в Tonviewer</a>`;

          // User ဆီသို့ ပြေစာ တိုက်ရိုက်ပို့ခြင်း
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: targetUserId,
              text: receiptHtml,
              parse_mode: "HTML"
            })
          });

          // Admin ဆီ အောင်မြင်ကြောင်း စာပြန်ပို့ခြင်း
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ <b>Success!</b> Receipt sent to User <code>${targetUserId}</code> for #${claimId}.`,
              parse_mode: "HTML"
            })
          });

          return { statusCode: 200, body: "OK" };
        }
      }

      // နည်းလမ်း ၂ - Reply ပြုလုပ်ပြီး Hash ပို့ရုံဖြင့် ပြေစာထွက်စေခြင်း
      if (body.message.reply_to_message && body.message.reply_to_message.text) {
        const orig = body.message.reply_to_message.text;
        if (orig.includes("NEW WITHDRAWAL REQUEST") || orig.includes("Claim ID")) {
          const txHash = text;
          const idMatch = orig.match(/ID:\s*(\d+)/);
          const claimMatch = orig.match(/Claim ID:\s*([#\w-]+)/);
          const netMatch = orig.match(/Payout Net:\s*([\d,.]+)/);

          const targetUserId = idMatch ? idMatch[1] : null;
          const claimId = claimMatch ? claimMatch[1].replace("#", "") : "IO-1";
          const netAmount = netMatch ? netMatch[1] : "0";

          const receiptHtml = 
            `✅ <b>Вывод средств успешно выполнен!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 <b>Заявка:</b> #${claimId}\n` +
            `💰 <b>Выплачено на кошелёк:</b> <b>${netAmount} IO</b>\n` +
            `🔗 <b>Хеш транзакции:</b>\n<code>${txHash}</code>\n\n` +
            `🔍 <a href="https://tonviewer.com/transaction/${txHash}">Посмотреть в Tonviewer</a>`;

          if (targetUserId) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: targetUserId,
                text: receiptHtml,
                parse_mode: "HTML"
              })
            });
          }

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ <b>Success!</b> Receipt sent to User <code>${targetUserId}</code> for #${claimId}.`,
              parse_mode: "HTML"
            })
          });

          return { statusCode: 200, body: "OK" };
        }
      }

      // /start Command
      let inviterId = "";
      if (text.startsWith("/start ref_")) {
        inviterId = text.split("ref_")[1].trim();
      }

      const WEBAPP_URL = inviterId 
        ? `https://io-mining-app.netlify.app?inviter=${inviterId}`
        : "https://io-mining-app.netlify.app";

      if (text.startsWith("/start")) {
        const welcomeText = 
          "⛏️ <b>Welcome to Infinite Orbit (IO)!</b>\n\n" +
          "🔸 Mine IO automatically 24/7\n" +
          "🔸 Hold IO — get mining boost & higher tier\n" +
          "🔸 Build Orbit Spire nodes for extra yields\n" +
          "🔸 Invite friends — get 5% referral claims\n\n" +
          "Tap the button below to start mining!\n👇";

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⛏️ Open Infinite Orbit", web_app: { url: WEBAPP_URL } }],
                [{ text: "📦 Community", url: "https://t.me/IO_Mining_bot" }, { text: "💎 STON.fi", url: STONFI_SWAP_URL }],
                [{ text: "📢 News Channel", url: "https://t.me/IO_Mining_bot" }]
              ]
            }
          })
        });
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}
