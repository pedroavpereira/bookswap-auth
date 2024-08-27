const db = require("../db/connect");

class User {
  constructor({ id, username, password, role }) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
  }

  static async findByUsername(username) {
    if (!username) throw new Error("No username provided");

    const data = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (data.rows.length === 0) throw new Error("Unable to authenticate");

    return new User(data.rows[0]);
  }

  static async create({ username, password }) {
    if (!username || !password) throw new Error("Required field not provided");

    const data = await db.query(
      "INSERT INTO users (username,password) VALUES($1,$2) RETURNING *;",
      [username, password]
    );

    return new User(data.rows[0]);
  }
}

module.exports = User;
