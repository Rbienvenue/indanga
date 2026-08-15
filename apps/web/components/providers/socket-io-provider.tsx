"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

function getSocketUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://indanga-api-tau.vercel.app";
}

export function SocketIoProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
    }),
    [isConnected],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketIo() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketIo must be used within SocketIoProvider");
  }

  return context;
}
