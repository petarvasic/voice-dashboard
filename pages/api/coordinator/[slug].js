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

    // 2. Get contract months - NO Contract Status filter for now
    let contractMonths = [];
    if (isHOD) {
      // HOD sees all
      contractMonths = await base('Contract Months')
        .select({
          sort: [{ field: 'Start Date', direction: 'desc' }]
        })
        .all();
    } else {
      // Coordinator sees only their campaigns
      contractMonths = await base('Contract Months')
        .select({
          filterByFormula: `FIND("${userName}", {Coordinator Name})`,
          sort: [{ field: 'Start Date', direction: 'desc' }]
        })
        .all();
    }

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
      publishedClips: parseInt(record.fields['Number of Published Clips']) || 0,
      contractStatus: record.fields['Contract Status'] || ''
    }));

    // 3. Get clips for these contract months
    const monthIds = months.map(m => m.id);
    let clips = [];
    
    if (monthIds.length > 0 && monthIds.length < 50) {
      const clipsFormula = `OR(${monthIds.slice(0, 20).map(id => `FIND("${id}", ARRAYJOIN({Contract Months}))`).join(',')})`;
      
      try {
        const clipRecords = await base('Clips')
          .select({
            filterByFormula: clipsFormula,
            sort: [{ field: 'Publish Date', direction: 'desc' }],
            maxRecords: 100
          })
          .firstPage();

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
      } catch (e) {
        console.log('Clips error:', e.message);
      }
    }

    // 4. Get offers
    let offers = [];
    try {
      let offersFormula = isHOD 
        ? `OR({Status} = "Sent", {Status} = "Accepted", {Status} = "Declined")`
        : `FIND("${userName}", {Coordinator Name})`;
      
      const offerRecords = await base('Offers')
        .select({
          filterByFormula: offersFormula,
          sort: [{ field: 'Sent Date', direction: 'desc' }],
          maxRecords: 100
        })
        .firstPage();

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
      console.log('Offers error:', e.message);
    }

    // 5. Categorize data
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const pendingOffers = offers.filter(o => o.status === 'Sent' && o.type === 'Offer');
    const pendingApplications = offers.filter(o => o.status === 'Sent' && o.type === 'Application');
    const acceptedToday = offers.filter(o => o.status === 'Accepted' && o.responseDate === todayStr);
    const declinedToday = offers.filter(o => o.status === 'Declined' && o.responseDate === todayStr);

    const waitingContent = clips.filter(c => c.status === 'Draft' || c.clipStatus === 'In Progress');
    const publishedRecent = clips.filter(c => c.status === 'Published').slice(0, 20);
    const publishedToday = clips.filter(c => c.publishDate && c.publishDate.startsWith(todayStr));
    const viewsToday = publishedToday.reduce((sum, c) => sum + c.views, 0);

    // Filter active months
    const activeMonths = months.filter(m => m.contractStatus === 'Active');

    res.status(200).json({
      user: {
        id: user.id,
        name: userFields['Name'] || '',
        email: userFields['Email'] || '',
        role: userFields['Role'] || '',
        slug: userFields['Slag'] || ''
      },
      summary: {
        activeMonths: activeMonths.length,
        pendingOffers: pendingOffers.length,
        pendingApplications: pendingApplications.length,
        acceptedToday: acceptedToday.length,
        declinedToday: declinedToday.length,
        waitingContent: waitingContent.length,
        publishedToday: publishedToday.length,
        viewsToday: viewsToday
      },
      offers: {
        pending: pendingOffers,
        applications: pendingApplications,
        acceptedToday: acceptedToday,
        declinedToday: declinedToday
      },
      clips: {
        waitingContent: waitingContent,
        needsReview: [],
        publishedRecent: publishedRecent
      },
      months: activeMonths
    });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
