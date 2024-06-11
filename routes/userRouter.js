const router = require('express').Router();
const {
  userAuth,
  ciudadanoLogin,
  employeeLogin,
  checkRole,
  userSignup,
  addUserRole
} = require("../Controller/authFunctions");

// Rutas de Registro
router.post("/register-se", userAuth, checkRole(["admin"]), async (req, res) => {
  await userSignup(req, "se", res);
});

router.post("/register-support", userAuth, checkRole(["admin"]), async (req, res) => {
  await userSignup(req, "support", res);
});

router.post("/register-ciudadano", async (req, res) => {
  await userSignup(req, "ciudadano", res);
});

// Añadir rol a un usuario existente (requiere autenticación y rol de admin)
router.post("/add-role", userAuth, checkRole(["admin"]), async (req, res) => {
  await addUserRole(req, res);
});

// Rutas de Login
router.post("/login-ciudadano", async (req, res) => {
  await ciudadanoLogin(req, res);
});

router.post("/login-employee", async (req, res) => {
  await employeeLogin(req, res);
});


// Rutas Protegidas
router.get("/se-protected", userAuth, checkRole(["se"]), async (req, res) => {
  return res.json(`Welcome ${req.user.name}`);
});

router.get("/support-protected", userAuth, checkRole(["support"]), async (req, res) => {
  return res.json(`Welcome ${req.user.name}`);
});

router.get("/ciudadano-protected", userAuth, checkRole(["ciudadano"]), async (req, res) => {
  return res.json(`Welcome ${req.user.name}`);
});

router.get("/admin-protected", userAuth, checkRole(["admin"]), async (req, res) => {
  return res.json(`Welcome ${req.user.name}`);
});

module.exports = router;
