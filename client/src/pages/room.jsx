import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/socket";
import { IoArrowUndo } from "react-icons/io5";
import { IoIosRedo, IoMdCopy } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { IoIosChatboxes, IoIosClose } from "react-icons/io";
import { FaMale } from "react-icons/fa";
import { FaTasks, FaBars, FaUsers, FaFile } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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
  const [Showactives, setShowactives] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [chatboxdisplay, setchatboxdisplay] = useState(false);
  const [currentUrl] = useState(window.location.href);

  // Mobile drawer state
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  useEffect(() => {
    socket.on("AllFiles", (files) => {
      setAllFiles(files);
      setOpenedFile(files.map((f) => f.filename));
    });
    return () => socket.off("AllFiles");
  }, [socket]);

  const fetchFiles = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/allFilesdata/${id}`
      );
      if (response.data.success) {
        setAllFiles(response.data.files);
        setOpenedFile(response.data.files.map((file) => file.filename));
        return response.data.files;
      }
    } catch (error) {
      console.error("Error fetching files:", error.message);
    }
  };

  useEffect(() => {
    if (roomId) fetchFiles(roomId);
  }, [roomId]);

  useEffect(() => {
    const username = localStorage.getItem("fusionspace_username") || socket.id;
    socket.emit("joinRoom", { roomId, username });
   socket.on("userJoined", ({ userId, username }) => {
  setCollaborators((prev) => {
    const already = prev.find((c) => c.id === userId);
    if (already) return prev;
    return [...prev, { id: userId, username }];
  });
  alert(`${username} joined the room`);
});

    socket.on("userLeft", (userId) => {
      setCollaborators((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("updateContent", ({ filename, content }) => {
      setAllFiles((prev) => {
        const idx = prev.findIndex((f) => f.filename === filename);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content };
        return updated;
      });
      setCurrentFile((cur) => {
        if (filename === cur) setFileContent(content);
        return cur;
      });
    });

    return () => {
      socket.emit("userLeft", socket.id);
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("updateContent");
    };
  }, [socket, roomId]);

  useEffect(() => {
    socket.on("filechange", ({ filename, content }) => {
      if (filename === currentFile) setFileContent(content);
      setAllFiles((prev) => {
        const exists = prev.findIndex((f) => f.filename === filename);
        if (exists === -1) return [...prev, { filename, content }];
        const updated = [...prev];
        updated[exists] = { ...updated[exists], content };
        return updated;
      });
      setOpenedFile((prev) =>
        prev.includes(filename) ? prev : [...prev, filename]
      );
    });
    return () => socket.off("filechange");
  }, [currentFile, socket]);

  useEffect(() => {
    socket.on("fileReceived", (data) => {
      const blob = new Blob([data.fileData], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    return () => socket.off("fileReceived");
  }, [socket]);

  const openChatbox = () => {
    setchatboxdisplay(!chatboxdisplay);
    navigate(`chat`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const updatedAt = Date.now();
        setOpenedFile((prev) =>
          prev.includes(file.name) ? prev : [...prev, file.name]
        );
        setCurrentFile(file.name);
        setFileContent(content);
        socket.emit("filechange", { RoomID: roomId, filename: file.name, content, updatedAt });
        setLeftDrawerOpen(false);
      };
      reader.readAsText(file);
    }
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    const updatedAt = Date.now();
    setUndoStack((prev) => [...prev, fileContent]);
    setRedoStack([]);
    setFileContent(newContent);
    socket.emit("sendContent", { roomId, filename: currentFile, newContent, updatedAt });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastContent = undoStack[undoStack.length - 1];
      const updatedAt = Date.now();
      setRedoStack((prev) => [...prev, fileContent]);
      setFileContent(lastContent);
      setUndoStack(undoStack.slice(0, -1));
      socket.emit("sendContent", { roomId, filename: currentFile, newContent: lastContent, updatedAt });
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      const updatedAt = Date.now();
      setUndoStack((prev) => [...prev, fileContent]);
      setFileContent(nextContent);
      setRedoStack(redoStack.slice(0, -1));
      socket.emit("sendContent", { roomId, filename: currentFile, newContent: nextContent, updatedAt });
    }
  };

  const openTask = () => navigate(`Tasks`);

  const downloadAllFiles = () => {
    allFiles.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const changeShowActives = () => setShowactives(!Showactives);

  async function GenerateAnswer() {
    try {
      setAnswer("Loading ...");
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/generate`,
        { contents: [{ parts: [{ text: fileContent + " " + prompt }] }] }
      );
      setAnswer(res.data);
      setIsOpen(true);
      setPrompt("");
    } catch (error) {
      setAnswer("An error occurred. Please try again.");
    }
  }

  const closeFile = (toclosefile) => {
    setOpenedFile((files) => files.filter((file) => file !== toclosefile));
    if (currentFile === toclosefile) {
      setFileContent("");
      setCurrentFile("");
    }
  };

  const FilesSidebarContent = () => (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-white tracking-tight">FusionSpace</span>
        <button className="sm:hidden text-slate-300 hover:text-white" onClick={() => setLeftDrawerOpen(false)}>
          <IoIosClose size={26} />
        </button>
      </div>

      <label className="flex flex-col gap-1 cursor-pointer">
        <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Open File</span>
        <input
          type="file"
          accept=".html,.js,.cpp,.jsx,.txt,.doc,.md,.gitignore"
          onChange={handleFileChange}
          className="text-sm text-slate-300
            file:mr-2 file:py-1.5 file:px-3
            file:rounded-lg file:border-0
            file:text-xs file:font-medium
            file:bg-green-600 file:text-white
            hover:file:bg-green-700 file:cursor-pointer
            file:transition-colors"
        />
      </label>
  
  <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
  <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Files</span>
  {allFiles.length === 0 && (
    <p className="text-slate-500 text-sm italic">No files open</p>
  )}
  {allFiles.map((file, index) => (   // <-- allFiles not openedFile
    <button
      key={index}
      onClick={() => {
        setCurrentFile(file.filename);
        setFileContent(file.content);
        setOpenedFile((prev) =>       // <-- also open it as a tab if not already
          prev.includes(file.filename) ? prev : [...prev, file.filename]
        );
        setLeftDrawerOpen(false);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all w-full ${
        file.filename === currentFile
          ? "bg-green-600 text-white"
          : "bg-slate-700/60 text-slate-300 hover:bg-slate-600"
      }`}
    >
      <FaFile size={10} className="shrink-0 opacity-60" />
      <span className="truncate">{file.filename}</span>  {/* <-- file.filename not filename */}
    </button>
  ))}
</div>
</div>
  );
  const RightSidebarContent = () => (
    <div className="flex flex-col h-full gap-5 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-widest">Room Tools</span>
        <button className="sm:hidden text-slate-300 hover:text-white" onClick={() => setRightDrawerOpen(false)}>
          <IoIosClose size={26} />
        </button>
      </div>

      <button
        onClick={openTask}
        className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 w-full text-white h-10 rounded-lg text-sm font-medium transition-colors"
      >
        <FaTasks size={14} /> Tasks
      </button>

      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg h-9 text-sm transition-colors text-slate-200"
        >
          <IoArrowUndo size={14} /> Undo
        </button>
        <button
          onClick={handleRedo}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg h-9 text-sm transition-colors text-slate-200"
        >
          <IoIosRedo size={14} /> Redo
        </button>
      </div>

   <div>
  <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Collaborators</p>
  <div className="flex flex-col gap-1.5">
    {collaborators.length === 0 ? (
      <p className="text-slate-500 text-sm italic">Only you here</p>
    ) : (
      collaborators.map((collab) => (
        <div key={collab.id} className="bg-slate-700/60 text-slate-200 px-3 py-2 rounded-lg text-xs truncate">
          {collab.username}
        </div>
      ))
    )}
  </div>
</div>

      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Share Link</p>
        <div className="flex items-center gap-2 bg-slate-700/60 rounded-lg px-3 py-2 border border-slate-600">
          <span className="text-slate-300 text-xs truncate flex-1">{currentUrl}</span>
          <button onClick={handleCopy} className="text-green-400 hover:text-green-300 shrink-0 transition-colors">
            <IoMdCopy size={16} />
          </button>
        </div>
        {copied && <span className="text-xs text-green-400 mt-1 block">Copied!</span>}
      </div>

      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Download</p>
        <div className="flex flex-col gap-1.5 mb-3">
          {openedFile.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="checkbox" className="accent-green-500" />
              <span className="text-sm text-slate-300 truncate">{file}</span>
            </div>
          ))}
        </div>
        <button
          onClick={downloadAllFiles}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors font-medium"
        >
          Download All Files
        </button>
      </div>

      <button
        onClick={openChatbox}
        className="flex items-center justify-center gap-2 border border-slate-500 hover:border-white rounded-xl h-11 text-slate-300 hover:text-white transition-colors mt-auto text-sm"
      >
        <IoIosChatboxes size={18} /> Open Chat
      </button>
    </div>
  );

  return (
    <>
      {isOpen && (
        <FullScreenResponse text={answer} onClose={() => setIsOpen(false)} />
      )}

      {/* Backdrop for mobile drawers */}
      {(leftDrawerOpen || rightDrawerOpen) && (
        <div
          className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm"
          onClick={() => { setLeftDrawerOpen(false); setRightDrawerOpen(false); }}
        />
      )}

      {/* Mobile left drawer (files) */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-slate-800 z-40 transform transition-transform duration-300 ease-in-out sm:hidden shadow-2xl ${leftDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <FilesSidebarContent />
      </div>

      {/* Mobile right drawer (tools) */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-slate-800 z-40 transform transition-transform duration-300 ease-in-out sm:hidden shadow-2xl ${rightDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <RightSidebarContent />
      </div>

      {/* Main layout */}
      <div className="flex h-screen overflow-hidden bg-[#1e1e1e] text-white">

        {/* Desktop left sidebar */}
        <div className="hidden sm:flex w-52 shrink-0 bg-slate-800 border-r border-slate-700 flex-col">
          <FilesSidebarContent />
        </div>

        {/* Center: editor column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Mobile top bar */}
          <div className="flex sm:hidden items-center justify-between px-3 h-12 bg-slate-900 border-b border-slate-700 shrink-0">
            <button onClick={() => setLeftDrawerOpen(true)} className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <FaBars size={18} />
            </button>
            <span className="text-sm font-medium text-slate-200 truncate max-w-[160px]">
              {currentFile || "FusionSpace"}
            </span>
            <button onClick={() => setRightDrawerOpen(true)} className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <FaUsers size={18} />
            </button>
          </div>

          {/* File tabs */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-[#252526] border-b border-slate-700 overflow-x-auto shrink-0"
            style={{ scrollbarWidth: "none" }}>
            {openedFile.length === 0 && (
              <span className="text-slate-500 text-xs px-2 italic">No files open</span>
            )}
            {openedFile.map((name, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs whitespace-nowrap cursor-pointer shrink-0 transition-all select-none group ${
                  name === currentFile
                    ? "bg-green-700 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => {
                  setCurrentFile(name);
                  const file = allFiles.find((f) => f.filename === name);
                  if (file) setFileContent(file.content);
                }}
              >
                <span className="max-w-[100px] truncate">{name}</span>

                <button
                  onClick={(e) => { e.stopPropagation(); changeShowActives(); }}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="Active users"
                >
                  <FaMale size={10} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); closeFile(name); }}
                  className="opacity-40 hover:opacity-100 hover:text-red-400 transition-all"
                >
                  <ImCross size={8} />
                </button>

                {Showactives && name === currentFile && (
                  <div className="absolute top-8 left-0 bg-slate-800 border border-slate-600 rounded-lg p-2 z-20 text-xs text-white shadow-xl min-w-[100px]">
                    <div className="py-0.5">Lovkash</div>
                    <div className="py-0.5">Rahul</div>
                    <div className="py-0.5">Aman</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Code editor */}
          <textarea
            value={fileContent}
            onChange={handleChange}
            className="flex-1 w-full p-4 bg-[#1e1e1e] text-slate-100 font-mono text-sm resize-none outline-none leading-relaxed"
            placeholder={currentFile ? "" : "← Open a file to start editing"}
            spellCheck={false}
          />

          {/* AI prompt bar — pinned to bottom of editor */}
          <div className="shrink-0 flex items-end gap-2 px-3 py-2 bg-[#252526] border-t border-slate-700">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none outline-none border border-slate-600 focus:border-green-500 transition-colors placeholder-slate-400 leading-relaxed"
              placeholder="Ask AI about this file… (Enter to send)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  GenerateAnswer();
                }
              }}
            />
            <button
              onClick={GenerateAnswer}
              className="shrink-0 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-lg px-4 h-[60px] text-sm font-medium transition-all"
            >
              Ask
            </button>
          </div>
        </div>

        {/* Desktop right sidebar */}
        <div className="hidden sm:flex w-52 shrink-0 bg-slate-800 border-l border-slate-700 flex-col">
          <RightSidebarContent />
        </div>
      </div>
    </>
  );
};

export default Room;