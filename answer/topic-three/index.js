const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const path = require("path");
const app = express();

// 指定SQLite数据库文件路径
const dbPath = path.join(__dirname, "..", "..", "mydatabase", "database.db");
// 创建SQLite数据库连接
const db = new sqlite3.Database(dbPath);

// 设置Swagger UI用于API文档展示
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 获取停车场信息的端点
app.get("/carparks", (req, res) => {
  const { freeParking, nightParking, gantryHeight } = req.query;

  let sql = "SELECT * FROM carparks WHERE 1=1";
  const params = [];

  if (freeParking) {
    sql += " AND free_parking = ?";
    params.push(freeParking);
  }
  if (nightParking) {
    sql += " AND night_parking = ?";
    params.push(nightParking);
  }
  if (gantryHeight) {
    sql += " AND gantry_height >= ?";
    params.push(gantryHeight);
  }

  // 执行查询
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// 添加停车场到收藏夹的端点
app.post("/favorites/:carParkNo", (req, res) => {
  const { carParkNo } = req.params;
  const userId = "JiangKj"; // 此处写死用户id，实际开发中应该由接口调用方法传递用户id参数过来
  
  // 插入收藏夹数据
  const sql = "INSERT INTO favorites (user_id, car_park_no) VALUES (?, ?)";
  db.run(sql, [userId, carParkNo], function (err) {
    if (err) return res.status(500).send(err);
    res.sendStatus(201);
  });
});

// 启动Express服务器监听端口3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
