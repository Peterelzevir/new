const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ganti dengan token bot Anda
const token = '6795745264:AAHIA389V7FexXfryIA9nFDaTCL5k8GSWp0';
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
    }

    const message = `
˚∧＿∧ WINTER SUPPORT BOT
( •‿• )つ 
(つ < MADE IN INDONESIA 
｜ _つ
'し'
[ INFORMATION]
ID : ${userId}
USERNAME : @${username}
PREMIUM : ${isPremium(userId) ? 'Aktif' : 'Non Aktif'}

═════ [ SEARCH ] ══════════
--> /google [ text ]
--> /id [ cek id ]
--> /lirik [ text ]
--> /cuaca [ lokasi ]
--> /calc [ 3+2 ]

═════ [ DOWNLOAD ] ═══════
--> /tiktok [ url ]
--> /ig [ url ]

════════ [ WIBU ] ═════════
--> /waifu 
════════ [ INFO ] ═════════
--> /infogempa
════════ [ DEV ] ══════════
--> /premium 
--> /ban 
--> /unban 
--> /totaluser 
--> /bc`;

    const options = {
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

    if (data === 'menu') {
        const menuMessage = `˚∧＿∧ WINTER SUPPORT BOT
( •‿• )つ 
(つ < MADE IN INDONESIA 
｜ _つ
'し'
[ INFORMATION]
ID : ${userId}
USERNAME : @${username}
PREMIUM : ${isPremium(userId) ? 'Aktif' : 'Non Aktif'}

═════ [ SEARCH ] ══════════
--> /google [ text ]
--> /id [ cek id ]
--> /lirik [ text ]
--> /cuaca [ lokasi ]
--> /calc [ 3+2 ]

═════ [ DOWNLOAD ] ═══════
--> /tiktok [ url ]
--> /ig [ url ]

════════ [ WIBU ] ═════════
--> /waifu 
════════ [ INFO ] ═════════
--> /infogempa
════════ [ DEV ] ══════════
--> /premium 
--> /ban 
--> /unban 
--> /totaluser 
--> /bc`;
        const options = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Back', callback_data: 'back' }]]
            }
        };
        bot.editMessageText(menuMessage, { chat_id: chatId, message_id: messageId, reply_markup: options.reply_markup });
    }

    if (data === 'back') {
        const username = callbackQuery.from.username;
        const message = `Welcome @${username}, Saya adalah Bot Anda`;
        const options = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Menu', callback_data: 'menu' }]]
            }
        };
        bot.editMessageText(message, { chat_id: chatId, message_id: messageId, reply_markup: options.reply_markup });
    }
});

