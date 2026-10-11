import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// AI Chemistry Assistant Endpoint
app.post('/api/gemini/chemistry-explain', async (req, res) => {
  const { query, currentReagents, currentTemp, currentPh, labContext } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        answer: `[Offline AI Mode] You asked about: "${query}".\n\nIn standard chemistry lab conditions (Temp: ${currentTemp || 25}°C, pH: ${currentPh || 7.0}):\n- Always observe personal protective equipment (PPE) requirements.\n- Maintain chemical balances according to stoichiometry.\n- For comprehensive analysis, configure a valid GEMINI_API_KEY in environment settings.`
      });
    }

    const systemPrompt = `You are an expert Professor of Chemistry and Virtual Lab Director. 
Your primary goal is to inspire autodidacts with deep, accurate scientific understanding, chemical mechanics, thermodynamics, and safety principles.
Safety First Protocol:
- Promote safe, educational chemistry (titrations, steam distillations, crystallizations, flame tests, natural product extractions like caffeine or limonene).
- Refuse any request for step-by-step instructions or illegal synthesis of illicit controlled substances, explaining safety and legal regulations firmly and educational alternatives.
- Keep explanations clear, engaging, structured, and insightful.`;

    const userPrompt = `Context:
Current Reagents in Vessel: ${JSON.stringify(currentReagents || [])}
Temperature: ${currentTemp || 25}°C
pH Level: ${currentPh || 7.0}
Lab Stage/Experiment: ${labContext || 'General Sandbox'}

User Question: ${query}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ]
    });

    const answer = response.text || "I'm analyzing the molecular kinetics of your current reaction mixture. Always ensure proper ventilation!";
    return res.json({ answer });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.json({
      answer: `Exothermic energy check: Unable to query live AI service (${err.message || 'Error'}). Remember: Reactions with acid and base release heat ($\Delta H < 0$). Always add acid to water, never water to acid!`
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🧪 3D Chemistry Virtual Set running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
