// pages/api/client/[clientId].js
// Fixed: Use '%Delivered 2' (decimal format 0.82) instead of '%Delivered' (82)
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

      months = contractMonths.map(record => {
        const fields = record.fields;
        
        // Use '%Delivered 2' which is decimal (0.82 = 82%)
        // Fallback to '%Delivered' if '%Delivered 2' doesn't exist
        let percentDelivered = parseFloat(fields['%Delivered 2']) || 0;
        
        // If using old '%Delivered' field, it might be in percentage format (82 instead of 0.82)
        // Detect and convert: if value > 1, it's already a percentage, divide by 100
        if (percentDelivered === 0) {
          percentDelivered = parseFloat(fields['%Delivered']) || 0;
          // If it looks like a percentage (> 1), convert to decimal
          if (percentDelivered > 1) {
            percentDelivered = percentDelivered / 100;
          }
        }
        
        return {
          id: record.id,
          month: fields['Month'] || '',
          startDate: fields['Start Date'] || '',
          endDate: fields['End Date'] || '',
          campaignGoal: parseInt(fields['Campaign Goal (Views)']) || 0,
          totalViews: parseInt(fields['Total Views for a Contract Month']) || 0,
          percentDelivered: percentDelivered, // Now always decimal (0.82 for 82%)
          progressStatus: fields['Progress Status'] || '',
          meaning: fields['Meaning'] || '',
          contractStatus: fields['Contract Status'] || '',
          totalLikes: parseInt(fields['Number of Likes Achieved']) || 0,
          totalComments: parseInt(fields['Number of Comment Achieved']) || 0,
          totalShares: parseInt(fields['Number of Shares Achieved']) || 0,
          totalSaves: parseInt(fields['Number of Saves Achieved']) || 0,
          publishedClips: parseInt(fields['Number of Published Clips']) || 0,
          daysTotal: parseInt(fields['Total Days in Contract Month']) || 30,
          daysPassed: parseInt(fields['Days Passed Today']) || 0,
          timePercent: parseFloat(fields['%Time Passed']) || 0,
          relatedClips: fields['Related Clips'] || []
        };
      });
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
    
    // Calculate percent delivered safely - result is decimal (0.94 for 94%)
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
