// Import required modules
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// MongoDB connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB')).catch(err => console.error('❌ MongoDB connection error:', err));

// Database Schema
const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  balance: { type: Number, default: 0 },
  inventory: { type: Array, default: [] },
  marriedTo: { type: String, default: null },
  marriageImages: { type: Object, default: { image: null, thumbnail: null } },
  marriageCaption: { type: String, default: null },
  lovePoints: { type: Number, default: 0 },
  deletedMessages: { type: Array, default: [] },
});

const User = mongoose.model('User', userSchema);

// Bot prefix
let prefix = 'e';

// Helper functions
const getUser = async (userId, username) => {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId, username });
    await user.save();
  }
  return user;
};

// Bot ready event
client.once('ready', () => {
  console.log(`🤖 Bot is online as ${client.user.tag}!`);
});

// Track deleted messages
client.on('messageDelete', async (message) => {
  if (!message.partial && message.content) {
    const user = await getUser(message.author.id, message.author.username);
    if (user.deletedMessages.length >= 10) user.deletedMessages.shift(); // Keep only 10 messages
    user.deletedMessages.push(message.content);
    await user.save();
  }
});

// Bot message event
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const user = await getUser(message.author.id, message.author.username);

  // List of commands
  const commands = {
    xu: 1,
    daily: 2,
    givexu: 3,
    nohu: 4,
    top: 5,
    shop: 6,
    buy: 7,
    inv: 8,
    gift: 9,
    marry: 10,
    divorce: 11,
    pmarry: 12,
    addimage: 13,
    delimage: 14,
    addthumbnail: 15,
    delthumbnail: 16,
    addcaption: 17,
    delcaption: 18,
    luv: 19,
    sn: 20,
    av: 21,
    rd: 22,
    pick: 23,
    helps: 24,
    addreply: 25,
    delreply: 26,
    listreply: 27,
    ban: 28,
    unban: 29,
    mute: 30,
    unmute: 31,
    kick: 32,
    lock: 33,
    unlock: 34,
    addrole: 35,
    delrole: 36,
    addxu: 37,
    delxu: 38,
    prefix: 39,
    resetallbot: 40,
    addemojishop: 41,
    delimojishop: 42,
    addspshop: 43,
    delspshop: 44,
    tx: 45,
  };

  // Command: "xu" (1)
  if (command === 'xu') {
    const embed = new EmbedBuilder()
      .setTitle('💰 Số dư của bạn')
      .setDescription(`Bạn hiện có **${user.balance.toLocaleString()} xu**.`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  }

  // Command: "daily" (2)
  if (command === 'daily') {
    const amount = Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000;
    user.balance += amount;
    await user.save();
    const embed = new EmbedBuilder()
      .setTitle('🎁 Quà tặng hàng ngày')
      .setDescription(`Bạn đã nhận được **${amount.toLocaleString()} xu**!`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  }

  // Command: "givexu" (3)
  if (command === 'givexu') {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Sử dụng đúng lệnh: `e givexu @user <số lượng>`.');
    }

    const targetUser = await getUser(target.id, target.username);

    if (user.balance < amount) {
      return message.reply('❌ Bạn không có đủ xu.');
    }

    user.balance -= amount;
    targetUser.balance += amount;
    await user.save();
    await targetUser.save();

    const embed = new EmbedBuilder()
      .setTitle('💸 Chuyển xu thành công!')
      .setDescription(`Bạn đã chuyển **${amount.toLocaleString()} xu** cho **${target.username}**.`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  }

// Command: "nohu" (4)
if (command === 'nohu') {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return message.reply('❌ Sử dụng đúng lệnh: `e nohu <số tiền đặt cược>`.');
  }
  if (user.balance < amount) {
    return message.reply('❌ Bạn không có đủ xu để đặt cược.');
  }

  const winRate = message.author.id === process.env.ADMIN_ID ? 100 : 4; // Admin luôn thắng
  const isWin = Math.random() * 100 < winRate;

  if (isWin) {
    const reward = amount * 100;
    user.balance += reward - amount; // Thêm tiền thắng, trừ tiền cược
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('🎉 Nổ hũ thành công!')
      .setDescription(`Bạn đã trúng **${reward.toLocaleString()} xu**! 💰💥`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  } else {
    user.balance -= amount;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('💣 Nổ hũ thất bại')
      .setDescription(`Bạn đã mất **${amount.toLocaleString()} xu**. Chúc bạn may mắn lần sau!`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  }
}

// Command: "top" (5)
if (command === 'top') {
  const topUsers = await User.find().sort({ balance: -1 }).limit(10);
  const leaderboard = topUsers.map((u, i) => `${i + 1}. **${u.username}** - ${u.balance.toLocaleString()} xu`).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🏆 Bảng xếp hạng Xu')
    .setDescription(leaderboard || 'Không có người chơi nào.')
    .setColor('#FF0000');
  message.reply({ embeds: [embed] });
}

// Command: "shop" (6)
if (command === 'shop') {
  const shopItems = [
    { id: '01', name: 'ENZ Peridot', price: 100000, emoji: '💍' },
    { id: '02', name: 'ENZ Citrin', price: 200000, emoji: '💎' },
    { id: '03', name: 'ENZ Topaz', price: 500000, emoji: '🔮' },
    { id: '04', name: 'ENZ Spinel', price: 1000000, emoji: '🌟' },
    { id: '05', name: 'ENZ Aquamarine', price: 2500000, emoji: '💠' },
    { id: '06', name: 'ENZ Emerald', price: 5000000, emoji: '✨' },
    { id: '07', name: 'ENZ Ruby', price: 10000000, emoji: '❤️' },
    { id: '333', name: 'ENZ Sapphire', price: 25000000, emoji: '💎' },
    { id: '999', name: 'ENZ Centenary', price: 99999999, emoji: '👑' },
  ];

  const shopDescription = shopItems
    .map(item => `${item.emoji} **${item.name}** - Giá: **${item.price.toLocaleString()} xu** (Mã: ${item.id})`)
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🛍️ Cửa hàng nhẫn')
    .setDescription(shopDescription)
    .setColor('#FF00CB');
  message.reply({ embeds: [embed] });
}

// Command: "buy" (7)
if (command === 'buy') {
  const itemId = args[0];
  const shopItems = {
    '01': { name: 'ENZ Peridot', price: 100000, emoji: '💍' },
    '02': { name: 'ENZ Citrin', price: 200000, emoji: '💎' },
    '03': { name: 'ENZ Topaz', price: 500000, emoji: '🔮' },
    '04': { name: 'ENZ Spinel', price: 1000000, emoji: '🌟' },
    '05': { name: 'ENZ Aquamarine', price: 2500000, emoji: '💠' },
    '06': { name: 'ENZ Emerald', price: 5000000, emoji: '✨' },
    '07': { name: 'ENZ Ruby', price: 10000000, emoji: '❤️' },
    '333': { name: 'ENZ Sapphire', price: 25000000, emoji: '💎' },
    '999': { name: 'ENZ Centenary', price: 99999999, emoji: '👑' },
  };

  const item = shopItems[itemId];

  if (!item) {
    return message.reply('❌ Vật phẩm không tồn tại. Hãy kiểm tra lại cửa hàng bằng lệnh `e shop`.');
  }

  if (user.balance < item.price) {
    return message.reply('❌ Bạn không có đủ xu để mua vật phẩm này.');
  }

  user.balance -= item.price;
  user.inventory.push({ id: itemId, name: item.name, emoji: item.emoji });
  await user.save();

  const embed = new EmbedBuilder()
    .setTitle('✅ Mua thành công!')
    .setDescription(`Bạn đã mua **${item.name}** với giá **${item.price.toLocaleString()} xu**.`)
    .setColor('#FF00CB');
  message.reply({ embeds: [embed] });
}

// Command: "inv" (8)
if (command === 'inv') {
  const inventoryDescription = user.inventory.length
    ? user.inventory.map(i => `${i.emoji} **${i.name}**`).join('\n')
    : 'Kho của bạn đang trống. Hãy mua đồ bằng lệnh `e shop`.';

  const embed = new EmbedBuilder()
    .setTitle('🎒 Kho vật phẩm của bạn')
    .setDescription(inventoryDescription)
    .setColor('#FF0000');
  message.reply({ embeds: [embed] });
}

// Command: "gift" (9)
if (command === 'gift') {
  const target = message.mentions.users.first();
  const itemId = args[1];

  if (!target || !itemId) {
    return message.reply('❌ Sử dụng đúng lệnh: `e gift @user <mã vật phẩm>`.');
  }

  const itemIndex = user.inventory.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return message.reply('❌ Bạn không sở hữu vật phẩm này.');
  }

  const targetUser = await getUser(target.id, target.username);
  const item = user.inventory.splice(itemIndex, 1)[0]; // Remove item from sender's inventory
  targetUser.inventory.push(item); // Add item to recipient's inventory

  await user.save();
  await targetUser.save();

  const embed = new EmbedBuilder()
    .setTitle('🎁 Tặng vật phẩm thành công!')
    .setDescription(`Bạn đã tặng **${item.name}** cho **${target.username}**.`)
    .setColor('#FF00CB');
  message.reply({ embeds: [embed] });
}

// Command: "tx" - Tài xỉu (10)
if (command === 'tx') {
  const bet = parseInt(args[0]);
  const choice = args[1]?.toLowerCase();

  if (!bet || isNaN(bet) || bet <= 0 || (choice !== 'tài' && choice !== 'xỉu')) {
    return message.reply('❌ Sử dụng đúng lệnh: `e tx <số tiền> tài/xỉu`.');
  }

  if (user.balance < bet) {
    return message.reply('❌ Bạn không có đủ xu để đặt cược.');
  }

  const diceRoll = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
  const result = diceRoll <= 10 ? 'xỉu' : 'tài';
  const win = choice === result;

  if (win) {
    user.balance += bet;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('🎲 Kết quả tài xỉu')
      .setDescription(`Bạn chọn **${choice}** và kết quả là **${result}** 🎉\n🎯 Bạn thắng **${bet.toLocaleString()} xu**!`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  } else {
    user.balance -= bet;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('🎲 Kết quả tài xỉu')
      .setDescription(`Bạn chọn **${choice}** nhưng kết quả là **${result}** 💔\n💸 Bạn đã mất **${bet.toLocaleString()} xu**.`)
      .setColor('#FF0000');
    message.reply({ embeds: [embed] });
  }
}

// Command: "marry" - Cầu hôn (11)
if (command === 'marry') {
  const target = message.mentions.users.first();
  if (!target || target.id === message.author.id) {
    return message.reply('❌ Bạn cần đề cập đến người muốn cầu hôn.');
  }

  const hasRing = user.inventory.find(item => item.id.startsWith('0'));
  if (!hasRing) {
    return message.reply('💍 Bạn không có nhẫn để cầu hôn. Hãy mua nhẫn từ cửa hàng bằng lệnh `e shop`.');
  }

  const targetUser = await getUser(target.id, target.username);
  if (targetUser.marriage) {
    return message.reply(`💔 **${target.username}** đã kết hôn với người khác.`);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('accept').setLabel('Đồng ý 💖').setStyle('Success'),
    new ButtonBuilder().setCustomId('decline').setLabel('Từ chối 💔').setStyle('Danger')
  );

  const embed = new EmbedBuilder()
    .setTitle('💍 Lời cầu hôn')
    .setDescription(`**${message.author.username}** đã cầu hôn **${target.username}**!`)
    .setColor('#FF00CB');

  const reply = await message.reply({ embeds: [embed], components: [row] });

  const filter = i => i.user.id === target.id && ['accept', 'decline'].includes(i.customId);
  const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async interaction => {
    if (interaction.customId === 'accept') {
      user.inventory = user.inventory.filter(item => item.id !== hasRing.id);
      user.marriage = target.id;
      targetUser.marriage = message.author.id;

      await user.save();
      await targetUser.save();

      const successEmbed = new EmbedBuilder()
        .setTitle('💞 Kết hôn thành công!')
        .setDescription(`**${message.author.username}** và **${target.username}** đã trở thành vợ chồng! 🎉`)
        .setColor('#FF00CB');
      interaction.update({ embeds: [successEmbed], components: [] });
    } else {
      const declineEmbed = new EmbedBuilder()
        .setTitle('💔 Lời cầu hôn bị từ chối')
        .setDescription(`**${target.username}** đã từ chối lời cầu hôn của **${message.author.username}**.`)
        .setColor('#FF00CB');
      interaction.update({ embeds: [declineEmbed], components: [] });
    }
  });

  collector.on('end', collected => {
    if (!collected.size) {
      reply.edit({ content: '⏳ Thời gian phản hồi đã hết.', components: [] });
    }
  });
}

// Command: "divorce" - Ly hôn (12)
if (command === 'divorce') {
  if (!user.marriage) {
    return message.reply('❌ Bạn không kết hôn với ai để ly hôn.');
  }

  const spouse = await client.users.fetch(user.marriage);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('confirm').setLabel('Xác nhận 💔').setStyle('Danger'),
    new ButtonBuilder().setCustomId('cancel').setLabel('Hủy').setStyle('Secondary')
  );

  const embed = new EmbedBuilder()
    .setTitle('💔 Ly hôn')
    .setDescription(`Bạn muốn ly hôn với **${spouse.username}**?`)
    .setColor('#FF00CB');
  const reply = await message.reply({ embeds: [embed], components: [row] });

  const filter = i => i.user.id === message.author.id && ['confirm', 'cancel'].includes(i.customId);
  const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async interaction => {
    if (interaction.customId === 'confirm') {
      const spouseData = await getUser(user.marriage);
      user.marriage = null;
      spouseData.marriage = null;

      await user.save();
      await spouseData.save();

      const successEmbed = new EmbedBuilder()
        .setTitle('💔 Ly hôn thành công')
        .setDescription(`**${message.author.username}** và **${spouse.username}** đã ly hôn.`)
        .setColor('#FF00CB');
      interaction.update({ embeds: [successEmbed], components: [] });
    } else {
      const cancelEmbed = new EmbedBuilder()
        .setTitle('❌ Ly hôn đã bị hủy')
        .setDescription(`Bạn đã hủy yêu cầu ly hôn với **${spouse.username}**.`)
        .setColor('#FF00CB');
      interaction.update({ embeds: [cancelEmbed], components: [] });
    }
  });

  collector.on('end', collected => {
    if (!collected.size) {
      reply.edit({ content: '⏳ Thời gian phản hồi đã hết.', components: [] });
    }
  });
}

