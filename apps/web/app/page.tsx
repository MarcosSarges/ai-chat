import { Chat } from "@/components/chat"

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary" />
            <h1 className="text-sm font-semibold tracking-tight">AI Chatbot</h1>
          </div>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Vercel AI SDK
          </div>
        </div>
      </header>

      <div className="container mx-auto flex h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-4 py-8">
        <Chat />
      </div>
    </main>
  )
}
