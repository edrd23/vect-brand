export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = process.env.BREVO_LIST_ID || 2; 

    if (!BREVO_API_KEY) {
        console.warn('BREVO_API_KEY is missing. Simulating success.');
        return res.status(200).json({ success: true, message: 'Simulated success (No API Key)' });
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                listIds: [parseInt(LIST_ID)],
                updateEnabled: true 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API Error:', data);
            return res.status(response.status).json({ error: data.message || 'Failed to add contact' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