// Command: "pmarry" - Xem thông tin hôn nhân (13)
if (command === 'pmarry') {
  if (!user.marriage) {
    return message.reply('❌ Bạn chưa kết hôn với ai.');
  }

  const spouse = await client.users.fetch(user.marriage);
  const spouseData = await getUser(user.marriage);

  const embed = new EmbedBuilder()
    .setTitle('💞 Thông tin hôn nhân')
    .setDescription(`Bạn đang hạnh phúc với **${spouse.username}** ❤️`)
    .setColor('#FF00CB')
    .addFields(
      { name: '💍 Nhẫn kết hôn:', value: user.marriageRing || 'Không có' },
      { name: '💖 Điểm yêu thương:', value: `${user.lovePoints || 0}` },
      { name: '📅 Ngày kết hôn:', value: `${user.marriageDate || 'Chưa rõ'}` }
    );

  if (user.marriageCaption) {
    embed.addFields({ name: '📜 Caption:', value: user.marriageCaption });
  }

  if (user.marriageImage) {
    embed.setImage(user.marriageImage);
  } else if (user.marriageRingEmoji) {
    embed.setDescription(embed.data.description + ` ${user.marriageRingEmoji}`);
  }

  if (user.marriageThumbnail) {
    embed.setThumbnail(user.marriageThumbnail);
  }

  message.reply({ embeds: [embed] });
}

