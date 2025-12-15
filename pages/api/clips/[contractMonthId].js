// pages/api/clips/[contractMonthId].js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { contractMonthId } = req.query;

  if (!contractMonthId) {
    return res.status(400).json({ error: 'Contract Month ID is required' });
  }

  try {
    // First get the contract month to find related clips
    const contractMonth = await base('Contract Months').find(contractMonthId);
    
    if (!contractMonth) {
      return res.status(404).json({ error: 'Contract month not found' });
    }

    const clipIds = contractMonth.fields['Related Clips'] || [];
    
    if (clipIds.length === 0) {
      return res.status(200).json({ clips: [] });
    }

    // Fetch clips by their IDs
    const clips = await base('Clips')
      .select({
        filterByFormula: `OR(${clipIds.map(id => `RECORD_ID() = "${id}"`).join(',')})`,
        sort: [{ field: 'Publish Date', direction: 'desc' }]
      })
      .all();

    // Get all unique influencer IDs from clips
    const influencerIds = [...new Set(clips.flatMap(c => c.fields['Influencer'] || []))];
    
    // Fetch influencer details
    let influencerMap = {};
    if (influencerIds.length > 0) {
      const influencers = await base('Influencers')
        .select({
          filterByFormula: `OR(${influencerIds.map(id => `RECORD_ID() = "${id}"`).join(',')})`,
          fields: ['Influencer Name', 'Influencer_Image']
        })
        .all();
      
      influencers.forEach(inf => {
        const image = inf.fields['Influencer_Image'];
        influencerMap[inf.id] = {
          name: inf.fields['Influencer Name'] || 'Unknown',
          image: image && image[0] ? image[0].url : null
        };
      });
    }

    const formattedClips = clips.map(record => {
      const influencerId = record.fields['Influencer'] ? record.fields['Influencer'][0] : null;
      const influencer = influencerId ? influencerMap[influencerId] : { name: 'Unknown', image: null };
      
      return {
        id: record.id,
        clipId: record.fields['Clip ID'] || '',
        influencer: influencer.name,
        influencerImage: influencer.image,
        platform: record.fields['Social'] || 'TikTok',
        link: record.fields['Social Media link'] || '',
        publishDate: record.fields['Publish Date'] || '',
        views: record.fields['Total Views'] || 0,
        likes: record.fields['Likes'] || 0,
        comments: record.fields['Comments'] || 0,
        shares: record.fields['Share'] || 0,
        saves: record.fields['Saves'] || 0,
        status: record.fields['Status'] || 'Draft',
        clipStatus: record.fields['Clip Status'] || ''
      };
    });

    res.status(200).json({ clips: formattedClips });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch clips', details: error.message });
  }
}
