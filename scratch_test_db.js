import mysql from 'mysql2/promise';

async function testConnection() {
  const connectionString = "mysql://335vPuqXq7rvfwj.root:JLDUjzGmDhrUX2Uh@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?ssl={\"rejectUnauthorized\":true}";
  try {
    console.log("Connecting to TiDB Cloud...");
    const connection = await mysql.createConnection({
      host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: '335vPuqXq7rvfwj.root',
      password: 'JLDUjzGmDhrUX2Uh',
      database: 'test',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
      }
    });
    console.log("SUCCESSFULLY CONNECTED TO TIDB CLOUD!");
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log("Tables:", rows);
    await connection.end();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

testConnection();
