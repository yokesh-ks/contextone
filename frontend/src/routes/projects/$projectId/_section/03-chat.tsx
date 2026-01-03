import { Dispatch, SetStateAction } from "react";
import { useParams } from "@tanstack/react-router";
import { chatAPI } from "@/lib/api";
import { ChatMessage } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, RefreshCw, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChatProps {
  projectId: string;
  welcomeMessage?: string;
  chatMessages: ChatMessage[];
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  chatInput: string;
  setChatInput: Dispatch<SetStateAction<string>>;
  chatLoading: boolean;
  handleSendMessage: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatSection({
  projectId,
  welcomeMessage,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendMessage,
  chatEndRef
}: ChatProps) {
  const handleResetChat = () => {
    if (welcomeMessage) {
      setChatMessages([{
        role: "assistant",
        content: welcomeMessage
      }]);
    } else {
      setChatMessages([]);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test Chat</CardTitle>
            <CardDescription>Test your chatbot before deploying.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-70">
                      Sources: {msg.sources.length} document(s)
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={chatLoading}
            />
            <Button onClick={handleSendMessage} disabled={chatLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
