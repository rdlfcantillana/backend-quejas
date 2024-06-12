const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require("../Database/users");
const Role = require("../Database/roles");
const UserRole = require("../Database/user_roles");
const nodemailer = require('nodemailer');

const userSignup = async (req, role, res) => {
  try {
    let ciNotRegistered = await validateCI(req.body.ci);
    if (!ciNotRegistered) {
      return res.status(400).json({
        message: `CI is already registered.`
      });
    }
    let emailNotRegistered = await validateEmail(req.body.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`
      });
    }
    const password = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      ...req.body,
      password
    });

    await newUser.save();

    const userRole = new UserRole({
      user_id: newUser._id,
      role_id: (await Role.findOne({ name: role }))._id
    });

    await userRole.save();

    return res.status(201).json({
      message: "Hurry! Now you are successfully registered. Please log in."
    });
  } catch (err) {
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};

const addUserRole = async (req, res) => {
  try {
    const { user_id, role } = req.body;

    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) {
      return res.status(400).json({
        message: `Role ${role} does not exist.`
      });
    }

    const userRole = new UserRole({
      user_id: user_id,
      role_id: roleDoc._id
    });

    await userRole.save();

    return res.status(201).json({
      message: "Role added successfully."
    });
  } catch (err) {
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};

const employeeLogin = async (req, res) => {
  try {
    let { ci, password } = req.body;
    const user = await User.findOne({ ci });
    if (!user) {
      return res.status(404).json({
        message: "User CI is not found. Invalid login credentials.",
      });
    }
    
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Incorrect CI or password."
      });
    }

    const userRoles = await UserRole.find({ user_id: user._id }).populate('role_id');
    const roles = userRoles.map(ur => ur.role_id.name);

    let token = jwt.sign(
      {
        roles: roles,
        ci: user.ci,
        email: user.email
      },
      process.env.APP_SECRET,
      { expiresIn: "3 days" }
    );

    let result = {
      ci: user.ci,
      roles: roles,
      email: user.email,
      token: `Bearer ${token}`,
      expiresIn: 168
    };

    res.status(200).cookie('jwt', token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      secure: false,
      httpOnly: true
    });
    return res.json({
      ...result,
      message: "You are now logged in."
    });
    
  } catch (err) {
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};

const ciudadanoLogin = async (req, res) => {
  await employeeLogin({ ...req, body: { ...req.body, role: 'ciudadano' } }, res);
};


const validateEmail = async email => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

const validateCI = async ci => {
  let user = await User.findOne({ ci });
  return user ? false : true;
};


const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(403);
  const token = authHeader && authHeader.split(" ")[1];
  jwt.verify(token, process.env.APP_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403);

    try {
      const user = await User.findOne({ ci: decoded.ci });
      if (!user) {
        return res.status(404).json("User not found.");
      }

      // Buscar roles del usuario
      const userRoles = await UserRole.find({ user_id: user._id }).populate('role_id');
      const roles = userRoles.map(userRole => userRole.role_id.name);

      req.user = {
        _id: user._id,
        roles: roles,
        ci: user.ci,
        email: user.email
      };

      console.log("User Auth Middleware: ", req.user); // Depuración
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
};

const checkRole = roles => async (req, res, next) => {
  const userRoles = req.user.roles;
  console.log("User Roles: ", userRoles); // Depuración
  const hasRole = userRoles.some(role => roles.includes(role));

  if (!hasRole) {
    return res.status(401).json("Sorry, you do not have access to this resource.");
  }
  next();
};

module.exports = {
  userSignup,
  addUserRole,
  employeeLogin,
  ciudadanoLogin,
  validateEmail,
  validateCI,
  userAuth,
  checkRole
};
