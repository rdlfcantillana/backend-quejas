const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require("../Database/users");
const Role = require("../Database/roles");
const UserRole = require("../Database/user_roles");
const Session = require("../Database/session");
const ResetToken = require('../Database/resetTokenSchema');

const userSignup = async (req, role, res) => {
  try {
    const ciNotRegistered = await validateCI(req.body.ci);
    if (!ciNotRegistered) {
      return res.status(400).json({
        message: "CI is already registered."

      });
    }
    const emailNotRegistered = await validateEmail(req.body.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: "Email is already registered."
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

const getUsersWithCitizenRole = async (req, res) => {
  try {
    const citizenRole = await Role.findOne({ name: 'ciudadano' });
    const users = await UserRole.find({ role_id: citizenRole._id }).populate('user_id');
    const populatedUsers = users.map(ur => ur.user_id).filter(user => user !== null);
    res.status(200).json(populatedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const employeeLogin = async (req, res) => {
  try {
    const { ci, password } = req.body;
    const user = await User.findOne({ ci });
    if (!user) {
      return res.status(404).json({
        message: "User CI is not found. Invalid login credentials.",
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        message: "Incorrect CI or password."
      });
    }

    const userRoles = await UserRole.find({ user_id: user._id }).populate('role_id');
    const roles = userRoles.map(ur => ur.role_id.name);

    // Verificar si ya tiene una sesión activa
    const activeSession = await Session.findOne({ user_id: user._id });
    if (activeSession) {
      return res.status(403).json({
        message: "User already has an active session. Please log out from other devices."
      });
    }

    const token = jwt.sign(
      {
        roles: roles,
        ci: user.ci,
        email: user.email
      },
      process.env.APP_SECRET,
      { expiresIn: "3 days" }
    );

    const session = new Session({ user_id: user._id, token });
    await session.save();

    const result = {
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
    console.error("Error in employeeLogin:", err); // Añadir registro de errores para depuración
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};
const ciudadanoLogin = async (req, res) => {
  await employeeLogin({ ...req, body: { ...req.body, role: 'ciudadano' } }, res);
};


const validateEmail = async email => {
  const user = await User.findOne({ email });
  return user ? false : true;
};

const validateCI = async ci => {
  const user = await User.findOne({ ci });
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

const getUserProfile = async (req, res) => {
  try {
    console.log("Fetching user profile for user ID:", req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userRoles = await UserRole.find({ user_id: user._id }).populate('role_id');
    const roles = userRoles.map(ur => ur.role_id.name);

    res.status(200).json({ ...user._doc, roles });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, lastname, email, password } = req.body;
    const updatedFields = { name, lastname, email };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedFields, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.APP_SECRET);

    // Elimina la sesión del usuario basada en el token
    await Session.findOneAndDelete({ token });

    // Elimina la cookie JWT
    res.clearCookie('jwt');
    
    return res.status(200).json({
      message: "User logged out successfully."
    });
  } catch (err) {
    console.error("Error in logout:", err);
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};


// Crear transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendResetPasswordEmail = async (req, res) => {
  const { email} = req.body;
  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    const token = jwt.sign({ email: user.email }, process.env.APP_SECRET, { expiresIn: '1h' });
    // Guardar el token en la base de datos
    const resetToken = new ResetToken({
      userId: user._id,
      token: token
    });

    await resetToken.save();
    const localUrl = `http://localhost:4000/api/user/reset-password/${token}`;
    //const deployUrl = `http://` //aqui esta el url de la password
    const resetLink = `https://backend-quejas-production.up.railway.app/api/user/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `Click on the link to reset your password: ${localUrl}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset password email sent.' });
  } catch (error) {
    console.error('Error in sendResetPasswordEmail:', error);
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordForm = async (req, res) => {
  res.render("auth/set_new_password" , {
    title: "resetear contraseña",
    pagina: "reset password"
  })
}

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    if (resetToken.used) {
      return res.status(400).json({ message: 'Token has already been used.' });
    }
    const user = await User.findOne({ _id: resetToken.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    //Marcar el token como usado
    resetToken.used = true;
    await resetToken.save();
    //res.status(200).json({ message: 'Password reset successful.' });
    return res.render("auth/reset_password" , {
      title: "resetear contraseña",
      pagina: "reset password"   
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  userSignup,
  addUserRole,
  getUsersWithCitizenRole,
  employeeLogin,
  ciudadanoLogin,
  validateEmail,
  validateCI,
  userAuth,
  checkRole,
  getUserProfile,
  updateUserProfile,
  sendResetPasswordEmail,
  resetPassword,
  resetPasswordForm,
  logout
};