// Command: "addimage" - Thêm ảnh lớn vào thông tin hôn nhân (14)
if (command === 'addimage') {
  const imageUrl = args[0];
  if (!user.marriage) {
    return message.reply('❌ Bạn chưa kết hôn để chỉnh sửa thông tin hôn nhân.');
  }

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return message.reply('❌ Vui lòng cung cấp đường dẫn hợp lệ đến ảnh.');
  }

  user.marriageImage = imageUrl;
  await user.save();

  message.reply('✅ Đã thêm ảnh lớn vào thông tin hôn nhân.');
}

// Command: "delimage" - Xóa ảnh lớn khỏi thông tin hôn nhân (15)
if (command === 'delimage') {
  if (!user.marriage || !user.marriageImage) {
    return message.reply('❌ Không có ảnh lớn nào để xóa.');
  }

  user.marriageImage = null;
  await user.save();

  message.reply('✅ Đã xóa ảnh lớn khỏi thông tin hôn nhân.');
}

// Command: "addthumbnail" - Thêm thumbnail vào góc phải thông tin hôn nhân (16)
if (command === 'addthumbnail') {
  const thumbnailUrl = args[0];
  if (!user.marriage) {
    return message.reply('❌ Bạn chưa kết hôn để chỉnh sửa thông tin hôn nhân.');
  }

  if (!thumbnailUrl || !thumbnailUrl.startsWith('http')) {
    return message.reply('❌ Vui lòng cung cấp đường dẫn hợp lệ đến thumbnail.');
  }

  user.marriageThumbnail = thumbnailUrl;
  await user.save();

  message.reply('✅ Đã thêm thumbnail vào thông tin hôn nhân.');
}

