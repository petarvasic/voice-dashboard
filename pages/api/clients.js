// pages/api/clients.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  try {
    const clients = await base('Clients')
      .select({
        fields: ['Client name', 'Record ID', 'Active?'],
        filterByFormula: '{Active?} = TRUE()',
        sort: [{ field: 'Client name', direction: 'asc' }]
      })
      .all();

    const formattedClients = clients.map(record => ({
      id: record.fields['Record ID'] || record.id,
      name: record.fields['Client name'] || 'Unknown',
      recordId: record.id
    }));

    res.status(200).json({ clients: formattedClients });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
}