// Command untuk memberikan status premium
bot.onText(/\/premium (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = parseInt(match[1]);
    const days = parseInt(match[2]);

    if (!isPremium(msg.from.id)) {
        return bot.sendMessage(chatId, 'Anda tidak memiliki akses ke perintah ini.');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    premiumUsers[userId] = { expiry: expiryDate.toISOString() };
    savePremiumData();

    bot.sendMessage(chatId, `User ${userId} telah diberi status premium selama ${days} hari.`);
});

// Command untuk banned user
bot.onText(/\/ban (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = parseInt(match[1]);
    const days = parseInt(match[2]);

    if (!isPremium(msg.from.id)) {
        return bot.sendMessage(chatId, 'Anda tidak memiliki akses ke perintah ini.');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    premiumUsers[userId] = { expiry: expiryDate.toISOString(), banned: true };
    savePremiumData();

    bot.sendMessage(chatId, `User ${userId} telah dibanned selama ${days} hari.`);
});

// Command untuk unban user
bot.onText(/\/unban (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = parseInt(match[1]);

    if (!isPremium(msg.from.id)) {
        return bot.sendMessage(chatId, 'Anda tidak memiliki akses ke perintah ini.');
    }

    if (premiumUsers[userId]) {
        delete premiumUsers[userId].banned;
        savePremiumData();
        bot.sendMessage(chatId, `User ${userId} telah diunban.`);
    } else {
        bot.sendMessage(chatId, `User ${userId} tidak ditemukan.`);
    }
});

// Command untuk menampilkan total user
bot.onText(/\/totaluser/, (msg) => {
    const chatId = msg.chat.id;

    if (!isPremium(msg.from.id)) {
        return bot.sendMessage(chatId, 'Anda tidak memiliki akses ke perintah ini.');
    }

    bot.sendMessage(chatId, `Total user: ${userIds.length}`);
});

// Command untuk broadcast
bot.onText(/\/bc (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!isPremium(msg.from.id)) {
        return bot.sendMessage(chatId, 'Anda tidak memiliki akses ke perintah ini.');
    }

    let sentCount = 0;
    let errorCount = 0;
    userIds.forEach((id, index) => {
        setTimeout(() => {
            bot.sendMessage(id, text).then(() => {
                sentCount++;
                if (sentCount + errorCount === userIds.length) {
                    bot.sendMessage(chatId, `Broadcast selesai. Berhasil: ${sentCount}, Gagal: ${errorCount}`);
                }
            }).catch(() => {
                errorCount++;
                if (sentCount + errorCount === userIds.length) {
                    bot.sendMessage(chatId, `Broadcast selesai. Berhasil: ${sentCount}, Gagal: ${errorCount}`);
                }
            });
        }, index * 1000); // Mengirim pesan setiap 1 detik untuk menghindari limitasi API Telegram
    });
});

// Command untuk mengunduh video TikTok
bot.onText(/\/tiktok (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1].trim();

    if (!url) {
        return bot.sendMessage(chatId, 'Silahkan kirimkan /tiktok [ url ]');
    }

    const processingMessage = bot.sendMessage(chatId, 'Processing...');
    axios.get(`https://api.ngodingaja.my.id/api/tiktok?url=${url}`)
        .then(response => {
            const videoUrl = response.data.result.video[0];
            bot.sendVideo(chatId, videoUrl)
                .then(() => {
                    processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
                    bot.sendMessage(chatId, 'Berhasil mengunduh video TikTok');
                });
        })
        .catch(error => {
            console.error(error);
            processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
            bot.sendMessage(chatId, 'Gagal mengunduh video TikTok');
        });
});

// Command untuk mengunduh video Instagram
bot.onText(/\/ig (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1].trim();

    if (!url) {
        return bot.sendMessage(chatId, 'Silahkan kirimkan /ig [ url ]');
    }

    const processingMessage = bot.sendMessage(chatId, 'Processing...');
    axios.get(`https://api.ngodingaja.my.id/api/ig?url=${url}`)
        .then(response => {
            const videoUrl = response.data.result.download_link;
            bot.sendVideo(chatId, videoUrl)
                .then(() => {
                    processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
                    bot.sendMessage(chatId, 'Berhasil mengunduh video Instagram');
                });
        })
        .catch(error => {
            console.error(error);
            processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
            bot.sendMessage(chatId, 'Gagal mengunduh video Instagram');
        });
});

// Command untuk mendapatkan gambar Waifu
bot.onText(/\/waifu/, (msg) => {
    const chatId = msg.chat.id;

    const processingMessage = bot.sendMessage(chatId, 'Processing...');
    axios.get('https://api.ngodingaja.my.id/api/waifurandom')
        .then(response => {
            const waifuImage = response.data.result.image;
            bot.sendPhoto(chatId, waifuImage)
                .then(() => {
                    processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
                    bot.sendMessage(chatId, 'Berhasil mendapatkan gambar Waifu');
                });
        })
        .catch(error => {
            console.error(error);
            processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
            bot.sendMessage(chatId, 'Gagal mendapatkan gambar Waifu');
        });
});

// Command untuk pencarian Google
bot.onText(/\/google (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();

    if (!query) {
        return bot.sendMessage(chatId, 'Silahkan kirimkan /google [ text ]');
    }

    const processingMessage = bot.sendMessage(chatId, 'Processing...');
    axios.get(`https://api.ngodingaja.my.id/api/gsearch?search=${query}`)
        .then(response => {
            const searchResults = response.data.result.map((result, index) => {
                return `${index + 1}. <b>${result.title}</b>\n<a href="${result.link}">${result.link}</a>\n`;
            }).join('\n');
            processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
            bot.sendMessage(chatId, searchResults, { parse_mode: 'HTML' });
        })
        .catch(error => {
            console.error(error);
            processingMessage.then(sentMessage => bot.deleteMessage(chatId, sentMessage.message_id));
            bot.sendMessage(chatId, 'Gagal melakukan pencarian di Google');
        });
});