// Command: "delthumbnail" - Xóa thumbnail khỏi thông tin hôn nhân (17)
if (command === 'delthumbnail') {
  if (!user.marriage || !user.marriageThumbnail) {
    return message.reply('❌ Không có thumbnail nào để xóa.');
  }

  user.marriageThumbnail = null;
  await user.save();

  message.reply('✅ Đã xóa thumbnail khỏi thông tin hôn nhân.');
}

// Command: "addcaption" - Thêm caption vào thông tin hôn nhân (18)
if (command === 'addcaption') {
  const caption = args.join(' ');
  if (!user.marriage) {
    return message.reply('❌ Bạn chưa kết hôn để chỉnh sửa thông tin hôn nhân.');
  }

  if (!caption) {
    return message.reply('❌ Vui lòng cung cấp nội dung caption.');
  }

  user.marriageCaption = caption;
  await user.save();

  message.reply('✅ Đã thêm caption vào thông tin hôn nhân.');
}

// Command: "delcaption" - Xóa caption khỏi thông tin hôn nhân (19)
if (command === 'delcaption') {
  if (!user.marriage || !user.marriageCaption) {
    return message.reply('❌ Không có caption nào để xóa.');
  }

  user.marriageCaption = null;
  await user.save();

  message.reply('✅ Đã xóa caption khỏi thông tin hôn nhân.');
}

