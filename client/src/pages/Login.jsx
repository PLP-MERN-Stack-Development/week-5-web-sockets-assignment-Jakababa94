import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/backendInt";

export default function Login({ setUser}){
    const [ username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = async ()=> {
        const res = await registerUser(username);
        setUser(res.data);
        navigate("/")
    };

    return (
        <div className="h-screen flex items-center justify-center bg-amber-200">
            <div className="p-6 bg-white rounded shadow-md w-96">
                <h1 className="text-3xl font-bold text-center mb-4">Join Chat</h1>
                <input 
                className="w-full p-2 border rounded mb-4"
                placeholder="Username"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
                 />
                 <button onClick={handleLogin} className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-900">
                    Enter
                 </button>
            </div>
        </div>
    )
}