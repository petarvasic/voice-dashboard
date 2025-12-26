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
    let userRecords;
    try {
      userRecords = await base('Users')
        .select({
          filterByFormula: `{Slag} = "${slug}"`,
          maxRecords: 1
        })
        .firstPage();
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch user', details: e.message });
    }

    if (!userRecords || userRecords.length === 0) {
      return res.status(404).json({ error: 'User not found', slug: slug });
    }

    const user = userRecords[0];
    const userFields = user.fields;
    const userName = userFields['Name'] || '';
    const userRole = userFields['Role'] || '';
    const isHOD = userRole === 'HOD' || userRole === 'Admin';

    // 2. Get contract months
    let contractMonths = [];
    try {
      if (isHOD) {
        contractMonths = await base('Contract Months')
          .select({
            sort: [{ field: 'Start Date', direction: 'desc' }],
            maxRecords: 500
          })
          .all();
      } else {
        contractMonths = await base('Contract Months')
          .select({
            filterByFormula: `FIND("${userName}", {Coordinator Name})`,
            sort: [{ field: 'Start Date', direction: 'desc' }],
            maxRecords: 200
          })
          .all();
      }
    } catch (e) {
      console.log('Contract months error:', e.message);
    }

    // 3. Get ALL clips to map to campaigns and show recent
    let allClips = [];
    try {
      allClips = await base('Clips')
        .select({
          sort: [{ field: 'Publish Date', direction: 'desc' }],
          maxRecords: 1000
        })
        .all();
    } catch (e) {
      console.log('Clips error:', e.message);
    }

    // Create a map of clips by contract month ID
    const clipsByMonth = {};
    allClips.forEach(clip => {
      const monthIds = clip.fields['Contract Months'] || [];
      monthIds.forEach(monthId => {
        if (!clipsByMonth[monthId]) {
          clipsByMonth[monthId] = [];
        }
        clipsByMonth[monthId].push({
          id: clip.id,
          influencerId: clip.fields['Influencer']?.[0] || null,
          influencerName: clip.fields['Influencer Name']?.[0] || 'Unknown',
          status: clip.fields['Status'] || '',
          clipStatus: clip.fields['Clip Status'] || '',
          publishDate: clip.fields['Publish Date'] || null,
          views: parseInt(clip.fields['Total Views']) || 0,
          likes: parseInt(clip.fields['Likes']) || 0,
          link: clip.fields['Social Media link'] || '',
          platform: clip.fields['Social'] || ''
        });
      });
    });

    // Process months with influencer aggregation
    const months = contractMonths.map(record => {
      const monthId = record.id;
      const monthClips = clipsByMonth[monthId] || [];
      
      // Aggregate influencers from clips
      const influencerMap = {};
      monthClips.forEach(clip => {
        if (clip.influencerId) {
          if (!influencerMap[clip.influencerId]) {
            influencerMap[clip.influencerId] = {
              id: clip.influencerId,
              name: clip.influencerName,
              clips: 0,
              views: 0,
              lastClipDate: null
            };
          }
          influencerMap[clip.influencerId].clips += 1;
          influencerMap[clip.influencerId].views += clip.views;
          
          // Track most recent clip date
          if (clip.publishDate) {
            if (!influencerMap[clip.influencerId].lastClipDate || 
                clip.publishDate > influencerMap[clip.influencerId].lastClipDate) {
              influencerMap[clip.influencerId].lastClipDate = clip.publishDate;
            }
          }
        }
      });

      const influencers = Object.values(influencerMap).sort((a, b) => b.views - a.views);

      return {
        id: monthId,
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
        contractStatus: record.fields['Contract Status'] || 'Active',
        influencers: influencers
      };
    });

    // Filter - exclude Closed
    const activeMonths = months.filter(m => m.contractStatus !== 'Closed');

    // 4. Get offers
    let offers = [];
    try {
      const offerRecords = await base('Offers')
        .select({
          maxRecords: 100,
          sort: [{ field: 'Sent Date', direction: 'desc' }]
        })
        .firstPage();

      offers = offerRecords.map(record => ({
        id: record.id,
        influencerName: record.fields['Influencer Name']?.[0] || 'Unknown',
        contractMonthName: record.fields['Contract Month Name'] || '',
        clientName: record.fields['Client Name'] || '',
        status: record.fields['Status'] || 'Sent',
        type: record.fields['Type'] || 'Offer',
        sentDate: record.fields['Sent Date'] || '',
        responseDate: record.fields['Response Date'] || ''
      }));
    } catch (e) {
      console.log('Offers error:', e.message);
    }

    // 5. Process clips for display
    const allClipsMapped = allClips.map(clip => ({
      id: clip.id,
      influencerName: clip.fields['Influencer Name']?.[0] || 'Unknown',
      clientName: clip.fields['Client Name']?.[0] || '',
      status: clip.fields['Status'] || '',
      clipStatus: clip.fields['Clip Status'] || '',
      publishDate: clip.fields['Publish Date'] || null,
      views: parseInt(clip.fields['Total Views']) || 0,
      likes: parseInt(clip.fields['Likes']) || 0,
      link: clip.fields['Social Media link'] || '',
      platform: clip.fields['Social'] || ''
    }));

    // 6. Categorize data
    const today = new Date().toISOString().split('T')[0];

    const pendingOffers = offers.filter(o => o.status === 'Sent' && o.type === 'Offer');
    const pendingApplications = offers.filter(o => o.status === 'Sent' && o.type === 'Application');
    const acceptedToday = offers.filter(o => o.status === 'Accepted' && o.responseDate === today);
    const declinedToday = offers.filter(o => o.status === 'Declined' && o.responseDate === today);

    const waitingContent = allClipsMapped.filter(c => c.clipStatus === 'In Progress');
    const publishedRecent = allClipsMapped.filter(c => c.status === 'Published').slice(0, 20);
    const publishedToday = allClipsMapped.filter(c => c.publishDate === today);

    // Return response
    res.status(200).json({
      user: {
        id: user.id,
        name: userName,
        email: userFields['Email'] || '',
        role: userRole,
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
        viewsToday: publishedToday.reduce((sum, c) => sum + c.views, 0)
      },
      offers: {
        pending: pendingOffers,
        applications: pendingApplications,
        acceptedToday,
        declinedToday
      },
      clips: {
        waitingContent: waitingContent.slice(0, 10),
        needsReview: [],
        publishedRecent
      },
      months: activeMonths
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message
    });
  }
}
