const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ganti dengan token bot Anda
const token = '7147604833:AAHnlNkW2pboIU_jrCPA0BnPEqkqI7ie_Ws';
const bot = new TelegramBot(token, { polling: true });

const dataFilePath = path.join(__dirname, 'data.txt');
const premiumFilePath = path.join(__dirname, 'premium.json');

// Membaca file data.txt dan premium.json jika ada
let userIds = [];
let premiumUsers = {};

if (fs.existsSync(dataFilePath)) {
    userIds = fs.readFileSync(dataFilePath, 'utf8').split('\n').filter(Boolean).map(Number);
}

if (fs.existsSync(premiumFilePath)) {
    premiumUsers = JSON.parse(fs.readFileSync(premiumFilePath, 'utf8'));
}

// Fungsi untuk menyimpan user ID ke file
const saveUserId = (userId) => {
    if (!userIds.includes(userId)) {
        userIds.push(userId);
        fs.appendFileSync(dataFilePath, userId + '\n');
    }
};

// Fungsi untuk menyimpan data premium ke file
const savePremiumData = () => {
    fs.writeFileSync(premiumFilePath, JSON.stringify(premiumUsers, null, 2));
};

// Fungsi untuk memeriksa status premium
const isPremium = (userId) => {
    const premiumData = premiumUsers[userId];
    if (!premiumData) return false;
    const now = new Date();
    return now < new Date(premiumData.expiry);
};

// Fungsi untuk memeriksa status banned
const isBanned = (userId) => {
    const premiumData = premiumUsers[userId];
    if (!premiumData) return false;
    return premiumData.banned === true;
};

// Middleware untuk memeriksa akses admin
const checkAdminAccess = (msg, callback) => {
    const userId = msg.from.id;
    if (userId !== 7065487918) {
        bot.sendMessage(userId, 'lu bukan admin bjir 🗿');
        return;
    }
    callback();
};

// Fungsi untuk mengecek dan memperbarui status premium yang telah kedaluwarsa
const checkPremiumExpiry = () => {
    const now = new Date();
    Object.keys(premiumUsers).forEach((userId) => {
        const premiumData = premiumUsers[userId];
        if (now >= new Date(premiumData.expiry)) {
            delete premiumUsers[userId];
        } else {
            const oneDayBeforeExpiry = new Date(premiumData.expiry);
            oneDayBeforeExpiry.setDate(oneDayBeforeExpiry.getDate() - 1);
            if (now >= oneDayBeforeExpiry && !premiumData.notified) {
                bot.sendMessage(userId, '🕓 Status premium Anda akan kedaluwarsa dalam 1 hari.');
                premiumData.notified = true;
                savePremiumData();
            }
        }
    });
};

setInterval(checkPremiumExpiry, 5 * 60 * 1000); // Memeriksa setiap jam

// Middleware untuk memeriksa status premium atau banned
const checkAccess = (msg, callback) => {
    const userId = msg.from.id;
    if (isBanned(userId)) {
        bot.sendMessage(userId, '🗿 Anda telah diblokir dan tidak dapat menggunakan fitur bot.');
        return;
    }
    if (!isPremium(userId)) {
        bot.sendMessage(userId, '😌 Fitur ini hanya tersedia untuk pengguna premium.');
        return;
    }
    callback();
};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;

    // Simpan user ID ke file
    saveUserId(userId);

    // Berikan trial premium 1 hari untuk pengguna baru
    if (!premiumUsers[userId]) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        premiumUsers[userId] = { expiry: expiryDate.toISOString() };
        savePremiumData();
        bot.sendMessage(chatId, 'Anjay dapet akses premium gratis selama 1 hari 🗿');
    }

    const message = `˚∧＿∧ 𝙒𝙄𝙉𝙏𝙀𝙍 𝙎𝙐𝙋𝙋𝙊𝙍𝙏
( •‿• )つ 
(つ < 𝘽𝙔 : @LuxInGame
｜ _つ
'し'
╔═❍ INFORMATION <
╠ ID : ${userId}
╠ USERNAME : @${username}
╠ PREMIUM : ${isPremium(userId) ? 'Aktif' : 'Non Aktif'}
╙─┈━━━━━━┅┅┅┅━━⚇
▬▭▬▭▬▭▬▭▬▭▬▭▬
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝙎𝙀𝘼𝙍𝘾𝙃 
┣⮕ /google <𝙏𝙚𝙭𝙩>
┣⮕ /id <𝘾𝙚𝙠𝙄𝘿>
┣⮕ /lirik <𝙏𝙚𝙭𝙩>
┣⮕ /calc <𝘾𝙖𝙡𝙘𝙪𝙡𝙖𝙩𝙤𝙧>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿
┣⮕ /tiktok <𝙐𝙍𝙇>
┣⮕ /ig <𝙐𝙍𝙇>
┣⮕ /spotify <𝙐𝙍𝙇>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝙒𝙄𝘽𝙐
┣⮕ /waifu <𝙃𝙤𝙩>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙄𝙉𝙁𝙊 𝘼𝙇𝘼𝙈
┣⮕ /infogempa <𝙂𝙚𝙢𝙥𝙖>
┣⮕ /cuaca <𝙇𝙤𝙠𝙖𝙨𝙞>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍
┣⮕ /addprem <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕  /ban <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /unban <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /totaluser <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /bc <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┗━━──━━━━─┉━━❐`;

    const options = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[{ text: 'Menu', callback_data: 'menu' }]]
        }
    };
    bot.sendMessage(chatId, message, options);
});

