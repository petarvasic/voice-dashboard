// pages/api/coordinator/action.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, offerId, notes } = req.body;

  if (!offerId) {
    return res.status(400).json({ error: 'Offer ID is required' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    switch (action) {
      case 'approve_application':
        // Koordinator odobrava prijavu kreatora
        await base('Offers').update(offerId, {
          'Status': 'Accepted',
          'Response Date': today
        });
        return res.status(200).json({ success: true, message: 'Prijava odobrena!' });

      case 'reject_application':
        // Koordinator odbija prijavu kreatora
        await base('Offers').update(offerId, {
          'Status': 'Declined',
          'Response Date': today
        });
        return res.status(200).json({ success: true, message: 'Prijava odbijena.' });

      case 'mark_active':
        // Označi ponudu kao aktivnu (kreator radi na klipu)
        await base('Offers').update(offerId, {
          'Status': 'Active'
        });
        return res.status(200).json({ success: true, message: 'Označeno kao aktivno.' });

      case 'mark_completed':
        // Označi ponudu kao završenu
        await base('Offers').update(offerId, {
          'Status': 'Completed'
        });
        return res.status(200).json({ success: true, message: 'Označeno kao završeno.' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Action failed', details: error.message });
  }
}
