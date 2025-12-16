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
    // First, get the client record
    const clientRecords = await base('Clients')
      .select({
        filterByFormula: `RECORD_ID() = "${clientId}"`,
        maxRecords: 1
      })
      .firstPage();

    if (clientRecords.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const clientRecord = clientRecords[0];
    const clientFields = clientRecord.fields;

    // Get contract months for this client
    const contractMonthIds = clientFields['Contract months'] || [];
    
    let months = [];
    
    if (contractMonthIds.length > 0) {
      const contractMonths = await base('Contract Months')
        .select({
          filterByFormula: `OR(${contractMonthIds.map(id => `RECORD_ID() = "${id}"`).join(',')})`,
          sort: [{ field: 'Start Date', direction: 'desc' }]
        })
        .all();

      months = contractMonths.map(record => ({
        id: record.id,
        month: record.fields['Month'] || '',
        startDate: record.fields['Start Date'] || '',
        endDate: record.fields['End Date'] || '',
        campaignGoal: parseInt(record.fields['Campaign Goal (Views)']) || 0,
        totalViews: parseInt(record.fields['Total Views for a Contract Month']) || 0,
        percentDelivered: parseFloat(record.fields['%Delivered']) || 0,
        progressStatus: record.fields['Progress Status'] || '',
        meaning: record.fields['Meaning'] || '',
        contractStatus: record.fields['Contract Status'] || '',
        totalLikes: parseInt(record.fields['Number of Likes Achieved']) || 0,
        totalComments: parseInt(record.fields['Number of Comment Achieved']) || 0,
        totalShares: parseInt(record.fields['Number of Shares Achieved']) || 0,
        totalSaves: parseInt(record.fields['Number of Saves Achieved']) || 0,
        publishedClips: parseInt(record.fields['Number of Published Clips']) || 0,
        daysTotal: parseInt(record.fields['Total Days in Contract Month']) || 30,
        daysPassed: parseInt(record.fields['Days Passed Today']) || 0,
        timePercent: parseFloat(record.fields['%Time Passed']) || 0,
        relatedClips: record.fields['Related Clips'] || []
      }));
    }

    // Calculate cumulative totals - using parseInt to avoid floating point issues
    const cumulative = {
      totalGoal: months.reduce((sum, m) => sum + (parseInt(m.campaignGoal) || 0), 0),
      totalViews: months.reduce((sum, m) => sum + (parseInt(m.totalViews) || 0), 0),
      totalLikes: months.reduce((sum, m) => sum + (parseInt(m.totalLikes) || 0), 0),
      totalComments: months.reduce((sum, m) => sum + (parseInt(m.totalComments) || 0), 0),
      totalShares: months.reduce((sum, m) => sum + (parseInt(m.totalShares) || 0), 0),
      totalSaves: months.reduce((sum, m) => sum + (parseInt(m.totalSaves) || 0), 0),
      totalClips: months.reduce((sum, m) => sum + (parseInt(m.publishedClips) || 0), 0),
      monthsCount: months.length
    };
    
    // Calculate percent delivered safely
    cumulative.percentDelivered = cumulative.totalGoal > 0 
      ? Math.round((cumulative.totalViews / cumulative.totalGoal) * 10000) / 10000
      : 0;

    res.status(200).json({
      client: {
        id: clientId,
        name: clientFields['Client name'] || 'Unknown Client',
        logo: clientFields['Logo'] || null,
        instagramLink: clientFields['Instagram Link'] || '',
        tiktokLink: clientFields['Tiktok Link'] || '',
        websiteLink: clientFields['Website Link'] || ''
      },
      cumulative,
      months
    });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
