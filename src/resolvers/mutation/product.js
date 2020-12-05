import User from "../../models/user";
import Product from "../../models/product";


const mutation = {
  createProduct: async (parent, args, {userId}, info) => {
    //Step 1 ตรวจสอบคนว่าlogin เข้ามาหรือไม่
    // const userId = "5fc0c34d43b14b1650b97b59"; //hardcode ไว้ก่อนเพราะยังไม่ได้ทำlogin

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
  updateProduct: async (parent, args,{userId}, info) => {
    const { id, name, description, price } = args;

    //Step 1 ตรวจสอบคนว่าlogin เข้ามาหรือไม่
    // const userId = "5fc0bbf83b29631dd0149246"; //hardcode ไว้ก่อนเพราะยังไม่ได้ทำlogin

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");


    //step 2 หา product ใน database
    const product = await Product.findById(id);

    //step 2.1 TODO: Check if user is the owner of the product


    if (userId !== product.user.toString()) {
      throw new Error("You are not authorized.");
    }

    //step 3 Form ที่ใช้ในการ updated
    const updateInfo = {
      name: !!name ? name : product.name,
      description: !!description ? description : product.description,
      price: !!price ? price : product.price
    };

    //step 4 Update product ใน database
    await Product.findByIdAndUpdate(id, updateInfo);

    //step 5 แสดงค่าออก(Return)
    const updatedProduct = await Product.findById(id).populate({
      path: "user"
    });

    return updatedProduct;
  },
  deleteProduct: async (parent, args, {userId}, info) => {
    const { id } = args;

    //Step 1 ตรวจสอบคนว่าlogin เข้ามาหรือไม่
    // const userId = "5fc0bbf83b29631dd0149246"; //hardcode ไว้ก่อนเพราะยังไม่ได้ทำlogin

    // Check if user logged in
    if (!userId) throw new Error("Please log in.");

    //step 2 Find product from given id
    const product = await Product.findById(id);

    //step 2.1 TODO: user id from request --> Find user
    const user = await User.findById(userId)

    // Check ownership of the product
    if (product.user.toString() !== userId) {
      throw new Error("Not authorized.")
    }

    //step 3 Delete product
    const deletedProduct = await Product.findOneAndRemove(id);

    //step 4 Update user's products
    const updatedUserProducts = user.products.filter(
      productId => productId.toString() !== deletedProduct.id.toString()
    );

    //step 5 แสดงค่าออก(Return)
    await User.findByIdAndUpdate(userId, { products: updatedUserProducts });

    return deletedProduct;
  }


};

export default mutation;
