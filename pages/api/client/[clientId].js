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
    }

    // Calculate cumulative totals
    const cumulative = {
      totalGoal: months.reduce((sum, m) => sum + (m.campaignGoal || 0), 0),
      totalViews: months.reduce((sum, m) => sum + (m.totalViews || 0), 0),
      totalLikes: months.reduce((sum, m) => sum + (m.totalLikes || 0), 0),
      totalComments: months.reduce((sum, m) => sum + (m.totalComments || 0), 0),
      totalShares: months.reduce((sum, m) => sum + (m.totalShares || 0), 0),
      totalSaves: months.reduce((sum, m) => sum + (m.totalSaves || 0), 0),
      totalClips: months.reduce((sum, m) => sum + (m.publishedClips || 0), 0),
      monthsCount: months.length
    };
    cumulative.percentDelivered = cumulative.totalGoal > 0 
      ? cumulative.totalViews / cumulative.totalGoal 
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
