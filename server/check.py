import sqlite3
conn = sqlite3.connect('database.sqlite')
c = conn.cursor()
c.execute("SELECT e.employee_id, MIN(a.timestamp) as first_seen, MAX(a.timestamp) as last_seen FROM employees e LEFT JOIN activities a ON e.employee_id = a.employee_id AND a.timestamp >= '2026-06-03T15:00:00.000Z' GROUP BY e.employee_id")
print("Today:")
print(c.fetchall())

c.execute("SELECT e.employee_id, MIN(a.timestamp) as first_seen, MAX(a.timestamp) as last_seen FROM employees e LEFT JOIN activities a ON e.employee_id = a.employee_id GROUP BY e.employee_id")
print("All time:")
print(c.fetchall())
