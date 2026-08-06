import sqlite3
conn = sqlite3.connect('database.sqlite')
c = conn.cursor()
c.execute("SELECT MIN(timestamp) as fs, MAX(timestamp) as ls FROM activities")
print(c.fetchall())
