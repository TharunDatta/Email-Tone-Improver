async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { sourceText, selectedTone } = req.body;

        if (!sourceText || !selectedTone) {
            return res.status(400).json({ error: 'Missing sourceText or selectedTone' });
        }

        const prompt = `You are an expert editorial AI. 
            Analyze the following email and rewrite it to match a '${selectedTone}' tone.
            
            Original Email:
            "${sourceText}"
            
            Return ONLY a raw JSON object (no markdown formatting, no \`\`\`json) with the exact following structure:
            {
               "improved_email": "The full rewritten email text in HTML format (using <p> and <br> tags).",
               "diff_html": "A short visual diff highlighting 1 or 2 key changes. Wrap removed words in <span class='diff-removed'>...</span> and added words in <span class='diff-added'>...</span>",
               "improvements": ["String array of 3 bullet points explaining the key improvements uniquely"],
               "clarity_score": "Number between 1-100",
               "tone_resonance": "Number between 1-100"
            }`;

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({ error: 'Server misconfiguration: API key is missing. Ensure GEMINI_API_KEY is set in environment variables.' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{parts: [{text: prompt}]}]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "API Error from Gemini");
        }
        
        let jsonString = data.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonString);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Server API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

export default handler;
