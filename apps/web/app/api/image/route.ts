import {
  generateImage,
  generateText,
  Output,
  jsonSchema,
  LanguageModel,
  ImageModel,
} from "ai"
import { evaluationPrompt } from "@/lib/evaluation-prompt"

export const maxDuration = 30
const PROMPT_MODEL: LanguageModel = "openai/gpt-4o-mini"
const IMAGE_MODEL: LanguageModel = "openai/dall-e-2"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt inválido" }, { status: 400 })
    }

    // 1. Camada de Segurança: Avaliação do Prompt
    const safetyResult = await generateText({
      model: PROMPT_MODEL,
      system: evaluationPrompt,
      prompt: prompt,
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

    if (!safety.isSafe) {
      return Response.json(
        {
          error: safety.reason || "o chat não suporta esse tipo de requisição",
        },
        { status: 403 }
      )
    }

    // 2. Geração da Imagem
    const { image } = await generateImage({
      model: "openai/gpt-image-1-mini", // Usando a constante definida no topo
      prompt: prompt,
      // size: "256x256", // Tamanho aproximado de 300x300 suportado pelo DALL-E 2
      size: "1024x1024",
    })

    return Response.json({
      url: `data:${image.mediaType};base64,${image.base64}`,
      prompt,
    })
  } catch (error) {
    console.error("[IMAGE ERROR]", error)
    return Response.json({ error: "Erro ao gerar imagem" }, { status: 500 })
  }
}
