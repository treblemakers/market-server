import User from "../../models/user";
import Product from "../../models/product";


const mutation = {
  createProduct: async (parent, args, context, info) => {
    //Step 1 ตรวจสอบคนว่าlogin เข้ามาหรือไม่
    const userId = "5fc0c34d43b14b1650b97b59"; //hardcode ไว้ก่อนเพราะยังไม่ได้ทำlogin

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

    //step 2 การตรวจสอบ ช่องต่างๆ ว่ากรอกครบหรือยัง หรือ logi ต่างๆสำหรับช่องนั้นๆ(|| หรือ,&& และ,<= น้อยหว่าหรือเท่ากับ )
    if (!args.name || !args.price) {
      throw new Error("กรอกให้ครบทุกช่องครับ ดอกทอง!!!");
    }

    //step 3 บันทึกข้อมูลลง Database จริงๆ
    const product = await Product.create({ ...args, user: userId });

    //step 4 บันทึกความสัมพันธ์
    const user = await User.findById(userId);

    if (!user.products) {
      user.products = [product.id];
    } else {
      user.products.push(product.id);
    }

    await user.save();

    //step 5 แสดงค่าออก(Return)
    return Product.findById(product.id).populate({
      path: "user",
      populate: { path: "products" },
    });
  },
};

export default mutation;
