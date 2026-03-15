"use client"

import { useChat } from "@ai-sdk/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useRef, useState } from "react"

export function Chat() {
  const { messages, sendMessage, status, setMessages } = useChat()
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<"text" | "image">("text")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const isLoading = status === "submitted" || status === "streaming" || isGeneratingImage
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status, isGeneratingImage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput("")

    if (mode === "text") {
      await sendMessage({ text: currentInput })
    } else {
      setIsGeneratingImage(true)
      
      // Adiciona a mensagem do usuário localmente
      const userMessageId = Math.random().toString(36).substring(7)
      setMessages([
        ...messages,
        {
          id: userMessageId,
          role: "user",
          parts: [{ type: "text", text: currentInput }],
          createdAt: new Date(),
        } as any
      ])

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({ prompt: currentInput }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao gerar imagem")
        }

        // Adiciona a imagem como uma mensagem do assistente
        setMessages((prev: any) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: "assistant",
            parts: [
              { type: "text", text: "Aqui está a imagem que você pediu:" },
              { type: "data", data: { type: "image", url: data.url } }
            ],
            createdAt: new Date(),
          }
        ])
      } catch (error: any) {
        setMessages((prev: any) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: "assistant",
            parts: [{ type: "text", text: error.message || "Erro ao gerar imagem" }],
            createdAt: new Date(),
          }
        ])
      } finally {
        setIsGeneratingImage(false)
      }
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col border-x bg-background">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto scroll-smooth p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-center opacity-50">
            <h2 className="text-lg font-medium">Bem-vindo ao AI Chat</h2>
            <p className="text-sm">
              Envie uma mensagem para começar a conversar.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const content = m.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("")

          const toolCalls = m.parts.filter((p) => p.type === "tool-call")
          const imageData = m.parts.find((p: any) => p.type === "data" && p.data?.type === "image") as any

          if (!content && !toolCalls.length && !imageData && m.role === "assistant" && isLoading) {
            return null
          }

          return (
            <div
              key={m.id}
              className={cn(
                "flex w-full flex-col gap-2",
                m.role === "user" ? "items-end" : "items-start"
              )}
            >
              {(content || imageData) && (
                <div
                  className={cn(
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap shadow-sm flex flex-col gap-3"
                  )}
                >
                  {content && <span>{content}</span>}
                  {imageData && (
                    <div className="relative size-[300px] overflow-hidden rounded-md border bg-black/5">
                      <img 
                        src={imageData.data.url} 
                        alt="Imagem gerada por IA"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {toolCalls.map((tc: any) => (
                <div
                  key={tc.toolCallId}
                  className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-[10px] text-muted-foreground shadow-sm"
                >
                  <div className="size-2 animate-pulse rounded-full bg-primary" />
                  Buscando: <span className="font-mono">{tc.args.query}</span>
                </div>
              ))}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] animate-pulse rounded-lg bg-muted px-4 py-2 text-sm text-foreground">
              {isGeneratingImage ? "Gerando imagem..." : "Digitando..."}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background/80 p-4 backdrop-blur-sm space-y-3">
        <div className="flex justify-center gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          <button
            onClick={() => setMode("text")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              mode === "text" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Texto
          </button>
          <button
            onClick={() => setMode("image")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              mode === "image" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Imagem
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-md bg-muted px-3 py-2 text-sm transition-all outline-none focus:ring-1 focus:ring-ring"
            value={input}
            placeholder={mode === "text" ? "Digite sua mensagem..." : "Descreva a imagem que deseja gerar..."}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {mode === "text" ? "Enviar" : "Gerar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
