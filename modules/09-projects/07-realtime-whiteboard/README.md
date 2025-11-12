# Project 7: Real-time Collaborative Whiteboard

Build a real-time collaborative whiteboard using TypeScript, WebSockets, Canvas API, and React.

## Overview

Create a collaborative drawing application with:
- Real-time multi-user collaboration
- Drawing tools (pen, shapes, text)
- Layer management
- Undo/redo functionality
- Export to image/PDF
- Room-based collaboration
- Presence indicators

**Duration:** 3-4 weeks
**Difficulty:** ⭐⭐⭐⭐⭐ (Expert)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│          React Frontend (Canvas)                │
│        (Drawing UI + WebSocket Client)          │
└──────────────────┬──────────────────────────────┘
                   │
                   │ WebSocket
                   │
┌──────────────────▼──────────────────────────────┐
│           WebSocket Server (Socket.io)          │
│         (Broadcast drawing events)              │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│ Redis  │    │Postgres│    │  S3    │
│ Pub/Sub│    │ Rooms  │    │ Export │
└────────┘    └────────┘    └────────┘
```

---

## Tech Stack

### Frontend
- **React** - UI framework
- **Canvas API** - Drawing
- **Fabric.js** - Canvas manipulation
- **Socket.io Client** - Real-time communication
- **Zustand** - State management
- **React Konva** - Alternative canvas library

### Backend
- **Node.js + Express** - HTTP server
- **Socket.io** - WebSocket server
- **Redis** - Pub/Sub for scaling
- **PostgreSQL** - Room persistence
- **Sharp** - Image processing

---

## Project Structure

```
whiteboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── UserList.tsx
│   │   ├── hooks/
│   │   │   ├── useCanvas.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useDrawing.ts
│   │   ├── stores/
│   │   │   └── whiteboardStore.ts
│   │   ├── types/
│   │   │   └── drawing.ts
│   │   └── App.tsx
│   └── package.json
└── backend/
    ├── src/
    │   ├── server.ts
    │   ├── socket/
    │   │   ├── socketHandler.ts
    │   │   └── roomManager.ts
    │   ├── services/
    │   │   ├── drawingService.ts
    │   │   └── exportService.ts
    │   └── types/
    │       └── events.ts
    └── package.json
```

---

## Setup

### Frontend Setup

```bash
npm create vite@latest whiteboard-frontend -- --template react-ts
cd whiteboard-frontend

npm install fabric socket.io-client zustand
npm install react-color @types/react-color
npm install html2canvas jspdf
```

### Backend Setup

```bash
mkdir whiteboard-backend && cd whiteboard-backend
npm init -y

npm install express socket.io redis ioredis
npm install prisma @prisma/client
npm install sharp cors dotenv
npm install -D typescript @types/node @types/express
npm install -D @types/socket.io tsx nodemon
```

---

## Drawing Types

```typescript
// shared/types/drawing.ts
export type DrawingTool =
  | 'pen'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'eraser'
  | 'select';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingObject {
  id: string;
  type: DrawingTool;
  points?: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  userId: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  objects: DrawingObject[];
  createdAt: Date;
}
```

---

## WebSocket Events

```typescript
// shared/types/events.ts
export interface ServerToClientEvents {
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'cursor-move': (data: { userId: string; position: Point }) => void;
  'draw-start': (data: DrawingObject) => void;
  'draw-update': (data: DrawingObject) => void;
  'draw-end': (data: DrawingObject) => void;
  'object-added': (object: DrawingObject) => void;
  'object-updated': (object: DrawingObject) => void;
  'object-deleted': (objectId: string) => void;
  'clear-canvas': () => void;
  'room-state': (state: { users: User[]; objects: DrawingObject[] }) => void;
}

export interface ClientToServerEvents {
  'join-room': (data: { roomId: string; userName: string }) => void;
  'leave-room': (roomId: string) => void;
  'cursor-move': (position: Point) => void;
  'draw-start': (data: Omit<DrawingObject, 'id' | 'userId' | 'timestamp'>) => void;
  'draw-update': (data: DrawingObject) => void;
  'draw-end': (data: DrawingObject) => void;
  'add-object': (object: Omit<DrawingObject, 'id' | 'userId' | 'timestamp'>) => void;
  'update-object': (object: DrawingObject) => void;
  'delete-object': (objectId: string) => void;
  'clear-canvas': () => void;
}
```

---

## Backend: Socket Handler

```typescript
// backend/src/socket/socketHandler.ts
import { Server, Socket } from 'socket.io';
import { RoomManager } from './roomManager';
import { DrawingObject, User } from '../../shared/types/drawing';

export class SocketHandler {
  private roomManager: RoomManager;

