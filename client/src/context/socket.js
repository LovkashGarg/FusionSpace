// client/src/context/socket.js
import { createContext } from 'react';
import { io } from 'socket.io-client';

export const socket = io('https://fusionspace.onrender.com'); // Adjust URL as needed
export const SocketContext = createContext();