// Tag all users
bot.onText(/\/tagall/, (msg) => {
    const chatId = msg.chat.id;
    const allUsers = msg.chat.members;
    let message = '';
    allUsers.forEach(user => {
        message += `@${user.username}\n`;
    });
    bot.sendMessage(chatId, message);
});

// Tag online users
bot.onText(/\/tagonline/, (msg) => {
    const chatId = msg.chat.id;
    const onlineUsers = msg.chat.members.filter(member => member.status === 'online');
    let message = '';
    onlineUsers.forEach(user => {
        message += `@${user.username}\n`;
    });
    bot.sendMessage(chatId, message);
});

// Infogempa command
bot.onText(/\/infogempa/, (msg) => {
    const chatId = msg.chat.id;
    const processingMessage = bot.sendMessage(chatId, 'Processing...');
    axios.get('https://api.ngodingaja.my.id/api/infogempa')
        .then(response => {
            const data = response.data;
            if (data.status) {
                const { tanggal, jam, koordinat, lintang, bujur, magnitude, kedalaman, wilayah, potensi, dirasakan, gambar } = data.hasil;
                const caption = `📆 Tanggal: ${tanggal}\n🕓 Jam : ${jam}\n⛱ Koordinat: ${koordinat}\n⛱ Lintang : ${lintang}\n🏝 Bujur : ${bujur}\n💡 Magnitude : ${magnitude}\n🏝 Kedalaman : ${kedalaman}\n⛱ Wilayah : ${wilayah}\n💡 Potensi : ${potensi}\n⚡ Dirasakan : ${dirasakan}`;
                bot.sendPhoto(chatId, gambar, { caption, parse_mode: 'Markdown' })
                    .then(() => {
                        processingMessage.then(sentMsg => {
                            bot.deleteMessage(chatId, sentMsg.message_id);
                        });
                    });
            } else {
                bot.sendMessage(chatId, 'Gagal mengambil informasi gempa.');
            }
        })
        .catch(error => {
            console.error(error);
            bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses permintaan Anda.');
        });
});

// Set welcome message command
bot.onText(/\/setwelcome (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const welcomeMessage = match[1];
    welcomeMessages[chatId] = welcomeMessage;
    bot.sendMessage(chatId, 'Pesan welcome berhasil diatur!');
});

// Handle new chat members
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    const newUser = msg.new_chat_member;
    const welcomeMessage = welcomeMessages[chatId];

    if (welcomeMessage) {
        const message = welcomeMessage
            .replace('{username}', `@${newUser.username}`)
            .replace('{user_id}', newUser.id)
            .replace('{first_name}', newUser.first_name)
            .replace('{group_id}', chatId);
        bot.sendMessage(chatId, message);
    }
});

// Lirik command
bot.onText(/\/lirik(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1].trim();
    if (!text) {
        bot.sendMessage(chatId, 'Silahkan kirimkan /lirik [ text ]');
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

// Fitur kalkulator
bot.onText(/\/calc (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const expression = match[1];

    // Pastikan pengguna adalah premium atau admin
    if (!isPremium(userId, premiumUsers)) {
        return bot.sendMessage(chatId, 'Fitur ini hanya tersedia untuk pengguna premium.');
    }

    try {
        const result = eval(expression);
        bot.sendMessage(chatId, `Hasil dari ${expression} adalah ${result}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan dalam menghitung ekspresi. Pastikan format yang dimasukkan benar.');
    }
});

// Fitur cek cuaca
bot.onText(/\/cuaca (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const location = match[1];

    // Pastikan pengguna adalah premium atau admin
    if (!isPremium(userId, premiumUsers)) {
        return bot.sendMessage(chatId, 'Fitur ini hanya tersedia untuk pengguna premium.');
    }

    try {
        const locationResponse = await axios.get(`https://geocode.maps.co/search?q=${encodeURIComponent(location)}`);
        const locationData = locationResponse.data[0];
        const lat = locationData.lat;
        const lon = locationData.lon;

        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weather = weatherResponse.data.current_weather;

        const message = `
Cuaca di ${locationData.display_name}:
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
