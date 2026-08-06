const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run('CREATE TABLE test (timestamp TEXT)');
    db.run('INSERT INTO test VALUES ("2026-06-03T23:54:23.000Z")');
    db.run('INSERT INTO test VALUES ("2026-06-04T00:00:00.000Z")');
    const d = new Date(2026, 5, 4).toISOString();
    console.log('Query param:', d);
    db.get('SELECT MIN(timestamp) as min_t FROM test WHERE timestamp >= ?', [d], (err, row) => console.log(row));
});
