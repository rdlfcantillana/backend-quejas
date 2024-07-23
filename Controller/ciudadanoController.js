// ciudadanoController.js
const mongoose = require('mongoose');
const Complaint = require("../Database/complaint");
const User = require("../Database/users");
const Status = require("../Database/status");
const Response = require("../Database/response");
const ComplaintType = require("../Database/complaint_type");
const { getIo } = require('../socket'); 

const ciudadanoController = {
  createComplaint: async (req, res) => {
    try {
      if (!req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to create complaints." });
      }

      const { description, type_id, location_coordinates } = req.body;
      const userId = req.user._id;

      console.log(req.body);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const pendingStatus = await Status.findOne({ name: 'pendiente' });
      if (!pendingStatus) {
        return res.status(404).json({ message: "Pending status not found." });
      }

      // Convertir type_id a ObjectId
      if (!mongoose.Types.ObjectId.isValid(type_id)) {
        return res.status(400).json({ message: "Invalid type_id" });
      }

      const newComplaint = new Complaint({
        description,
        createdBy: user._id,
        type_id: new mongoose.Types.ObjectId(type_id),
        status_id: pendingStatus._id,
        location_type: "Point",
        location_coordinates: {
          lat: location_coordinates.lat,
          lon: location_coordinates.lon,
        },
      });

      await newComplaint.save();

      // Emitir evento de creación de queja
      const io = getIo();
      io.emit('complaintCreated', { 
        message: 'Complaint created successfully',
        complaint: newComplaint 
      });

      res.status(201).json({
        message: "Complaint created successfully",
        complaint: {
          _id: newComplaint._id,
          description: newComplaint.description,
          type_id: newComplaint.type_id,
          status: pendingStatus.name,
          createdBy: newComplaint.createdBy,
          location_type: newComplaint.location_type,
          location_coordinates: newComplaint.location_coordinates,
          createdAt: newComplaint.createdAt,
          updatedAt: newComplaint.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error in createComplaint:', error);
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
        .populate({ path: 'status_id', select: 'name' })
        .populate({ path: 'type_id', select: 'name' }); 
  
      const formattedComplaints = complaints.map(complaint => ({
        ...complaint._doc,
        status: complaint.status_id.name, 
        type: complaint.type_id.name, 
        status_id: undefined,
        type_id: undefined
      }));

      // Emitir evento de visualización de quejas
      const io = getIo();
      io.emit('viewComplaints', { 
        message: 'Complaints viewed successfully',
        complaints: formattedComplaints 
      });
  
      res.status(200).json(formattedComplaints);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  viewResponses: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to view responses." });
      }

      const responses = await Response.find({ createdBy: { $ne: req.user._id } })
        .populate({
          path: 'complaint_id',
          match: { createdBy: req.user._id },
          populate: [
            { path: 'type_id', select: 'name' },
            { path: 'status_id', select: 'name' }
          ]
        })
        .populate('createdBy', 'name lastname'); // Poblamos createdBy para obtener el nombre y apellido del SE

      // Filtrar respuestas donde la queja no pertenece al usuario actual
      const filteredResponses = responses.filter(response => response.complaint_id);

      console.log('Respuestas encontradas:', filteredResponses);

      // Emitir evento de visualización de respuestas
      const io = getIo();
      io.emit('viewResponses', { 
        message: 'Responses viewed successfully',
        responses: filteredResponses 
      });

      res.status(200).json(filteredResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getComplaintTypes: async (req, res) => {
    try {
      const complaintTypes = await ComplaintType.find({});
      
      // Emitir evento de obtención de tipos de quejas
      const io = getIo();
      io.emit('getComplaintTypes', { 
        message: 'Complaint types retrieved successfully',
        complaintTypes 
      });

      res.status(200).json(complaintTypes);
    } catch (error) {
      console.error('Error in getComplaintTypes:', error);
      res.status(500).json({ message: error.message });
    }
  },

  viewAllComplaintsCiudadano: async (req, res) => {
    try {
      console.log('Verificando rol de usuario:', req.user.roles);
      if (!Array.isArray(req.user.roles) || !req.user.roles.includes('ciudadano')) {
        return res.status(403).json({ message: "You do not have permission to view complaints." });
      }

      const complaints = await Complaint.find()
        .populate("type_id")
        .populate("status_id")
        .populate("createdBy")
        .populate("assignedTo");

      console.log('Quejas encontradas:', complaints);

      // Emitir evento de visualización de todas las quejas
      const io = getIo();
      io.emit('viewAllComplaintsCiudadano', { 
        message: 'All complaints viewed successfully',
        complaints 
      });

      res.status(200).json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = ciudadanoController;
