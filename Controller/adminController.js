const User = require("../Database/users");
const UserRole = require("../Database/user_roles");
const Role = require("../Database/roles");
const { userSignup } = require("./authFunctions");
const Complaint = require("../Database/complaint");

//admin role

const adminController = {
  registerSupport: async (req, res) => {
    try {
      const { name, lastname, ci, email, password } = req.body;
      await userSignup({ body: { name, lastname, ci, email, password } }, 'support', res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },



  registerSE: async (req, res) => {
    try {
      const { name, lastname, ci, email, password } = req.body;
      await userSignup({ body: { name, lastname, ci, email, password } }, 'se', res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  viewSupports: async (req, res) => {
    try {
      const supportRole = await Role.findOne({ name: 'support' });
      const supports = await UserRole.find({ role_id: supportRole._id }).populate('user_id');
      res.status(200).json(supports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  viewSEs: async (req, res) => {
    try {
      const seRole = await Role.findOne({ name: 'se' });
      const ses = await UserRole.find({ role_id: seRole._id }).populate('user_id');
      res.status(200).json(ses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "Employee not found" });
      }
      await UserRole.deleteMany({ user_id: id }); // Ensure roles related to the user are also deleted
      res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  viewAllComplaintsadmin: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('admin')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const complaints = await Complaint.find().populate("createdBy assignedTo");
      console.log('Quejas encontradas:', complaints);
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
