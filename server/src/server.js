"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const types_1 = require("./types");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.KEY;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/build')));
const httpServer = (0, http_1.createServer)(app);
// ------------------- Global Variables -------------------
const roomCodeToUnityID = {};
const rooms = {};
const uClients = {};
const rClients = {};
// ------------------- Helper Functions -------------------
const genRoomCode = () => {
    let roomCode = Math.floor(10000000 + Math.random() * 90000000);
    while (roomCodeToUnityID[roomCode]) {
        roomCode = Math.floor(10000000 + Math.random() * 90000000);
    }
    return roomCode;
};
function isValidJWT(token) {
    return __awaiter(this, void 0, void 0, function* () {
        jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return false;
            }
            return true;
        });
    });
}
// ------------------- Authorization Middleware -------------------
const authenticateToken = (req, res, next) => {
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
    if (!isValidJWT(token)) {
        return res.status(403).send('Access Forbidden');
    }
    next();
};
// ------------------- Authentication Calls -------------------
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'client/build/index.html'));
});
app.get("/api", (req, res) => {
    res.send("Server is running");
});
app.post("/api/token", (req, res) => {
    const { userID, key } = req.body;
    if (!(key === SECRET_KEY)) {
        return res.status(401).send('Invalid key');
    }
    const token = jsonwebtoken_1.default.sign({ userID: userID, }, SECRET_KEY, { expiresIn: '1h' });
    const uClient = new types_1.UnityClient(userID, token);
    const newRoom = new types_1.Room(userID, uClient);
    rooms[newRoom.roomID] = newRoom;
    roomCodeToUnityID[genRoomCode()] = userID;
    console.log("Creating Room");
    res.json(token);
});
app.get("/api/verify", authenticateToken, (req, res) => {
    res.send("Token Verified");
});
app.get("/api/room/join", (req, res) => {
    console.log("Joining Room");
    const unityIDs = Object.keys(rooms);
    if (unityIDs.length === 0) {
        console.log("No rooms available");
        return res.status(404).send("No rooms available");
    }
    const randomUnityID = unityIDs[Math.floor(Math.random() * unityIDs.length)];
    const rClientID = crypto.randomUUID();
    const rClient = new types_1.ReactClient(rClientID, randomUnityID);
    rClients[rClientID] = rClient;
    rooms[randomUnityID].addWebClient(rClient);
    res.json({ id: rClientID, roomID: randomUnityID });
});
app.get("/api/room/verify", (req, res) => {
    console.log("Verifying Room");
    const { rClient, roomID } = req.body;
    if (rClients[rClient] && rClients[rClient].unityID === roomID) {
        res.sendStatus(200);
    }
    else {
        console.log("Invalid Room Join");
        res.sendStatus(403);
    }
});
app.get("/api/room/close", authenticateToken, (req, res) => {
    var _a;
    console.log("Closing Room");
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const room = rooms[id];
    delete uClients[room.unityClient.userID];
    for (const webClient of room.webClients) {
        delete rClients[webClient.userID];
    }
    delete rooms[id];
});
// ------------------- Game State Calls -------------------
// POST BY UNITY CLIENT
app.post("/api/pos/player", authenticateToken, (req, res) => {
    var _a;
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const { playerPos } = req.body;
    const room = rooms[id];
    if (room.roomData === undefined) {
        return res.status(404).send("Room Data Not Found");
    }
    room.roomData.playerPos = playerPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/player", (req, res) => {
    console.log("Getting Player Pos:" + JSON.stringify(req.params));
    const { rClient } = req.body;
    console.log("Getting Player Pos: " + rClient);
    if (!rClients[rClient]) {
        return res.status(403).send("Invalid Client");
    }
    const room = rooms[rClients[rClient].unityID];
    res.json(room.roomData.playerPos);
});
// POST BY UNITY CLIENT
app.post("/api/pos/eel", authenticateToken, (req, res) => {
    var _a;
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const { eelPos } = req.body;
    const room = rooms[id];
    room.roomData.eelPos = eelPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/eel", (req, res) => {
    const { rClient } = req.body;
    const room = rooms[rClients[rClient].unityID];
    res.json(room.roomData.eelPos);
});
// POST BY UNITY CLIENT
app.post("/api/pos/phantom", authenticateToken, (req, res) => {
    var _a;
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const { phantomID, phantomPos } = req.body;
    const room = rooms[id];
    room.roomData.phantomPos[phantomID].phantomPos = phantomPos;
});
// GET DATA FROM UNITY CLIENT
// CALLED BY REACT CLIENT
app.get("/api/pos/phantom", (req, res) => {
    const { rClient } = req.body;
    const room = rooms[rClients[rClient].unityID];
    res.json(room.roomData.phantomPos);
});
// POST BY UNITY CLIENT
app.post("/api/phantom/remove", authenticateToken, (req, res) => {
    var _a;
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const { phantomID, phantomPos } = req.body;
    const room = rooms[id];
    room.roomData.removePhantom(phantomID);
});
// POST BY REACT CLIENT
let spawnCooldown = false;
app.post("/api/phantom/spawn", (req, res) => {
    const { rClient, phantomPos } = req.body;
    if (!rClients[rClient]) {
        return res.status(403).send("Invalid Client");
    }
    if (phantomPos.x < 0 || phantomPos.x > 1 || phantomPos.y < 0 || phantomPos.y > 1) {
        return res.status(400).send("Invalid Position");
    }
    const room = rooms[rClients[rClient].unityID];
    if (room === undefined) {
        delete rClients[rClient];
        console.log(rClients);
        return res.status(404).send("Room Data Not Found");
    }
    if (spawnCooldown) {
        const cooldownTimeLeft = 10000 - (Date.now() - room.roomData.lastSpawnTime);
        return res.status(429).json({ cooldownTimeLeft });
    }
    const phantom = new types_1.Phantom(crypto.randomUUID(), phantomPos);
    room.roomData.newPhantom = phantom;
    console.log(JSON.stringify(room.roomData.newPhantom));
    room.roomData.spawnPhantom(phantom);
    spawnCooldown = true;
    setTimeout(() => {
        console.log("Cooldown Ended");
        spawnCooldown = false;
    }, 10000); // 10 seconds cooldown
    res.sendStatus(200);
});
// GET DATA FROM REACT CLIENT
// CALLED BY UNITY CLIENT
app.get("/api/phantom/new", authenticateToken, (req, res) => {
    var _a;
    const id = jsonwebtoken_1.default.decode((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]).userID;
    const room = rooms[id];
    if (room.roomData.newPhantom) {
        console.log("New phantom sent to Unity Client");
        res.json(room.roomData.newPhantom);
        room.roomData.newPhantom = undefined;
    }
    res.json();
});
// ------------------- Server Start -------------------
httpServer.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