// Callback query handler
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username;

    if (data === 'menu') {
        const menuMessage = `˚∧＿∧ 𝙒𝙄𝙉𝙏𝙀𝙍 𝙎𝙐𝙋𝙋𝙊𝙍𝙏
( •‿• )つ 
(つ < 𝘽𝙔 : @LuxInGame
｜ _つ
'し'
╔═❍ INFORMATION <
╠ ID : ${userId}
╠ USERNAME : @${username}
╠ PREMIUM : ${isPremium(userId) ? 'Aktif' : 'Non Aktif'}
╙─┈━━━━━━┅┅┅┅━━⚇
▬▭▬▭▬▭▬▭▬▭▬▭▬
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝙎𝙀𝘼𝙍𝘾𝙃 
┣⮕ /google <𝙏𝙚𝙭𝙩>
┣⮕ /id <𝘾𝙚𝙠𝙄𝘿>
┣⮕ /lirik <𝙏𝙚𝙭𝙩>
┣⮕ /calc <𝘾𝙖𝙡𝙘𝙪𝙡𝙖𝙩𝙤𝙧>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿
┣⮕ /tiktok <𝙐𝙍𝙇>
┣⮕ /ig <𝙐𝙍𝙇>
┣⮕ /spotify <𝙐𝙍𝙇>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙁𝙄𝙏𝙐𝙍 𝙒𝙄𝘽𝙐
┣⮕ /waifu <𝙃𝙤𝙩>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝙄𝙉𝙁𝙊 𝘼𝙇𝘼𝙈
┣⮕ /infogempa <𝙂𝙚𝙢𝙥𝙖>
┣⮕ /cuaca <𝙇𝙤𝙠𝙖𝙨𝙞>
┗━━──━━━━─┉━━❐
▬▭▬▭▬▭▬▭▬▭▬▭
┏━⏍ 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍
┣⮕ /addprem <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕  /ban <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /unban <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /totaluser <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┣⮕ /bc <𝘿𝙚𝙫𝙊𝙣𝙡𝙮>
┗━━──━━━━─┉━━❐`;
        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: 'Menu', callback_data: 'menu' }]]
            }
        };
        bot.editMessageText(menuMessage, {
            chat_id: chatId,
            message_id: messageId,
            ...options
        });
    }
});

// Fungsi untuk memproses perintah /waifu
bot.onText(/\/waifu/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    checkAccess(msg, () => {
        bot.sendMessage(chatId, '💡 Processing...').then((sentMessage) => {
            axios.get('https://api.ngodingaja.my.id/api/waifurandom')
                .then(response => {
                    const waifuUrl = response.data;
                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.sendPhoto(chatId, waifuUrl, {
                        caption: 'Here is your waifu!'
                    });
                })
                .catch(error => {
                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.sendMessage(chatId, 'Failed to fetch waifu.');
                });
        });
    });
});

