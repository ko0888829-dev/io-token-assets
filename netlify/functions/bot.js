export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "IO Mining Bot is Running" };
  }

  try {
    const body = JSON.parse(event.body);
    const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";
    const STONFI_SWAP_URL = "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE";

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = (body.message.text || "").trim();

      // နည်းလမ်း - Withdrawal Alert မက်ဆေ့ခ်ျကို Reply လုပ်ပြီး Tx Hash ပို့ရုံဖြင့် ပြေစာတန်းထွက်စေခြင်း
      if (body.message.reply_to_message && body.message.reply_to_message.text) {
        const originalText = body.message.reply_to_message.text;

        // NEW WITHDRAWAL REQUEST ဟုတ်မဟုတ် စစ်ဆေးခြင်း
        if (originalText.includes("NEW WITHDRAWAL REQUEST")) {
          const txHash = text; // Admin ရိုက်ပို့လိုက်သည့် Hash

          // မူလစာသားထဲမှ User ID, Claim ID, Net Amount ကို အလိုအလျောက် ရှာဖွေဖတ်ယူခြင်း
          const idMatch = originalText.match(/ID:\s*(\d+)/);
          const claimMatch = originalText.match(/Claim ID:\s*([#\w-]+)/);
          const netMatch = originalText.match(/Payout Net:\s*([\d,.]+)/);

          const targetUserId = idMatch ? idMatch[1] : null;
          const claimId = claimMatch ? claimMatch[1] : "IO-Payout";
          const netAmount = netMatch ? netMatch[1] : "0";

          // LootVault ပုံစံ On-Chain ပြေစာ
          const receiptHtml = 
            `✅ <b>Вывод средств успешно выполнен!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 <b>Заявка:</b> ${claimId}\n` +
            `💰 <b>Выплачено на кошелёк:</b> <b>${netAmount} IO</b>\n` +
            `🔗 <b>Хеш транзакции:</b>\n<code>${txHash}</code>\n\n` +
            `🔍 <a href="https://tonviewer.com/transaction/${txHash}">Посмотреть в Tonviewer</a>`;

          // ၁။ User ဆီသို့ တကယ့် Tonviewer Link ပါသော ပြေစာ ပို့ပေးခြင်း
          if (targetUserId) {
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
            } catch (e) {}
          }

          // ၂။ Admin ဆီသို့လည်း အတည်ပြု အောင်မြင်ကြောင်း အကြောင်းကြားခြင်း
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ <b>Success!</b> Receipt with Tonviewer link sent to user (ID: <code>${targetUserId}</code>).`,
              parse_mode: "HTML"
            })
          });

          return { statusCode: 200, body: "Reply Payout Handled" };
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
