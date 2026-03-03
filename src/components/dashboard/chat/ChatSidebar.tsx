import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, ChatCircle, CaretLeft, CaretRight, Calendar, Clock, MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}
interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isMobileOverlay?: boolean;
}

// Group conversations by time period
function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const groups: {
    label: string;
    icon: React.ElementType;
    conversations: Conversation[];
  }[] = [{
    label: "Aujourd'hui",
    icon: Clock,
    conversations: []
  }, {
    label: "Hier",
    icon: Calendar,
    conversations: []
  }, {
    label: "7 derniers jours",
    icon: Calendar,
    conversations: []
  }, {
    label: "30 derniers jours",
    icon: Calendar,
    conversations: []
  }, {
    label: "Plus ancien",
    icon: Calendar,
    conversations: []
  }];
  conversations.forEach(conv => {
    const date = new Date(conv.created_at);
    if (date >= today) {
      groups[0].conversations.push(conv);
    } else if (date >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (date >= last7Days) {
      groups[2].conversations.push(conv);
    } else if (date >= last30Days) {
      groups[3].conversations.push(conv);
    } else {
      groups[4].conversations.push(conv);
    }
  });
  return groups.filter(g => g.conversations.length > 0);
}
export function ChatSidebar({
  conversations,
  currentConversationId,
  isCollapsed,
  onToggleCollapse,
  onSelectConversation,
  onCreateNew,
  onDelete,
  isMobileOverlay = false,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv => conv.title?.toLowerCase().includes(term));
  }, [conversations, searchTerm]);
  const groupedConversations = useMemo(() => groupConversations(filteredConversations), [filteredConversations]);

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => regex.test(part) ? <span key={i} className="bg-primary/30 text-primary rounded px-0.5">{part}</span> : part);
  };
  return <motion.div initial={false} animate={{
    width: isCollapsed ? 72 : 280
  }} transition={{
    duration: 0.3,
    ease: "easeInOut"
  }} className={cn("relative h-full border-r border-border/50 flex flex-col bg-muted/30 dark:bg-background/30 backdrop-blur-xl overflow-hidden flex-shrink-0", isMobileOverlay ? "flex" : "hidden md:flex")}>
      {/* Header with New Chat button */}
      <div className="p-3 flex items-center justify-between min-w-[72px]">
        <AnimatePresence mode="wait">
          {!isCollapsed ? <motion.button key="expanded" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={onCreateNew} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl", "bg-gradient-to-r from-primary to-primary/80", "text-primary-foreground font-medium", "shadow-lg shadow-primary/25", "hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]", "transition-all duration-200")}>
              <Plus weight="bold" className="w-5 h-5" />
              <span className="whitespace-nowrap">Nouvelle conversation</span>
            </motion.button> : <motion.button key="collapsed" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={onCreateNew} className={cn("mx-auto p-3.5 rounded-xl", "bg-gradient-to-r from-primary to-primary/80", "text-primary-foreground", "shadow-lg shadow-primary/25", "hover:shadow-xl hover:shadow-primary/30", "transition-all duration-200")} title="Nouvelle conversation">
              <Plus weight="bold" className="w-5 h-5" />
            </motion.button>}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button onClick={onToggleCollapse} className={cn("absolute top-4 right-0 translate-x-1/2 z-10", "p-1.5 rounded-full", "bg-background/90 backdrop-blur-sm", "border border-white/20", "hover:bg-white/10 hover:border-white/30", "transition-all duration-200", "shadow-lg")} title={isCollapsed ? "Étendre" : "Réduire"}>
        {isCollapsed ? <CaretRight weight="bold" className="w-3 h-3 text-foreground/60" /> : <CaretLeft weight="bold" className="w-3 h-3 text-foreground/60" />}
      </button>

      {/* Search bar */}
      {!isCollapsed && <div className="px-3 pb-3">
          <div className="relative">
            <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={cn("w-full pl-9 pr-8 py-2.5 rounded-xl", "bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10", "text-sm font-light text-foreground placeholder:text-foreground/40", "focus:outline-none focus:border-primary/40 focus:bg-muted dark:focus:bg-white/8", "transition-all duration-200")} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors">
                <X weight="bold" className="w-3 h-3 text-foreground/40" />
              </button>}
          </div>
          {searchTerm && <p className="text-xs text-foreground/40 mt-2 px-1">
              {filteredConversations.length} résultat{filteredConversations.length !== 1 ? 's' : ''}
            </p>}
        </div>}

      {/* Scrollable conversations list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groupedConversations.map((group, groupIndex) => <div key={group.label} className="mb-4">
            {/* Group label */}
            {!isCollapsed && <motion.div initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: groupIndex * 0.1
        }} className="flex items-center gap-2 px-3 py-2 mb-1">
                <group.icon weight="light" className="w-3.5 h-3.5 text-foreground/40" />
                <span className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                  {group.label}
                </span>
              </motion.div>}

            {/* Conversations in group */}
            <div className="space-y-1">
              {group.conversations.map((conv, convIndex) => <motion.button key={conv.id} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: groupIndex * 0.1 + convIndex * 0.05
          }} onClick={() => onSelectConversation(conv.id)} className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group relative", currentConversationId === conv.id ? 'bg-primary/10 dark:bg-white/10 text-foreground' : 'text-foreground/60 hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground')} title={isCollapsed ? conv.title || 'Conversation' : undefined}>
                  {/* Active indicator */}
                  {currentConversationId === conv.id}
                  
                  <ChatCircle weight={currentConversationId === conv.id ? "fill" : "light"} className={cn("w-5 h-5 flex-shrink-0", currentConversationId === conv.id && "text-primary")} />
                  
                  {!isCollapsed && <>
                      <span className="flex-1 truncate text-sm font-light">
                        {highlightMatch(conv.title || 'Conversation')}
                      </span>
                      <button onClick={e => onDelete(conv.id, e)} className={cn("opacity-0 group-hover:opacity-100", "p-1.5 hover:bg-white/10 rounded-lg", "transition-all duration-200")}>
                        <Trash weight="light" className="w-4 h-4 text-foreground/40 hover:text-destructive transition-colors" />
                      </button>
                    </>}
                </motion.button>)}
            </div>
          </div>)}

        {/* Empty state */}
        {conversations.length === 0 && !isCollapsed && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-8 text-center">
            <ChatCircle weight="light" className="w-12 h-12 text-foreground/20 mb-3" />
            <p className="text-sm text-foreground/40">Aucune conversation</p>
            <p className="text-xs text-foreground/30 mt-1">Commence une nouvelle discussion</p>
          </motion.div>}
      </div>
    </motion.div>;
}