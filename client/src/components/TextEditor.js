// client/src/components/TextEditor.js
import React, { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/socket';

function TextEditor() {
    const socket = useContext(SocketContext);
    const [content, setContent] = useState('');

    useEffect(() => {
        // Listen for content updates from other users
        socket.on('updateContent', (newContent) => {
            setContent(newContent);
        });

        return () => {
            socket.off('updateContent'); // Clean up listener on unmount
        };
    }, [socket]);

    const handleChange = (e) => {
        const newContent = e.target.value;

        setContent(newContent);

        // Emit the new content to the server
        socket.emit('sendContent', newContent);

    };

    return (
        <div>
            <textarea
                value={content}
                onChange={handleChange}
                placeholder="Start typing..."
                rows="10"
                cols="50"
            />
        </div>
    );
}

export default TextEditor;