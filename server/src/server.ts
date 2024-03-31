/*declare global {
  interface crypto {
    randomUUID: () => string;
  }
}*/

import express, { Express, Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors, VerifyOptions } from "jsonwebtoken";
import { createServer } from "http";
import { UnityClient, ReactClient, Room, RoomData, PositionData, Phantom } from "./types";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import crypto from "crypto";

dotenv.config();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.KEY;

const app: Express = express();
app.use(express.json());
app.use(cors());
//app.use(express.static(path.join(__dirname, '../../client/build')));
const httpServer = createServer(app);


// ------------------- Global Variables -------------------

const roomCodeToUnityID: { [key: number]: string } = {};
const rooms: { [key: string]: Room } = {};
const uClients: { [key: string]: UnityClient } = {};
const rClients: { [key: string]: ReactClient } = {};


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


// ------------------- Authentication Calls -------------------

/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});*/

app.get("/api", (req: Request, res: Response) => {
  res.send("Server is running");
});

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
  console.log("Creating Room");

  res.json(token);
});

app.get("/api/verify", authenticateToken, (req: Request, res: Response) => {
  res.send("Token Verified");
});

app.get("/api/room/join", (req: Request, res: Response) => {
  console.log("Joining Room");
  const unityIDs = Object.keys(rooms);
  if(unityIDs.length === 0) {
    console.log("No rooms available");
    return res.status(404).send("No rooms available");
  }
  const randomUnityID = unityIDs[Math.floor(Math.random() * unityIDs.length)];
  const rClientID = crypto.randomUUID();
  const rClient = new ReactClient(rClientID, randomUnityID);
  rClients[rClientID] = rClient;
  rooms[randomUnityID].addWebClient(rClient);
  res.json({ id: rClientID, roomID: randomUnityID });
});

app.get("/api/room/verify", (req: Request, res: Response) => {
  console.log("Verifying Room");
  const { rClient, roomID } = req.body;
  if(rClients[rClient] && rClients[rClient].unityID === roomID) {
    res.sendStatus(200);
  }
  else {
    console.log("Invalid Room Join");
    res.sendStatus(403);
  }
});

app.get("/api/room/close", authenticateToken, (req: Request, res: Response) => {
  console.log("Closing Room");
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const room = rooms[id];
  delete uClients[room.unityClient.userID];
  for (const webClient of room.webClients) {
    delete rClients[webClient.userID];
  }
  delete rooms[id];
});



// ------------------- Game State Calls -------------------

// POST BY UNITY CLIENT
app.post("/api/pos/player", authenticateToken, (req: Request, res: Response) => {
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const { playerPos } = req.body;
  const room = rooms[id];
  if(room.roomData === undefined) {
    return res.status(404).send("Room Data Not Found");
  }
  room.roomData!.playerPos = playerPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/player", (req: Request, res: Response) => {
  console.log("Getting Player Pos:" + JSON.stringify(req.params));
  const { rClient } = req.body;
  console.log("Getting Player Pos: " + rClient);
  if(!rClients[rClient]) {
    return res.status(403).send("Invalid Client");
  }
  const room = rooms[rClients[rClient].unityID];
  res.json(room.roomData!.playerPos);
});


// POST BY UNITY CLIENT
app.post("/api/pos/eel", authenticateToken, (req: Request, res: Response) => {
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const { eelPos } = req.body;
  const room = rooms[id];
  room.roomData!.eelPos = eelPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/eel", (req: Request, res: Response) => {
  const { rClient } = req.body;
  const room = rooms[rClients[rClient].unityID];
  res.json(room.roomData!.eelPos);
});


// POST BY UNITY CLIENT
app.post("/api/pos/phantom", authenticateToken, (req: Request, res: Response) => {
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const { phantomID, phantomPos } = req.body;
  const room = rooms[id];
  room.roomData!.phantomPos[phantomID].phantomPos = phantomPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/phantom", (req: Request, res: Response) => {
  const { rClient } = req.body;
  const room = rooms[rClients[rClient].unityID];
  res.json(room.roomData!.phantomPos);
});


// POST BY UNITY CLIENT
app.post("/api/phantom/remove", authenticateToken, (req: Request, res: Response) => {
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const { phantomID, phantomPos } = req.body;
  const room = rooms[id];
  room.roomData!.removePhantom(phantomID);
});
// POST BY REACT CLIENT
let spawnCooldown = false;
app.post("/api/phantom/spawn", (req: Request, res: Response) => {
  const { rClient, phantomPos } = req.body;

  if (!rClients[rClient]) {
    return res.status(403).send("Invalid Client");
  }
  if(phantomPos.x < 0 || phantomPos.x > 1 || phantomPos.y < 0 || phantomPos.y > 1) {
    return res.status(400).send("Invalid Position");
  }

  const room = rooms[rClients[rClient].unityID];
  if(room === undefined) {
    delete rClients[rClient];
    console.log(rClients);
    return res.status(404).send("Room Data Not Found");
  }

  if (spawnCooldown) {
    const cooldownTimeLeft = 10000 - (Date.now() - room.roomData!.lastSpawnTime);
    return res.status(429).json({ cooldownTimeLeft });
  }
  
  const phantom = new Phantom(crypto.randomUUID(), phantomPos);
  room.roomData!.newPhantom = phantom;
  console.log(JSON.stringify(room.roomData!.newPhantom));
  room.roomData!.spawnPhantom(phantom);

  spawnCooldown = true;
  setTimeout(() => {
    console.log("Cooldown Ended");
    spawnCooldown = false;
  }, 10000); // 10 seconds cooldown

  res.sendStatus(200);
});
// GET DATA FROM REACT CLIENT
// CALLED BY UNITY CLIENT
app.get("/api/phantom/new", authenticateToken, (req: Request, res: Response) => {
  const id = (jwt.decode(req.headers.authorization?.split(" ")[1]!) as JwtPayload).userID;
  const room = rooms[id];
  if(room.roomData!.newPhantom) {
    console.log("New phantom sent to Unity Client");
    res.json(room.roomData!.newPhantom);
    room.roomData!.newPhantom = undefined;
  }
  res.json();
});


// ------------------- Server Start -------------------

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});