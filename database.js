const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err.message);
    } else {
        console.log('Đã kết nối thành công với cơ sở dữ liệu SQLite.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS user_votes (
        user_id TEXT,
        guild_id TEXT,
        expire_time INTEGER,
        PRIMARY KEY (user_id, guild_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS servers (
        guild_id TEXT PRIMARY KEY,
        vote_count INTEGER DEFAULT 0
    )`);
});

module.exports = db;
