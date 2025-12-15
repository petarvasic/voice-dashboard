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
    // Fetch clips for this contract month
    const clips = await base('Clips')
      .select({
        filterByFormula: `FIND("${contractMonthId}", ARRAYJOIN({Contract Months}))`,
        sort: [{ field: 'Publish Date', direction: 'desc' }]
      })
      .all();

    const formattedClips = clips.map(record => ({
      id: record.id,
      clipId: record.fields['Clip ID'] || '',
      influencer: record.fields['Influencer Name in Text'] || 'Unknown',
      platform: record.fields['Social'] || 'TikTok',
      link: record.fields['Social Media link'] || '',
      publishDate: record.fields['Publish Date'] || '',
      views: record.fields['Total Views'] || 0,
      viewsDay1to6: record.fields['Views (Day 1-6)'] || 0,
      viewsDay7Plus: record.fields['Views (Day 7- Contract End)'] || 0,
      likes: record.fields['Likes'] || 0,
      comments: record.fields['Comments'] || 0,
      shares: record.fields['Share'] || 0,
      saves: record.fields['Saves'] || 0,
      status: record.fields['Status'] || 'Draft',
      clipStatus: record.fields['Clip Status'] || ''
    }));

    res.status(200).json({ clips: formattedClips });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
}
