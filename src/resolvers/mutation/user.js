import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

import User from "../../models/user";

const mutation = {
  login: async (parent, args, context, info) => {
    const { username, password } = args;

    // Find user in database
    const user = await User.findOne({ username })
      .populate({
        path: "products",
        populate: { path: "user" },
      })

    if (!user) throw new Error("Username not found, please sign up.");

    // Validate password
    if (password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new Error("Invalid email or password.");

    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "7days",
    });

    return { user, jwt: token };
  },

  signup: async (parent, args, context, info) => {
    //username ไม่ควรนับ เว้นวรรค
    const username = args.username.trim();

    //ถ้า username ซ้ำไม่ควรสมัครได้
    const currentUsers = await User.find({});
    const isUsernameExist =
      currentUsers.findIndex((user) => user.username === username) > -1;

    if (isUsernameExist) {
      throw new Error("username คุณซ้ำ");
    }

    //email ไม่ควรนับ เว้นวรรค
    const email = args.email.trim();

    //ถ้า email ซ้ำไม่ควรสมัครได้
    const isEmailExist =
      currentUsers.findIndex((user) => user.email === email) > -1;

    if (isEmailExist) {
      throw new Error("email คุณซ้ำ");
    }

    // password กรอง
    if (args.password.trim().length < 6) {
      throw new Error("Password กรุณายาวกว่า 6 ตัวอักษร");
    }

    // ใช้ bcrypt เพื่อทำการแปลง password
    const password = await bcrypt.hash(args.password, 10);

    return User.create({ ...args, password });
  },
  deleteUser: async (parent, args, context, info) => {
    // 1. หา user ในระบบ
    const user = await User.findById(args.id);

    // 2. ทำการลบมันทิ้งชะ
    const deletedUser = await User.findByIdAndRemove(user);

    return deletedUser;
  },
  updateUser: async (parent, args, context, info) => {
    // 1. หา user ในระบบ
    const user = await User.findById(args.id);

    // 1.1 ตัวกรอง สำหรับ user เฉพาะ
    if (args.email) {
      //email ไม่ควรนับ เว้นวรรค
      const email = args.email.trim();
      //ถ้า email ซ้ำไม่ควรแก้ไขได้
      const currentUsers = await User.find({});
      const isEmailExist =
        currentUsers.findIndex((user) => user.email === email) > -1;

      if (isEmailExist) {
        throw new Error("email คุณซ้ำ");
      }
    }
    if (args.password) {
      // password กรอง
      if (args.password.trim().length < 6) {
        throw new Error("Password กรุณายาวกว่า 6 ตัวอักษร");
      }
      // ใช้ bcrypt เพื่อทำการแปลง password
      args.password = await bcrypt.hash(args.password, 10);
    }
    // 2. ข้อมูลที่จะอัพเดท
    const updateInfo = {
      name: !!args.name ? args.name : user.name,
      password: !!args.password ? args.password : user.password,
      email: !!args.email ? args.email : user.email,
    };

    // 3. อัพเดท ข้อมูล
    await User.findByIdAndUpdate(args.id, updateInfo);

    // 4. return ข้อมูล
    const updatedUser = await User.findById(args.id);
    return updatedUser;
  },
};

export default mutation;
