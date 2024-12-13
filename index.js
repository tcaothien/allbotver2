// Khai báo các thư viện cần thiết
const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const { prefix, mongoURI, botToken } = require('./config/config.json');
const User = require('./models/user');
const ShopItem = require('./models/shopItem');

// Thiết lập strictQuery để tránh cảnh báo
mongoose.set('strictQuery', true);

// Khởi tạo client và kết nối MongoDB
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

// Khi bot đã sẵn sàng
client.once('ready', () => {
    console.log(`Bot đã đăng nhập như ${client.user.tag}`);
});

// Xử lý các lệnh của bot
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Bot không phản hồi các tin nhắn của chính nó
    if (!message.content.startsWith(prefix)) return; // Chỉ phản hồi nếu tin nhắn bắt đầu bằng prefix

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Các lệnh khác sẽ tiếp tục từ đây, theo logic tương tự...
});

// Đăng nhập vào bot
client.login(botToken);
