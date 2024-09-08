from telethon import TelegramClient, events
from telethon.tl.functions.channels import LeaveChannel
from telethon.tl.functions.contacts import BlockRequest

# Ganti dengan API_ID dan API_HASH kamu
api_id = '23207350'
api_hash = '03464b6c80a5051eead6835928e48189'

client = TelegramClient('userbot', api_id, api_hash)

# Fungsi untuk menampilkan daftar grup
@client.on(events.NewMessage(pattern=r'\.grup'))
async def list_grup(event):
    async for dialog in client.iter_dialogs():
        if dialog.is_group:
            await event.respond(f"- {dialog.title} (ID: {dialog.id})")
    await event.respond("Selesai menampilkan daftar grup.")

# Fungsi untuk keluar dari seluruh grup/channel
@client.on(events.NewMessage(pattern=r'\.outall'))
async def leave_all(event):
    count = 0
    async for dialog in client.iter_dialogs():
        if dialog.is_group or dialog.is_channel:
            await client(LeaveChannelRequest(dialog.id))
            count += 1
    await event.respond(f"Berhasil keluar dari {count} grup/channel.")

# Fungsi untuk menghapus semua pesan dengan bot tertentu dan memblokirnya, atau hanya membersihkan chat
@client.on(events.NewMessage(pattern=r'\.clearall'))
async def clear_all(event):
    target_bot = None
    async for dialog in client.iter_dialogs():
        # Mengecek apakah ada bot dalam obrolan
        if dialog.is_user and dialog.entity.bot:
            target_bot = dialog.id
            break

    if target_bot:
        # Hapus semua pesan dengan bot dan blokir
        async for message in client.iter_messages(target_bot):
            await client.delete_messages(target_bot, message.id)
        await client(functions.contacts.BlockRequest(target_bot))
        await event.respond(f"Semua pesan dari bot {target_bot} telah dihapus dan bot diblokir.")
    else:
        # Hapus semua chat (hanya pengguna, bukan bot)
        async for dialog in client.iter_dialogs():
            async for message in client.iter_messages(dialog.id):
                await client.delete_messages(dialog.id, message.id)
        await event.respond("Semua pesan telah dihapus dari semua chat.")

# Mulai client userbot
with client:
    client.run_until_disconnected()
