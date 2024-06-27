const Complaint = require("../Database/complaint");
const User = require("../Database/users");
const Notification = require("../Database/notification");
const UserRole = require("../Database/user_roles");
const Role = require("../Database/roles")
const io = require("../../backend-quejas/socket")

const supportController = {
  viewAllComplaints: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('support')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const complaints = await Complaint.find()
        .populate("type_id")
        .populate("status_id")
        .populate("createdBy")
        .populate("assignedTo");

      console.log('Quejas encontradas:', complaints);
      res.status(200).json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
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
        io.emit('complaintAssigned', complaint);
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
  },

  


  unassignComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      complaint.assignedTo = null;
      await complaint.save();
      //io.emit('complaintUnassigned', complaintId);
      res.status(200).json({ message: "Complaint unassigned successfully", complaint });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSEsWithComplaints: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('support')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const seRole = await Role.findOne({ name: 'se' });
      if (!seRole) {
        return res.status(404).json({ message: "SE role not found." });
      }

      const seUserRoles = await UserRole.find({ role_id: seRole._id }).populate('user_id');
      const seUsers = seUserRoles.map(userRole => userRole.user_id);

      const complaints = await Complaint.find({ assignedTo: { $in: seUsers.map(user => user._id) } })
        .populate("type_id")
        .populate("status_id")
        .populate("createdBy")
        .populate("assignedTo");

      const seUsersWithComplaints = seUsers.map(seUser => ({
        ...seUser._doc,
        complaints: complaints.filter(complaint => complaint.assignedTo && complaint.assignedTo._id.equals(seUser._id))
      }));

      console.log('SEs con quejas asignadas:', seUsersWithComplaints);
      res.status(200).json(seUsersWithComplaints);
    } catch (error) {
      console.error('Error fetching SEs with complaints:', error);
      res.status(500).json({ message: error.message });
    }
  },
};





module.exports = supportController;
