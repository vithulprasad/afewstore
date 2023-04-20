const users = require("../models/userModel");
const bcrypt = require("bcrypt");
const Product = require("../models/productModule");
const categoryDb = require("../models/category");
const Banner = require("../models/banner");
const Coupon = require("../models/coupon");
const Orders = require("../models/ordersmodel");
const nodemailer = require("nodemailer");
const session = require("express-session");
const { name } = require("ejs");
const excelJs = require("exceljs");
const cloudinary = require('cloudinary').v2;
require("dotenv").config()
const fs = require("fs")

cloudinary.config({ 
  cloud_name:process.env.CLOUDNAME, 
  api_key: process.env.CLOUDKEY, 
  api_secret: process.env.CLOUDSECRET,
  secure: true
});
// admin page set up

const loadLogin = async (req, res) => {
  try {
    res.render("signin");
  } catch (error) {
    console.log("load login", error.message);
  }
};
// admin verification
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await users.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("signin", { message: "email and password is incorrect" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("signin", { message: "email and password is incorrect" });
      }
    } else {
      res.render("signin", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log("verify admin ", error.message);
  }
};
// load home
const loadHome = async (req, res) => {
  try {
    const orderData = await Orders.find();
    const orderDataRecent = await Orders.find()
      .sort({ date: -1 })
      .populate("user");

    const date = new Date();
    res.render("index", { orderData, date, orderDataRecent });
  } catch (error) {
    console.log("Load home error");
    console.log("home load", error.message);
  }
};
const homeIndex = async (req, res) => {
  try {
    res.redirect("/admin/home");
  } catch (error) {
    console.log(error.message);
  }
};
// admin logout
const logout = async (req, res) => {
  try {
    console.log("sedssion started");
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log("admin log out ", error.message);
  }
};
// =============================================PRODUCT MANAGEMENT===============================================================//

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log("product admin login", error.message);
  }
};

// product page
const product = async (req, res) => {
  const product = await Product.find({});
  const category = await categoryDb.find({});
  try {
    const message = "true";
    res.render("productAdd", { product, category, message });
  } catch (error) {
    console.log("product page", error.message);
  }
};

//product loading
const productLoad = async (req, res) => {
  const productData = await Product.find({}).populate("category");
  const image = await Product.find({ image: { $in: [0] } });
  try {
    const message = "true";
    res.render("product", { productData, image, message });
  } catch (error) {
    console.log("product load", error.message);
  }
};
// add new product load
const addProductLoad = async (req, res) => {
  try {
    const category = await categoryDb.find({});
    const message = "true";
    res.render("newproduct", { productData, category, message });
  } catch (error) {
    console.log("add new product load", error.message);
  }
};
// add new product
const addProduct = async (req, res) => {
  
  try {
    console.log("add");
    let files = [];
    const imageUpload = await (function () {
      for (let i = 0; i < req.files.length; i++) {
       
        files[i] = req.files[i].filename;
      }
      return files;
    })();
console.log(files, imageUpload);
    for(let i=0;i<req.files.length;i++){
      cloudinary.uploader.upload(__dirname+"/../public/prodectImages/"+files[i] , {public_id:files[i]}).then(data=>{
        console.log(data);
      }).catch(err=>{
        console.log(err);
      })
     
    }
console.log(req.body);
    const product = new Product({
      name: req.body.name,
      discription: req.body.description,
      price: req.body.price,
      offerPrice: req.body.offerPrice,
      quantity: req.body.quantity,
      category: req.body.category,
      image: imageUpload,
    });
    if (req.body.offerPrice <= req.body.price) 
    {
      const productData = await product.save();
      res.redirect("/admin/product");
    } else {
      const product = await Product.find({});
      const category = await categoryDb.find({});
      const message =
        "the product price is smaller compared to to offer please chage";
      res.render("productAdd", { product, category, message });
    }
  } catch (error) {
    console.log("add new product error", error.message);
  }
};
// delete product
const deleteProduct = async (req, res) => {
  try {
    const product_id = req.query.id;
    const deleteData = await Product.findByIdAndDelete({ _id: product_id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log("delete product error", error.message);
  }
};
const updateProduct = async (req, res) => {
  try {
    const user_id = req.query.id;
    const productData = await Product.findOne({ _id: user_id }).populate(
      "category"
    );
    const category = await categoryDb.find({});
    const message = "true";
    res.render("updateProduct", { productData, category, message });
  } catch (error) {
    console.log("update product error", error.message);
  }
};

const productUpdate = async (req, res) => {
  try {
    const price = req.body.price;
    const offerprice = req.body.offerPrice;

    if (offerprice <= price) {
      const product_id = req.body.id;
      let position = [];
      if (req.body.edit) {
        try {
          console.log("data on the try blodk");
          position = JSON.parse(req.body.edit);
        } catch (err) {
          console.error("Error parsing edit parameter:", err);
        }
      }
      let files = [];
      const images = req.files;
      images.forEach((file, i) => {
        files.push(file.filename);
        position[i] = Number(position[i]);
      });
      const cast = await Product.findOne({ _id: product_id });
      for (let i = 0; i < files.length; i++) {
        const cast = await Product.findOne({ _id: product_id });
        const c = cast.image[position[i]];
        await Product.updateOne(
          { _id: product_id, image: c },
          { $set: { "image.$": files[i] } }
        );
      }
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: req.body.name,
            quantity: req.body.que,
            discription: req.body.discription,
            price: req.body.price,
            category: req.body.category,
            offerPrice: req.body.offerPrice,
          },
        }
      ).then((value) => {
        res.redirect("/admin/product");
      });
    } else {
      const product_id = req.body.id;
      const productData = await Product.findOne({ _id: product_id }).populate(
        "category"
      );
      const category = await categoryDb.find({});
      console.log("else is working......");
      message = "offer price must be smaller than price";
      res.render("updateProduct", { productData, category, message });
    }
  } catch (error) {
    console.log("product update error", error.message);
  }
};

