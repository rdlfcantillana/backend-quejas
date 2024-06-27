const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const supportRouter = require('./routes/supportRoutes');
const seRouter = require('./routes/seRoutes');
const adminRouter = require('./routes/adminRoutes');
const ciudadanoRouter = require('./routes/ciudadanoRoutes'); 
const socketConfig = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketConfig.init(server);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_CONNECT)
  .then(() => {
    console.log('MongoDB connected...');
  });

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://localhost:8081','http://localhost:5173','http://backend-quejas-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials', 'source']
};

app.use(cors(corsOptions));


app.use('/api/user', userRouter);
app.use('/api/support', supportRouter);
app.use('/api/se', seRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ciudadano', ciudadanoRouter);
app.use('/api/ciudadano', ciudadanoRouter);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
