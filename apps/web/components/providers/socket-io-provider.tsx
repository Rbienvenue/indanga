"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { API_BASE_URL } from "@/lib/api-url";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  addConsumer: () => () => void;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

function getSocketUrl() {
  return API_BASE_URL;
}

export function SocketIoProvider({ children }: { children: React.ReactNode }) {
  const [consumerCount, setConsumerCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const shouldConnect = consumerCount > 0;

  const addConsumer = useCallback(() => {
    setConsumerCount((count) => count + 1);

    return () => {
      setConsumerCount((count) => Math.max(0, count - 1));
    };
  }, []);

  useEffect(() => {
    if (!shouldConnect) return;

    const nextSocket = io(getSocketUrl(), {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(nextSocket);

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [shouldConnect]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      addConsumer,
    }),
    [addConsumer, isConnected, socket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketIo(enabled = true) {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketIo must be used within SocketIoProvider");
  }

  const { addConsumer } = context;
  useEffect(() => {
    if (!enabled) return;
    return addConsumer();
  }, [addConsumer, enabled]);

  return context;
}
