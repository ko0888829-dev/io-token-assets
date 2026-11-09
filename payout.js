const BOT_TOKEN = "9126577611:AAEZDAju0zpZNOi6pUkE6m-2BbG3M6PargY";

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
    device: "Android 14 (Redmi Note)",
    date: "09 Nov 2026, 04:04 PM"
  }
];

export async function handler(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod === "GET") {
    return { statusCode: 200, headers, body: JSON.stringify(pendingWithdrawals) };
  }

  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body || "{}");

      if (data.action === "complete") {
        const { targetUserId, claimId, amount, txHash } = data;

        const receiptText = 
          "✅ Вывод средств успешно выполнен!\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "🆔 Заявка: #" + claimId.replace("#", "") + "\n" +
          "💰 Выплачено на кошелёк: " + amount + " IO\n" +
          "🔗 Хеш транзакции:\n" + txHash + "\n\n" +
          "🔍 Tonviewer: https://tonviewer.com/transaction/" + txHash;

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
        pendingWithdrawals = pendingWithdrawals.filter(p => p.claimId !== claimId);

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, telegram: resData }) };
      }
      return { statusCode: 400, headers, body: "Bad Action" };
    } catch (e) {
      return { statusCode: 500, headers, body: e.toString() };
    }
  }

  return { statusCode: 405, headers, body: "Method Not Allowed" };
}
