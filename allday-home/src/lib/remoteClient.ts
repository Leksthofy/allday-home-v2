import { RemoteCommandType, RemoteCommand, RemoteToastNotification } from "../types";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

type CommandCallback = (cmd: RemoteCommand) => void;
type AnnouncementCallback = (ann: RemoteToastNotification) => void;
type StateCallback = (state: any) => void;
type StatusCallback = (status: ConnectionStatus, connectedCount: number) => void;

export const PAIRING_ROOM_ID = "allday-home-hub";
const LOCAL_BC_CHANNEL = "allday-home-broadcast";

class RemoteClientManager {
  private eventSource: EventSource | null = null;
  private clientId: string = `device_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  private deviceType: "kiosk" | "mobile" = "kiosk";
  private senderName: string = "Celular";
  private roomId: string = PAIRING_ROOM_ID;
  private status: ConnectionStatus = "disconnected";
  private connectedCount: number = 1;
  private bc: BroadcastChannel | null = null;
  private reconnectTimer: any = null;

  private commandListeners: Set<CommandCallback> = new Set();
  private announcementListeners: Set<AnnouncementCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();

  constructor() {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.bc = new BroadcastChannel(LOCAL_BC_CHANNEL);
        this.bc.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingPayload(event.data);
          }
        };
      }
    } catch (e) {
      // BroadcastChannel optional fallback
    }
  }

  public init(deviceType: "kiosk" | "mobile" = "kiosk", senderName: string = "Celular", customRoomId?: string) {
    this.deviceType = deviceType;
    this.senderName = senderName;

    // Check URL for custom room code
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get("room");
      if (roomParam) {
        this.roomId = roomParam;
      } else if (customRoomId) {
        this.roomId = customRoomId;
      }
    }

    this.connect();
  }

  public setSenderName(name: string) {
    this.senderName = name;
  }

  public getSenderName() {
    return this.senderName;
  }

  public getRoomId() {
    return this.roomId;
  }

  public getClientId() {
    return this.clientId;
  }

  public getStatus() {
    return this.status;
  }

  public getConnectedCount() {
    return Math.max(1, this.connectedCount);
  }

  private setStatus(status: ConnectionStatus, count?: number) {
    this.status = status;
    if (typeof count === "number") {
      this.connectedCount = Math.max(1, count);
    }
    this.statusListeners.forEach((cb) => cb(this.status, this.connectedCount));
  }

  public connect() {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      this.setStatus("connected", 1);
      return;
    }

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }

    this.setStatus("connecting");

    try {
      const sseUrl = `/api/remote/events?device=${encodeURIComponent(
        this.deviceType
      )}&clientId=${encodeURIComponent(this.clientId)}&room=${encodeURIComponent(
        this.roomId
      )}`;

      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.setStatus("connected");
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const data = JSON.parse(event.data);
          this.handleIncomingPayload(data);
        } catch (err) {
          // Ignore parse errors on heartbeat
        }
      };

      this.eventSource.onerror = () => {
        // EventSource will automatically retry connection
        if (this.status !== "connecting") {
          this.setStatus("connecting");
        }
      };
    } catch (e) {
      // Fallback to local mode without throwing unhandled exceptions
      this.setStatus("connected", 1);
    }
  }

  private handleIncomingPayload(data: any) {
    if (!data) return;

    // Ignore self-published messages
    if (data.clientId && data.clientId === this.clientId) {
      return;
    }

    if (data.type === "CONNECTED") {
      if (typeof data.connectedDevices === "number") {
        this.setStatus("connected", data.connectedDevices);
      }
    } else if (data.type === "DEVICE_PRESENCE") {
      if (typeof data.connectedDevices === "number") {
        this.setStatus("connected", data.connectedDevices);
      }
    } else if (data.type === "REMOTE_COMMAND") {
      const cmd: RemoteCommand = {
        id: data.id || `cmd_${Date.now()}_${Math.random()}`,
        type: data.command as RemoteCommandType,
        payload: data.payload,
        sender: data.sender || "Dispositivo",
        timestamp: data.timestamp || Date.now(),
      };
      this.commandListeners.forEach((cb) => cb(cmd));
    } else if (data.type === "ANNOUNCEMENT") {
      const ann: RemoteToastNotification = {
        id: data.id || `ann_${Date.now()}`,
        title: data.title || `Aviso de ${data.sender || "Celular"}`,
        message: data.message,
        sender: data.sender || "Celular",
        type: data.announcementType || data.type || "info",
        timestamp: data.timestamp || Date.now(),
      };
      this.announcementListeners.forEach((cb) => cb(ann));
    } else if (data.type === "STATE_UPDATED") {
      this.stateListeners.forEach((cb) => cb(data.state));
    }
  }

  public async sendCommand(command: RemoteCommandType, payload?: any, customSender?: string): Promise<boolean> {
    const sender = customSender || this.senderName;
    const data = {
      type: "REMOTE_COMMAND",
      command,
      payload,
      sender,
      clientId: this.clientId,
      timestamp: Date.now(),
    };

    // 1. Broadcast to local tabs/windows
    if (this.bc) {
      try {
        this.bc.postMessage(data);
      } catch (e) {}
    }

    // 2. Dispatch to server to broadcast to all connected devices via SSE
    try {
      await fetch("/api/remote/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async sendAnnouncement(message: string, type: "info" | "success" | "alert" = "info", customSender?: string): Promise<boolean> {
    const sender = customSender || this.senderName;
    const data = {
      type: "ANNOUNCEMENT",
      title: `Aviso de ${sender}`,
      message,
      sender,
      announcementType: type,
      clientId: this.clientId,
      timestamp: Date.now(),
    };

    if (this.bc) {
      try {
        this.bc.postMessage(data);
      } catch (e) {}
    }

    try {
      await fetch("/api/remote/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async syncSharedState(state: any): Promise<boolean> {
    const data = {
      type: "STATE_UPDATED",
      state,
      sender: this.senderName,
      clientId: this.clientId,
      timestamp: Date.now(),
    };

    if (this.bc) {
      try {
        this.bc.postMessage(data);
      } catch (e) {}
    }

    try {
      await fetch("/api/remote/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async fetchSharedState(): Promise<any> {
    try {
      const res = await fetch("/api/remote/state");
      if (res.ok) {
        const json = await res.json();
        return json.state;
      }
    } catch (e) {}
    return null;
  }

  public onCommand(callback: CommandCallback) {
    this.commandListeners.add(callback);
    return () => this.commandListeners.delete(callback);
  }

  public onAnnouncement(callback: AnnouncementCallback) {
    this.announcementListeners.add(callback);
    return () => this.announcementListeners.delete(callback);
  }

  public onStateUpdate(callback: StateCallback) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  public onStatusChange(callback: StatusCallback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }
    this.setStatus("disconnected");
  }
}

export const remoteClient = new RemoteClientManager();
