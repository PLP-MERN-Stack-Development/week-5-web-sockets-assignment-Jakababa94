import React from 'react';
import PropTypes from 'prop-types';

const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Hands': ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✋', '🤚', '🖐', '✌️', '🤞', '🤟', '🤘', '🤙', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✊', '👊', '🤛', '🤜'],
  'Objects': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍩', '🍪', '☕', '🧋', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🔥', '💯', '⭐', '🌟', '✨', '💫']
};

export const EmojiPicker = ({ onSelect }) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 w-80 max-h-64 overflow-y-auto">
      {Object.entries(emojiCategories).map(([category, emojis]) => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {category}
          </h4>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="text-lg p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

EmojiPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
};