import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneTilt, 
  Microphone, 
  Paperclip, 
  X, 
  File as FileIcon,
  Stop
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface ChatInputProps {
  onSubmit: (message: string, file?: File | null) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatInputRef {
  focus: () => void;
  setValue: (value: string) => void;
  submitForm: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ onSubmit, isLoading, disabled, placeholder = "Pose-moi ta question..." }, ref) => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_CHARS = 4000;

    // Speech-to-text
    const { 
      startListening, 
      stopListening, 
      isListening, 
      isConnecting,
      transcript,
      partialTranscript,
      isSupported: sttSupported 
    } = useSpeechToText();

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      setValue: (value: string) => setInput(value),
      submitForm: () => handleSubmit()
    }));

    // Update input with transcript
    useEffect(() => {
      if (transcript) {
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      }
    }, [transcript]);

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [input]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setFilePreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setFilePreview(null);
        }
      }
    };

    const clearSelectedFile = () => {
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleVoiceInput = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };

    const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isLoading || disabled) return;
      
      onSubmit(input.trim(), selectedFile);
      setInput('');
      clearSelectedFile();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const displayValue = isListening && partialTranscript 
      ? input + (input ? ' ' : '') + partialTranscript 
      : input;

    return (
      <div className="w-full">
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Listening indicator */}
        <AnimatePresence>
          {(isListening || isConnecting) && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="relative"
              >
                <Microphone weight="fill" className="w-5 h-5 text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              </motion.div>
              <span className="text-sm text-primary font-medium">
                {isConnecting ? "Connexion..." : "🎙️ Écoute en cours..."}
              </span>
              {partialTranscript && (
                <span className="text-sm text-foreground/60 italic truncate flex-1">
                  {partialTranscript}
                </span>
              )}
              <button
                onClick={stopListening}
                className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                <Stop weight="fill" className="w-4 h-4 text-primary" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected file preview */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 overflow-hidden"
            >
              {filePreview ? (
                <img src={filePreview} className="w-12 h-12 rounded-lg object-cover" alt="Preview" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <FileIcon weight="light" className="w-6 h-6 text-foreground/60" />
                </div>
              )}
              <span className="text-sm text-foreground/80 truncate flex-1">{selectedFile.name}</span>
              <button 
                onClick={clearSelectedFile}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X weight="bold" className="w-4 h-4 text-foreground/60" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Container */}
        <form onSubmit={handleSubmit}>
          <div 
            className={cn(
              "relative rounded-2xl overflow-hidden transition-all duration-300",
              "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
              "border shadow-xl",
              isFocused 
                ? "border-primary/50 shadow-primary/10 ring-2 ring-primary/20" 
                : "border-white/20 shadow-black/5"
            )}
          >
            {/* Gradient border on focus */}
            {isFocused && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-gradient-rotate opacity-50 -z-10" />
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2 p-3 pt-4">
              <textarea
                ref={textareaRef}
                value={displayValue}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isListening ? "Écoute en cours..." : placeholder}
                className={cn(
                  "flex-1 bg-transparent border-0 focus:outline-none resize-none",
                  "text-foreground placeholder:text-foreground/40",
                  "text-base font-light leading-relaxed",
                  "min-h-[28px] max-h-[200px] py-1 px-1",
                  isListening && partialTranscript && "text-foreground/70 italic"
                )}
                disabled={isLoading || disabled}
                rows={1}
                readOnly={isListening}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 pb-3 pt-0">
              <div className="flex items-center gap-1">
                {/* Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-200",
                    "text-foreground/50 hover:text-foreground/80 hover:bg-white/10"
                  )}
                  title="Joindre un fichier"
                >
                  <Paperclip weight="light" className="w-5 h-5" />
                </button>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={!sttSupported || isConnecting}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-200",
                    isListening 
                      ? "text-primary bg-primary/20" 
                      : isConnecting
                      ? "text-foreground/30 cursor-wait"
                      : "text-foreground/50 hover:text-foreground/80 hover:bg-white/10"
                  )}
                  title={isListening ? "Arrêter la dictée" : "Dictée vocale"}
                >
                  <Microphone weight={isListening ? "fill" : "light"} className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character counter */}
                <span className={cn(
                  "text-xs transition-colors",
                  input.length > MAX_CHARS * 0.9 
                    ? "text-destructive" 
                    : "text-foreground/30"
                )}>
                  {input.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
                </span>
                
                {/* Send Button */}
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading || disabled}
                  whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                  whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                      : "bg-white/10 text-foreground/30 cursor-not-allowed"
                  )}
                >
                  <PaperPlaneTilt 
                    weight="fill" 
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      input.trim() && !isLoading && "hover:rotate-12"
                    )} 
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </form>

        {/* Disclaimer */}
        <p className="text-center text-xs text-foreground/30 mt-4">
          VitaSync AI peut afficher des informations inexactes. Vérifiez les conseils importants.
        </p>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