const updateProductImage = async (req, res) => {
  try {
    const images = req.files;
    const id = req.body.id;
    const newImage = images[0].filename;
    await Product.updateOne({ _id: id }, { $push: { image: newImage } });
    const productData = await Product.findOne({ _id: id }).populate("category");
    const category = await categoryDb.find({});
    res.render("updateProduct", { productData, category });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id }).populate("category");
    const i = productData.image.length;
    const image = productData.image[i - 1];
    await Product.updateOne({ _id: id }, { $pull: { image: image } });
    const category = await categoryDb.find({});
    res.render("updateProduct", { productData, category });
  } catch (error) {
    console.log(error.message);
  }
};

const productSinglepage = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id });

    res.render("productSinglepage", { productData });
  } catch (error) {
    console.log(error.message);
  }
};
//============================================== CATEGORY MANAGEMENT===========================================================//

const category = async (req, res) => {
  try {
    const categoryData = await categoryDb.find({});
    res.render("category", { categoryData });
  } catch (error) {
    console.log("category management error", error.message);
  }
};
// add category
const addCategory = async (req, res) => {
  try {
    const categoryData = await categoryDb.find({});
    res.render("addCategory", { categoryData });
  } catch (error) {
    console.log("add category error", error.message);
  }
};
// add category action
const categoryAdd = async (req, res) => {
  try {
    const images = req.files;

    const category = new categoryDb({
      name: req.body.category,
      images: images[0].filename,
    });
    const categoryData = await categoryDb.findOne({});
    const Check = await categoryDb.findOne({ name: req.body.category });
    if (Check) {
      const message = "category existing";
      res.render("addCategory", { message });
    } else {
      const categoryHere = await category.save();

      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log("add category image error", error.message);
  }
};

// =====================================================CATEGORY UPDATE====================================================//

const updateCategory = async (req, res) => {
  try {
    user_id = req.query.id;
    const categoryData = await categoryDb.findOne({ _id: user_id });
    res.render("updateCategory", { Category: categoryData });
  } catch (error) {
    console.log("update category error", error.message);
  }
};
// update category
const categoryUpdate = async (req, res) => {
  try {
    const images = req.files;
    const product_id = req.body.id;

    const find = await Product.find().populate("category");
    const check = await categoryDb.findOne({ name: req.body.discription });

    if (check) {
      const message = "alredy existing";
      const Category = await categoryDb.findOne({ _id: user_id });
      res.render("updateCategory", { Category, message });
    } else {
      for (let i = 0; i < find.length; i++) {
        if (find[i].category._id == product_id) {
          const value = find[i].category._id;
          const Data = await Product.updateMany(
            { "category.$._id": value },
            { $set: { name: req.body.discription, images: images[0].filename } }
          );
        }
      }
      const Data = await categoryDb.findByIdAndUpdate(
        { _id: product_id },
        { $set: { name: req.body.discription, images: images[0].filename } }
      );
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log("category update error", error.mesage);
  }
};
//====================================================prodect manage list &unlist items================================

const unlist = async (req, res, next) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { status: 1 } }).then(() => {
      res.redirect("/admin/product");
    });
  } catch (error) {
    next("unlist error", error);
  }
};
const list = async (req, res, next) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { status: 0 } }).then(() => {
      res.redirect("/admin/product");
    });
  } catch (error) {
    next("list error", error);
  }
};

