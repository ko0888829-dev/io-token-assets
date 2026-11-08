cat << 'EOF' > bot.py
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "9126577611:AAEZDAjuOzpZNOi6pUKe6m-2BbG3M6PargY"
WEBAPP_URL = "https://io-mining-app.netlify.app"

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    text = (
        "⛏️ *Welcome to Infinite Orbit (IO)!*\n\n"
        "🔸 Mine IO automatically 24/7\n"
        "🔸 Hold IO — get mining boost & higher tier\n"
        "🔸 Build Orbit Spire nodes for extra yields\n"
        "🔸 Invite friends — get 5% referral claims\n\n"
        "Tap the button below to start mining!\n👇"
    )
    
    markup = InlineKeyboardMarkup()
    # ပင်မ WebApp ခလုတ်
    markup.row(InlineKeyboardButton("⛏️ Open Infinite Orbit", web_app=WebAppInfo(url=WEBAPP_URL)))
    # အောက်က Link ခလုတ်များ
    markup.row(
        InlineKeyboardButton("📦 Rules & Info", url="https://t.me/IO_Mining_bot"),
        InlineKeyboardButton("💎 STON.fi DEX", url="https://app.ston.fi")
    )
    markup.row(InlineKeyboardButton("📢 News Channel", url="https://t.me/IO_Mining_bot"))

    bot.send_message(message.chat.id, text, reply_markup=markup, parse_mode="Markdown")

print("Bot is running...")
bot.infinity_polling()
EOF
