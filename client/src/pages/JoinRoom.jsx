import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';


const JoinRoom = () => {
    const generateRoomId=()=>{
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const uniqueRoomId = array[0].toString(16).slice(0, 8);
        setRoomId(uniqueRoomId);
    }
  const [roomId, setRoomId] = useState('');
  const [UserName,setUserName]=useState('');

    const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const navigate=useNavigate();
  const handleJoinRoom = () => {
    // Handle joining the room, e.g., redirect to a chat room or trigger a socket event
    console.log('Joining room:', roomId);
    // ...
    localStorage.setItem('UserName',UserName);
    // Use correct query parameter syntax
  navigate(`roomId/roomId=${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-700 gap-4">
      <div className='text-[40px] text-white'>Fusion Space</div>
      <h1 className="text-3xl font-bold mb-4 text-white">Join a Workspace</h1>
      <input
        type="text"
        placeholder="Enter UserName"
        value={UserName}
        onChange={(e)=>setUserName(e.target.value)}
        className="w-full max-w-md p-4 border border-gray-300 rounded-md mb-4"
      />
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={handleRoomIdChange}
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