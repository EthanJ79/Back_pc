const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const startOfDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const todayStartUTC = startOfDay.toISOString();
console.log('todayStartUTC:', todayStartUTC);
db.all('SELECT MIN(timestamp) as first_seen, COUNT(*) as cnt FROM activities WHERE timestamp >= ?', [todayStartUTC], (err, rows) => {
    console.log(rows);
});
