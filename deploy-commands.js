const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote cho server này (Mỗi user vote 1 lần mỗi 24 giờ)'),
    new SlashCommandBuilder()
        .setName('checkservervotes')
        .setDescription('Xem tổng số vote hiện tại của server này'),
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Xem bảng xếp hạng top 10 server có nhiều vote nhất')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Đang bắt đầu làm mới các lệnh ứng dụng (/) cho bot Elder...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Đã đăng ký thành công các lệnh Slash!');
    } catch (error) {
        console.error(error);
    }
})();
