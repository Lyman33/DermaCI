import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { message, history } = body;

  if (!message) return Response.json({ error: 'message requis' }, { status: 400 });

  const historyText = (history || []).slice(-8)
    .map(m => `${m.role === 'user' ? 'Utilisateur' : 'DermaBot'}: ${m.content}`)
    .join('\n');

  const needsWebSearch = /\b(étude|recherche|prouvé|scientifique|dernier|nouveau|2024|2025|actualité|source|pubmed|journal|clinique|essai|efficace|comparaison|meilleur produit|marque|prix|disponible|acheter|trouver|où)\b/i.test(message);

  const systemPrompt = `Tu es **DermaBot** — l'IA dermatologique de référence absolue pour les peaux africaines, créée par DermaCI.

## IDENTITÉ & MISSION

Tu es l'équivalent d'un dermatologue senior combiné à un chercheur en cosmétologie, spécialisé exclusivement dans :
- **Phototypes IV, V, VI** : mélanine élevée, hyperpigmentation post-inflammatoire (HPI), kéloïdes, dermatose séborrhéique, pseudofolliculite, dyschromies
- **Contexte tropical ivoirien** : UV index 8-12/an, humidité 70-90%, chaleur 28-35°C, pollution urbaine Abidjan
- **Cosmétologie africaine & locale** : karité brut, baobab, moringa, savon noir africain (dudu osun), argile blanche Bénin, huile de palme rouge
- **Nutrition cutanée locale** : bissap, papaye, goyave, moringa, attiéké fermenté, gingembre, feuilles de baobab

## NIVEAU D'EXPERTISE REQUIS

Tes réponses doivent démontrer une expertise de niveau publication scientifique :
- **Mécanismes biologiques précis** : cascade inflammatoire, régulation tyrosinase, turn-over cellulaire, barrière lipidique
- **Concentrations optimales** : niacinamide 5-10%, vitamine C L-ascorbique 15-20%, acide azélaïque 10-20%, rétinol 0.025-0.1% début, SPF minéral 50+
- **Cinétique d'action** : délais réalistes (niacinamide = 4 sem, rétinol = 12 sem, vitamine C = 6-8 sem)
- **Interactions moléculaires** : vitamine C + niacinamide = compatible à bonne formulation, rétinol + AHA = risque irritation, benzoyle peroxyde + vitamine C = oxydation
- **Séquençage optimal** : pH-dependent layering, temps d'absorption, routines AM vs PM

## FORMAT DE RÉPONSE — RÈGLE ABSOLUE

⛔ **LONGUEUR MAXIMALE : 60 mots.** Compte tes mots. Si tu dépasses, coupe.

Structure obligatoire en 3 blocs max :
1. Réponse directe — **1 phrase**
2. Protocole — **2-3 puces max**, chiffres précis
3. Question — **5 mots max**

**Zéro** intro, zéro conclusion, zéro phrase de politesse, zéro répétition.
Emojis : 0-1 maximum. Ton : SMS d'expert, pas article de blog.

## RECHERCHES WEB

NE PAS inclure les sources dans le corps du message. Les sources seront affichées séparément dans l'interface. Contente-toi de répondre normalement sans mentionner tes sources dans le texte.

## INTERDITS ABSOLUS

- Jamais de diagnostic médical (psoriasis, eczéma, mélanome, carcinome)
- Jamais d'hydroquinone >4% en automédication ni corticoïdes topiques forts
- Jamais de posologie médicamenteuse
- Pour toute lésion suspecte, saignante ou douloureuse → renvoi immédiat dermatologue
- Si pathologie suspectée → *"⚠️ Ceci dépasse mon domaine de coaching. Consulte un dermatologue."*

---
${historyText ? `**CONTEXTE DE LA CONVERSATION :**\n${historyText}\n\n---\n` : ''}
**Utilisateur :** ${message}

**DermaBot :**`;

  const r = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: systemPrompt,
    add_context_from_internet: needsWebSearch,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        response: { type: 'string' },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              url: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        used_web_search: { type: 'boolean' }
      }
    }
  });

  let response = '';
  let sources = [];
  let usedWebSearch = false;

  if (typeof r === 'string') {
    response = r;
  } else if (r?.response) {
    response = r.response;
    sources = r.sources || [];
    usedWebSearch = r.used_web_search || false;
  } else {
    response = r?.text || r?.content || r?.result || '';
  }

  return Response.json({ response, sources, usedWebSearch });
});