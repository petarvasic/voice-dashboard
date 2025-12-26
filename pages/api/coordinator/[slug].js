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

    // 2. Get offers - filter by coordinator unless HOD/Admin
    let offersFormula = '';
    if (isHOD) {
      offersFormula = `OR({Status} = "Sent", {Status} = "Accepted", {Status} = "Declined", {Status} = "Active")`;
    } else {
      offersFormula = `FIND("${userName}", ARRAYJOIN({Coordinator}))`;
    }

    let offers = [];
    try {
      const offerRecords = await base('Offers')
        .select({
          filterByFormula: offersFormula,
          sort: [{ field: 'Sent Date', direction: 'desc' }]
        })
        .all();

      offers = offerRecords.map(record => ({
        id: record.id,
        influencerId: record.fields['Influencer']?.[0] || null,
        influencerName: record.fields['Influencer Name'] || 'Unknown',
        contractMonthId: record.fields['Contract Month']?.[0] || null,
        contractMonthName: record.fields['Contract Month Name'] || '',
        clientName: record.fields['Client Name'] || '',
        status: record.fields['Status'] || 'Sent',
        type: record.fields['Type'] || 'Offer',
        sentDate: record.fields['Sent Date'] || '',
        responseDate: record.fields['Response Date'] || '',
        brief: record.fields['Brief'] || ''
      }));
    } catch (e) {
      console.log('Offers table error:', e.message);
    }

    // 3. Get contract months - filter by coordinator unless HOD/Admin
    let monthsFormula = `{Contract Status} = "Active"`;
    if (!isHOD) {
      monthsFormula = `AND({Contract Status} = "Active", FIND("${userName}", ARRAYJOIN({Coordinator})))`;
    }

    const contractMonths = await base('Contract Months')
      .select({
        filterByFormula: monthsFormula,
        sort: [{ field: 'Start Date', direction: 'desc' }]
      })
      .all();

    const months = contractMonths.map(record => ({
      id: record.id,
      month: record.fields['Month'] || '',
      clientId: record.fields['Client']?.[0] || null,
      clientName: record.fields['Client Name'] || '',
      campaignGoal: parseInt(record.fields['Campaign Goal (Views)']) || 0,
      totalViews: parseInt(record.fields['Total Views for a Contract Month']) || 0,
      percentDelivered: parseFloat(record.fields['%Delivered']) || 0,
      progressStatus: record.fields['Progress Status'] || '',
      startDate: record.fields['Start Date'] || '',
      endDate: record.fields['End Date'] || '',
      daysLeft: parseInt(record.fields['Days Left']) || 0,
      publishedClips: parseInt(record.fields['Number of Published Clips']) || 0
    }));

    // 4. Get clips for these contract months
    const monthIds = months.map(m => m.id);
    let clips = [];
    
    if (monthIds.length > 0) {
      const clipsFormula = `OR(${monthIds.map(id => `FIND("${id}", ARRAYJOIN({Contract Months}))`).join(',')})`;
      
      const clipRecords = await base('Clips')
        .select({
          filterByFormula: `AND(OR({Status} = "Draft", {Status} = "In Progress", {Status} = "Published"), ${clipsFormula})`,
          sort: [{ field: 'Publish Date', direction: 'desc' }]
        })
        .all();

      clips = clipRecords.map(record => ({
        id: record.id,
        influencerId: record.fields['Influencer']?.[0] || null,
        influencerName: record.fields['Influencer Name'] || 'Unknown',
        clientName: record.fields['Client Name'] || '',
        status: record.fields['Status'] || '',
        clipStatus: record.fields['Clip Status'] || '',
        publishDate: record.fields['Publish Date'] || null,
        views: parseInt(record.fields['Total Views']) || 0,
        likes: parseInt(record.fields['Likes']) || 0,
        link: record.fields['Social Media link'] || '',
        platform: record.fields['Social'] || '',
        contractMonthId: record.fields['Contract Months']?.[0] || null
      }));
    }

    // 5. Categorize data
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today - 86400000).toISOString().split('T')[0];

    // Offers categorization
    const pendingOffers = offers.filter(
