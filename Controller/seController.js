const Complaint = require("../Database/complaint");
const { getIo } = require("../socket");
const Status = require("../Database/status");
const Notification = require("../Database/notification");
const Response = require("../Database/response");

const seController = {
  viewAssignedComplaints: async (req, res) => {
    try {
      if (!req.user.roles.includes('se')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }
  
      const seId = req.user._id;
      console.log('ID de SE:', seId);
  
      const complaints = await Complaint.find({ assignedTo: seId })
        .populate("type_id")
        .populate("status_id")
        .populate("createdBy")
        .populate("assignedTo");
  
      console.log('Quejas encontradas:', complaints);
  
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateComplaintStatus: async (req, res) => {
    try {
      if (!req.user.roles.includes('se')) {
        return res.status(403).json({ message: "You do not have permission to update complaints." });
      }

      const { complaintId, status } = req.body;
      const seId = req.user._id;

      const statusRecord = await Status.findOne({ name: status });
      if (!statusRecord) {
        return res.status(400).json({ message: "Invalid status." });
      }

      const complaint = await Complaint.findOneAndUpdate(
        { _id: complaintId, assignedTo: seId },
        { status_id: statusRecord._id },
        { new: true }
      ).populate("createdBy");

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found or not assigned to you." });
      }

      // Enviar actualización en tiempo real al ciudadano
      const room = complaint.createdBy._id.toString();
      const io = getIo();
      io.to(room).emit('statusUpdate', {
        message: `El estado de su queja ha sido actualizado a: ${status}`
      });

      // Crear una notificación
      const notification = new Notification({
        user_id: complaint.createdBy._id,
        complaint_id: complaint._id,
        message: `El estado de su queja ha sido actualizado a: ${status}`,
        read: false
      });

      await notification.save();

      res.status(200).json({ message: "Complaint status updated successfully and real-time update sent", complaint });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  respondToComplaint: async (req, res) => {
    try {
      if (!req.user.roles.includes('se')) {
        return res.status(403).json({ message: "You do not have permission to respond to complaints." });
      }

      const { complaintId, response } = req.body;
      const seId = req.user._id;


      
      const complaint = await Complaint.findOne({ _id: complaintId, assignedTo: seId });
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found or not assigned to you." });
      }

      const newResponse = new Response({
        complaint_id: complaintId,
        response: response,
        createdBy: seId
      });

      await newResponse.save();

      // Crear una notificación
      const notification = new Notification({
        user_id: complaint.createdBy._id,
        complaint_id: complaint._id,
        message: `Ha recibido una nueva respuesta a su queja.`,
        read: false
      });

      await notification.save();

      res.status(200).json({ message: "Response submitted successfully", response: newResponse });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  
  getSentResponses: async (req, res) => {
    try {
      if (!req.user.roles.includes('se')) {
        return res.status(403).json({ message: "You do not have permission to view sent responses." });
      }

      const seId = req.user._id;

      const responses = await Response.find({ createdBy: seId })
      
      
      .populate('complaint_id', 'description createdAt') 
      
      .populate({
        path: 'complaint_id',
        populate: {
          path: 'type_id',
          select: 'name'
        }
      });
      
      res.status(200).json(responses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};




module.exports = seController;