// =================================================USER MANAGEMENT=================================================================
const user = async (req, res) => {
  try {
    const productData = await users.find({ is_verified: 0 });
    res.redirect("/admin/cat");
  } catch (error) {
    console.log(error.message);
  }
};
const cat = async (req, res) => {
  try {
    const productData = await users.find({ is_verified: 0 });

    res.render("UsresHai", { productData });
  } catch (error) {
    console.log("user management error", error.message);
  }
};

// ================================================BANNED

const banned = async (req, res) => {
  try {
    const id = req.query.id;
    const check = await users.updateOne(
      { _id: id },
      { $set: { status: "banned" } }
    );
    const one = await users.find({ _id: id }).count();
    const productData = await users.find({ is_verified: 0 });
    if (check) {
      res.render("UsresHai", { productData });
    } else {
      req.render("UsresHai", { productData });
    }
  } catch (error) {
    console.log("banned error", error.message);
  }
};
const unbanned = async (req, res) => {
  try {
    const id = req.query.id;

    const check = await users.updateOne(
      { _id: id },
      { $set: { status: "unbanned" } }
    );
    const productData = await users.find({ is_verified: 0 });

    const one = await users.find({ _id: id, is_verified: 0 }).count();
    if (check) {
      res.render("UsresHai", { productData });
    } else {
      res.render("UsresHai", { productData });
    }
  } catch (error) {
    console.log("unbanned error", error.message);
  }
};

// ===============================================================banner =============================================================

const banner = async (req, res) => {
  try {
    const bannerData = await Banner.find({});
    res.render("banner", { bannerData });
  } catch (error) {
    console.log("banned error", error.message);
  }
};
const bannerAdd = async (req, res) => {
  try {
    res.render("addBanner");
  } catch (error) {
    console.log("banner add error", error.message);
  }
};

const bannerSubmit = async (req, res) => {
  try {
    let files = [];
    const imageUpload = await (function () {
      for (let i = 0; i < req.files.length; i++) {
        files[i] = req.files[i].filename;
      }
      return files;
    })();
    const banner = new Banner({
      bannerName: req.body.name,
      description: req.body.description,
      bannerUrl: req.body.url,
      image: imageUpload,
    });
    const couponData = await banner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    console.log("banner submit error", error.message);
  }
};
const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const Delete = await Banner.findByIdAndDelete({ _id: id });
    res.redirect("/admin/banner");
  } catch (error) {
    console.log("delete banner error", error.message);
  }
};

// ============================================================coupon management================================================
const coupon = async (req, res) => {
  try {
    const couponData = await Coupon.find({});
    res.render("coupon", { couponData });
  } catch (error) {
    console.log("coupon error", error.message);
  }
};

const couponAdd = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log("coupon add error", error.message);
  }
};
const couponSubmit = async (req, res) => {
  try {
    if (req.body.Date < req.body.expDate) {
      const coupon = new Coupon({
        couponName: req.body.couponName,
        code: req.body.Code,
        ExpDate: req.body.Date,
        finalDate: req.body.expDate,
        price: req.body.price,
      });
      const checkCoupon = await Coupon.findOne({
        $or: [{ couponName: req.body.couponName }, { code: req.body.Code }],
      });
      if (checkCoupon) {
        const message = "coupon exists";
        res.render("addCoupon", { message });
      } else {
        console.log("data is added");
        const data = await coupon.save();
        const couponData = await Coupon.find({});
        res.render("coupon", { couponData });
        console.log(couponData);
      }
    } else {
      const message = "date error occured";
      res.render("addCoupon", { message });
    }
  } catch (error) {
    console.log("coupon submit error", error.message);
  }
};

const couponDelete = async (req, res) => {
  try {
    const id = req.query.id;
    const Delete = await Coupon.findByIdAndDelete({ _id: id });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log("coupon delete error", error.message);
  }
};