  constructor(private io: Server) {
    this.roomManager = new RoomManager();
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      this.handleJoinRoom(socket);
      this.handleLeaveRoom(socket);
      this.handleCursorMove(socket);
      this.handleDrawing(socket);
      this.handleObjects(socket);
      this.handleClearCanvas(socket);
      this.handleDisconnect(socket);
    });
  }

  private handleJoinRoom(socket: Socket) {
    socket.on('join-room', async ({ roomId, userName }) => {
      // Join room
      socket.join(roomId);

      // Create user
      const user: User = {
        id: socket.id,
        name: userName,
        color: this.generateUserColor(),
      };

      // Add user to room
      await this.roomManager.addUser(roomId, user);

      // Get current room state
      const room = await this.roomManager.getRoom(roomId);

      // Send current state to new user
      socket.emit('room-state', {
        users: room.users,
        objects: room.objects,
      });

      // Notify others
      socket.to(roomId).emit('user-joined', user);

      console.log(`User ${userName} joined room ${roomId}`);
    });
  }

  private handleLeaveRoom(socket: Socket) {
    socket.on('leave-room', async (roomId) => {
      socket.leave(roomId);
      await this.roomManager.removeUser(roomId, socket.id);
      socket.to(roomId).emit('user-left', socket.id);
    });
  }

  private handleCursorMove(socket: Socket) {
    socket.on('cursor-move', (position) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(roomId => {
        socket.to(roomId).emit('cursor-move', {
          userId: socket.id,
          position,
        });
      });
    });
  }

  private handleDrawing(socket: Socket) {
    socket.on('draw-start', async (data) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      const drawingObject: DrawingObject = {
        ...data,
        id: this.generateId(),
        userId: socket.id,
        timestamp: Date.now(),
      };

      rooms.forEach(roomId => {
        socket.to(roomId).emit('draw-start', drawingObject);
      });
    });

    socket.on('draw-update', (data) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(roomId => {
        socket.to(roomId).emit('draw-update', data);
      });
    });

    socket.on('draw-end', async (data) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      // Save object to room
      rooms.forEach(async roomId => {
        await this.roomManager.addObject(roomId, data);
        socket.to(roomId).emit('draw-end', data);
      });
    });
  }

  private handleObjects(socket: Socket) {
    socket.on('add-object', async (data) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      const object: DrawingObject = {
        ...data,
        id: this.generateId(),
        userId: socket.id,
        timestamp: Date.now(),
      };

      rooms.forEach(async roomId => {
        await this.roomManager.addObject(roomId, object);
        this.io.to(roomId).emit('object-added', object);
      });
    });

    socket.on('update-object', async (data) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(async roomId => {
        await this.roomManager.updateObject(roomId, data);
        socket.to(roomId).emit('object-updated', data);
      });
    });

    socket.on('delete-object', async (objectId) => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(async roomId => {
        await this.roomManager.deleteObject(roomId, objectId);
        this.io.to(roomId).emit('object-deleted', objectId);
      });
    });
  }

  private handleClearCanvas(socket: Socket) {
    socket.on('clear-canvas', async () => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(async roomId => {
        await this.roomManager.clearObjects(roomId);
        this.io.to(roomId).emit('clear-canvas');
      });
    });
  }

  private handleDisconnect(socket: Socket) {
    socket.on('disconnect', async () => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      rooms.forEach(async roomId => {
        await this.roomManager.removeUser(roomId, socket.id);
        socket.to(roomId).emit('user-left', socket.id);
      });

      console.log(`User disconnected: ${socket.id}`);
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserColor(): string {
    const colors = [
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
```

---

## Room Manager

```typescript
// backend/src/socket/roomManager.ts
import { Room, User, DrawingObject } from '../../shared/types/drawing';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  async getRoom(roomId: string): Promise<Room> {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: roomId,
        users: [],
        objects: [],
        createdAt: new Date(),
      });
    }

    return this.rooms.get(roomId)!;
  }

  async addUser(roomId: string, user: User): Promise<void> {
    const room = await this.getRoom(roomId);
    room.users.push(user);
  }

  async removeUser(roomId: string, userId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    room.users = room.users.filter(u => u.id !== userId);

    // Clean up empty rooms
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  async addObject(roomId: string, object: DrawingObject): Promise<void> {
    const room = await this.getRoom(roomId);
    room.objects.push(object);
  }

  async updateObject(roomId: string, object: DrawingObject): Promise<void> {
    const room = await this.getRoom(roomId);
    const index = room.objects.findIndex(o => o.id === object.id);

    if (index !== -1) {
      room.objects[index] = object;
    }
  }

  async deleteObject(roomId: string, objectId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    room.objects = room.objects.filter(o => o.id !== objectId);
  }

  async clearObjects(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    room.objects = [];
  }
}
```

---

## Frontend: Canvas Component

```typescript
// frontend/src/components/Canvas.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useSocket } from '../hooks/useSocket';
import { DrawingTool, Point } from '../types/drawing';

interface Props {
  roomId: string;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
}

export function Canvas({ roomId, tool, color, strokeWidth }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObject, setCurrentObject] = useState<any>(null);

  const socket = useSocket(roomId);
  const canvas = useCanvas(canvasRef);

  useEffect(() => {
    if (!socket || !canvas) return;

    // Listen for remote drawing events
    socket.on('draw-start', (object) => {
      canvas.startDrawing(object);
    });

    socket.on('draw-update', (object) => {
      canvas.updateDrawing(object);
    });

    socket.on('draw-end', (object) => {
      canvas.finishDrawing(object);
    });

    socket.on('object-added', (object) => {
      canvas.addObject(object);
    });

    socket.on('cursor-move', ({ userId, position }) => {
      canvas.updateCursor(userId, position);
    });

    return () => {
      socket.off('draw-start');
      socket.off('draw-update');
      socket.off('draw-end');
      socket.off('object-added');
      socket.off('cursor-move');
    };
  }, [socket, canvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDrawing(true);

    const obj = canvas?.startLocalDrawing(tool, point, color, strokeWidth);
    setCurrentObject(obj);

    socket?.emit('draw-start', obj);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Send cursor position
    socket?.emit('cursor-move', point);

    if (isDrawing && currentObject) {
      const updated = canvas?.updateLocalDrawing(currentObject, point);

      if (updated) {
        socket?.emit('draw-update', updated);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentObject) {
      canvas?.finishLocalDrawing(currentObject);
      socket?.emit('draw-end', currentObject);
    }

    setIsDrawing(false);
    setCurrentObject(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        border: '1px solid #ccc',
        cursor: getCursor(tool),
      }}
    />
  );
}

function getCursor(tool: DrawingTool): string {
  switch (tool) {
    case 'pen':
    case 'line':
      return 'crosshair';
    case 'eraser':
      return 'not-allowed';
    case 'text':
      return 'text';
    case 'select':
      return 'default';
    default:
      return 'crosshair';
  }
}
```

---

## Canvas Hook

```typescript
// frontend/src/hooks/useCanvas.ts
import { useRef, useEffect } from 'react';
import { DrawingTool, Point, DrawingObject } from '../types/drawing';

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const objectsRef = useRef<DrawingObject[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    contextRef.current = ctx;
  }, [canvasRef]);

  const startLocalDrawing = (
    tool: DrawingTool,
    point: Point,
    color: string,
    strokeWidth: number
  ): DrawingObject => {
    const object: DrawingObject = {
      id: generateId(),
      type: tool,
      points: [point],
      stroke: color,
      strokeWidth,
      userId: 'local',
      timestamp: Date.now(),
    };

    return object;
  };

  const updateLocalDrawing = (object: DrawingObject, point: Point): DrawingObject => {
    object.points!.push(point);
    redraw();
    return object;
  };

  const finishLocalDrawing = (object: DrawingObject) => {
    objectsRef.current.push(object);
    redraw();
  };

  const addObject = (object: DrawingObject) => {
    objectsRef.current.push(object);
    redraw();
  };

  const redraw = () => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all objects
    objectsRef.current.forEach(obj => {
      drawObject(ctx, obj);
    });
  };

  const drawObject = (ctx: CanvasRenderingContext2D, obj: DrawingObject) => {
    ctx.strokeStyle = obj.stroke || '#000000';
    ctx.lineWidth = obj.strokeWidth || 2;

    switch (obj.type) {
      case 'pen':
        drawPath(ctx, obj.points!);
        break;
      case 'line':
        drawLine(ctx, obj.points![0], obj.points![obj.points!.length - 1]);
        break;
      case 'rectangle':
        drawRectangle(ctx, obj.points![0], obj.points![obj.points!.length - 1]);
        break;
      case 'circle':
        drawCircle(ctx, obj.points![0], obj.points![obj.points!.length - 1]);
        break;
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  };

  const drawLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    ctx.strokeRect(start.x, start.y, width, height);
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  return {
    startLocalDrawing,
    updateLocalDrawing,
    finishLocalDrawing,
    addObject,
    startDrawing: addObject,
    updateDrawing: (obj: DrawingObject) => redraw(),
    finishDrawing: addObject,
    updateCursor: () => {},
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## Running the Project

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Open http://localhost:5173
```

---

## Next Steps

1. Add layers support
2. Implement undo/redo with history
3. Add image upload and embedding
4. Export to PNG/PDF
5. Add authentication
6. Implement room permissions
7. Add zoom and pan
8. Deploy to production

**Estimated Time:** 3-4 weeks

---

## Resources

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Fabric.js](http://fabricjs.com/)
- [React Konva](https://konvajs.org/docs/react/)
