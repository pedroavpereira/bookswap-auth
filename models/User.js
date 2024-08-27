const db = require("../db/connect");

class User {
  constructor({ user_id, email, password, first_name, last_name, lat, lng }) {
    this.user_id = user_id;
    this.email = email;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.lat = lat;
    this.lng = lng;
  }

  static async findById(user_id) {
    if (!user_id) throw new Error("No username provided");

    const data = await db.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (data.rows.length === 0) throw new Error("Unable to authenticate");

    return new User(data.rows[0]);
  }

  static async findByEmail(email) {
    if (!email) throw new Error("No email provided");

    const data = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (data.rows.length === 0) throw new Error("Unable to authenticate");

    return new User(data.rows[0]);
  }

  static async create({ email, password, first_name, last_name, lat, lng }) {
    if (!email || !password || !first_name || !last_name || !lat || !lng)
      throw new Error("Required field not provided");

    const data = await db.query(
      "INSERT INTO users (email,password,first_name,last_name,lat,lng) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;",
      [email, password, first_name, last_name, lat, lng]
    );

    return new User(data.rows[0]);
  }
}

module.exports = User;
