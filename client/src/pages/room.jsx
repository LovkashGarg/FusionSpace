import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/socket";
import { IoArrowUndo } from "react-icons/io5";
import { IoIosRedo, IoMdCopy } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { IoIosChatboxes } from "react-icons/io";

// import Chatbox from "./chatbox";

import axios from "axios";
import { FaTasks } from "react-icons/fa";
import {
  // useLocation,
  useNavigate,
  useParams,
  // useSearchParams,
} from "react-router-dom";
import FullScreenResponse from "./Response";
const Room = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [openedFile, setOpenedFile] = useState([]);

  const [allFiles, setAllFiles] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  // const [cursors, setCursors] = useState({});
  // const cursorRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl] = useState(window.location.href);

  useEffect(() => {
    // Emit event when the user joins the room
    socket.emit("joinRoom", { userId: socket.id });

    if (socket.id && !collaborators.includes(socket.id)) {
      // setCurrentUser(socket.id);
      socket.emit("userJoined", socket.id);
    }
    // Update collaborators on user join
    socket.on("userJoined", (userId) => {
      setCollaborators((prev) => [...new Set([...prev, userId])]);
    });

    // Remove user from collaborators on disconnect
    socket.on("userLeft", (userId) => {
      setCollaborators((prev) => prev.filter((id) => id !== userId));
    });

    // Listen for content updates from other users
    socket.on("updateContent", (newContent) => {
      setFileContent(newContent);
    });

    // Listen for all files update from server

    // Clean up event listeners on component unmount
    return () => {
      socket.emit("userLeft", socket.id);
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("updateContent"); // Clean up listener on unmount
    };
  }, [socket]);

  useEffect(() => {
    // Listen for the 'filechange' event emitted by the server
    socket.on("filechange", ({ filename, content }) => {
      // Check if the changed file is the current file being viewed
      if (filename === currentFile) {
        // Update the file content for the current file
        setFileContent(content);
      }

      // Optionally, you can update the opened files list or perform other UI updates
      setOpenedFile((prevFiles) => {
        const fileIndex = prevFiles.findIndex((file) => file === filename);
        if (fileIndex === -1) {
          return [...prevFiles, filename];
        }
        return prevFiles;
      });
    });

    // Cleanup on component unmount
    return () => {
      socket.off("filechange");
    };
  }, [currentFile]);

  //   const location=useLocation();
  const [roomID, setRoomId] = useState("");
  const fetchFiles = async (roomID) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/allFilesdata/${roomID}`
      );
      if (response.data.success) {
        setAllFiles(response.data.files);
        setOpenedFile(response.data.files.map((file) => file.filename));

        console.log("Files:", response.data.files);
        return response.data.files;
      } else {
        console.error("No files found:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching files:", error.message);
    }
  };

  useEffect(() => {
    setRoomId(roomId);
    fetchFiles(roomID);
  }, [roomID]);

  useEffect(() => {
    fetchFiles(roomID);
  }, [allFiles]);

  const openChatbox = () => {
    setchatboxdisplay(!chatboxdisplay);
    navigate(`chat`);
    console.log(chatboxdisplay + "the chat box");
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;

        // Update the opened files list, current file, and its content
        setOpenedFile((prev) => [...prev, file.name]);
        setCurrentFile(file.name);
        setFileContent(content);

        // Emit the file content with filename and room ID to the server
        socket.emit("filechange", {
          RoomID: roomID, // Room ID
          filename: file.name, // File name
          content, // File content
        });
      };
      reader.readAsText(file);
    }
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    // Update the content in the current page
    setUndoStack((prevStack) => [...prevStack, fileContent]); // Save current content to the undo stack
    setFileContent(newContent); // Update the displayed content

    // Emit the new content with file name and room ID to the server
    socket.emit("sendContent", {
      roomId, // Room ID
      filename: currentFile, // File name of the active file
      newContent: newContent, // Updated file content
    });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastContent = undoStack[undoStack.length - 1];

      // Update fileContent to the last saved state
      setFileContent(lastContent);

      // Remove the last state from undoStack
      setUndoStack(undoStack.slice(0, -1));

      // Emit the restored content to the server
      socket.emit("sendContent", { lastContent, roomId });
    }
  };

  const openTask = () => {
    navigate(`Tasks`);
  };

  socket.on("fileReceived", (data) => {
    const blob = new Blob([data.fileData], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  const downloadAllFiles = () => {

    allFiles.forEach((file) => {
      // Create a blob from the file content
      const blob = new Blob([file.content], { type: "text/plain" });
  
      // Generate a download URL
      const url = URL.createObjectURL(blob);
      // Create a temporary <a> element
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename; // Set the filename for download
      document.body.appendChild(a);
  
      // Trigger the download
      a.click();
  
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };
  

  const [chatboxdisplay, setchatboxdisplay] = useState(false);

  // const cursorStyle = {
  //   position: "absolute",
  //   width: "10px",
  //   height: "10px",
  //   backgroundColor: "red",
  //   borderRadius: "50%",
  // };

  // const [gitrepo, setgitrepo] = useState();

  async function GenerateAnswer() {
    // console.log(API_URL);
    try {
      setAnswer("Loading ...");
      //   console.log("file me kuch Hai "  + fileContent)
      // console.log(question);
      const res = await axios.post(`http://localhost:5000/api/generate`, {
        contents: [
          {
            parts: [{ text: fileContent + " " + prompt }],
          },
        ],
      });
      //   console.log(res.data);
      // console.log("API Response:", res.data); // Log response to verify structure
      setAnswer(res.data);
      setIsOpen(true);
      setPrompt("");
    } catch (error) {
      setAnswer("An error occurred. Please try again.");
      console.error(
        "Error fetching the answer:",
        error.response ? error.response.data : error.message
      );
    }
  }

  const closeFile = (toclosefile) => {
    setOpenedFile((files) => files.filter((file) => file !== toclosefile));
    if (openedFile.size === 0) {
      setFileContent("");
    }
  };

  return (
    <>
      {" "}
      {isOpen && (
        <FullScreenResponse text={answer} onClose={() => setIsOpen(false)} />
      )}
      <div className="grid grid-cols-12 w-[100%] h-[90vh] ">
        <div className="hidden  sm:block col-span-2 flex flex-col gap-8 py-[10%] bg-slate-600">
          <div className="flex items-center justify-evenly">
            <div className="container mx-auto p-4 flex flex-col align-center justify-center">
              <div className="text-[40px] mt-[-10px]">FusionSpace</div>
              <h1 className="md:text-2xl font-bold mb-4 text-white sm:text-xl">
                Open and View File
              </h1>
              <input
                type="file"
                accept=".html,.js,.cpp,.jsx,.txt,.doc,.md,.gitignore"
                onChange={handleFileChange}
                className="mb-4 border border-gray-300 p-2 rounded "
              />
            </div>
            <div className="bg-red-600 w-[120px] text-white rounded-[20px]">
              New File
            </div>
            <div className="bg-red-600 w-[120px] text-white rounded-[20px]">
              Upload
            </div>
          </div>
          <div className="bg-white text-green-900 mx-[10%] mb-4 px-[7%] rounded-[20px] h-[40px] flex justify-left align-center items-center ">
            All Files
          </div>
          <div className="flex flex-col gap-3 justify-center items-start">
            {openedFile.map((filename, index) => (
              <div
                key={index}
                className={`${
                 filename === currentFile ? "bg-green-600 text-white" : "bg-white text-black"
                } rounded-[20px] w-[200px] overflow-x-hidden h-[30px] text-green-900 mx-[10%] px-[5%]`}
              >
                {filename}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 sm:col-span-8 flex flex-col bg-white">
          <div className="bg-gradient-to-br from-[#1e1e1e] via-[#252526] to-[#1e1e1e] flex justify-evenly items-center gap-5 sm:gap-20 overflow-x-auto">
            {openedFile.map((name, index) => (
              <li key={index} className="list-none">
                <button
                  onClick={async () => {
                    // Set the currently selected file name
                    setCurrentFile(name);

                    // Find the file in the allFiles array by its filename
                    const file = allFiles.find(
                      (file) => file.filename === name
                    );

                    if (file) {
                      console.log("Setting file content:", file.content);

                      // Update the current file content
                      setFileContent(file.content);
                    } else {
                      console.warn("File not found in allFiles:", name);

                      // Optional: Notify the user about the missing file
                      // Example: showToast(`File "${name}" not found.`);
                    }
                  }}
                  className={`${
                    name === currentFile ? "bg-green-600 text-white" : "bg-white text-black"
                  } rounded-[10px] flex items-center gap-4 w-[150px] overflow-x-hidden text-slate-900 m-[5%]  my-[2%] p-[5%] sm:m-[10%] sm:my-[5%] sm:p-[10%]`}
                >
                  {name} <ImCross onClick={() => closeFile(name)} />
                </button>
              </li>
            ))}
          </div>
          <div>
          
          </div>
          <textarea
            value={fileContent}
            onChange={handleChange}
            className="h-[100vh] whitespace-pre-wrap border p-4 bg-gradient-to-br from-[#1e1e1e] via-[#252526] to-[#1e1e1e] min-h-screen text-white rounded"
          />
          <div>
            <textarea
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-slate-600 rounded-[20px] px-3 fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[80%] sm:w-[30%] h-[80px] border-[2px]  border-white flex items-center align-center justify-center text-center  text-white "
              placeholder="Interact with current File"
            />
            <button
              onClick={GenerateAnswer}
              className="fixed bottom-7 text-white bg-green-600 rounded-[20px]  left-1/2 transform -translate-x-1/2 w-[30%] md:w-[15%] h-[40px]"
            >
              {" "}
              Search
            </button>
          </div>
        </div>

        <div className="col-span-2 hidden sm:block bg-slate-600 p-4  shadow-lg text-white space-y-4  md:text-lg">
          <div className="flex items-center justify-center">
            <button
              onClick={openTask}
              className="bg-green-600 flex items-center justify-center  gap-4 w-[80%] text-white h-[40px] "
            >
              <div>Tasks</div> <FaTasks />
            </button>
          </div>
          <div className="font-semibold text-xl">Collaborators</div>
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab}
                className="bg-white text-green-900 px-4 py-2 rounded-lg shadow-md"
              >
                {collab}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span>Sharable Link:</span>
            <span className="bg-slate-700 px-2 py-1 rounded-md text-gray-300 truncate">
              {currentUrl}
            </span>
            <button
              onClick={handleCopy}
              className="text-green-300 hover:text-green-500"
            >
              <IoMdCopy size={24} />
            </button>
            {copied && <span className="text-sm text-green-400">Copied!</span>}
          </div>

          <div className="flex justify-evenly mt-4">
            <button
              onClick={handleUndo}
              className="flex items-center space-x-2 hover:text-green-400"
            >
              <IoArrowUndo size={24} />
              <span>Undo</span>
            </button>
            <button
              onClick={handleUndo}
              className="flex items-center space-x-2 hover:text-green-400"
            >
              <IoIosRedo size={24} />
              <span>Redo</span>
            </button>
          </div>

          {/* <div>
          <div>Download File</div>{" "}
          <input
            value={gitrepo}
            type="Enter git Repo Initialized"
            onChange={(e) => setgitrepo(e.target.value)}
            className="text-black px-2"
          />
        </div> */}

          <div className="flex flex-col align-center justify-center ">
            <div className="text-center text-xl bg-green-600">Select Files</div>
            {openedFile.map((file, index) => {
              return (
                <>
                  <div
                    key={index}
                    className="flex items-center gap-3 justify-left"
                  >
                    <input type="checkbox" />
                    <div>{file}</div>
                  </div>
                </>
              );
            })}

            <div className="flex align-center justify-center mt-2">
            <button onClick={downloadAllFiles} className="bg-blue-500 text-white p-2 rounded">
  Download All Files
</button>

            </div>
          </div>
          <button
            onClick={openChatbox}
            className="fixed bottom-7 right-7 border border-[3px] border-white rounded-[20px] h-[50px] w-[100px] flex items-center justify-center"
          >
            <IoIosChatboxes size={30} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Room;
