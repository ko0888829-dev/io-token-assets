const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";

// Global memory for demo/runtime pending requests
let pendingWithdrawals = [
  {
    claimId: "W-42255",
    userId: "5330848428",
    username: "Dragonchou18",
    amount: "100,000",
    net: "95,000",
    wallet: "0:ad15a5fb1933bf14f29642d07dfaa53340d3c3da7a4ee78adee981e76a4113b8",
    ip: "103.115.24.12",
    device: "Android 14 (Redmi Note)",
    date: "09 Nov 2026, 06:15 PM"
  },
  {
    claimId: "W-86964",
    userId: "8621182145",
    username: "Hvuvgugugu",
    amount: "10,350",
    net: "9,832.5",
    wallet: "0:d45163438fdd4a291e086b47b26b3871495b1d4449f8004c538aac7602b14e01",
    ip: "103.115.24.12",
    device: "Android 14 (Redmi Note)", // IP & Device တူနေပါက Duplicate သတိပေးမည်
    date: "09 Nov 2026, 04:04 PM"
  }
];

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  // 1. GET Request: Pending List ကို Admin Portal ထံ ပေးပို့ခြင်း
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(pendingWithdrawals)
    };
  }

  // 2. POST Request: Action စီမံခြင်း
  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body || "{}");

      // A. User အသစ်က Request တင်ခြင်း (IP & Device ပါဝင်သည်)
      if (data.action === "request") {
        const clientIp = event.headers["client-ip"] || event.headers["x-forwarded-for"] || "Unknown IP";
        const userAgent = event.headers["user-agent"] || "Unknown Device";

        const newReq = {
          claimId: data.claimId,
          userId: data.userId,
          username: data.username,
          amount: data.amount,
          net: data.net,
          wallet: data.wallet,
          ip: clientIp.split(",")[0].trim(),
          device: userAgent.slice(0, 40),
          date: new Date().toLocaleString()
        };

        pendingWithdrawals.unshift(newReq);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, req: newReq }) };
      }

      // B. Admin က Complete & Send Receipt နှိပ်ခြင်း (Bot ကနေ User ဆီ စာတိုက်ရိုက်ပို့ခြင်း)
      if (data.action === "complete") {
        const { targetUserId, claimId, amount, txHash } = data;

        const receiptText = 
          "✅ Вывод средств успешно выполнен!\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "🆔 Заявка: #" + claimId.replace("#", "") + "\n" +
          "💰 Выплачено на кошелёк: " + amount + " IO\n" +
          "🔗 Хеш транзакции:\n" + txHash + "\n\n" +
          "🔍 Tonviewer: https://tonviewer.com/transaction/" + txHash;

        // Bot Token ဖြင့် User ဆီသို့ Server ဘက်မှ တိုက်ရိုက် စာပို့ခြင်း
        const teleRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetUserId,
            text: receiptText,
            disable_web_page_preview: false
          })
        });

        const resData = await teleRes.json();

        // Pending စာရင်းမှ ဖယ်ရှားခြင်း
        pendingWithdrawals = pendingWithdrawals.filter(p => p.claimId !== claimId);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, telegram: resData })
        };
      }

      return { statusCode: 400, headers, body: "Invalid Action" };
    } catch (e) {
      return { statusCode: 500, headers, body: e.toString() };
    }
  }

  return { statusCode: 405, headers, body: "Method Not Allowed" };
}
