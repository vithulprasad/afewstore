const mongoose = require("mongoose");
const users = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../models/productModule");
const Banner = require("../models/banner");
const Order = require("../models/ordersmodel");
const Category = require("../models/category");
const Coupon = require("../models/coupon");
const Cart = require("../models/cart");


const cloudinary = require('cloudinary').v2;
// ================================================SECURE PASSWORD============================================================
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log("secure password", error.message);
    res.render("500error");
  }
};

// ================================================LOAD REGISTER==========================================================
const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log("load register", error.message);
  }
};

// =======================================================INSERT USER==================================================================

const insertUser = async (req, res) => {
  try {
    console.log("working------1");
    const checkMail = await users.findOne({ email: req.body.email }) 
    console.log("working------2",checkMail);
    if (checkMail) {
      res.render("registration", {
        message: "mail id already exists choose a different email",
      });
    } else {
      console.log("working------3");
      const spassword = await securePassword(req.body.password);
      console.log("working------4");
      const user = new users({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        phone: req.body.phone,
        is_admin: 0,
        is_verified: 0,
      });
      console.log("working------4");
      const userData = await user.save();
      console.log(userData, 'dfdsfd------------d-d-d-d-5');
      if (userData) {
        res.render("login", {
          message:
            "your registration has been successful now you can login to ARNOZE",
        });
    
      } else {
        res.render("registration", { message: "field empty" });
      }
    }
  } catch (error) {
    console.log("inserting user", error.message);
    res.render("500error");
  }
};

// ======================================================LOGIN==================================================================
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log("load login", error.message);
    res.render("500error");
  }
};

// =======================================================LOGIN ==================================================================
const login = async (req, res) => {
  try {
    const Email = req.body.email;
    const password = req.body.password;
    const userData = await users.findOne({ email: Email });
    const banned = await users.findOne({
      $and: [{ email: Email }, { status: "unbanned" }],
    });
    if (banned) {
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch && userData.is_verified == 0) {
          req.session.user_id = userData._id;
          res.redirect("/");
        } else {
          res.render("login", { message: "wrong email or password " });
        }
      } else {
        res.render("login", { message: "wrong email or password " });
      }
    } else {
      res.render("login", { message: "user is blocked by company" });
    }
  } catch (error) {
    console.log("login", error.message);
    res.render("500error");
  }
};
// =======================================================HOME LOAD=================================================================
const homeLoad = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData = await users.findById({ _id: req.session.user_id });
      const productData = await Product.find({ status: 0 });
      const bannerData = await Banner.find();
      const categoryData = await Category.find();
      const cart = await Cart.findOne({ user: userData });
      let count = 0;
      if (cart == !undefined) {
        for (let i = 0; i < cart.products.length; i++) {
          count = i + 1;
        }
      }
      const orders = await Order.find({
        user: userData,
        status: "OrderCanceled",
      });
      res.render("index", {
        productData,
        bannerData,
        userData,
        categoryData,
        count,
        orders,
      });
    } else {
      const productData = await Product.find({ status: 0 });
      const bannerData = await Banner.find({});
      const categoryData = await Category.find({});
      const count = 0;
      console.log(bannerData);
      res.render("index", { productData, bannerData, categoryData, count });
    }
  } catch (error) {
    console.log("home load get", error.message);
  }
};
// =======================================================VERIFICATION==================================================================
const EmailVerification = async (req, res) => {
  try {
    res.render("inputemail");
  } catch (error) {
    console.log("email varification", error.message);
    res.render("500error");
  }
};
// =======================================================log out ==================================================================
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log("error at user login", error.message);
    res.render("500error");
  }
};
// ====================================================E--MAIL VALIDATION=======================================================//
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,

  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//===================================================load otp page=================================================
const otpLogin = async (req, res) => {
  try {
    res.render("OtpEnterPage");
  } catch (error) {
    console.log("login page error", error.message);
    res.render("500error");
  }
};
// ===================================================otp page================================================
const otpPage = async (req, res) => {
  try {
    res.render("otpPage");
  } catch (error) {
    console.log("otp page", error.message);
    res.render("500error");
  }
};

// =============================================================OtP======================================================

const ottp = async (req, res, next) => {
  try {
    req.session.name = req.body.name;
    req.session.email = req.body.email;
    req.session.mno = req.body.mobile;
    req.session.password = req.body.password;
    const Email = req.body.email;
    const user = await users.findOne({ email: req.body.email });
    if (!user) {
      // =======================================================send mail with defined transport object=========================
      var mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Otp for registration is: ",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>", // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        res.render("otpPage", { status: "false" });
      });
    } else {
    const productData= await Product.find()
    const  bannerData = await Banner.find()
    const userData = await users.findOne({_id:req.session.user._id})
    const categoryData = await Category.find()
    const orders = await Order.find({user:req.session.user._id})
    const count = 1;
        res.render("index", {
        productData,
        bannerData,
        userData,
        categoryData,
        count,
        orders,
      });
    }
  } catch (error) {
    console.log("send mail with defined transport object", error);
    res.render("500error");
    next(error);
  }
};
//============================================================== otp compare==============================================

const ottpCompare = async (req, res, next) => {
  try {
    if (req.body.otp == otp) {
      console.log("iff");
      req.session.password = await bcrypt.hash(req.session.password, 10);
      let newUser = new users({
        name: req.session.name,
        email: req.session.email,
        phone: req.session.mno,
        password: req.session.password,
        is_time: 10,
      });
      const productData = await Product.find({});
      newUser.save().then(async(data) => {
        req.session.useremail = req.session.email;
        req.session.userlogged = true;
        req.session.user = newUser;
        const productData= await Product.find()
        const  bannerData = await Banner.find()
        const userData = await users.findOne({_id:req.session.user._id})
        const categoryData = await Category.find()
        const orders = await Order.find({user:req.session.user._id})
        const count = 1;
            res.render("index", {
            productData,
            bannerData,
            userData,
            categoryData,
            count,
            orders,
          });
      });
    } else {
      res.redirect("/otpPage");
    }
  } catch (error) {
    console.log(error, "otp camparing error");
    res.render("500error");
  }
};

//============================================================== RESEND==============================================

const resendOTP = (req, res, next) => {
  try {
    var mailOptions = {
      from: process.env.EMAIL,
      to: req.session.email,
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        otp +
        "</h1>",
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("send mail with transport object", error);
      }
      res.render("otpPage", { status: "false" });
    });
  } catch (error) {
    console.log("error in resend otp", error);
    res.render("500error");
    next(error);
  }
};

//============================================================== SINGLE PRODUCT==============================================

const singleProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const user = req.session.user_id;
    if (user) {
      const ProductData = await Product.findOne({ _id: id }).populate(
        "category"
      );
      const userData = 1;
      res.render("single-product", { ProductData, userData });
    }
    const ProductData = await Product.findOne({ _id: id }).populate("category");
    res.render("single-product", { ProductData });
  } catch (error) {
    console.log("single product page loading error", error.message);
    res.render("500error");
  }
};

