// api/enhance.js — Gemini API handler with proper error handling
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { sourceText, selectedTone } = req.body;

        // Validation
        if (!sourceText || !selectedTone) {
            return res.status(400).json({ error: 'Missing sourceText or selectedTone.' });
        }

        if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
            return res.status(400).json({ error: 'Source text cannot be empty.' });
        }

        if (typeof selectedTone !== 'string' || selectedTone.trim().length === 0) {
            return res.status(400).json({ error: 'Selected tone cannot be empty.' });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            if (process.env.NODE_ENV === 'development') {
                console.error('⚠️  GEMINI_API_KEY not configured');
            }
            return res.status(500).json({ error: 'AI service misconfigured. Please try again later.' });
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

        // Note: API key in URL is required by Google's API. Mitigate by:
        // 1. Using API key restrictions in Google Cloud Console (restrict to generativelanguage.googleapis.com)
        // 2. Enabling request validation (restrict to server IP or user agent)
        // 3. Setting quotas to prevent abuse
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "User-Agent": "EtherealTone/1.0"
            },
            body: JSON.stringify({
                contents: [{parts: [{text: prompt}]}]
            })
        });

        if (!response.ok) {
            const errorMsg = `Gemini API returned status ${response.status}`;
            if (process.env.NODE_ENV === 'development') {
                console.error(errorMsg);
            }
            throw new Error('AI service error');
        }

        const data = await response.json();
        
        if (data.error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Gemini API error:', data.error);
            }
            throw new Error('AI service error');
        }

        // Safely extract response
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Unexpected response format from AI service.');
        }

        let jsonString = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown code blocks if present
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let result;
        try {
            result = JSON.parse(jsonString);
        } catch (parseErr) {
            if (process.env.NODE_ENV === 'development') {
                console.error('JSON parse error:', parseErr);
            }
            throw new Error('Failed to parse AI response');
        }

        // Validate response structure
        if (!result.improved_email || !result.diff_html || !Array.isArray(result.improvements)) {
            throw new Error('AI response missing required fields.');
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Enhancement API error:", error.message);
        
        // Return user-friendly error message (don't expose internal details)
        const message = error.message.includes('fetch') 
            ? 'Network error. Please try again.'
            : error.message || 'Failed to enhance email. Please try again.';
        
        return res.status(500).json({ error: message });
    }
}

export default handler;
