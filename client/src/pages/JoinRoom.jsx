import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [UserName, setUserName] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    setRoomId(array[0].toString(16).slice(0, 8));
  };

  const handleJoinRoom = () => {
    if (!UserName.trim() || !roomId.trim()) return;
    localStorage.setItem('fusionspace_username', UserName.trim());
    navigate(`/roomId/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-700 gap-4">
      <div className='text-[40px] text-white'>Fusion Space</div>
      <h1 className="text-3xl font-bold mb-4 text-white">Join a Workspace</h1>
      <input
        type="text"
        placeholder="Enter UserName"
        value={UserName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full max-w-md p-4 border border-gray-300 rounded-md mb-4"
      />
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full max-w-md p-4 border border-gray-300 rounded-md mb-4"
      />
      <button
        onClick={handleJoinRoom}
        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded"
      >
        Join Room
      </button>
      <button
        onClick={generateRoomId}
        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded"
      >
        Create Room
      </button>
    </div>
  );
};

export default JoinRoom;