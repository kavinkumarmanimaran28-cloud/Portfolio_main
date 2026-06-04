export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const models = [
        'gemini-2.5-flash-lite-preview-06-17',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
    ];

    for (const model of models) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: message }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000
                        }
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json();
                console.error(`Model ${model} failed:`, err);
                continue;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                return res.status(200).json({ response: text, modelUsed: model });
            }

        } catch (err) {
            console.error(`Error with model ${model}:`, err);
            continue;
        }
    }

    return res.status(500).json({ error: 'All models failed. Please try again.' });
}
