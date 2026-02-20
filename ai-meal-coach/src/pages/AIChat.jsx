import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { sendChatMessage } from '@/services/chatApi';
import { askGemini, askGroq } from '@/services/aiService';
import { cn } from '@/lib/utils';

const quickPrompts = [
  "Diet plan",
  "New Plan",
  "Weight loss tips",
  "Healthy breakfast options",
];

const formatMessage = (content) => {
  if (typeof content !== 'string') return content;

  // First split into lines to handle bullets and line breaks
  const lines = content.split('\n');

  return lines.map((line, lineIdx) => {
    // Check for bullet points at the start of the line
    const trimmedLine = line.trim();
    const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
    const displayContent = isBullet ? trimmedLine.substring(2) : line;

    // Split by bold segments
    const parts = displayContent.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, i) => {
      if (typeof part === 'string' && part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${lineIdx}-${i}`} className="font-bold text-foreground mx-0.5">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // Handle empty lines as spacers
    if (trimmedLine === '' && lineIdx !== lines.length - 1) {
      return <div key={lineIdx} className="h-3" />;
    }

    return (
      <div key={lineIdx} className={cn(
        "flex gap-2 my-0.5",
        isBullet ? "ml-2 items-start" : "items-center"
      )}>
        {isBullet && (
          <span className="text-primary mt-1 flex-shrink-0">•</span>
        )}
        <span className="flex-1 leading-relaxed">
          {renderedLine}
        </span>
      </div>
    );
  });
};

const AIChat = () => {
  const { user, getTodaysNutrition, dailyGoals } = useUser();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm your AI nutrition assistant. I can help you with:\n\n• Personalized meal suggestions\n• Nutrition advice for your goals\n• High-protein or low-carb recommendations\n• Weight management tips\n\nHow can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message) => {
    const text = message || input.trim();
    if (!text || !user) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get latest nutrition context
      const todaysNutrition = getTodaysNutrition();

      // Call the real Flask API with profile syncing
      const response = await sendChatMessage(text, user?.id || 'default_user', user);

      let assistantContent = response.response || response;

      // Check if backend is unsure - if so, fallback to Gemini
      const fallbackTriggers = [
        "I'm not sure what you mean",
        "Stick to the plan",
        "Type 'reset' to start over"
      ];

      const isUnsure = fallbackTriggers.some(trigger =>
        typeof assistantContent === 'string' && assistantContent.includes(trigger)
      );

      // Trigger GROQ if backend is unsure
      if (isUnsure) {
        console.log('🤖 Backend unsure, falling back to GROQ...');
        const groqResponse = await askGroq(text, {
          user,
          todaysNutrition,
          dailyGoals
        });

        if (groqResponse) {
          assistantContent = groqResponse;
        } else {
          // If GROQ fails, use final fallback
          assistantContent = "Can not understand plz enter your query again";
        }
      }

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I couldn't connect to the AI assistant. Please make sure the backend server is running on port 5000.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Your personal nutrition coach</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-fade-in',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'gradient-primary'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'glass-card rounded-tl-sm'
                )}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {formatMessage(message.content)}
                </div>
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 max-w-lg mx-auto w-full">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-full hover:bg-secondary/80 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about nutrition..."
            className="flex-1 h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl gradient-primary text-primary-foreground"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