// Command: "luv" - Cộng điểm yêu thương (20)
if (command === 'luv') {
  const cooldownKey = `luvCooldown_${message.author.id}`;
  const cooldown = client.cooldowns.get(cooldownKey);

  if (cooldown && Date.now() - cooldown < 3600000) {
    const timeLeft = Math.ceil((3600000 - (Date.now() - cooldown)) / 60000);
    return message.reply(`⏳ Bạn cần chờ **${timeLeft} phút** nữa để cộng điểm yêu thương.`);
  }

  if (!user.marriage) {
    return message.reply('❌ Bạn cần kết hôn để cộng điểm yêu thương.');
  }

  user.lovePoints = (user.lovePoints || 0) + 1;
  await user.save();
  client.cooldowns.set(cooldownKey, Date.now());

  message.reply('💖 Bạn đã cộng 1 điểm yêu thương thành công!');
}

// Command: "sn" - Xem lại tin nhắn đã xóa gần nhất (21)
if (command === 'sn') {
  const deletedMessages = client.deletedMessages.get(message.channel.id) || [];
  if (deletedMessages.length === 0) {
    return message.reply('❌ Không có tin nhắn nào bị xóa gần đây.');
  }

  let index = 0;
  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('📜 Tin nhắn đã xóa')
    .setDescription(`Nội dung: ${deletedMessages[index].content || 'Tin nhắn không có nội dung.'}`)
    .setFooter({ text: `Tin nhắn ${index + 1}/${deletedMessages.length}` });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Trước').setStyle('Primary'),
    new ButtonBuilder().setCustomId('next').setLabel('➡️ Tiếp').setStyle('Primary')
  );

  const sentMessage = await message.reply({ embeds: [embed], components: [buttons] });

  const filter = (interaction) =>
    ['prev', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;

  const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', (interaction) => {
    interaction.deferUpdate();

    if (interaction.customId === 'next') {
      index = (index + 1) % deletedMessages.length;
    } else if (interaction.customId === 'prev') {
      index = (index - 1 + deletedMessages.length) % deletedMessages.length;
    }

    embed.setDescription(`Nội dung: ${deletedMessages[index].content || 'Tin nhắn không có nội dung.'}`);
    embed.setFooter({ text: `Tin nhắn ${index + 1}/${deletedMessages.length}` });

    sentMessage.edit({ embeds: [embed] });
  });
}

// Command: "av" - Xem avatar thành viên (22)
if (command === 'av') {
  const target = message.mentions.users.first() || message.author;

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(`🖼️ Avatar của ${target.username}`)
    .setImage(target.displayAvatarURL({ size: 1024, dynamic: true }));

  message.reply({ embeds: [embed] });
}

// Command: "rd" - Random số theo yêu cầu (23)
if (command === 'rd') {
  const [min, max] = args.map(Number);
  if (!min || !max || min >= max) {
    return message.reply('❌ Vui lòng nhập khoảng số hợp lệ. Ví dụ: `e.rd 1 100`');
  }

  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  message.reply(`🎲 Kết quả ngẫu nhiên: **${result}**`);
}

// Command: "pick" - Chọn ngẫu nhiên các tùy chọn (24)
if (command === 'pick') {
  const options = args.join(' ').split('|').map((opt) => opt.trim());
  if (options.length < 2) {
    return message.reply('❌ Vui lòng cung cấp ít nhất 2 tùy chọn, cách nhau bằng dấu `|`. Ví dụ: `e.pick A | B | C`');
  }

  const choice = options[Math.floor(Math.random() * options.length)];
  message.reply(`🎯 Lựa chọn ngẫu nhiên: **${choice}**`);
}

