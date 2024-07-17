import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import cors from 'cors';

const OPENAI_API_KEY = '';
const OPENAI_ORG_ID = '';

const app = express();

app.use(cors({
    origin: 'http://localhost:9000'
}));

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG_ID,
});

app.get('/', (req, res) => {
  res.send('Le serveur fonctionne !');
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'La question est requise' });
  }

  try {
    const response = await openai.Completions.create({
      model: 'gpt-4',
      prompt: question,
      max_tokens: 150,
    });

    res.json({ answer: response.choices[0].text.trim() });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Nouvelle route pour récupérer les données de l'athlète
app.post('/api/athlete', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom de l\'athlète est requis' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": "Tu vas me sortir un JSON avec les parametre suivant :\n Son pays d'origine :\n  le sport qu'il pratique : \n son club ou son equipe :"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Donne-moi des informations sur l'athlète nommé ${name}.`
            }
          ]
        }
      ],
      max_tokens: 150,
    });

    res.json({ data: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});