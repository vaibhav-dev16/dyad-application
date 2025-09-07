import { useState, useEffect } from "react";
import { searchChats } from "@/lib/chat";
import type { ChatSummary } from "@/lib/schemas";

export function useSearchChats(appId: number | null, query: string) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appId || !query) {
      setChats([]);
      return;
    }
    setLoading(true);
    searchChats(appId, query)
      .then(setChats)
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [appId, query]);

  return { chats, loading };
}
