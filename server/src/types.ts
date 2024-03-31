export class UnityClient {
    userID: string;
    token: string;
    constructor(userID: string, token: string) {
        this.userID = userID;
        this.token = token;
    }
}

export class ReactClient {
    userID: string;
    unityID: string;
    constructor(userID: string, unityID: string) {
        this.userID = userID;
        this.unityID = unityID;
    }
}

export class Room {
    roomID: string;
    unityClient: UnityClient;
    webClients: ReactClient[];
    roomData: RoomData | undefined;
    constructor(roomID: string, unityClient: UnityClient) {
        this.roomID = roomID;
        this.unityClient = unityClient;
        this.webClients = [];
        this.roomData = new RoomData({ x: 0, y: 0, rot: 0 }, { x: 0, y: 0, rot: 0 });
    }

    addWebClient(webClient: ReactClient) {
        this.webClients.push(webClient);
    }

    removeWebClient(webClient: ReactClient) {
        const index = this.webClients.indexOf(webClient);
        if (index !== -1) {
            this.webClients.splice(index, 1);
        }
    }
}

export class RoomData {
    playerPos: PositionData;
    eelPos: PositionData;
    phantomPos: { [key: string]: Phantom };
    newPhantom: Phantom | undefined;
    lastSpawnTime: number;
    constructor(playerPos: PositionData, eelPos: PositionData) {
        this.playerPos = playerPos;
        this.eelPos = eelPos;
        this.phantomPos = {};
        this.lastSpawnTime = Date.now();
    }

    spawnPhantom(phantomPos: Phantom) {
        this.phantomPos[phantomPos.phantomID] = phantomPos;
    }

    removePhantom(phantomPos: Phantom) {
        delete this.phantomPos[phantomPos.phantomID];
    }
}

export class Phantom {
    phantomID: string;
    phantomPos: PositionData;
    constructor(phantomID: string, phantomPos: PositionData) {
        this.phantomID = phantomID;
        this.phantomPos = phantomPos;
    }

}

export class PositionData {
    x: number;
    y: number;
    rot: number;
    constructor(x: number, y: number, rot: number) {
        this.x = x;
        this.y = y;
        this.rot = rot;
    }
}