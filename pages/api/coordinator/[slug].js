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

    // 3. Get influencers for name lookup
    let influencerMap = {};
    try {
      const influencerRecords = await base('Influencers')
        .select({
          fields: ['Influencer Name', 'Tier', 'E-mail'],
          maxRecords: 2000
        })
        .all();
      
      influencerRecords.forEach(inf => {
        influencerMap[inf.id] = {
          id: inf.id,
          name: inf.fields['Influencer Name'] || 'Unknown',
          tier: inf.fields['Tier'] || '',
          email: inf.fields['E-mail'] || ''
        };
      });
    } catch (e) {
      console.log('Influencers error:', e.message);
    }

    // 4. Get ALL clips
    let allClips = [];
    try {
      allClips = await base('Clips')
        .select({
          sort: [{ field: 'Publish Date', direction: 'desc' }],
          maxRecords: 2000
        })
        .all();
    } catch (e) {
      console.log('Clips error:', e.message);
    }

    // Process clips with proper influencer names
    const processedClips = allClips.map(clip => {
      const influencerId = clip.fields['Influencer']?.[0];
      const influencer = influencerMap[influencerId];
      const contractMonthIds = clip.fields['Contract Months'] || [];
      
      // Try to get client name from lookup or linked field
      let clientName = '';
      if (clip.fields['Client Name']) {
        clientName = Array.isArray(clip.fields['Client Name']) 
          ? clip.fields['Client Name'][0] 
          : clip.fields['Client Name'];
      } else if (clip.fields['Client']) {
        clientName = Array.isArray(clip.fields['Client']) 
          ? clip.fields['Client'][0] 
          : clip.fields['Client'];
      }
      
      return {
        id: clip.id,
        influencerId: influencerId || null,
        influencerName: influencer?.name || 'Unknown',
        influencerTier: influencer?.tier || '',
        clientName: clientName,
        status: clip.fields['Status'] || '',
        clipStatus: clip.fields['Clip Status'] || '',
        publishDate: clip.fields['Publish Date'] || null,
        views: parseInt(clip.fields['Total Views']) || 0,
        likes: parseInt(clip.fields['Likes']) || 0,
        comments: parseInt(clip.fields['Comments']) || 0,
        saves: parseInt(clip.fields['Saves']) || 0,
        link: clip.fields['Social Media link'] || '',
        platform: clip.fields['Social'] || '',
        contractMonthIds: contractMonthIds
      };
    });

    // Create a map of clips by contract month ID
    const clipsByMonth = {};
    processedClips.forEach(clip => {
      clip.contractMonthIds.forEach(monthId => {
        if (!clipsByMonth[monthId]) {
          clipsByMonth[monthId] = [];
        }
        clipsByMonth[monthId].push(clip);
      });
    });

    // Process months with influencer aggregation
    const months = contractMonths.map(record => {
      const monthId = record.id;
      const monthClips = clipsByMonth[monthId] || [];
      
      // Aggregate influencers from clips
      const influencerAgg = {};
      monthClips.forEach(clip => {
        if (clip.influencerId) {
          if (!influencerAgg[clip.influencerId]) {
            influencerAgg[clip.influencerId] = {
              id: clip.influencerId,
              name: clip.influencerName,
              tier: clip.influencerTier,
              clips: 0,
              views: 0,
              lastClipDate: null
            };
          }
          influencerAgg[clip.influencerId].clips += 1;
          influencerAgg[clip.influencerId].views += clip.views;
          
          if (clip.publishDate) {
            if (!influencerAgg[clip.influencerId].lastClipDate || 
                clip.publishDate > influencerAgg[clip.influencerId].lastClipDate) {
              influencerAgg[clip.influencerId].lastClipDate = clip.publishDate;
            }
          }
        }
      });

      const influencers = Object.values(influencerAgg).sort((a, b) => b.views - a.views);

      // Get client name
      let clientName = '';
      if (record.fields['Client Name']) {
        clientName = Array.isArray(record.fields['Client Name']) 
          ? record.fields['Client Name'][0] 
          : record.fields['Client Name'];
      }

      return {
        id: monthId,
        month: record.fields['Month'] || '',
        clientId: record.fields['Client']?.[0] || null,
        clientName: clientName,
        campaignGoal: parseInt(record.fields['Campaign Goal (Views)']) || 0,
        totalViews: parseInt(record.fields['Total Views for a Contract Month']) || 0,
        percentDelivered: parseFloat(record.fields['%Delivered']) || 0,
        progressStatus: record.fields['Progress Status'] || '',
        startDate: record.fields['Start Date'] || '',
        endDate: record.fields['End Date'] || '',
        daysLeft: parseInt(record.fields['Days Left']) || 0,
        publishedClips: parseInt(record.fields['Number of Published Clips']) || 0,
        contractStatus: record.fields['Contract Status'] || 'Active',
        influencers: influencers,
        totalInfluencers: influencers.length
      };
    });

    // Filter - exclude Closed
    const activeMonths = months.filter(m => m.contractStatus !== 'Closed');

    // 5. Get offers
    let offers = [];
    try {
      const offerRecords = await base('Offers')
        .select({
          maxRecords: 100,
          sort: [{ field: 'Sent Date', direction: 'desc' }]
        })
        .firstPage();

      offers = offerRecords.map(record => {
        const influencerId = record.fields['Influencer']?.[0];
        const influencer = influencerMap[influencerId];
        
        return {
          id: record.id,
          influencerId: influencerId,
          influencerName: influencer?.name || 'Unknown',
          contractMonthName: record.fields['Contract Month Name'] || '',
          clientName: record.fields['Client Name'] || '',
          status: record.fields['Status'] || 'Sent',
          type: record.fields['Type'] || 'Offer',
          sentDate: record.fields['Sent Date'] || '',
          responseDate: record.fields['Response Date'] || ''
        };
      });
    } catch (e) {
      console.log('Offers error:', e.message);
    }

    // 6. Categorize data
    const today = new Date().toISOString().split('T')[0];

    const pendingOffers = offers.filter(o => o.status === 'Sent' && o.type === 'Offer');
    const pendingApplications = offers.filter(o => o.status === 'Sent' && o.type === 'Application');
    const acceptedToday = offers.filter(o => o.status === 'Accepted' && o.responseDate === today);
    const declinedToday = offers.filter(o => o.status === 'Declined' && o.responseDate === today);

    const waitingContent = processedClips.filter(c => c.clipStatus === 'In Progress');
    const publishedRecent = processedClips.filter(c => c.status === 'Published').slice(0, 30);
    const publishedToday = processedClips.filter(c => c.publishDate === today);

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
        waitingContent: waitingContent.slice(0, 15),
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
