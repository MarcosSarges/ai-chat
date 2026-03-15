import {
  streamText,
  convertToModelMessages,
  tool,
  jsonSchema,
  generateText,
  Output,
  LanguageModel,
} from "ai"
import { openai } from "@ai-sdk/openai"
import { prompt as systemPrompt } from "@/lib/prompt"
import { evaluationPrompt } from "@/lib/evaluation-prompt"

export const maxDuration = 30
export const PROMPT_MODEL: LanguageModel = "openai/gpt-4.1-nano"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // 1. Extrair a última mensagem do usuário para avaliação
  const lastMessage = messages[messages.length - 1]
  const lastUserMessage =
    lastMessage?.content ||
    lastMessage?.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("")

  if (!lastUserMessage || typeof lastUserMessage !== "string") {
    const errorResult = streamText({
      model: PROMPT_MODEL,
      prompt: `Apenas repita exatamente esta frase: "o chat não suporta esse tipo de requisição"`,
    })
    return errorResult.toUIMessageStreamResponse()
  }

  try {
    // 2. Camada de Segurança: Avaliação do Prompt
    const safetyResult = await generateText({
      model: PROMPT_MODEL, // Modelo rápido para avaliação
      system: evaluationPrompt,
      prompt: lastUserMessage,
      output: Output.object({
        schema: jsonSchema({
          type: "object",
          properties: {
            isSafe: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["isSafe", "reason"],
          additionalProperties: false,
        }),
      }),
    })

    const safety = safetyResult.output as { isSafe: boolean; reason?: string }

    // 3. Bloqueio se não for seguro
    if (!safety.isSafe) {
      console.warn(`[SAFETY BLOCK] Reason: ${safety.reason}`)

      // Retornamos a razão diretamente no stream para o front
      const errorResult = streamText({
        model: PROMPT_MODEL,
        prompt: `Apenas repita exatamente esta frase: "${safety.reason || "o chat não suporta esse tipo de requisição"}"`,
      })

      return errorResult.toUIMessageStreamResponse()
    }
  } catch (error) {
    console.error("[SAFETY ERROR]", error)
    const errorResult = streamText({
      model: PROMPT_MODEL,
      prompt: `Apenas repita exatamente esta frase: "o chat não suporta esse tipo de requisição"`,
    })
    return errorResult.toUIMessageStreamResponse()
  }

  // 4. Fluxo Normal se for seguro
  const result = streamText({
    model: PROMPT_MODEL,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      systemTime: tool({
        description: "Retorna a hora atual do sistema do servidor.",
        inputSchema: jsonSchema({
          type: "object",
          properties: {},
          additionalProperties: false,
        }),
        execute: async () => {
          const now = new Date()
          return {
            iso: now.toISOString(),
            localTime: now.toLocaleString("pt-BR", {
              hour12: false,
              timeZone: "America/Sao_Paulo",
            }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            unixMs: now.getTime(),
          }
        },
      }),
      webSearch: openai.tools.webSearch({
        searchContextSize: "low",
        userLocation: {
          type: "approximate",
          city: "São Paulo",
          country: "BR",
          region: "SP",
          timezone: "America/Sao_Paulo",
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
