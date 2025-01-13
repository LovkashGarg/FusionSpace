// src/Router.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Room from './pages/room'; // Ensure the import path is correct
import JoinRoom from './pages/JoinRoom';
// import About from './pages/About'; // Example additional page
// import NotFound from './pages/NotFound'; // Example for a 404 Not Found page
import { SocketContext, socket } from './context/socket';
import Chatbox from './pages/chatbox';
import TasksDashboard from './pages/Tasks'
const App = () => {
  return (

<SocketContext.Provider value={socket}>
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/roomId/:roomId" element={<Room/>} />
        <Route path="/roomId/:roomId/chat" element={<Chatbox />} />
        <Route path="/roomId/:roomId/Tasks" element={<TasksDashboard />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
    </SocketContext.Provider>
  );
};

export default App;