// Fitur Instagram
bot.onText(/\/ig (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const url = match[1];

    // Pastikan pengguna adalah premium atau admin
    if (!isPremium(userId, premiumUsers)) {
        return bot.sendMessage(chatId, 'Fitur ini hanya tersedia untuk pengguna premium.');
    }

    try {
        const response = await axios.get(`https://api.ngodingaja.my.id/api/ig?url=${encodeURIComponent(url)}`);
        const data = response.data.hasil[0];

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔥 Download Video No Watermak', callback_data: `ig_video|${data.download_link}` },
                        { text: '⚡ Download Thumbnail', callback_data: `ig_thumbnail|${data.thumbnail_link}` }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, '➡️ Pilih format yang ingin Anda unduh:', options);
        bot.sendPhoto(chatId, data.thumbnail_link, { caption: 'Thumbnail dari video Instagram.' });
    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan Instagram. Pastikan URL yang dimasukkan benar.');
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const userId = callbackQuery.from.id;
    const [type, url] = callbackQuery.data.split('|');

    if (!isPremium(userId, premiumUsers)) {
        return bot.answerCallbackQuery(callbackQuery.id, { text: 'Fitur ini hanya tersedia untuk pengguna premium.' });
    }

    bot.sendMessage(chatId, `Memproses permintaan Anda untuk ${type.includes('video') ? 'video' : 'thumbnail'}...`);

    try {
        if (type === 'ig_video') {
            bot.sendVideo(chatId, url, { caption: 'success y' });
        } else if (type === 'ig_thumbnail') {
            bot.sendPhoto(chatId, url, { caption: 'dah' });
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan saat mengirim file.');
    }
});

// Fungsi untuk memproses perintah /spotify
bot.onText(/\/spotify (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const url = match[1];

    checkAccess(msg, () => {
        bot.sendMessage(chatId, 'Processing...').then((sentMessage) => {
            axios.get(`https://api.ngodingaja.my.id/api/spotify?url=${encodeURIComponent(url)}`)
                .then(response => {
                    const data = response.data;
                    if (data && data.download_url) {
                        const caption = `
<b>${data.title}</b>
<i>${data.artist}</i>
<a href="${data.download_url}">Download</a>
`;
                        const options = { parse_mode: 'HTML' };
                        bot.deleteMessage(chatId, sentMessage.message_id);
                        bot.sendPhoto(chatId, data.thumbnailUrl, {
                            caption: caption,
                            ...options
                        });
                    } else {
                        bot.deleteMessage(chatId, sentMessage.message_id);
                        bot.sendMessage(chatId, 'Failed to fetch data from Spotify.');
                    }
                })
                .catch(error => {
                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.sendMessage(chatId, 'An error occurred while processing your request.');
                });
        });
    });
});

// Fitur TikTok
bot.onText(/\/tiktok (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const url = match[1];

    // Pastikan pengguna adalah premium atau admin
    if (!isPremium(userId, premiumUsers)) {
        return bot.sendMessage(chatId, 'Fitur ini hanya tersedia untuk pengguna premium.');
    }

    try {
        const response = await axios.get(`https://api.ngodingaja.my.id/api/tiktok?url=${encodeURIComponent(url)}`);
        const data = response.data.hasil;

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💡 Download Video', callback_data: `video|${data.tanpawm}` },
                        { text: '🔥 Download MP3', callback_data: `mp3|${data.musik}` }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, `Pilih format yang ingin Anda unduh:\n\nJudul: ${data.judul}`, options);
    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan TikTok. Pastikan URL yang dimasukkan benar.');
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const userId = callbackQuery.from.id;
    const [type, url] = callbackQuery.data.split('|');

    if (!isPremium(userId, premiumUsers)) {
        return bot.answerCallbackQuery(callbackQuery.id, { text: 'Fitur ini hanya tersedia untuk pengguna premium.' });
    }

    bot.sendMessage(chatId, `Memproses permintaan Anda untuk ${type === 'video' ? 'video' : 'mp3'}...`);

    try {
        if (type === 'video') {
            bot.sendVideo(chatId, url, { caption: 'dah.' });
        } else if (type === 'mp3') {
            bot.sendAudio(chatId, url, { caption: 'ni anyink' });
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan saat mengirim file.');
    }
});

// Fungsi untuk memproses perintah /google
bot.onText(/\/google (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const query = match[1];

    checkAccess(msg, () => {
        bot.sendMessage(chatId, 'Processing...').then((sentMessage) => {
            axios.get(`https://api.ngodingaja.my.id/api/gsearch?search=${encodeURIComponent(query)}`)
                .then(response => {
                    const data = response.data;
                    const results = data.results.slice(0, 5).map((result, index) => {
                        return `${index + 1}. <a href="${result.link}">${result.title}</a>\n${result.snippet}`;
                    }).join('\n\n');
                    const message = `
<b>💡 Hasil pencarian untuk "${query}":</b>

${results}
`;
                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
                })
                .catch(error => {
                    bot.deleteMessage(chatId, sentMessage.message_id);
                    bot.sendMessage(chatId, '❗ Failed to fetch search results.');
                });
        });
    });
});

// Fungsi untuk memproses perintah /ban
bot.onText(/\/ban (\d+) (\d+)/, (msg, match) => {
    checkAdminAccess(msg, () => {
        const userId = parseInt(match[1], 10);
        const banDuration = parseInt(match[2], 10);

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + banDuration);

        premiumUsers[userId] = {
            banned: true,
            expiry: expiryDate.toISOString()
        };
        savePremiumData();

        bot.sendMessage(msg.chat.id, `💡 User dengan ID ${userId} telah diblokir selama ${banDuration} hari.`);
    });
});

// Fungsi untuk memproses perintah /unban
bot.onText(/\/unban (\d+)/, (msg, match) => {
    checkAdminAccess(msg, () => {
        const userId = parseInt(match[1], 10);

        if (premiumUsers[userId]) {
            delete premiumUsers[userId].banned;
            savePremiumData();
            bot.sendMessage(msg.chat.id, `💡 User dengan ID ${userId} telah diunblokir.`);
        } else {
            bot.sendMessage(msg.chat.id, `❗ User dengan ID ${userId} tidak ditemukan.`);
        }
    });
});

// Fungsi untuk memproses perintah /totaluser
bot.onText(/\/totaluser/, (msg) => {
    checkAdminAccess(msg, () => {
        const totalUsers = userIds.length;
        bot.sendMessage(msg.chat.id, `🔥 Total user: ${totalUsers}`);
    });
});

// Fungsi untuk memproses perintah /bc
bot.onText(/\/bc (.+)/, (msg, match) => {
    checkAdminAccess(msg, () => {
        const broadcastMessage = match[1];

        userIds.forEach((userId) => {
            bot.sendMessage(userId, broadcastMessage);
        });

        bot.sendMessage(msg.chat.id, '✅ Broadcast message has been sent.');
    });
});

// Fungsi untuk memproses perintah /premium
bot.onText(/\/premium (\d+) (\d+)/, (msg, match) => {
    checkAdminAccess(msg, () => {
        const userId = parseInt(match[1], 10);
        const days = parseInt(match[2], 10);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        premiumUsers[userId] = { expiry: expiryDate.toISOString() };
        savePremiumData();

        bot.sendMessage(msg.chat.id, `💡 User dengan ID ${userId} telah diberikan akses premium selama ${days} hari.`);
    });
});

// Command untuk tag all users
bot.onText(/\/tagall/, (msg) => {
    const chatId = msg.chat.id;

    checkAccess(msg, () => {
        const allUsers = msg.chat.members;
        let message = '';
        allUsers.forEach(user => {
            message += `@${user.username}\n`;
        });
        bot.sendMessage(chatId, message);
    });
});

// Command untuk tag online users
bot.onText(/\/tagonline/, (msg) => {
    const chatId = msg.chat.id;

    checkAccess(msg, () => {
        const onlineUsers = msg.chat.members.filter(member => member.status === 'online');
        let message = '';
        onlineUsers.forEach(user => {
            message += `@${user.username}\n`;
        });
        bot.sendMessage(chatId, message);
    });
});

// ID command
bot.onText(/\/id/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    bot.sendMessage(chatId, `💡 ID Telegram Anda adalah: ${userId}`);
});

