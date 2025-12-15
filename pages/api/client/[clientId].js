// pages/api/client/[clientId].js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  try {
    // Fetch all contract months for this client
    const contractMonths = await base('Contract Months')
      .select({
        filterByFormula: `FIND("${clientId}", {Record ID (from Client)})`,
        sort: [{ field: 'Start Date', direction: 'desc' }]
      })
      .all();

    if (contractMonths.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get client info from the first contract month
    const clientRecord = await base('Clients')
      .select({
        filterByFormula: `{Record ID} = "${clientId}"`,
        maxRecords: 1
      })
      .firstPage();

    const clientInfo = clientRecord[0]?.fields || {};

    // Format contract months data
    const months = contractMonths.map(record => ({
      id: record.id,
      month: record.fields['Month'] || '',
      startDate: record.fields['Start Date'] || '',
      endDate: record.fields['End Date'] || '',
      campaignGoal: record.fields['Campaign Goal (Views)'] || 0,
      totalViews: record.fields['Total Views for a Contract Month'] || 0,
      percentDelivered: record.fields['%Delivered'] || 0,
      progressStatus: record.fields['Progress Status'] || '',
      meaning: record.fields['Meaning'] || '',
      contractStatus: record.fields['Contract Status'] || '',
      totalLikes: record.fields['Number of Likes Achieved'] || 0,
      totalComments: record.fields['Number of Comments Achieved'] || 0,
      totalShares: record.fields['Number of Shares Achieved'] || 0,
      totalSaves: record.fields['Number of Saves Achieved'] || 0,
      publishedClips: record.fields['Number of Published Clips'] || 0,
      daysTotal: record.fields['Total Days in Contract Month'] || 30,
      daysPassed: record.fields['Days Passed Today'] || 0,
      timePercent: record.fields['%Time Passed'] || 0,
      relatedClips: record.fields['Related Clips'] || []
    }));

    res.status(200).json({
      client: {
        id: clientId,
        name: clientInfo['Client name'] || 'Unknown Client',
        logo: clientInfo['Logo'] || null,
        instagramLink: clientInfo['Instagram Link'] || '',
        tiktokLink: clientInfo['Tiktok Link'] || '',
        websiteLink: clientInfo['Website Link'] || ''
      },
      months
    });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
