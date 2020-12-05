import Product from "../../models/product";

const query = {
  products: (parent, args, context, info) =>
    Product.find().populate({
      path: "user",
      populate: { path: "products" },
    }),
};

export default query;