// Infogempa command
bot.onText(/\/infogempa/, (msg) => {
    const chatId = msg.chat.id;

    checkAccess(msg, async () => {
        const processingMessage = await bot.sendMessage(chatId, 'Processing...');
        try {
            const response = await axios.get('https://api.ngodingaja.my.id/api/infogempa');
            const data = response.data;
            if (data.status) {
                const { tanggal, jam, koordinat, lintang, bujur, magnitude, kedalaman, wilayah, potensi, dirasakan, gambar } = data.hasil;
                const caption = `📆 Tanggal: ${tanggal}\n🕓 Jam : ${jam}\n⛱ Koordinat: ${koordinat}\n⛱ Lintang : ${lintang}\n🏝 Bujur : ${bujur}\n💡 Magnitude : ${magnitude}\n🏝 Kedalaman : ${kedalaman}\n⛱ Wilayah : ${wilayah}\n💡 Potensi : ${potensi}\n⚡ Dirasakan : ${dirasakan}`;
                await bot.sendPhoto(chatId, gambar, { caption, parse_mode: 'Markdown' });
                await bot.deleteMessage(chatId, processingMessage.message_id);
            } else {
                bot.sendMessage(chatId, 'Gagal mengambil informasi gempa.');
            }
        } catch (error) {
            await bot.deleteMessage(chatId, processingMessage.message_id);
            bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan Anda.');
        }
    });
});

