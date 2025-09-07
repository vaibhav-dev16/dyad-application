import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import { useState, useEffect } from "react";
import { useSearchChats } from "@/hooks/useSearchChats";
import type { ChatSummary } from "@/lib/schemas";

type ChatSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChat: ({ chatId, appId }: { chatId: number; appId: number }) => void;
  appId: number | null;
  allChats: ChatSummary[];
};

export function ChatSearchDialog({
  open,
  onOpenChange,
  appId,
  onSelectChat,
  allChats,
}: ChatSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { chats: searchResults, loading } = useSearchChats(appId, searchQuery);

  // Show all chats if search is empty, otherwise show search results
  const chatsToShow = searchQuery.trim() === "" ? allChats : searchResults;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} data-testid="chat-search-dialog">
      <CommandInput
        placeholder="Search chats"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No results found."}
        </CommandEmpty>
        <CommandGroup heading="Chats">
          {chatsToShow.map((chat) => (
            <CommandItem
              key={chat.id}
              onSelect={() =>
                onSelectChat({ chatId: chat.id, appId: chat.appId })
              }
            >
              {chat.title || "Untitled Chat"}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
