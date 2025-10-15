import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Send, 
  FileText, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    text: string;
    source: string;
    url: string;
    internal: boolean;
  }>;
  timestamp: Date;
}

export default function CopilotPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/copilot/chat', { query });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
          citations: data.citations,
          timestamp: new Date(data.generatedAt),
        },
      ]);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not get AI response',
        variant: 'destructive',
      });
    },
  });

  // Legal brief mutation
  const briefMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/copilot/brief', { 
        classificationId: 'demo-001' 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const briefContent = `# ${data.title}

## Facts
${data.facts.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Award Analysis
${data.snippets.map((s: any) => `> ${s.text}\n> — ${s.source}`).join('\n\n')}

## Citations
${data.citations.map((c: any) => `- [${c.text}](${c.url})`).join('\n')}

---
*Generated ${new Date(data.generatedAt).toLocaleString()} by ${data.generatedBy}*
`;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: briefContent,
          citations: data.citations,
          timestamp: new Date(data.generatedAt),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input, timestamp: new Date() },
    ]);

    // Send to AI
    chatMutation.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 h-[calc(100vh-200px)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-copilot">
              <Sparkles className="h-8 w-8 text-primary" />
              ComplAI Buddy
            </h1>
            <p className="text-muted-foreground">
              Compliance intelligence powered by Azure OpenAI + AI Search
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => briefMutation.mutate()}
              disabled={briefMutation.isPending}
              data-testid="button-generate-brief"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Legal Brief
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-4">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Start a conversation</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ask about classifications, obligations, or generate legal briefs
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput('Explain the Clerks Award Level 3 classification criteria');
                        setTimeout(handleSend, 100);
                      }}
                      data-testid="suggestion-1"
                    >
                      Award Classification
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput('What are the SG contribution requirements for Q2 2024?');
                        setTimeout(handleSend, 100);
                      }}
                      data-testid="suggestion-2"
                    >
                      SG Requirements
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput('Explain the payslip delivery SLA requirements');
                        setTimeout(handleSend, 100);
                      }}
                      data-testid="suggestion-3"
                    >
                      Payslip SLA
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                      data-testid={`message-${idx}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">ComplAI Buddy</span>
                        </div>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                      </div>
                      
                      {/* Citations */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="text-xs font-medium">Sources:</p>
                          {message.citations.map((citation, cidx) => (
                            <div key={cidx} className="flex items-center gap-2 text-xs">
                              <Badge variant={citation.internal ? 'secondary' : 'outline'}>
                                {citation.internal ? 'Internal' : 'External'}
                              </Badge>
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                              >
                                {citation.text}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(message.content)}
                            data-testid={`button-copy-${idx}`}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about classifications, obligations, or compliance requirements..."
                className="flex-1 min-h-[60px]"
                disabled={chatMutation.isPending}
                data-testid="input-chat"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
