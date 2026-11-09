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
      const ADMIN_TELEGRAM_ID = "5330848428";
      const STONFI_SWAP_URL = "https://app.ston.fi/swap?ft=EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH58rwL_l&tt=EQDliaNChKznSyglMpfPGetHAHXbSkoQ2XEjmMifVgTK9HkE";

      // 1. Admin Payout Command (/payout USER_ID CLAIM_ID AMOUNT TX_HASH)
      if (text.startsWith("/payout")) {
        // Admin ID စစ်ဆေးခြင်း
        if (String(chatId) !== ADMIN_TELEGRAM_ID) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "⚠️ Unauthorized: Only admin can use this command."
            })
          });
          return { statusCode: 200, body: "Unauthorized" };
        }

        // Space သို့မဟုတ် Newline အားလုံးကို split လုပ်ခြင်း
        const parts = text.split(/\s+/);
        if (parts.length >= 4) {
          const targetUserId = parts[1].trim();
          const claimId = parts[2].trim().replace("#", "");
          const amount = parts[3].trim();
          const txHash = parts[4] ? parts[4].trim() : "tonviewer_confirmed";

          // HTML format ဖြင့် ရေးထား၍ Hash ထဲရှိ underscore ကြောင့် error မတက်တော့ပါ
          const userReceipt = 
            `✅ <b>Withdrawal successfully completed!</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 <b>Claim ID:</b> #${claimId}\n` +
            `💰 <b>Paid to wallet:</b> <b>${Number(amount).toLocaleString()} IO</b>\n` +
            `🔗 <b>Transaction Hash:</b>\n<code>${txHash}</code>\n\n` +
            `🔍 <a href="https://tonviewer.com/transaction/${txHash}">View on Tonviewer</a>`;

          // User ဆီသို့ LootVault စတိုင် ပြေစာ တိုက်ရိုက်ပို့ခြင်း
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: targetUserId,
              text: userReceipt,
              parse_mode: "HTML",
              disable_web_page_preview: false
            })
          });

          // Admin ဆီသို့ အတည်ပြု မက်ဆေ့ခ်ျ ပြန်ပို့ခြင်း
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: ADMIN_TELEGRAM_ID,
              text: `👍 <b>Success!</b> Payout receipt sent to user <code>${targetUserId}</code> for <b>#${claimId}</b>.`,
              parse_mode: "HTML"
            })
          });

          return { statusCode: 200, body: "Payout Sent" };
        } else {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: ADMIN_TELEGRAM_ID,
              text: "⚠️ Format မှားနေပါသည်:\n<code>/payout USER_ID CLAIM_ID AMOUNT TX_HASH</code>",
              parse_mode: "HTML"
            })
          });
          return { statusCode: 200, body: "Invalid format" };
        }
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