// Lirik command
bot.onText(/\/lirik (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1].trim();

    if (!text) {
        bot.sendMessage(chatId, '➡️ Silahkan kirimkan /lirik [ text ]');
    } else {
        const processingMessage = bot.sendMessage(chatId, '💡 Processing...');
        axios.get(`https://api.ngodingaja.my.id/api/lirik?search=${text}`)
            .then(response => {
                const data = response.data;
                if (data.status) {
                    const artist = data.hasil.artis;
                    const title = data.hasil.judul;
                    const lyrics = data.hasil.lirik;
                    const imageUrl = data.hasil.gambar;
                    const botUsername = bot.getMe().then(botInfo => botInfo.username);
                    botUsername.then(botName => {
                        const caption = `Artis : ${artist}\nJudul : ${title}\nLirik : ${lyrics}\n\nby @${botName}`;
                        bot.sendPhoto(chatId, imageUrl, { caption, parse_mode: 'Markdown' })
                            .then(() => {
                                processingMessage.then(sentMsg => {
                                    bot.deleteMessage(chatId, sentMsg.message_id);
                                });
                            });
                    });
                } else {
                    bot.sendMessage(chatId, 'Gagal mengambil lirik dari teks tersebut.');
                }
            })
            .catch(error => {
                console.error(error);
                bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan Anda.');
            });
    }
});

// Command untuk kalkulator
bot.onText(/\/calc (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const expression = match[1];

    // Pastikan pengguna adalah premium atau admin
    checkAccess(msg, () => {
        try {
            const result = eval(expression);
            bot.sendMessage(chatId, `💡 Hasil dari ${expression} adalah ${result}`);
        } catch (error) {
            bot.sendMessage(chatId, '❗ Terjadi kesalahan dalam menghitung ekspresi. Pastikan format yang dimasukkan benar.');
        }
    });
});

// Command untuk cuaca
bot.onText(/\/cuaca (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const location = match[1];

    // Pastikan pengguna adalah premium atau admin
    checkAccess(msg, async () => {
        try {
            const locationResponse = await axios.get(`https://geocode.maps.co/search?q=${encodeURIComponent(location)}`);
            const locationData = locationResponse.data[0];
            const lat = locationData.lat;
            const lon = locationData.lon;

            const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weather = weatherResponse.data.current_weather;

            const message = `
⛱ Cuaca di ${locationData.display_name}:
- Suhu: ${weather.temperature}°C
- Kecepatan angin: ${weather.windspeed} m/s
- Arah angin: ${weather.winddirection}°
- Kondisi cuaca: ${weather.weathercode}
            `;
            bot.sendMessage(chatId, message);
        } catch (error) {
            bot.sendMessage(chatId, 'Terjadi kesalahan saat memeriksa cuaca. Pastikan lokasi yang dimasukkan benar.');
        }
    });
});

// Periksa status premium saat bot dimulai
checkPremiumExpiry();
