const mongoose = require('mongoose');
const Complaint = require("../Database/complaint");
const User = require("../Database/users");
const Status = require("../Database/status");
const Response = require("../Database/response");

const ciudadanoController = {
  createComplaint: async (req, res) => {
    try {
      if (!req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to create complaints." });
      }

      //const { description, latitude, longitude, type_id } = req.body;
      const { description, type_id , location_coordinates } = req.body;
      const userId = req.user._id;
      console.log(req.body)

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const pendingStatus = await Status.findOne({ name: 'pendiente' });
      if (!pendingStatus) {
        return res.status(404).json({ message: "Pending status not found." });
      }

      const newComplaint = new Complaint({
        description,
        createdBy: user._id,
        type_id: new mongoose.Types.ObjectId(type_id),
        status_id: pendingStatus._id,
        location_type: "Point",
        location_coordinates
      });

      await newComplaint.save();

      res.status(201).json({
        message: "Complaint created successfully",
        complaint: {
          _id: newComplaint._id,
          description: newComplaint.description,
          type_id: newComplaint.type_id,
          status: pendingStatus.name, // Devolver el nombre del estado en lugar del ID
          createdBy: newComplaint.createdBy,
          location_type: newComplaint.location_type,
          location_coordinates: newComplaint.location_coordinates,
          createdAt: newComplaint.createdAt,
          updatedAt: newComplaint.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  viewComplaints: async (req, res) => {
    try {
      if (!req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const complaints = await Complaint.find({ createdBy: user._id })
        .populate("createdBy assignedTo")
        .populate({ path: 'status_id', select: 'name' });

      const formattedComplaints = complaints.map(complaint => ({
        ...complaint._doc,
        status: complaint.status_id.name, // Devolver el nombre del estado en lugar del ID
        status_id: undefined
      }));

      res.status(200).json(formattedComplaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  viewResponses: async (req, res) => {
    try {
      if (!req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to view responses." });
      }

      const userId = req.user._id;
      const responses = await Response.find({ createdBy: userId }).populate('complaint_id createdBy');
      res.status(200).json(responses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = ciudadanoController;
