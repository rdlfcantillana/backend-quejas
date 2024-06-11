const Complaint = require("../Database/complaint");
const User = require("../Database/users");
const Notification = require("../Database/notification");
const UserRole = require("../Database/user_roles");

const supportController = {
  viewAllComplaints: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('support')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const complaints = await Complaint.find().populate("createdBy assignedTo");
      console.log('Quejas encontradas:', complaints);
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  assignComplaint: async (req, res) => {
    try {
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('support')) {
        return res.status(403).json({ message: "You do not have permission to assign complaints." });
      }

      const { complaintId, assignedToCI } = req.body;
      console.log('Datos de la solicitud:', { complaintId, assignedToCI });

      const seEmployee = await User.findOne({ ci: Number(assignedToCI) });
      console.log('Empleado SE encontrado:', seEmployee);

      if (!seEmployee) {
        return res.status(404).json({ message: "SE not found." });
      }

      const seRoles = await UserRole.find({ user_id: seEmployee._id }).populate('role_id');
      const roles = seRoles.map(ur => ur.role_id.name);
      console.log('Roles del empleado SE:', roles);

      if (!Array.isArray(roles) || !roles.includes('se')) {
        return res.status(404).json({ message: "SE does not have the correct role." });
      }

      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        { assignedTo: seEmployee._id },
        { new: true }
      ).populate("createdBy assignedTo");

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found." });
      }

      // Crear una notificación para el SE
      const notification = new Notification({
        user_id: seEmployee._id,
        complaint_id: complaint._id,
        message: `Una nueva queja ha sido asignada a usted.`,
        read: false
      });

      await notification.save();

      res.status(200).json({ message: "Complaint assigned successfully", complaint });
    } catch (error) {
      console.error('Error en assignComplaint:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = supportController;
