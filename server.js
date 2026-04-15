const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const JWT_SECRET = "CHANGE_ME_SECRET";
let locations = {};

function auth(req, res, next){
  const token = req.headers.authorization;
  if(!token) return res.sendStatus(401);
  try{
    jwt.verify(token.split(" ")[1], JWT_SECRET);
    next();
  }catch(e){
    res.sendStatus(403);
  }
}

io.on("connection", (socket) => {
  socket.on("update-location", (data) => {
    if(!data?.userId) return;
    locations[data.userId] = data;
    io.emit("locations-update", locations);
  });
});

app.post("/location", auth, (req,res)=>{
  const data = req.body;
  locations[data.userId] = data;
  io.emit("locations-update", locations);
  res.sendStatus(200);
});

app.get("/locations", auth, (req,res)=>{
  res.json(locations);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log("Enterprise backend running", PORT));