import { Server } from "socket.io";
//establish the connection
let io = null;
export const establishSocketConnection = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  return io;
};

export const getSocket = () => {
  return io;
};
