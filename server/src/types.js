"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionData = exports.Phantom = exports.RoomData = exports.Room = exports.ReactClient = exports.UnityClient = void 0;
class UnityClient {
    constructor(userID, token) {
        this.userID = userID;
        this.token = token;
    }
}
exports.UnityClient = UnityClient;
class ReactClient {
    constructor(userID, unityID) {
        this.userID = userID;
        this.unityID = unityID;
    }
}
exports.ReactClient = ReactClient;
class Room {
    constructor(roomID, unityClient) {
        this.roomID = roomID;
        this.unityClient = unityClient;
        this.webClients = [];
        this.roomData = new RoomData({ x: 0, y: 0, rot: 0 }, { x: 0, y: 0, rot: 0 });
    }
    addWebClient(webClient) {
        this.webClients.push(webClient);
    }
    removeWebClient(webClient) {
        const index = this.webClients.indexOf(webClient);
        if (index !== -1) {
            this.webClients.splice(index, 1);
        }
    }
}
exports.Room = Room;
class RoomData {
    constructor(playerPos, eelPos) {
        this.playerPos = playerPos;
        this.eelPos = eelPos;
        this.phantomPos = {};
        this.lastSpawnTime = Date.now();
    }
    spawnPhantom(phantomPos) {
        this.phantomPos[phantomPos.phantomID] = phantomPos;
    }
    removePhantom(phantomPos) {
        delete this.phantomPos[phantomPos.phantomID];
    }
}
exports.RoomData = RoomData;
class Phantom {
    constructor(phantomID, phantomPos) {
        this.phantomID = phantomID;
        this.phantomPos = phantomPos;
    }
}
exports.Phantom = Phantom;
class PositionData {
    constructor(x, y, rot) {
        this.x = x;
        this.y = y;
        this.rot = rot;
    }
}
exports.PositionData = PositionData;
