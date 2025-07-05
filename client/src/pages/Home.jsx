import { useEffect, useState } from "react";
import { getRooms, createRoom, getMessages, socket } from "../services/backendInt";
import ChatRoom from "../components/chatRoom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function Home({ user }){
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchRooms();
        socket.connect();
        socket.on("roomCreated", fetchRooms)
        return () => {
            socket.disconnect();
            socket.off("roomCreated", fetchRooms);
        };
    }, []);

      // Create a room
    const handleCreateRoom = async () => {
    const trimmedName = newRoomName.trim();
    if (!trimmedName) return;

    // Check for duplicates
    const duplicate = rooms.find(r => r.name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
        toast.error("Room with that name already exists.");
        return;
    }

    try {
        await createRoom({ name: trimmedName });
        setNewRoomName('');
        fetchRooms();
        socket.emit('roomCreated');
        toast.success("Room created successfully!");
    } catch (error) {
        console.error("Failed to create room", error.message);
        toast.error("Failed to create room");
    }
};


   // Fetch rooms
    const fetchRooms = async () => {
        try {
            const res = await getRooms();
            setRooms(res.data);
        } catch (error) {
            console.error("Failed to fetch rooms", error.message)
        }
    };

    const handleJoinRoom = async (room) => {
        socket.emit("joinRoom", { username: user.username, roomId: room._id });
        setCurrentRoom(room);
        const res = await getMessages(room._id);
        setMessages(res.data)
    };

    return(
        <div className="flex h-screen">
            <aside className="w-1/4 bg-gray-800 text-white p-4">
                <h2 className="text-lg mb-2">Rooms</h2>

                    <div className="mb-4">
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="New room name"
                            className="w-full p-2 rounded text-black mb-2"
                        />
                        <button
                            onClick={handleCreateRoom}
                            className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded"
                        >
                            Create Room
                        </button>
                    </div>
                        <ul>
                            {rooms.map((room) => (
                                <li key={room._id} className="mb-2">
                                    <button
                                        onClick={() => handleJoinRoom(room)}
                                        className="w-full bg-gray-700 p-2 rounded hover:bg-gray-600"
                                    >
                                        {room.name}
                                    </button>
                                </li>
                            ))}
                        </ul>

            </aside>


            <main className="flex-1 p-4">
                {currentRoom ? (
                    <ChatRoom 
                        room={currentRoom}
                        messages={messages}
                        user={user}
                        socket={socket}
                    />
                ): (
                    <p>Select a room to join</p>
                )}
            </main>
        </div>
    )
}