// Command: "addreply" - Thêm trả lời tự động (26)
if (command === 'addreply') {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Bạn cần quyền quản trị viên để sử dụng lệnh này.');
  }

  const trigger = args[0];
  const response = args.slice(1).join(' ');
  if (!trigger || !response) {
    return message.reply('❌ Vui lòng cung cấp từ khóa và câu trả lời. Ví dụ: `e.addreply hello Xin chào!`');
  }

  client.autoReplies.set(trigger, response);
  message.reply(`✅ Đã thêm trả lời tự động cho từ khóa: **${trigger}**.`);
}

// Command: "delreply" - Xóa trả lời tự động (27)
if (command === 'delreply') {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Bạn cần quyền quản trị viên để sử dụng lệnh này.');
  }

  const trigger = args[0];
  if (!client.autoReplies.has(trigger)) {
    return message.reply('❌ Không tìm thấy từ khóa để xóa.');
  }

  client.autoReplies.delete(trigger);
  message.reply(`✅ Đã xóa trả lời tự động cho từ khóa: **${trigger}**.`);
}

// Command: "listreply" - Liệt kê các trả lời tự động (28)
if (command === 'listreply') {
  if (!message.member.permissions.has('Administrator')) {
    return message.reply('❌ Bạn cần quyền quản trị viên để sử dụng lệnh này.');
  }

  if (client.autoReplies.size === 0) {
    return message.reply('📜 Không có trả lời tự động nào.');
  }

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('📋 Danh sách trả lời tự động')
    .setDescription(
      Array.from(client.autoReplies.entries())
        .map(([trigger, response], i) => `${i + 1}. **${trigger}** ➡️ ${response}`)
        .join('\n')
    );

  message.reply({ embeds: [embed] });
}

