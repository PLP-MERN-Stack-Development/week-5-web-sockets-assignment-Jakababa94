import React, { useState } from 'react';
import { User, UserPlus, Sparkles } from 'lucide-react';


const avatars = [
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🧑‍💻', '👩‍💻', '🧑‍🎨', '👩‍🎨',
  '🧑‍🚀', '👩‍🚀', '🧑‍⚕️', '👩‍⚕️', '🧑‍🍳', '👩‍🍳', '🧑‍🎓', '👩‍🎓'
];

export const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const handleSubmit = (e => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim(), selectedAvatar);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full p-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join the Chat</h1>
          <p className="text-gray-400">Connect with people from around the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose your avatar
            </label>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-indigo-600 shadow-lg scale-110'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter your username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your username"
                required
                maxLength={20}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:from-indigo-700 hover:to-pink-700 hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};