export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "IO Mining Bot is Running" };
  }

  try {
    const body = JSON.parse(event.body);

    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text.trim();
      const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";
      const STONFI_SWAP_URL = "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE";

      // 1. Payout Completion Command
      if (text.startsWith("/payout")) {
        const parts = text.split(/\s+/);
        
        let targetUserId = chatId;
        let claimId = "W-42255";
        let amount = "95000";
        let txHash = "tonviewer_confirmed";

        // Parameter ၄ ခု ပါလျှင် (/payout USER_ID CLAIM_ID AMOUNT TX_HASH)
        if (parts.length >= 5) {
          targetUserId = parts[1].trim();
          claimId = parts[2].trim().replace("#", "");
          amount = parts[3].trim();
          txHash = parts[4].trim();
        } else if (parts.length === 4) {
          // Parameter ၃ ခု ပါလျှင် (/payout CLAIM_ID AMOUNT TX_HASH)
          claimId = parts[1].trim().replace("#", "");
          amount = parts[2].trim();
          txHash = parts[3].trim();
        }

        const formattedAmount = Number(amount) ? Number(amount).toLocaleString() : amount;

        // LootVault ပုံစံ တိကျသော HTML Receipt
        const receiptHtml = 
          `✅ <b>Вывод средств успешно выполнен!</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🆔 <b>Заявка:</b> #${claimId}\n` +
          `💰 <b>Выплачено на кошелёк:</b> <b>${formattedAmount} IO</b>\n` +
          `🔗 <b>Хеш транзакции:</b>\n<code>${txHash}</code>\n\n` +
          `🔍 <a href="https://tonviewer.com/transaction/${txHash}">Посмотреть в Tonviewer</a>`;

        // (က) Command ရိုက်ပို့လိုက်သည့် လက်ရှိ Chat ထဲသို့ ပြေစာ ချက်ချင်း ပြန်ပို့ခြင်း
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: receiptHtml,
            parse_mode: "HTML"
          })
        });

        // (ခ) အကယ်၍ အခြား User ဆီ သီးသန့် ပို့လိုပါက safe try/catch ဖြင့် ထပ်ဆင့် ပို့ပေးခြင်း
        if (String(targetUserId) !== String(chatId)) {
          try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: targetUserId,
                text: receiptHtml,
                parse_mode: "HTML"
              })
            });
          } catch(err) {}
        }

        return { statusCode: 200, body: "Payout Sent" };
      }

      // 2. Referral & Start Command
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

        const replyMarkup = {
          inline_keyboard: [
            [
              { text: "⛏️ Open Infinite Orbit", web_app: { url: WEBAPP_URL } }
            ],
            [
              { text: "📦 Community", url: "https://t.me/IO_Mining_bot" },
              { text: "💎 STON.fi", url: STONFI_SWAP_URL }
            ],
            [
              { text: "📢 News Channel", url: "https://t.me/IO_Mining_bot" }
            ]
          ]
        };

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "HTML",
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
