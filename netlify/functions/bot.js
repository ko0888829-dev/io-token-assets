const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "IO Bot is online" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const msg = body.message;

    if (msg && msg.text) {
      const chatId = msg.chat.id;
      const text = msg.text.trim();

      // /done သို့မဟုတ် /payout ပါလာပါက ချက်ချင်း အလုပ်လုပ်စေခြင်း
      if (text.startsWith("/done") || text.startsWith("/payout")) {
        // စာသားထဲမှ W-86964 (Claim ID) ကို ရှာခြင်း
        const claimMatch = text.match(/(W-\d+|IO-\d+|#\w+)/i);
        const claimId = claimMatch ? claimMatch[0].replace("#", "") : "W-86964";

        // Amount ကို ရှာခြင်း (ဥပမာ 9832.5 သို့မဟုတ် 95000)
        const amountMatch = text.match(/(\d+[\d,.]*)\s+([a-f0-9]{30,})/i) || text.match(/\s+(\d+[\d,.]*)\s+/);
        const amount = amountMatch ? amountMatch[1] : "9,832.5";

        // Hash အရှည်ကြီး (30 လုံးအထက် hex) ကို ရှာခြင်း
        const hashMatch = text.match(/([a-f0-9]{32,64})/i);
        const txHash = hashMatch ? hashMatch[0] : "54d010e61441053f9778e27e62ad15dee209ba749444e765402cb4ba41889e5e";

        // ပို့ရမည့် User ID ကို ရှာခြင်း (chatId မဟုတ်သော 8621182145 စသည့် ဂဏန်း)
        const userMatch = text.match(/\/done\s+(\d+)/i) || text.match(/\/payout\s+(\d+)/i);
        const targetUserId = userMatch ? userMatch[1] : chatId;

        // LootVault ပုံစံ On-Chain ပြေစာ
        const receiptText = 
          "✅ Вывод средств успешно выполнен!\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "🆔 Заявка: #" + claimId + "\n" +
          "💰 Выплачено на кошелёк: " + amount + " IO\n" +
          "🔗 Хеш транзакции:\n" + txHash + "\n\n" +
          "🔍 Tonviewer: https://tonviewer.com/transaction/" + txHash;

        // ၁။ Command ရိုက်ပို့လိုက်သည့် သင်၏ Chat ထဲသို့ ပြေစာ တိုက်ရိုက် ထုတ်ပေးခြင်း
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: receiptText,
            disable_web_page_preview: false
          })
        });

        // ၂။ User ဆီသို့လည်း သီးသန့် ပြေစာ ပို့ပေးခြင်း
        if (String(targetUserId) !== String(chatId)) {
          try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: targetUserId,
                text: receiptText,
                disable_web_page_preview: false
              })
            });
          } catch(err) {}
        }

        return { statusCode: 200, body: "OK" };
      }

      // /start Command
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

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
  } catch (e) {
    return { statusCode: 200, body: "Error Handled" };
  }
}
