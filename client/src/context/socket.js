// client/src/context/socket.js
import { createContext } from 'react';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:4000'); // Adjust URL as needed
export const SocketContext = createContext();