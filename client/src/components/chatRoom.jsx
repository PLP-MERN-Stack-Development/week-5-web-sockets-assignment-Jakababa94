import { useEffect, useRef, useState } from "react";

export default function ChatRoom({ room, message, user, socket}) {
    const [chat, setChat]= useState("")
    const [typingUser, setTypingUser ]= useState("")
    const [messages, setMessages] = useState([]);
    const msgRef = useRef(null);

    useEffect(()=>{
        socket.on("newMessage", (msg)=> {
            setMessages(prev => [...prev, msg]);
        });

        socket.on("typing", (username)=> {
            setTypingUser(username)
        });

        socket.on("stopTyping", ()=> {
            setTypingUser("")
        });

        return()=> {
            socket.off("newMessage");
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, []);

    const handleTyping = ()=> {
        socket.emit("typing");
        setTimeout(()=> socket.emit("stopTyping"), 1000);
    };

    const handleSend = ()=> {
        socket.emit("sendMessage", chat);
        setChat("")
    };

    return (
        <div>
            <h2 className="text-2xl mb-2">{room.name}</h2>
            <div className="h-64 overflow-y-auto border mb-2 bg-gray-50" ref={msgRef}>
                {messages.map((msg, idx) => (
                    <p key={idx}>
                        <strong>{msg.sender.username}</strong>: {msg.content}
                    </p>
                ))}
            </div>
            <div className="mb-2 text-sm text-gray-600">
                {typingUser && `${typingUser} is typing`}
            </div>
            <div className="flex gap-2">
                <input
                className="flex-1 p-2 border rounded"
                value={chat}
                onChange={(e)=> { setChat(e.target.value) }}
                onKeyDown={handleTyping}
                placeholder="Type a message"
                 />
                <button
                    className="p-2 bg-green-500 text-white rounded"
                    onClick={handleSend}
                    disabled={!chat.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    )
}