import express, { Express, Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors, VerifyOptions } from "jsonwebtoken";
import { createServer } from "http";
import { Server, Socket } from 'socket.io';
import { UnityClient, ReactClient, Room } from "./types";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.KEY;

const app: Express = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ------------------- Global Variables -------------------
const roomCodeToUnityID: { [key: number]: string } = {};
const rooms: { [key: string]: Room } = {};


// ------------------- Helper Functions -------------------

const genRoomCode = () => {
  let roomCode = Math.floor(10000000 + Math.random() * 90000000);
  while (roomCodeToUnityID[roomCode]) {
    roomCode = Math.floor(10000000 + Math.random() * 90000000);
  }
  return roomCode;
}

async function isValidJWT(token: string) {
  jwt.verify(token, SECRET_KEY!, (err, decoded) => {
    if (err) {
      return false;
    }
    return true;
  });
}

// ------------------- Authorization Middleware -------------------

const authenticateToken = (req: Request, res: Response, next: any) => {
  const header = req.headers.authorization;

  if (!header) {
    console.log("No Token");
    return res.status(401).send('No Token');
  }

  if (!header.startsWith("Bearer ")) {
    console.log("Invalid Token");
    return res.status(401).send('Invalid Token');
  }

  const token = header.substring(7);

  if(!isValidJWT(token)) {
    return res.status(403).send('Access Forbidden');
  }
  next();
}

const authenticateSocket = (socket: Socket, next: any) => {
  const header = socket.handshake.auth.token;

  if (!header) {
    return next(new Error("No Token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("Invalid Token"));
  }

  const token = header.substring(7);

  if(!isValidJWT(token)) {
    return next(new Error("Access Forbidden"));
  }

  socket.data.token = token;
  socket.data.userData = jwt.decode(token);
  next();
};

// ------------------- Express Calls -------------------

app.post("/api/token", (req: Request, res: Response) => { 
  const { userID, key } = req.body;

  if (!(key === SECRET_KEY)) {
    return res.status(401).send('Invalid key');
  }

  const token = jwt.sign({ userID: userID, }, SECRET_KEY!, { expiresIn: '1h' });
  const uClient = new UnityClient(userID, token);
  const newRoom = new Room(userID, uClient);
  rooms[newRoom.roomID] = newRoom;
  roomCodeToUnityID[genRoomCode()] = userID;

  res.json(token);
});

app.get("/api/verify", authenticateToken, (req: Request, res: Response) => {
  res.send("Token Verified");
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

/*app.get("/api/room", authenticateToken, (req: Request, res: Response) => {
  const unityIDs = Object.keys(rooms);
  const randomUnityID = unityIDs[Math.floor(Math.random() * unityIDs.length)];
  const rClient = new ReactClient(randomUnityID);
  rooms[randomUnityID].addWebClient(rClient);

  io.to(randomUnityID).emit('haunt', 'You have been haunted!');
  res.json(randomUnityID);
});*/

// ------------------- Socket.IO Calls -------------------

io.on('joinroom', (socket) => {
  console.log("Joining Room");
  const unityIDs = Object.keys(rooms);
  const randomUnityID = unityIDs[Math.floor(Math.random() * unityIDs.length)];
  const rClient = new ReactClient(randomUnityID, socket);
  socket.data.unityID = randomUnityID;
  rooms[socket.data.unityID].addWebClient(rClient);
  socket.join(socket.data.unityID);

  socket.to(socket.data.unityID).emit('haunt', 'You have been haunted!');
});

io.on('connection', (socket) => authenticateSocket(socket, () => {
  console.log("ksjdfhaksdf")
  //rooms[socket.data.userData.userID].unityClient.socket = socket;
  //socket.join(socket.data.userData.userID);

  socket.on('transform', (data) => {
    socket.to(socket.data.userData.userID).emit('transform', data);
  });

  io.on('joinroom', () => {
    console.log("Joining Room");
  });
}));

httpServer.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});