import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photo_url } = await req.json();

    if (!photo_url) {
      return Response.json({ error: 'Photo URL required' }, { status: 400 });
    }

    // Invoke LLM to analyze the photo
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un dermatologue IA expert. L'utilisateur t'envoie une photo de peau pour une micro-analyse rapide.

Analyse cette photo et fournis un retour court et utile (3-4 phrases max) couvrant:
1. Type de peau apparent
2. Problèmes visibles majeurs (s'il y en a)
3. Un conseil rapide à appliquer

Sois naturel, bienveillant et concis. Pas de disclaimer, juste le conseil.`,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: {
            type: "string",
            description: "Micro-analyse courte de la photo de peau"
          }
        },
        required: ["analysis"]
      }
    });

    return Response.json({
      analysis: response.analysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});