//=================================================================ORDER=======================================

const order = async (req, res) => {
  try {
    const order = await Orders.find().populate("user");
    console.log(order[0].products[0].name);
    res.render("order", { order });
  } catch (error) {
    console.log(error.message);
  }
};
const orderd = async (req, res) => {
  try {
    const id = req.query.id;
    const find = await Orders.find({ _id: id });
    if (find.status == "complete" || find.status == "OrderCanceled") {
      res.redirect("/admin/order");
    } else {
      await Orders.updateOne({ _id: id }, { $set: { status: "orderd" } });
      res.redirect("/admin/order");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const OrderShipped = async (req, res) => {
  try {
    const id = req.query.id;
    const find = await Orders.find({ _id: id });
    if (find.status == "complete" || find.status == "OrderCanceled") {
      res.redirect("/admin/order");
    } else {
      await Orders.findOneAndUpdate(
        { _id: id },
        { $set: { status: "OrderShipped" } }
      );
      res.redirect("/admin/order");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const Deliverd = async (req, res) => {
  try {
    const id = req.query.id;
    const find = await Orders.find({ _id: id });
    if (find.status == "complete" || find.status == "OrderCanceled") {
      res.redirect("/admin/order");
    } else {
      await Orders.findOneAndUpdate(
        { _id: id },
        { $set: { status: "Deliverd" } }
      );
      res.redirect("/admin/order");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const OrderCanceled = async (req, res) => {
  try {
    const id = req.query.id;
    if (find.status == "complete") {
      res.redirect("/admin/order");
    } else {
      await Orders.findOneAndUpdate(
        { _id: id },
        { $set: { status: "OrderCanceled" } }
      );
      res.redirect("/admin/order");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const compleat = async (req, res) => {
  try {
        const id = req.query.id;
    await Orders.findOneAndUpdate(
      { _id: id },
      { $set: { status: "compleat" } }
    );
    res.redirect("/admin/order");
  } catch (error) {
    console.log(error.message);
  }
};

const productOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Orders.findOne({ _id: id }).populate("user");
    res.render("productOrder", { order });
  } catch (error) {
    console.log(error.message);
  }
};

// =======================================exel sheet =======================================
const exelSheet = async (req, res) => {
  try {
    const workbook = new excelJs.Workbook();
    const Worksheet = workbook.addWorksheet("orders");
    Worksheet.columns = [
      { header: "S no.", key: "s_no", width: 5 },
      { header: "Date", key: "date", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Order Status", key: "order_status", width: 20 },
      { header: "Address", key: "address", width: 30 },
      { header: "Products", key: "products", width: 40 },
      { header: "Total Price", key: "totalPrice", width: 15 },
    ];
    let counter = 1;

    if (req.body.end == "" || req.body.start == "") {
      const userData = await Orders.find();
      userData.forEach((user) => {
        user.s_no = counter;
        Worksheet.addRow(user);
        counter++;
      });

      Worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("content-Disposition", `attachment; filename=orders.xlsx`);

      return workbook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } else {
      console.log("not working s");
      const userData = await Orders.find({
        $and: [
          { date: { $gte: req.body.start } },
          { date: { $lte: req.body.end } },
        ],
      });
      if (userData) {
        userData.forEach((user) => {
          user.s_no = counter;
          Worksheet.addRow(user);
          counter++;
        });

        Worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "content-Disposition",
          `attachment; filename=orders.xlsx`
        );

        return workbook.xlsx.write(res).then(() => {
          res.status(200);
        });
      } else {
        res.redirect("/orders");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadHome,
  logout,
  product,
  productLoad,
  addProductLoad,
  updateProduct,
  productUpdate,
  addProduct,
  homeIndex,
  deleteProduct,
  category,
  addCategory,
  categoryAdd,
  updateCategory,
  categoryUpdate,
  list,
  unlist,
  user,
  cat,
  banned,
  unbanned,
  banner,
  bannerAdd,
  bannerSubmit,
  deleteBanner,
  coupon,
  couponAdd,
  couponSubmit,
  order,
  couponDelete,
  adminLogout,
  order,
  OrderCanceled,
  orderd,
  OrderShipped,
  Deliverd,
  productOrder,
  compleat,
  updateProductImage,
  deleteProductImage,
  productSinglepage,
  exelSheet,
};
