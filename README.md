# AI Chat POC - Vercel AI SDK

Este projeto é uma **Prova de Conceito (POC)** desenvolvida para testar e demonstrar as capacidades do **Vercel AI SDK**.

## 🤖 Desenvolvimento Full AI

Este projeto foi desenvolvido **100% por Inteligência Artificial** utilizando o **Cursor**, sem interação humana direta no código, design ou arquitetura.

As únicas intervenções humanas foram:
- Configuração das variáveis de ambiente (`.env`).
- Instalação inicial das *skills* do agente.

## 🚀 Funcionalidades

- **Chatbot Textual:** Interface de chat fluida com streaming de resposta (`streamText`).
- **Geração de Imagens:** Integração com DALL-E para gerar imagens (300x300) diretamente no chat.
- **Camada de Segurança:** Avaliação automática de prompts para garantir conformidade e segurança.
- **Tools Integradas:** Ferramentas de busca web e consulta de hora do sistema.
- **Design Moderno:** Desenvolvido com Next.js, Tailwind CSS e shadcn/ui.

## 🛠️ Tecnologias

- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Cursor](https://www.cursor.com/) (IDE de IA)
- [Next.js](https://nextjs.org/) (App Router)
- [OpenAI](https://openai.com/) (GPT-4o, GPT-4o-mini, DALL-E 3)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Turbo](https://turbo.build/) (Monorepo)

## 📦 Como rodar localmente

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Configure o `.env` em `apps/web/.env` com sua `AI_GATEWAY_API_KEY`.

3. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

---
*Projeto gerado automaticamente para fins de estudo e experimentação.*
