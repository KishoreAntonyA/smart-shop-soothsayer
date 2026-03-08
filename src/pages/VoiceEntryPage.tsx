import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface ParsedTransaction {
  type: "sale" | "expense";
  product?: string;
  quantity?: number;
  amount: number;
  category?: string;
  raw: string;
}

function parseVoice(text: string): ParsedTransaction | null {
  const lower = text.toLowerCase();

  // Sale patterns: "sold 2 milk packets for 60 rupees"
  const saleMatch = lower.match(/sold?\s+(\d+)\s+(.+?)\s+(?:for|at)\s+(\d+)\s*(?:rupees?|rs\.?|₹)?/);
  if (saleMatch) {
    return { type: "sale", quantity: parseInt(saleMatch[1]), product: saleMatch[2].trim(), amount: parseInt(saleMatch[3]), raw: text };
  }

  // Simple sale: "sold rice for 1200"
  const simpleSale = lower.match(/sold?\s+(.+?)\s+(?:for|at)\s+(\d+)\s*(?:rupees?|rs\.?|₹)?/);
  if (simpleSale) {
    return { type: "sale", product: simpleSale[1].trim(), amount: parseInt(simpleSale[2]), quantity: 1, raw: text };
  }

  // Expense: "add expense 200 rupees for transport"
  const expenseMatch = lower.match(/(?:add\s+)?expense\s+(\d+)\s*(?:rupees?|rs\.?|₹)?\s*(?:for|on|in)?\s*(.*)/);
  if (expenseMatch) {
    return { type: "expense", amount: parseInt(expenseMatch[1]), category: expenseMatch[2].trim() || "Miscellaneous", raw: text };
  }

  // Expense alt: "spent 500 on electricity"
  const spentMatch = lower.match(/spent\s+(\d+)\s*(?:rupees?|rs\.?|₹)?\s*(?:on|for)\s*(.*)/);
  if (spentMatch) {
    return { type: "expense", amount: parseInt(spentMatch[1]), category: spentMatch[2].trim() || "Miscellaneous", raw: text };
  }

  return null;
}

export default function VoiceEntryPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Speech recognition is not supported in this browser", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        const parsed = parseVoice(text);
        if (parsed) {
          setTransactions((prev) => [parsed, ...prev]);
          toast({
            title: parsed.type === "sale" ? "Sale recorded" : "Expense recorded",
            description: parsed.type === "sale"
              ? `${parsed.quantity}x ${parsed.product} for ${formatCurrency(parsed.amount)}`
              : `${formatCurrency(parsed.amount)} for ${parsed.category}`,
          });
        } else {
          toast({ title: "Couldn't understand", description: "Try: 'Sold 2 milk packets for 60 rupees' or 'Expense 200 for transport'", variant: "destructive" });
        }
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({ title: "Error", description: "Speech recognition failed. Please try again.", variant: "destructive" });
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Voice Entry</h2>
        <p className="text-sm text-muted-foreground">Add transactions using your voice</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voice input */}
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
                : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
            }`}
          >
            {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </button>

          <p className="text-lg font-semibold text-card-foreground">
            {isListening ? "Listening..." : "Tap to speak"}
          </p>

          {transcript && (
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                <Volume2 className="h-4 w-4" /> {transcript}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-2 text-left">
            <p className="text-xs font-medium text-muted-foreground">Example commands:</p>
            <div className="space-y-1">
              {[
                '"Sold 2 milk packets for 60 rupees"',
                '"Sold rice for 1200 rupees"',
                '"Add expense 200 rupees for transport"',
                '"Spent 500 on electricity"',
              ].map((cmd) => (
                <p key={cmd} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">{cmd}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Voice Transactions</h3>
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No voice transactions yet. Tap the mic to start!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={tx.type === "sale" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                        {tx.type}
                      </Badge>
                      <p className="text-sm font-medium text-card-foreground">
                        {tx.type === "sale" ? `${tx.quantity}x ${tx.product}` : tx.category}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">"{tx.raw}"</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === "sale" ? "text-success" : "text-destructive"}`}>
                    {tx.type === "sale" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
