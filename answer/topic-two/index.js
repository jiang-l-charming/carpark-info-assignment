const fs = require("fs");
const csv = require("csv-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 指定SQLite数据库文件路径
const dbPath = path.join(__dirname, "..", "..", "mydatabase", "database.db");
// 创建SQLite数据库连接
const db = new sqlite3.Database(dbPath);

// 创建表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS carparks (
    car_park_no TEXT PRIMARY KEY,
    address TEXT,
    x_coord REAL,
    y_coord REAL,
    car_park_type TEXT,
    type_of_parking_system TEXT,
    short_term_parking TEXT,
    free_parking TEXT,
    night_parking TEXT,
    car_park_decks INTEGER,
    gantry_height REAL,
    car_park_basement INTEGER
  )`);
});

// 处理CSV数据
db.serialize(() => {
  const stmt = db.prepare(`INSERT INTO carparks (
    car_park_no,
    address,
    x_coord,
    y_coord,
    car_park_type,
    type_of_parking_system,
    short_term_parking,
    free_parking,
    night_parking,
    car_park_decks,
    gantry_height,
    car_park_basement
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "/hdb-carpark-information-20220824010400.csv"
  );
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      stmt.run(
        row.car_park_no,
        row.address,
        parseFloat(row.x_coord),
        parseFloat(row.y_coord),
        row.car_park_type,
        row.type_of_parking_system,
        row.short_term_parking,
        row.free_parking,
        row.night_parking,
        parseInt(row.car_park_decks),
        parseFloat(row.gantry_height),
        row.car_park_basement === "Y" ? 1 : 0
      );
    })
    .on("end", () => {
      stmt.finalize();
      console.log("CSV file processed successfully.");
    });
});

// 关闭数据库连接
db.close();
