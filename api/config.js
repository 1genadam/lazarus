// Simple API endpoint to serve OpenAI configuration
// This would run on a backend service (Node.js, Python, etc.)

export default function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // In production, you'd add authentication/authorization here
    // For now, we'll serve the config
    res.status(200).json({
        openaiKey: process.env.OPENAI_API_KEY || null,
        chatEnabled: true
    });
}