import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTags } from '../lib/tags';
import { Tag } from '../lib/tags';

type TagInputProps = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllTags().then(setTags);
  }, []);

  const filteredTags = tags.filter(
    tag => 
      tag.name.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTags.includes(tag.name)
  ).slice(0, 8);

  const handleAddTag = (tagName: string) => {
    if (!selectedTags.includes(tagName) && selectedTags.length < 5) {
      onChange([...selectedTags, tagName]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(selectedTags.filter(t => t !== tagName));
  };

  const handleCreateNew = () => {
    if (input.trim() && !selectedTags.includes(input.trim()) && selectedTags.length < 5) {
      onChange([...selectedTags, input.trim()]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm text-gray-400 mb-2">Tags (max 5)</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 rounded-md bg-card/30 border border-white/10">
        <AnimatePresence>
          {selectedTags.map(tag => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-highlight transition-colors"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {selectedTags.length < 5 && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredTags.length > 0) {
                  handleAddTag(filteredTags[0].name);
                } else {
                  handleCreateNew();
                }
              }
            }}
            placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white placeholder-gray-500"
          />
        )}
      </div>
      
      {showSuggestions && input && filteredTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 w-full mt-1 p-2 rounded-lg bg-card/90 border border-white/20 backdrop-blur-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleAddTag(tag.name)}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-white transition-colors"
            >
              {tag.name}
            </button>
          ))}
          {!tags.some(t => t.name.toLowerCase() === input.toLowerCase()) && (
            <button
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-accent border-t border-white/10 mt-1"
            >
              + Create "{input}"
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