// ==========================================================================CART MANAGEMENT=================================================

const cart = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.render("cart");
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("cart management error", error.message);
    res.render("500error");
  }
};
//============================================================== CART ADD=======================================================
const cartAdd = async (req, res) => {
  try {
    if (req.session.user_id) {
      const productId = req.body.id;
      const quantity = req.body.quantity || 1;
      const avs = 1;
      const userId = await req.session.user_id;
      const DataS = await Product.findOne({ _id: productId });
      const price = DataS.price;
      const name = DataS.name;
      const image = DataS.image[0];
      await users.updateOne(
        { _id: userId },
        { $pull: { wishlist: { productId } } }
      );
      if (userId) {
        const cartData = await Cart.findOne({ user: userId });
        const cartPurchase = await Cart.findOne({
          $and: [{ user: userId }, { active: 1 }],
        });
        if (cartData) {
          const productIndex = cartData.products.findIndex(
            (p) => p.productId == productId
          );
          if (productIndex !== -1) {
            const updateResult = await Cart.updateOne(
              { user: userId, "products.productId": productId },
              { $inc: { "products.$.quantity": quantity } }
            );
            await users.updateOne(
              { _id: userId, "wishlist.productId": productId },
              { $set: { "wishlist.$.is_in": 1 } }
            );
          } else {
            await users.updateOne(
              { _id: userId, "wishlist.productId": productId },
              { $set: { "wishlist.$.is_in": 1 } }
            );
            const totalPrice = quantity*price;
            const cartUpdate = await Cart.updateOne(
              { user: userId },
              {
                $push: {
                  products: { productId, quantity, price, name, image,totalPrice },
                },
              }
            );
          }
        } else {
          const totalPrice = quantity*price;
          const cart = new Cart({
            products: [{ productId, quantity, price, name, image,totalPrice }],
            user: userId,
          });
          await users.updateOne(
            { _id: userId, "wishlist.productId": productId },
            { $set: { "wishlist.$.is_in": 1 } }
          );
          const cartData = await cart.save();
        }
        await Product.updateOne({ _id: productId }, { $set: { available: 0 } });
        res.json({ success: true });
      } else {
        res.redirect("/login");
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("cartAdd error", error.message);
    res.render("500error");
  }
};
//==============================================================CART PAGE========================================================
const cartPage = async (req, res) => {
  try {
    console.log('dslf,dsalg,pdsl,gplfsd,gpl');
    if (req.session.user_id) {
      const userData = await users.findOne({ _id: req.session.user_id });
      const userCart = await Cart.findOne({ user: req.session.user_id });
      const CartDa = await Cart.findOne({ user: req.session.user_id });
      let count = 0;
      if (userCart) {
        const cartProducts = userCart.products;
        const userCartProductsId = cartProducts.map(
          (values) => values.productId
        );
        const products = await Product.aggregate([
          {
            $match: {
              _id: { $in: userCartProductsId },
            },
          },
          {
            $project: {
              name: 1,
              image: 1,
              price: 1,
              quantity: 1,
              cartOrder: { $indexOfArray: [userCartProductsId, "$_id"] },
            },
          },
          { $sort: { cartOrder: 1 } },
        ]);
        count = products.length;
        if (products.length > 0) {
          const add = userCart.products;

          const a = add.reduce((ctotal, items) => {
            return items.price + ctotal;
          }, 0);
          const user = req.session.user_id;
          const userData = await users.findOne({ _id: user });
          const value = await Cart.findOneAndUpdate(
            { user: req.session.user_id },
            { $set: { totalPrice: a, coupon: 0, couponNumber: 0 } }
          ).then((result) => {
            res.render("cart", {
              products,
              cartProducts,
              count,
              CartDa,
              a,
              userData,
            });
          });
        } else {
          res.render("cart", { count, userData });
        }
      } else {
        res.redirect("/home");
      }
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log("cart page error", error.message);
    res.render("500error");
  }
};
// ========================================================remove cart============================================================
const removeCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      const productId = req.query.id;
      const cart = await Cart.findOne({ user: user });
      await Cart.updateOne(
        { user: user },
        { $pull: { products: { productId } } },
        (err, result) => {
          if (err) {
            console.error(err);
          } else {
            res.redirect("/cartPage");
          }
        }
      );
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// =====================================================================CHECKOUT===================================================================//

const checkout = async (req, res) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const pId = req.query.id;
      await users.findOneAndUpdate({ _id: id }, { $set: { check: 0 } });
      const order = await Order.findOne({ user: id }).sort({ date: -1 });
      if (pId) {
        if (id) {
          const userData = await users.findOne({ _id: id });
          const CartData = await Cart.findOne({ user: id });
          const prodectData = await Product.findOne({ _id: pId });
          const one = await Cart.findOne({
            $and: [{ user: id }, { status: 1 }],
          });
          if (one) {
            const a = CartData.address[0]._id;
            await Cart.findOneAndUpdate(
              { user: userData, "address._id": a },
              { $set: { "address.$.is_in": 1 } }
            );
            let check = await Cart.findOne({
              user: id,
              "products.productId": pId,
            });
            let hai = await Cart.find({
              user: id,
              products: { $elemMatch: { productId: pId } },
            });
            if (check != null) {
              for (var j = 0; j <= CartData.products.length; j++) {
                if (CartData.products[j].productId == pId) {
                  const c = CartData.products[j].cancel;
                  check = 10;
                  res.render("checkout", { userData, CartData, j });
                  break;
                }
              }
            } else {
              const length = await Product.find().count();
              const value = await Product.find();
              for (var m = 0; m <= length; m++) {
                if (value[m]._id == pId) {
                  const i = m;
                  res.render("newProductBuy", { userData, CartData, value, i });
                  break;
                }
              }
            }
          } else {
            const productId = req.query.id;
            res.render("address", { productId, prodectData });
          }
        } else {
          res.redirect("/login");
        }
      } else {
        const CartData = await Cart.findOne({ user: id });
        const userData = await users.findOne({ _id: id });
        if (CartData.address[0] != undefined) {
          const a = CartData.address[0]._id;
          await Cart.findOneAndUpdate(
            { user: userData, "address._id": a },
            { $set: { "address.$.is_in": 1 } }
          );
          const j = -1;
          res.render("checkout", { userData, CartData, j });
        } else {
          res.render("address");
        }
        const a = CartData.address[0]._id;
        await Cart.findOneAndUpdate(
          { user: userData, "address._id": a },
          { $set: { "address.$.is_in": 1 } }
        );
        const j = -1;
        res.render("checkout", { userData, CartData, j });
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("check out error ", error.message);
    res.render("500error");
  }
};

//============================================================== CHECK OUT ADD==============================================

const checkoutAdd = async (req, res) => {
  try {
    if (req.session.user_id) {
      console.log('--------------------------------one');
      const productId = req.query.id;
      const id = req.session.user_id;
      console.log('--------------------------------two');
      const data = await Cart.findOne({ user: id });
      console.log('--------------------------------tjhre');
      const newAddress = {
        productId: productId,
        firstName: req.body.firstName,
        lastName: req.body.firstName,
        house: req.body.house,
        post: req.body.post,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pin: req.body.pinCode,
      };
      data.address.push(newAddress);
      await data.save();
      const update = await Cart.findOneAndUpdate(
        { user: id },
        { $set: { status: 1 } }
      );
      res.redirect("/");
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("checkout add", error.message);
    res.render("500error");
  }
};
//============================================================== PURCHASE==============================================================
// ====================================================================================================================================

const purchase = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const productId = req.body.id;
      const find1 = await Cart.findOne({ user: userId });
      const user_1 = await users.findOne({ _id: userId });
      const orders = await Order.find();
      const check = user_1.check;

      if (check == 0) {
        // ====================================================delivery check====================================================================
        if (productId) {
          //=================================================  CART SINGLE PRODUCT BUY ============================================================

          const product = await Product.findOne({ _id: productId }).populate(
            "category"
          );
          const status = "orderd";
          const length = await Product.find().count();
          const value = await Product.find().populate("category");
          for (let i = 0; i < length; i++) {
            if (value[i]._id == productId) {
              for (let j = 0; j < find1.address.length; j++) {
                if (find1.address[j].is_in == 1) {
                  const name = value[i].name;
                  const price1 = value[i].price;
                  const quantity = value[i].qun;
                  const value2 = value[i].quantity;
                  const price = price1 * quantity;
                  const image = value[i].image[0];
                  const category = value[i].category.name;
                  const order = new Order({
                    user: userId,
                    products: {
                      name: name,
                      price: price,
                      quantity: quantity,
                      image: image,
                      category: category,
                    },
                    date: new Date(),
                    status: status,
                    address: {
                      firstName: find1.address[j].firstName,
                      lastName: find1.address[j].lastName,
                      house: find1.address[j].house,
                      post: find1.address[j].post,
                      city: find1.address[j].city,
                      district: find1.address[j].district,
                      state: find1.address[j].state,
                      pin: find1.address[j].pin,
                    },
                  });
                  await order.save();
                  const quantity1 = value2 - quantity;
                  const values1 = await Product.findOneAndUpdate(
                    { _id: productId },
                    { $set: { qunatity: quantity1 } }
                  );
                  break;
                }
              }
              const setProduct = await Product.updateOne(
                { _id: productId },
                { $set: { available: 1 } }
              );
              await Cart.findOneAndUpdate(
                { user: userId, "products.productId": productId },
                { $set: { "products.$.cancel": 0 } }
              );
              break;
            }
          }
          for (let c = 0; c < find1.address.length; c++) {
            let address1 = find1.address[c]._id;
            await Cart.findOneAndUpdate(
              { user: userId, "address._id": address1 },
              { $set: { "address.$.is_in": 0 } }
            );
          }
          await Cart.updateOne(
            { user: userId },
            { $pull: { products: { productId } } },
            (err, result) => {
              if (err) {
                console.error(err);
              } else {
                res.json({ success: true });
              }
            }
          );
        } else {
          // ============================================CART ALL PRODUCT BUY=============================================================
          const status = "orderd";
          for (let i = 0; i < find1.address.length; i++) {
            for (let j = 0; j < find1.products.length; j++) {
              if (find1.address[i].is_in == 1) {
                console.log("entering into the address add");
                const order = new Order({
                  user: userId,
                  date: new Date(),
                  status: status,
                  orderType: "cashOnDelivery",
                  address: {
                    firstName: find1.address[i].firstName,
                    lastName: find1.address[i].lastName,
                    house: find1.address[i].house,
                    post: find1.address[i].post,
                    city: find1.address[i].city,
                    district: find1.address[i].district,
                    state: find1.address[i].state,
                    pin: find1.address[i].pin,
                  },
                });
                await order.save();
                i++;
                break;
              }
            }
          }
          await Product.updateOne(
            { _id: productId },
            { $set: { available: 1 } }
          );
          const order = await Order.find();
          const length = order.length - 1;
          for (let i = 0; i < order.length; i++) {
            if (length == i) {
              const f = order[i]._id;
              for (let n = 0; n < find1.products.length; n++) {
                const productId = find1.products[n].productId;
                const category1 = await Product.findOne({
                  _id: productId,
                }).populate("category");
                const name = find1.products[n].name;
                const price = find1.products[n].price;
                const image = find1.products[n].image;
                const quantity = find1.products[n].quantity;
                const category = category1.name;
                const orderId = order[i]._id;
                const totalPrice = find1.totalPrice - find1.coupon;
                await Order.findOneAndUpdate(
                  { _id: f },
                  { $set: { totalPrice: totalPrice } }
                );
                await Order.updateOne(
                  { _id: orderId },
                  {
                    $push: {
                      products: {
                        name,
                        price,
                        productId,
                        image,
                        quantity,
                        category,
                      },
                    },
                  }
                ).then((result) => {
                  console.log(
                    result,
                    "this iis the changed purchase ouder pushing"
                  );
                });
                const code = find1.couponNumber;
                const codeprice = find1.coupon;
                if (codeprice != 0) {
                  await Order.updateOne(
                    { _id: orderId },
                    { $set: { couponNumber: code, coupon: codeprice } }
                  );
                }
                const product = await Product.findOne({ _id: productId });
                const newQuantity = product.quantity - quantity;
                if (newQuantity >= 0) {
                  await Product.updateOne(
                    { _id: productId },
                    { $set: { quantity: newQuantity } }
                  );
                }
                console.log(
                  `Updated quantity for product ${productId} to ${newQuantity}`
                );
              }
            }
          }
          await Cart.findOneAndUpdate(
            { user: userId, "products.productId": productId },
            { $set: { "products.$.cancel": 0 } }
          );
          await Cart.findOneAndUpdate(
            { user: userId, "products.productId": productId },
            { $set: { couponNumber: 0 } }
          ).then((result) => {});
          for (let i = 0; i < find1.products.length; i++) {
            const productId = find1.products[i]._id;
            try {
              const result = await Cart.updateOne(
                { user: userId },
                { $pull: { products: { _id: productId } } }
              );
              console.log(
                `Successfully removed product with ObjectId ${productId} from cart with ObjectId ${result._id}`
              );
            } catch (err) {
              console.error(err);
            }
          }
          res.json({ success: false });
        }
      } else if (check == 1) {
        //=======================================================rozopay===================================================================
        const status = "orderd";
        for (let i = 0; i < find1.address.length; i++) {
          for (let j = 0; j < find1.products.length; j++) {
            if (find1.address[i].is_in == 1) {
              const order = new Order({
                user: userId,
                date: new Date(),
                status: status,
                order_status: "pending",
                orderType: "Razorpay",
                address: {
                  firstName: find1.address[i].firstName,
                  lastName: find1.address[i].lastName,
                  house: find1.address[i].house,
                  post: find1.address[i].post,
                  city: find1.address[i].city,
                  district: find1.address[i].district,
                  state: find1.address[i].state,
                  pin: find1.address[i].pin,
                },
              });
              await order.save();
              i++;
              break;
            }
          }
        }

        await Product.updateOne({ _id: productId }, { $set: { available: 1 } });
        const order = await Order.find();
        const length = order.length - 1;
        for (let i = 0; i < order.length; i++) {
          if (length == i) {
            const f = order[i]._id;
            for (let n = 0; n < find1.products.length; n++) {
              const productId = find1.products[n].productId;
              const category1 = await Product.findOne({
                _id: productId,
              }).populate("category");
              const name = find1.products[n].name;
              const price = find1.products[n].price;
              const image = find1.products[n].image;
              const quantity = find1.products[n].quantity;
              const category = category1.name;
              const orderId = order[i]._id;
              const totalPrice = find1.totalPrice - find1.coupon;
              await Order.findOneAndUpdate(
                { _id: f },
                { $set: { totalPrice: totalPrice } }
              );
              const product = await Product.findOne({ _id: productId });
              const newQuantity = product.quantity - quantity;
              if (newQuantity >= 0) {
                await Product.updateOne(
                  { _id: productId },
                  { $set: { quantity: newQuantity } }
                );
              }
            }
            const Razorpay = require("razorpay");
            var instance = new Razorpay({
              key_id: process.env.KEY,
              key_secret: process.env.SECRET,
            });
            instance.orders.create(
              {
                amount: find1.totalPrice * 100,
                currency: "INR",
                receipt: "" + order[i]._id,
                notes: {
                  key1: "value3",
                  key2: "value2",
                },
              },
              (err, order) => {
                if (err) {
                  console.log(err);
                } else {
                  res.json(order);
                }
              }
            );
          }
        }
      } else {
        //==============================================================================================wallet payment===========================================================
        const status = "orderd";
        for (let i = 0; i < find1.address.length; i++) {
          for (let j = 0; j < find1.products.length; j++) {
            if (find1.address[i].is_in == 1) {
              const order = new Order({
                user: userId,
                date: new Date(),
                status: status,
                orderType: "walletPayment",
                address: {
                  firstName: find1.address[i].firstName,
                  lastName: find1.address[i].lastName,
                  house: find1.address[i].house,
                  post: find1.address[i].post,
                  city: find1.address[i].city,
                  district: find1.address[i].district,
                  state: find1.address[i].state,
                  pin: find1.address[i].pin,
                },
              });
              await order.save();
              i++;
              break;
            }
          }
        }
        await Product.updateOne({ _id: productId }, { $set: { available: 1 } });
        const w = await users.findOne({ _id: userId });
        const wallet = w.wallet;
        await users.updateOne(
          { _id: userId },
          { $set: { wallet: wallet - find1.totalPrice } }
        );
        const order = await Order.find();
        const length = order.length - 1;
        for (let i = 0; i < order.length; i++) {
          if (length == i) {
            const f = order[i]._id;
            for (let n = 0; n < find1.products.length; n++) {
              const productId = find1.products[n].productId;
              const category1 = await Product.findOne({
                _id: productId,
              }).populate("category");
              const name = find1.products[n].name;
              const price = find1.products[n].price;
              const image = find1.products[n].image;
              const quantity = find1.products[n].quantity;
              const category = category1.name;
              const orderId = order[i]._id;
              const totalPrice = find1.totalPrice - find1.coupon;
              await Order.findOneAndUpdate(
                { _id: f },
                { $set: { totalPrice: totalPrice } }
              );
              await Order.updateOne(
                { _id: orderId },
                {
                  $push: {
                    products: {
                      name,
                      price,
                      productId,
                      image,
                      quantity,
                      category,
                    },
                  },
                }
              );

              // Update the product quantity
              const product = await Product.findOne({ _id: productId });
              const newQuantity = product.quantity - quantity;
              if (newQuantity >= 0) {
                await Product.updateOne(
                  { _id: productId },
                  { $set: { quantity: newQuantity } }
                );
              }
              console.log(
                `Updated quantity for product ${productId} to ${newQuantity}`
              );
            }
          }
        }
        await Cart.findOneAndUpdate(
          { user: userId, "products.productId": productId },
          { $set: { "products.$.cancel": 0 } }
        );
        for (let i = 0; i < find1.products.length; i++) {
          const productId = find1.products[i]._id;
          try {
            const result = await Cart.updateOne(
              { user: userId },
              { $pull: { products: { _id: productId } } }
            );
          } catch (err) {
            console.error(err);
          }
        }
        res.json({ success: false });
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("purchase error", error.message);
    res.render("500error");
  }
};

// =============PURCHASE ENDS =============================
//============================================================================
//  ===================================================================rozopay confirmation=========================================================================

const rozoPayment = async (req, res) => {
  try {
    if (req.session.user_id) {
      const crypto = require("crypto");
      const user = req.session.user_id;

      let razorpay_payment_id = req.body.response.razorpay_payment_id;
      let razorOrder = req.body.order.receipt;
      let razorpay_order_id = req.body.response.razorpay_order_id;
      let razorpay_signature = req.body.response.razorpay_signature;

      keysecret = process.env.SECRET;

      const hmac_sha256 = (data, secret) => {
        return crypto.createHmac("sha256", secret).update(data).digest("hex");
      };

      let generated_signature = hmac_sha256(
        razorpay_order_id + "|" + razorpay_payment_id,
        keysecret
      );

      if (generated_signature == razorpay_signature) {
        const find = await Cart.findOne({ user: user });
        const order = await Order.findOne().sort({ date: -1 });
        const id = order._id;
        for (let i = 0; i < find.products.length; i++) {
          const productId = find.products[i].productId;
          const category1 = await Product.findOne({ _id: productId }).populate(
            "category"
          );
          const category = category1.name;
          const name = find.products[i].name;
          const price = find.products[i].price;
          const image = find.products[i].image;
          const quantity = find.products[i].quantity;
          console.log(name, price, image, quantity);
          await Order.updateOne(
            { _id: id },
            {
              $push: {
                products: { name, price, image, quantity, productId, category },
              },
            }
          ).then((result) => {
            console.log(result, "successful");
          });
        }

        for (let i = 0; i < find.products.length; i++) {
          const pid = find.products[i]._id;
          await Cart.updateOne(
            { user: user },
            { $pull: { products: { _id: pid } } }
          ).then((result) => {
            console.log(result, "successful");
          });
        }
        await Order.updateOne(
          { _id: id },
          { $set: { order_status: "complete" } }
        ).then((result) => {
          console.log("successfuly updated order status compleat");
        });
        res.json({ success: true });
      } else {
        await Order.findOneAndDelete({ _id: id });
        res.json({ message2: "Payment failed" });
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    res.render("500error");
  }
};

//============================================================== CONFIRMATION  ============================================================== otp compare==============================================

const confirmation = async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (userId) {
      const userData = 1;
      const orderData = await Order.find({ user: userId });
      res.render("confirmation", { orderData, userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("confirmation order", error.message);
    res.render("500error");
  }
};

//============================================================== CANCEL  ============================================================== otp compare==============================================

const cancel = async (req, res) => {
  try {
    const userid = req.session.user_id;
    if (userid) {
      const orderId = req.query.id;
      const checkIsBuyed = await Order.findOne({ _id: orderId });
      const user = await users.findOne({ _id: userid });
      const value = checkIsBuyed.totalPrice + user.wallet;

      for (let i = 0; i < checkIsBuyed.products.length; i++) {
        const orderIds = checkIsBuyed.products[i].productId;
        const productId = await Product.findOne({ _id: orderIds });
        const productQuantity = productId.quantity;
        const orderQuantity = checkIsBuyed.products[i].quantity;
        const totalQuantity = productQuantity + orderQuantity;

        await Product.updateOne(
          { _id: orderIds },
          { $set: { quantity: totalQuantity } }
        );
      }
      if (checkIsBuyed.status == "OrderCanceled") {
        res.redirect("/confirmation");
      } else {
        if (checkIsBuyed.status == "compleat") {
          res.redirect("/confirmation");
        } else {
          if (checkIsBuyed.orderType == "Razorpay") {
            await Order.findOneAndUpdate(
              { _id: orderId },
              { $set: { status: "OrderCanceled" } }
            );
            await users
              .findOneAndUpdate({ _id: userid }, { $set: { wallet: value } })
              .then(() => {
                res.redirect("/confirmation");
              });
          } else if (checkIsBuyed.orderType == "wallet") {
            await Order.findOneAndUpdate(
              { _id: orderId },
              { $set: { status: "OrderCanceled" } }
            );
            await users
              .findOneAndUpdate({ _id: userid }, { $set: { wallet: value } })
              .then(() => {
                res.redirect("/confirmation");
              });
          } else {
            await Order.findOneAndUpdate(
              { _id: orderId },
              { $set: { status: "OrderCanceled" } }
            );
            res.redirect("/confirmation");
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("cancel error", error.message);
    res.render("500error");
  }
};
// ==========================================================return order========================================================
const returnOrder = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      const id = req.query.id;
      const value = await users.findOne({ _id: user });
      const value2 = await Order.findOne({ _id: id });
      const wallet = value.wallet + value2.totalPrice;
      await Order.findOneAndUpdate(
        { _id: id },
        { $set: { status: "returnOrder" } }
      );
      await users
        .findOneAndUpdate({ _id: user }, { $set: { wallet: wallet } })
        .then((result) => {
          log(result);
          res.redirect("/confirmation");
        });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("return order error", error.message);
    res.render("500error");
  }
};
// ===================================================================PROFILE =================================================================

const profile = async (req, res) => {
  try {
    if (req.session.user_id) {
    
      const id = req.session.user_id;
      const cart = await Cart.findOne({ user: id });
      if(!cart){
      res.redirect('/home')
      }else{
      if (cart.address[0] != undefined) {
        const cod = await Order.find({
          user: id,
          orderType: "cashOnDelivery",
        }).count();
        const rozorpay = await Order.find({
          user: id,
          orderType: "Razorpay",
        }).count();
        const wallet = await Order.find({
          user: id,
          orderType: "walletPayment",
        }).count();
        const coupon = await Coupon.find();

        const date = new Date();
        const serch = coupon.filter((value) => {
          return value.finalDate >= date;
        });
        const exp = coupon.filter((value) => {
          return value.finalDate <= date;
        });

        console.log(
          "data of the product ",
          cod,
          "-----",
          rozorpay,
          "------",
          "wallet---",
          wallet
        );

        const userData = await users.findOne({ _id: id });
        res.render("profile", {
          userData,
          cart,
          cod,
          rozorpay,
          wallet,
          serch,
          exp,
        });
      } else {
        res.render("address", { count: 0 });
      }
    }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("profile error", error.message);
    res.render("500error");
  }
};
//============================================================== PROFILE EDIT  ============================================================== otp compare==============================================

const profileEdit = async (req, res) => {
  try {
    if (req.session.user_id) {
      if (req.files == "") {
        const userID = req.session.user_id;
        const update = await users
          .findByIdAndUpdate(
            { _id: userID },
            { $set: { name: req.body.name, phone: req.body.phone } }
          )
          .then((value) => {
            res.redirect("/profile");
          });
      }
      const userID = req.session.user_id;
      const update = await users
        .findByIdAndUpdate(
          { _id: userID },
          {
            $set: {
              name: req.body.name,
              phone: req.body.phone,
              image: req.files[0].filename,
            },
          }
        )
        .then((value) => {
          res.redirect("/profile");
        });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log("profiles edit error", error.message);
    res.render("500error");
  }
};
//============================================================== DETAILS ============================================================== otp compare==============================================

const details = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      const id = req.query.id;
      const orders = await Order.findById({ _id: id });
      const date = orders.date; // replace this with your database date field
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      res.render("confirmationDetails", { orders, day, month, year });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

//============================================================== CHANGE EDIT  ============================================================== otp compare==============================================

const ChangeAddress = async (req, res) => {
  try {
    if (req.session.user_id) {
      const productId = req.query.id;
      res.render("address2", { productId });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

//============================================================== ADDRESS ADD  ============================================================== otp compare==============================================

const addressAdd = async (req, res) => {
  try {
    if (req.session.user_id) {
      const productId = req.query.id;
      if (productId) {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const house = req.body.house;
        const post = req.body.post;
        const city = req.body.city;
        const district = req.body.district;
        const state = req.body.state;
        const pin = req.body.pin;
        const user = req.session.user_id;
        await Cart.findOneAndUpdate(
          { user: user },
          {
            $push: {
              address: {
                firstName,
                lastName,
                house,
                post,
                city,
                district,
                state,
                pin,
              },
            },
          }
        );
        const address = await Cart.findOne({ user: user });
        const userData = await users.findOne({ _id: user });
        const CartData = await Cart.findOne({ user: user });
        const one = await Cart.findOne({
          $and: [{ user: user }, { status: 1 }],
        });
        if (one) {
          for (var j = 0; j <= CartData.products.length; j++) {
            if (CartData.products[j].productId == productId) {
              const c = CartData.products[j].cancel;
              res.render("checkout", { userData, CartData, j });
              break;
            }
          }
        }
      } else {
        // -----------------------------------------------------------------else-------------------------------------
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const house = req.body.house;
        const post = req.body.post;
        const city = req.body.city;
        const district = req.body.district;
        const state = req.body.state;
        const pin = req.body.pin;
        const user = req.session.user_id;
        await Cart.findOneAndUpdate(
          { user: user },
          {
            $push: {
              address: {
                firstName,
                lastName,
                house,
                post,
                city,
                district,
                state,
                pin,
              },
            },
          }
        );
        const address = await Cart.findOne({ user: user });
        const userData = await users.findOne({ _id: user });
        const CartData = await Cart.findOne({ user: user });
        const one = await Cart.findOne({
          $and: [{ user: user }, { status: 1 }],
        });
        if (one) {
          const j = -1;
          res.render("checkout", { userData, CartData, j });
        }
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
}; //============================================================== USED ADDRESS ============================================================== otp compare==============================================

const UsedAddress = async (req, res) => {
  try {
    const userData = req.session.user_id;
    if (userData) {
      const orders = await Order.find({
        user: userData,
        status: "OrderCanceled",
      });
      const returned = await Order.find({
        user: userData,
        status: "returnOrder",
      });
      const Wallet = await Order.find({
        user: userData,
        status: "walletPayment",
      });
      const usersData = await users.findOne({ _id: userData });
      res.render("wallethistory", { orders, usersData, returned, userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
// =========================================================edit address==============================================
const editAddress = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const addressId = req.body.value7.trim();
      const house = req.body.value1;
      const post = req.body.value2;
      const city = req.body.value3;
      const district = req.body.value4;
      const state = req.body.value5;
      const pin = req.body.value6;

      const find = await Cart.findOne({ user: userId });

      for (let i = 0; i < find.address.length; i++) {
        if (find.address[i].id.trim() === addressId) {
          console.log(find.address[i].pin);
          await Cart.findOneAndUpdate(
            { user: userId, "address._id": find.address[i]._id },
            {
              $set: {
                "address.$.house": house,
                "address.$.post": post,
                "address.$.city": city,
                "address.$.district": district,
                "address.$.state": state,
                "address.$.pin": pin,
              },
            }
          );
        }
      }
      res.json({ success: true });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.render("500error");
  }
};
// ===========================================================delete address============================================

const deleteAddress = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const addressId = req.body.id.trim();

      const find = await Cart.findOne({ user: userId });

      for (let i = 0; i < find.address.length; i++) {
        if (find.address[i].id.trim() === addressId) {
          await Cart.findOneAndUpdate(
            { user: userId },
            { $pull: { address: { _id: find.address[i]._id } } }
          );
        }
      }
      res.json({ success: true });
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.render("500error");
  }
};
//============================================================== ADD ADDRESS  ============================================================== otp compare==============================================

const set = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const addressId = req.body.id;
      const productId = req.body.pId;
      const address = await Cart.findOne({ user: user });
      for (var i = 0; i < address.address.length; i++) {
        if (address.address[i]._id == addressId) {
          const userData = await users.findOne({ _id: user });
          const CartData = await Cart.findOne({ user: user });
          const c = i;
          await Cart.findOneAndUpdate(
            { user: user, "products.productId": productId },
            { $set: { "products.$.cancel": i } }
          );
          for (var j = 0; j < CartData.address.length; j++) {
            if (CartData.address[j]._id == addressId) {
              const firstName = CartData.address[j].firstName;
              const lastName = CartData.address[j].lastName;
              const house = CartData.address[j].house;
              const post = CartData.address[j].post;
              const city = CartData.address[j].city;
              const district = CartData.address[j].district;
              const state = CartData.address[j].state;
              const pin = CartData.address[j].pin;
              for (let c = 0; c < CartData.address.length; c++) {
                if (CartData.address[c]._id == addressId) {
                  let address = CartData.address[c]._id;
                  await Cart.findOneAndUpdate(
                    { user: user, "address._id": address },
                    { $set: { "address.$.is_in": 1 } }
                  );
                } else {
                  let address1 = CartData.address[c]._id;
                  await Cart.findOneAndUpdate(
                    { user: user, "address._id": address1 },
                    { $set: { "address.$.is_in": 0 } }
                  );
                }
              }
              res.json({
                firstName,
                lastName,
                house,
                post,
                city,
                district,
                state,
                pin,
              });
            }
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// =======================================================Ajax set all================================================================
const setAll = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const addressId = req.body.id;
      const CartData = await Cart.findOne({ user: user });
      for (var j = 0; j < CartData.address.length; j++) {
        if (CartData.address[j]._id == addressId) {
          const firstName = CartData.address[i].firstName;
          const lastName = CartData.address[i].lastName;
          const house = CartData.address[i].house;
          const post = CartData.address[i].post;
          const city = CartData.address[i].city;
          const district = CartData.address[i].district;
          const state = CartData.address[i].state;
          const pin = CartData.address[i].pin;
          for (let c = 0; c < CartData.address.length; c++) {
            if (CartData.address[c]._id == addressId) {
              let address = CartData.address[c]._id;
              await Cart.findOneAndUpdate(
                { user: user, "address._id": address },
                { $set: { "address.$.is_in": 1 } }
              );
            } else {
              let address1 = CartData.address[c]._id;
              await Cart.findOneAndUpdate(
                { user: user, "address._id": address1 },
                { $set: { "address.$.is_in": 0 } }
              );
            }
          }
          res.json({
            firstName,
            lastName,
            house,
            post,
            city,
            district,
            state,
            pin,
          });
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// =======================================================add address it is not working=============================================
const AddAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const productId = req.query.id;
      const addressId = req.body.id;
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// ===========================================================  wishLIST LOAD =========================================================
const wishlist = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      console.log('coming here------------');
      const userData = 1;
      const wishData = await users.findOne({ _id: user });
      const cart = await Cart.findOne({ user: user });
      if (!cart) {
        const count = 0;
        res.render("wishlist", { wishData, userData, count });
      }else{
      const count = cart.products.length;
      res.render("wishlist", { wishData, userData, count });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
//============================================================== WISHLIST ADD  ========================================================
const wishAdd = async (req, res) => {
  try {
    const user = req.session.user_id;
    const productId = req.body.id;
    const userDATA = await users.findOne({ _id: user });
    const product = await Product.findById({ _id: productId });
    if (user) {
      await users.updateOne(
        { _id: user, "wishlist.productId": productId },
        { $set: { "wishlist.$.is_in": 0 } }
      );
      let count = 0;
      console.log("after zero");
      console.log(userDATA.wishlist.length);
      for (var i = 0; i < userDATA.wishlist.length; i++) {
        if (userDATA.wishlist[i].productId == productId) {
          count++;
        }
      }
      console.log(userDATA.wishlist.length);
      if (count == 0) {
        await users.findOneAndUpdate(
          { _id: user },
          {
            $push: {
              wishlist: {
                productId,
                Price: product.price,
                name: product.name,
                quantity: product.quantity,
                image: product.image[0],
              },
            },
          }
        );
        const value = 1;
        res.json({ value });
      } else {
      }
    } else {
      req.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
// =====================================================================removeWishlist=============================================

const removeWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    const user = req.session.user_id;
    if (user) {
      await users.updateOne(
        { _id: user },
        { $pull: { wishlist: { productId } } }
      );
      res.redirect("/wishlist");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
// =============================================================category page======================================================================
const category = async (req, res) => {
  try {
    const userData = req.session.user_id;

      console.log('data is coming------------------');
      const currentPage = parseInt(req.query.page) || 1;
      const pageSize = 6;
      const skip = pageSize * currentPage - pageSize;
      const productData = await Product.aggregate([
        { $skip: skip },
        { $limit: pageSize },
        { $sort: { createdAt: -1 } },
      ]);

      const totalProducts = await Product.countDocuments();
      const pageCount = Math.ceil(totalProducts / pageSize);
      const categoryData = await Category.find();
      const category = await Category.find();

      let count = 0;
      if (userData) {
        const cart = await Cart.findOne({ user: userData });
        if(!cart){
          count = 0
        }else{
    
        count = cart.products.length;
      }
      }

      res.render("category", {
        totalProducts,
        categoryData,
        productData,
        count,
        userData,
        currentPage,
        pageCount,
        category,
      });
   
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
// ==========================================================change category================================================================
const ChangeCategory = async (req, res) => {
  try {
    const catId = req.body.id;
    const currentPage = parseInt(req.body.page) || 1;
    const user = req.session.user_id;
    const category = await Category.findOne({ _id: catId });

  
    const limit = 6;
    const skip = (currentPage - 1) * limit;
console.log('skip=--------------------------------------------------------------', skip);
    const pipeline = [
      { $match: { category: mongoose.Types.ObjectId(catId) } },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          offerPrice: 1,
          quantity: 1,
          image: 1, 
        },
      },
    ];

    const productData = await Product.aggregate(pipeline);
    const categoryData = await Category.find();
    const count = await Product.countDocuments({ category: catId });

    let responseData = {
      categoryData,
      productData,
      count,
      category,
      currentPage: currentPage,
      pages: Math.ceil(count / limit),
    };
    if (user) {
      const cartData = await Cart.findOne({ user });
      responseData = { ...responseData, cartData };
    }
    if(currentPage==1){
      console.log(productData.length,'-productData-');
    
      res.json({
        responseData,
        currentPage,
        category,
        productData,
        categoryData,
        count,
      });
    
    }else{
      console.log(productData.length,'-productData-');

      res.json({
        responseData,
        currentPage,
        category,
        productData,
        categoryData,
        count,
      });
    }
   

  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

//======================================================search================================

const search = async (req, res) => {
  try {
    const user = req.session.user_id;
    const value = req.body.id;
    const catId = req.body.category;

    if (user) {
      const co = await Cart.findOne({ user: user });
      const count = co.products.length;
      if (catId != "empty") {
        const categoryData = await Category.find();
        const productData = await Product.findOne({
          name: value,
          category: catId,
        }).populate("category");
        res.json({ productData, count, categoryData });
      } else {
        const categoryData = await Category.find();
        const productData = await Product.findOne({ name: value });
        res.json({ productData, count, categoryData });
      }
    } else {
      const count = 0;
      if (catId != "empty") {
        const categoryData = await Category.find();
        const productData = await Product.findOne({
          name: value,
          category: catId,
        }).populate("category");
        res.json({ productData, count, categoryData });
      } else {
        const categoryData = await Category.find();
        const productData = await Product.findOne({ name: value });
        res.json({ productData, count, categoryData });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

const priceOrder = async (req, res) => {
  try {
    const type = req.body.id;
    const catId = req.body.category;
    const user = req.session.user_id;
    // ================================================if user is found============================================
    if (user) {
      const co = await Cart.findOne({ user: user });
      const count = co.products.length;
      if (type == "LOW") {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ price: -1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ price: -1 });
          res.json({ productData, count, categoryData });
        }
      } else if (type == "HEIGH") {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ price: 1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ price: 1 });
          res.json({ productData, count, categoryData });
        }
      } else {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ date: 1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ date: 1 });
          res.json({ productData, count, categoryData });
        }
      }
    } else {
      // ================================================if user is not found============================================
      const count = 0;
      if (type == "LOW") {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ price: -1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ price: -1 });
          res.json({ productData, count, categoryData });
        }
      } else if (type == "HEIGH") {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ price: 1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ price: 1 });
          res.json({ productData, count, categoryData });
        }
      } else {
        if (catId != "empty") {
          const categoryData = await Category.find();
          const productData = await Product.find({ category: catId })
            .sort({ date: 1 })
            .populate("category");

          res.json({ productData, count, categoryData });
        } else {
          const categoryData = await Category.find();
          const productData = await Product.find().sort({ date: 1 });
          res.json({ productData, count, categoryData });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.render("500error");
  }
};
// ======================================================decrement==========================================================================
const decrement = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const productId = req.body.id;
      const find = await Cart.findOne({ user: user });
      const data = find.products.find((product) => {
        return product.productId == productId;
      });
      if (data.quantity >= 2) {
        const checking = data.quantity-1;
        await Cart.findOneAndUpdate(
          { user: user, "products.productId": productId },
          { $inc: { "products.$.quantity": -1 } }
        ).then(async (result) => {
         
        });
        for (let i = 0; i < find.products.length; i++) {
          if (find.products[i].productId == productId) {
            if (
              
              find.products[i].quantity != 0
            ) {
              const datas = find.products[i].quantity - 1
              let totalPrice =
              datas * find.products[i].price;
              const value = find.products[i].quantity - 1;

              await Cart.findOneAndUpdate(
                { user: user, "products.productId": productId },
                { $set: { "products.$.totalPrice": totalPrice } }
              ).then((result) => {});
             
                res.json({ value, totalPrice, checking });
            } else {
              console.log(
                "quantity is less than one"
              );
            }
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);

    res.render("500error");

    res.status(500).json({ error: error.message });
  }
};
// ====================================================increment=========================================================
const increment = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const productId = req.body.id;
      const productOne = await Product.findOne({ _id: productId });
      const find = await Cart.findOne({ user: user });
      const data = find.products.find((product) => {
        return product.productId == productId;
      });
      const data1 = productOne.quantity;

      if (data.quantity < data1) {
        const checking = data.quantity;
        let a = 0;
        for (let i = 0; i < find.products.length; i++) {
          if (find.products[i].productId == productId) {
            a = find.products[i].quantity;
          }
        }
        const b = productOne.quantity;
        await Cart.findOneAndUpdate(
          { user: user, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
        for (let i = 0; i < find.products.length; i++) {
          if (find.products[i].productId == productId) {
            let totalPrice =find.products[i].quantity * find.products[i].price;
            const value = find.products[i].quantity;
            await Cart.findOneAndUpdate(
              { user: user, "products.productId": productId },
              { $set: { "products.$.totalPrice": totalPrice } }
            ).then((values) => {
           console.log(values);
            });
            
           const findOne = find.products.find((value)=>{
            return value.productId == productId
           })
            res.json({ value, a, b, totalPrice, checking });
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
// ======================================================sum========================================================
const sum = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const product = req.body.id;
      const find = await Cart.findOne({ user: user });
      let datas = 0;
      for (let i = 0; i < find.products.length; i++) {
        let value1 = find.products[i].quantity;
        let value2 = find.products[i].price;
        datas = value1 * value2 + datas;
      }
      for (let i = 0; i < find.products.length; i++) {
        if (find.products[i].productId == product) {
          await Cart.findOneAndUpdate(
            { user: user },
            { $set: { totalPrice: datas } }
          );
        }
      }
      res.json({ datas });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
    res.render("500error");
  }
};

const setSingle = async (req, res) => {
  try {
    const productId = req.body.id;
    const operator = req.body.operator;
    console.log(productId);
    console.log(operator);

    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { qun: operator } }
    ).then((product) => {
    });
    const p = await Product.findOne({ _id: productId });
    const updated = p.qun;
    res.json({ updated });
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};
//====================================================coupon apply================================================
const couponApply = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const cartData = await Cart.findOne({ user: user });
      const value = req.body.id;
      const coupons = await Coupon.find();
      const couponMatch = await Order.findOne({
        user: user,
        couponNumber: value,
      });

      let key = 0;
      for (let i = 0; i < coupons.length; i++) {
        const coupon = coupons[i].code;
        const couponP = coupons[i].price;
        if (value == "") {
          const returnCoupon4 = "coupon feild is empty";
          res.json({ returnCoupon4 });
        } else {
          if (value == coupon) {
            if (couponMatch) {
              const returnCoupon5 =
                "this coupon is already in use please choose a different coupon";
              res.json({ returnCoupon5 });
            } else {
              if (cartData.totalPrice > couponP) {
                await Cart.findOneAndUpdate(
                  { user: user },
                  { $set: { coupon: couponP, couponNumber: value } }
                );
                key = 10;
                const returnCoupon1 = "coupon successfull ";
                const discount = couponP;
                const price = cartData.totalPrice - couponP;
                res.json({ returnCoupon1, discount, price });
              } else {
                const returnCoupon2 = "coupon not available for this purchase";
                await Cart.findOneAndUpdate(
                  { user: user },
                  { $set: { coupon: 0, couponNumber: 0 } }
                );
                key = 10;
                res.json({ returnCoupon2 });
              }
            }
          }
        }
      }
      if (key == 0) {
        const returnCoupon3 = "coupon is invalide";
        await Cart.findOneAndUpdate({ user: user }, { $set: { coupon: 0 } });
        res.json({ returnCoupon3 });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// =====================================================change================================================

const change = async (req, res) => {
  try {
    const user = req.session.user_id;
    const id = req.body.id;

    if (id == "cachOnDelivery") {
      await users.findOneAndUpdate({ _id: user }, { $set: { check: 0 } });
      const cash = "cash on delivery";
      res.json({ cash });
    }
    if (id == "rozopay") {
      await users.findOneAndUpdate({ _id: user }, { $set: { check: 1 } });
      const cash = "rozopay";

      res.json({ cash });
    }
    if (id == "Wallet") {
      await users.findOneAndUpdate({ _id: user }, { $set: { check: 2 } });
      const cash = "Wallet";

      res.json({ cash });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// ===================================edit profile===============================================
const editProfile = async (req, res) => {
  try {
    if (res.session.user_id) {
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const passwordChange = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const email = req.body.email;
      const password = req.body.password;
      const newPassword = req.body.newPassword;
      const confirmPass = req.body.confirmPassword;
      const find = await users.findOne({ _id: user });
      const emailCheck = find.email;
      const passwordMatch = await bcrypt.compare(password, find.password);

      if (email == "" && password == "") {
        const value = 1;
        const message = "feild is empty please fill the form";
        res.json({ value, message });
      } else {
        if (confirmPass == "" && newPassword == "") {
          if (passwordMatch && emailCheck == email) {
            const value = 2;
            res.json({ value });
          } else {
            const message = "wrong email or password";
            const value = 3;
            res.json({ value, message });
          }
        } else {
          if (confirmPass == "" && newPassword == "") {
            const message = "password is empty";
            const value = 6;
            res.json({ value, message });
          } else {
            const value1 = parseInt(newPassword);
            const value2 = parseInt(confirmPass);
            if (value1 == value2) {
              const passwordHash = await bcrypt.hash(newPassword, 10);
              await users
                .findOneAndUpdate(
                  { _id: user },
                  { $set: { password: passwordHash } }
                )
                .then((result) => {
                  console.log(result);
                  const value = 4;
                  res.json({ value });
                });
            } else {
              const value = 5;
              const message =
                "password not matching please enter correct password";
              res.json({ value, message });
            }
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log();
    res.render("500error");
  }
};

const successPage = async (req, res) => {
  try {
    const user = req.session.user_id;
    if (user) {
      const findData = await Order.findOne().sort({ date: -1 });
      const userData = await users.findOne({ _id: user });

      res.render("confirmationsuccesspage", { findData, userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500error");
  }
};

// ==========================================================================================================================

module.exports = {
  loadRegister,
  insertUser,
  loadLogin,
  login,
  homeLoad,
  EmailVerification,
  userLogout,
  otpLogin,
  otpPage,
  ottp,
  ottpCompare,
  resendOTP,
  singleProduct,
  cartAdd,
  cart,
  profile,
  profileEdit,
  cartPage,
  checkout,
  checkoutAdd,
  purchase,
  cancel,
  returnOrder,
  confirmation,
  details,
  ChangeAddress,
  UsedAddress,
  addressAdd,
  AddAddress,
  wishlist,
  wishAdd,
  removeCart,
  removeWishlist,
  category,
  ChangeCategory,
  decrement,
  increment,
  sum,
  set,
  setAll,
  setSingle,
  couponApply,
  change,
  search,
  rozoPayment,
  successPage,
  priceOrder,
  editAddress,
  deleteAddress,
  editProfile,
  passwordChange,
};