// Command: "ban" - Ban thành viên (29)
if (command === 'ban') {
  if (!message.member.permissions.has('BanMembers')) {
    return message.reply('❌ Bạn cần quyền "Cấm thành viên" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'Không có lý do được cung cấp.';

  if (!target) {
    return message.reply('❌ Vui lòng đề cập đến thành viên bạn muốn cấm.');
  }
  if (!target.bannable) {
    return message.reply('❌ Tôi không thể cấm thành viên này.');
  }

  await target.ban({ reason });
  message.reply(`✅ Đã cấm thành viên **${target.user.tag}**.\n📝 Lý do: ${reason}`);
}

// Command: "unban" - Mở ban thành viên (30)
if (command === 'unban') {
  if (!message.member.permissions.has('BanMembers')) {
    return message.reply('❌ Bạn cần quyền "Cấm thành viên" để sử dụng lệnh này.');
  }

  const userId = args[0];
  if (!userId) {
    return message.reply('❌ Vui lòng cung cấp ID của thành viên bạn muốn mở ban.');
  }

  try {
    await message.guild.members.unban(userId);
    message.reply(`✅ Đã mở ban cho thành viên có ID **${userId}**.`);
  } catch (error) {
    message.reply('❌ Không thể mở ban. Hãy kiểm tra ID hoặc quyền của bạn.');
  }
}

// Command: "mute" - Mute thành viên (31)
if (command === 'mute') {
  if (!message.member.permissions.has('MuteMembers')) {
    return message.reply('❌ Bạn cần quyền "Tắt tiếng thành viên" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const duration = parseInt(args[1]) || 0;

  if (!target) {
    return message.reply('❌ Vui lòng đề cập đến thành viên bạn muốn mute.');
  }
  if (duration <= 0) {
    return message.reply('❌ Vui lòng cung cấp thời gian tắt tiếng (phút). Ví dụ: `e.mute @user 10`');
  }

  const muteRole = message.guild.roles.cache.find((role) => role.name === 'Muted');
  if (!muteRole) {
    return message.reply('❌ Không tìm thấy vai trò "Muted". Hãy tạo nó trước.');
  }

  await target.roles.add(muteRole);
  message.reply(`🔇 Đã mute **${target.user.tag}** trong **${duration} phút**.`);

  setTimeout(async () => {
    if (target.roles.cache.has(muteRole.id)) {
      await target.roles.remove(muteRole);
      message.channel.send(`🔊 **${target.user.tag}** đã được unmute sau **${duration} phút**.`);
    }
  }, duration * 60 * 1000);
}

// Command: "unmute" - Unmute thành viên (32)
if (command === 'unmute') {
  if (!message.member.permissions.has('MuteMembers')) {
    return message.reply('❌ Bạn cần quyền "Tắt tiếng thành viên" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const muteRole = message.guild.roles.cache.find((role) => role.name === 'Muted');

  if (!target || !muteRole || !target.roles.cache.has(muteRole.id)) {
    return message.reply('❌ Thành viên không bị mute hoặc không có vai trò "Muted".');
  }

  await target.roles.remove(muteRole);
  message.reply(`🔊 Đã unmute **${target.user.tag}**.`);
}

// Command: "kick" - Kick thành viên (33)
if (command === 'kick') {
  if (!message.member.permissions.has('KickMembers')) {
    return message.reply('❌ Bạn cần quyền "Kick thành viên" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'Không có lý do được cung cấp.';

  if (!target) {
    return message.reply('❌ Vui lòng đề cập đến thành viên bạn muốn kick.');
  }
  if (!target.kickable) {
    return message.reply('❌ Tôi không thể kick thành viên này.');
  }

  await target.kick(reason);
  message.reply(`✅ Đã kick thành viên **${target.user.tag}**.\n📝 Lý do: ${reason}`);
}

// Command: "lock" - Khóa kênh chat (34)
if (command === 'lock') {
  if (!message.member.permissions.has('ManageChannels')) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để sử dụng lệnh này.');
  }

  await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
  message.reply('🔒 Kênh chat đã bị khóa.');
}

// Command: "unlock" - Mở khóa kênh chat (35)
if (command === 'unlock') {
  if (!message.member.permissions.has('ManageChannels')) {
    return message.reply('❌ Bạn cần quyền "Quản lý kênh" để sử dụng lệnh này.');
  }

  await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
  message.reply('🔓 Kênh chat đã được mở khóa.');
}

// Command: "addrole" - Thêm vai trò cho thành viên (36)
if (command === 'addrole') {
  if (!message.member.permissions.has('ManageRoles')) {
    return message.reply('❌ Bạn cần quyền "Quản lý vai trò" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const roleName = args.slice(1).join(' ');

  if (!target || !roleName) {
    return message.reply('❌ Vui lòng đề cập đến thành viên và vai trò muốn thêm.');
  }

  const role = message.guild.roles.cache.find((r) => r.name === roleName);
  if (!role) {
    return message.reply('❌ Vai trò không tồn tại.');
  }

  await target.roles.add(role);
  message.reply(`✅ Đã thêm vai trò **${roleName}** cho **${target.user.tag}**.`);
}

// Command: "delrole" - Xóa vai trò của thành viên (37)
if (command === 'delrole') {
  if (!message.member.permissions.has('ManageRoles')) {
    return message.reply('❌ Bạn cần quyền "Quản lý vai trò" để sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const roleName = args.slice(1).join(' ');

  if (!target || !roleName) {
    return message.reply('❌ Vui lòng đề cập đến thành viên và vai trò muốn xóa.');
  }

  const role = message.guild.roles.cache.find((r) => r.name === roleName);
  if (!role || !target.roles.cache.has(role.id)) {
    return message.reply('❌ Vai trò không tồn tại hoặc thành viên không có vai trò đó.');
  }

  await target.roles.remove(role);
  message.reply(`✅ Đã xóa vai trò **${roleName}** khỏi **${target.user.tag}**.`);
}

// Command: "addxu" - Thêm xu vào tài khoản người dùng (38)
if (command === 'addxu') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const amount = parseInt(args[1]);

  if (!target || isNaN(amount) || amount <= 0) {
    return message.reply('❌ Vui lòng đề cập thành viên và số lượng xu hợp lệ. Ví dụ: `eaddxu @user 1000`');
  }

  const userData = await User.findOneAndUpdate(
    { userId: target.id },
    { $inc: { balance: amount } },
    { upsert: true, new: true }
  );

  message.reply(`💰 Đã thêm **${amount} xu** cho **${target.user.tag}**. Số dư hiện tại: **${userData.balance} xu**.`);
}

// Command: "delxu" - Trừ xu từ tài khoản người dùng (39)
if (command === 'delxu') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const target = message.mentions.members.first();
  const amount = parseInt(args[1]);

  if (!target || isNaN(amount) || amount <= 0) {
    return message.reply('❌ Vui lòng đề cập thành viên và số lượng xu hợp lệ. Ví dụ: `edelxu @user 1000`');
  }

  const userData = await User.findOneAndUpdate(
    { userId: target.id },
    { $inc: { balance: -amount } },
    { upsert: true, new: true }
  );

  if (userData.balance < 0) {
    userData.balance = 0;
    await userData.save();
  }

  message.reply(`💸 Đã trừ **${amount} xu** từ **${target.user.tag}**. Số dư hiện tại: **${userData.balance} xu**.`);
}

// Command: "prefix" - Thay đổi prefix của bot (40)
if (command === 'prefix') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const newPrefix = args[0];
  if (!newPrefix || newPrefix.length > 3) {
    return message.reply('❌ Vui lòng cung cấp một prefix hợp lệ (dài tối đa 3 ký tự).');
  }

  prefix = newPrefix;
  message.reply(`✅ Prefix đã được thay đổi thành: **${prefix}**.`);
}

// Command: "resetallbot" - Reset tất cả dữ liệu của bot (41)
if (command === 'resetallbot') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  await User.deleteMany({});
  message.reply('⚠️ Tất cả dữ liệu của bot đã được reset hoàn toàn.');
}

// Khai báo mảng shopItems
const shopItems = [
  { id: '01', name: 'ENZ Peridot', price: 100000, emoji: '💍' },
  { id: '02', name: 'ENZ Citrin', price: 200000, emoji: '💍' },
  { id: '03', name: 'ENZ Topaz', price: 500000, emoji: '💍' },
  { id: '04', name: 'ENZ Spinel', price: 1000000, emoji: '💍' },
  { id: '05', name: 'ENZ Aquamarine', price: 2500000, emoji: '💍' },
  { id: '06', name: 'ENZ Emerald', price: 5000000, emoji: '💍' },
  { id: '07', name: 'ENZ Ruby', price: 10000000, emoji: '💍' },
  { id: '333', name: 'ENZ Sapphire', price: 25000000, emoji: '💎' },
  { id: '999', name: 'ENZ Centenary', price: 99999999, emoji: '💎' }
];

 // Command: "addemojishop" - Thêm emoji vào sản phẩm trong shop (42)
if (command === 'addemojishop') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const itemId = args[0];
  const emoji = args[1];

  if (!itemId || !emoji) {
    return message.reply('❌ Vui lòng cung cấp ID sản phẩm và emoji. Ví dụ: `eaddemojishop 01 🟢`');
  }

  const item = shopItems.find((item) => item.id === itemId);
  if (!item) {
    return message.reply('❌ Không tìm thấy sản phẩm với ID này.');
  }

  item.emoji = emoji;
  message.reply(`✅ Đã thêm emoji **${emoji}** vào sản phẩm **${item.name}**.`);
}

// Command: "delemojishop" - Xóa emoji khỏi sản phẩm trong shop (43)
if (command === 'delemojishop') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const itemId = args[0];

  if (!itemId) {
    return message.reply('❌ Vui lòng cung cấp ID sản phẩm. Ví dụ: `edelemojishop 01`');
  }

  const item = shopItems.find((item) => item.id === itemId);
  if (!item) {
    return message.reply('❌ Không tìm thấy sản phẩm với ID này.');
  }

  delete item.emoji;
  message.reply(`✅ Đã xóa emoji khỏi sản phẩm **${item.name}**.`);
}

// Command: "addspshop" - Thêm sản phẩm mới vào shop (44)
if (command === 'addspshop') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const itemId = args[0];
  const itemName = args.slice(1, -1).join(' ');
  const itemPrice = parseInt(args[args.length - 1]);

  if (!itemId || !itemName || isNaN(itemPrice) || itemPrice <= 0) {
    return message.reply('❌ Vui lòng cung cấp ID, tên sản phẩm và giá hợp lệ. Ví dụ: `eaddspshop 123 Vòng Cổ 5000`');
  }

  const existingItem = shopItems.find((item) => item.id === itemId);
  if (existingItem) {
    return message.reply('❌ Đã tồn tại sản phẩm với ID này.');
  }

  shopItems.push({ id: itemId, name: itemName, price: itemPrice });
  message.reply(`✅ Đã thêm sản phẩm **${itemName}** vào shop với giá **${itemPrice} xu**.`);
}

// Command: "delspshop" - Xóa sản phẩm khỏi shop (45)
if (command === 'delspshop') {
  if (message.author.id !== '1262464227348582492') {
    return message.reply('❌ Chỉ admin bot mới có thể sử dụng lệnh này.');
  }

  const itemId = args[0];

  if (!itemId) {
    return message.reply('❌ Vui lòng cung cấp ID sản phẩm. Ví dụ: `edelspshop 123`');
  }

  const itemIndex = shopItems.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return message.reply('❌ Không tìm thấy sản phẩm với ID này.');
  }

  const item = shopItems[itemIndex];
  shopItems.splice(itemIndex, 1);
  message.reply(`✅ Đã xóa sản phẩm **${item.name}** khỏi shop.`);
}
    
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
