import { Socket } from 'socket.io';

export class UnityClient {
    userID: string;
    token: string;
    socket: Socket | undefined;
    constructor(userID: string, token: string) {
        this.userID = userID;
        this.token = token;
    }
}

export class ReactClient {
    unityID: string;
    socket: Socket;
    constructor(unityID: string, socket: Socket) {
        this.unityID = unityID;
        this.socket = socket;
    }
}

export class Room {
    roomID: string;
    unityClient: UnityClient;
    webClients: ReactClient[];
    constructor(roomID: string, unityClient: UnityClient) {
        this.roomID = roomID;
        this.unityClient = unityClient;
        this.webClients = [];
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