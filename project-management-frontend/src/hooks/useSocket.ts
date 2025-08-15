import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useSocket = (roomId: string | null): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io(socketUrl, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // সার্ভারে 'joinProjectRoom' ইভেন্ট পাঠান
    newSocket.emit("joinProjectRoom", roomId);

    return () => {
      // কম্পোনেন্ট আনমাউন্ট হওয়ার সময় 'leaveProjectRoom' ইভেন্ট পাঠান এবং কানেকশন বন্ধ করুন
      newSocket.emit("leaveProjectRoom", roomId);
      newSocket.close();
    };
  }, [roomId]);

  return socket;
};
