// pages/api/coordinator/[slug].js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    // 1. Get user by slug
    const userRecords = await base('Users')
      .select({
        filterByFormula: `{Slag} = "${slug}"`,
        maxRecords: 1
      })
      .firstPage();

    if (userRecords.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRecords[0];
    const userFields = user.fields;
    const userName = userFields['Name'] || '';
    const isHOD = userFields['Role'] === 'HOD' || userFields['Role'] === 'Admin';

    // 2. Get contract months
    let contractMonths = [];
    if (isHOD) {
      contractMonths = await base('Contract Months')
        .select({
          maxRecords: 10,
          sort: [{ field: 'Start Date', direction: 'desc' }]
        })
        .firstPage();
    } else {
      contractMonths = await base('Contract Months')
        .select({
          filterByFormula: `FIND("${userName}", {Coordinator Name})`,
          maxRecords: 10,
          sort: [{ field: 'Start Date', direction: 'desc' }]
        })
        .firstPage();
    }

    // Debug: log first record's Contract Status
    const debugInfo = contractMonths.slice(0, 3).map(r => ({
      month: r.fields['Month'],
      contractStatus: r.fields['Contract Status'],
      rawFields: Object.keys(r.fields)
    }));

    const months = contractMonths.map(record => ({
      id: record.id,
      month: record.fields['Month'] || '',
      clientName: record.fields['Client Name'] || '',
      campaignGoal: parseInt(record.fields['Campaign Goal (Views)']) || 0,
      totalViews: parseInt(record.fields['Total Views for a Contract Month']) || 0,
      percentDelivered: parseFloat(record.fields['%Delivered']) || 0,
      progressStatus: record.fields['Progress Status'] || '',
      startDate: record.fields['Start Date'] || '',
      endDate: record.fields['End Date'] || '',
      daysLeft: parseInt(record.fields['Days Left']) || 0,
      contractStatus: record.fields['Contract Status'] || 'unknown'
    }));

    // Filter active
    const activeMonths = months.filter(m => m.contractStatus === 'Active');

    res.status(200).json({
      debug: debugInfo,
      user: {
        id: user.id,
        name: userName,
        role: userFields['Role'] || '',
        slug: userFields['Slag'] || ''
      },
      summary: {
        totalMonths: months.length,
        activeMonths: activeMonths.length,
        statuses: months.map(m => m.contractStatus)
      },
      months: activeMonths
    });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
