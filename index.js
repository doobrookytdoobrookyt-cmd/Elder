const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./database');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Bot Elder đã sẵn sàng! Đăng nhập với tên: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'vote') {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const now = Date.now();
        const cooldownTime = 24 * 60 * 60 * 1000;

        db.get(`SELECT expire_time FROM user_votes WHERE user_id = ? AND guild_id = ?`, [userId, guildId], (err, row) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Đã có lỗi xảy ra khi xử lý vote.', ephemeral: true });
            }

            if (row && row.expire_time > now) {
                const remainingHours = Math.ceil((row.expire_time - now) / (1000 * 60 * 60));
                return interaction.reply({
                    content: `⏳ Bạn đã vote cho server này rồi! Vui lòng quay lại sau **${remainingHours} giờ nữa**.`,
                    ephemeral: true
                });
            }

            const newExpireTime = now + cooldownTime;

            db.run(`INSERT OR REPLACE INTO user_votes (user_id, guild_id, expire_time) VALUES (?, ?, ?)`, [userId, guildId, newExpireTime], (err) => {
                if (err) console.error(err);
            });

            db.run(`INSERT INTO servers (guild_id, vote_count) VALUES (?, 1) ON CONFLICT(guild_id) DO UPDATE SET vote_count = vote_count + 1`, [guildId], (err) => {
                if (err) console.error(err);
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 Cảm ơn bạn đã vote!')
                .setDescription(`Bạn đã vote thành công cho server **${interaction.guild.name}**!\nLượt vote tiếp theo của bạn sẽ có hiệu lực sau 24 giờ nữa.`);

            return interaction.reply({ embeds: [embed] });
        });
    }

    else if (commandName === 'checkservervotes') {
        const guildId = interaction.guild.id;

        db.get(`SELECT vote_count FROM servers WHERE guild_id = ?`, [guildId], (err, row) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Đã có lỗi xảy ra.', ephemeral: true });
            }

            const votes = row ? row.vote_count : 0;

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`📊 Thống kê Vote Server`)
                .setDescription(`Server **${interaction.guild.name}** hiện đang có tổng cộng: **${votes}** lượt vote.`);

            return interaction.reply({ embeds: [embed] });
        });
    }

    else if (commandName === 'leaderboard') {
        db.all(`SELECT guild_id, vote_count FROM servers ORDER BY vote_count DESC LIMIT 10`, async (err, rows) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Đã có lỗi xảy ra khi lấy bảng xếp hạng.', ephemeral: true });
            }

            if (!rows || rows.length === 0) {
                return interaction.reply({ content: 'Chưa có server nào có lượt vote trên hệ thống.', ephemeral: true });
            }

            let description = '';
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                let serverName = 'Server Không Rõ';
                try {
                    const guild = await client.guilds.fetch(row.guild_id);
                    if (guild) serverName = guild.name;
                } catch (e) {}
                
                const medals = ['🥇', '🥈', '🥉'];
                const rankPrefix = medals[i] || `**#${i + 1}**`;
                description += `${rankPrefix} **${serverName}** - ${row.vote_count} votes\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Bảng Xếp Hạng Top 10 Server Voting')
                .setDescription(description)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
              
