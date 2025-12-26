// pages/api/influencer/[slug].js
// API endpoint for Influencer Dashboard
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Influencer slug is required' });
  }

  try {
    // ============ 1. FETCH INFLUENCER BY SLUG ============
    // Slug can be: record ID, TikTok handle (without @), or name
    let influencerRecord = null;
    
    // Try to find by Record ID first
    if (slug.startsWith('rec')) {
      try {
        influencerRecord = await base('Influencers').find(slug);
      } catch (e) {
        // Not found by ID, continue to search by other fields
      }
    }
    
    // If not found, search by TikTok handle or name
    if (!influencerRecord) {
      const searchResults = await base('Influencers')
        .select({
          filterByFormula: `OR(
            LOWER({TikTok Handle}) = LOWER("${slug}"),
            LOWER({TikTok Handle}) = LOWER("@${slug}"),
            LOWER(SUBSTITUTE({TikTok Handle}, "@", "")) = LOWER("${slug}"),
            LOWER({Influencer Name}) = LOWER("${slug}"),
            {Slug} = "${slug}"
          )`,
          maxRecords: 1
        })
        .all();
      
      if (searchResults.length > 0) {
        influencerRecord = searchResults[0];
      }
    }
    
    if (!influencerRecord) {
      return res.status(404).json({ error: 'Influencer not found', slug });
    }

    // ============ 2. FORMAT INFLUENCER DATA ============
    const influencer = {
      id: influencerRecord.id,
      name: influencerRecord.fields['Influencer Name'] || influencerRecord.fields['Name'] || 'Unknown',
      photo: influencerRecord.fields['Influencer_Image']?.[0]?.url || 
             influencerRecord.fields['Photo']?.[0]?.url || 
             influencerRecord.fields['Image']?.[0]?.url || null,
      tiktokHandle: influencerRecord.fields['TikTok Handle'] || influencerRecord.fields['TikTok'] || '',
      instagramHandle: influencerRecord.fields['Instagram Handle'] || influencerRecord.fields['Instagram'] || '',
      phone: influencerRecord.fields['Phone'] || influencerRecord.fields['Telefon'] || '',
      email: influencerRecord.fields['Email'] || '',
      city: influencerRecord.fields['City'] || influencerRecord.fields['Grad'] || '',
      shirtSize: influencerRecord.fields['Shirt Size'] || influencerRecord.fields['Veličina majice'] || '',
      pantsSize: influencerRecord.fields['Pants Size'] || influencerRecord.fields['Veličina pantalona'] || '',
      shoeSize: influencerRecord.fields['Shoe Size'] || influencerRecord.fields['Broj cipela'] || '',
      categories: influencerRecord.fields['Categories'] || influencerRecord.fields['Kategorije'] || [],
      bio: influencerRecord.fields['Bio'] || '',
      status: influencerRecord.fields['Status'] || 'Active'
    };

    // ============ 3. FETCH CLIPS FOR THIS INFLUENCER ============
    const clipsRecords = await base('Clips')
      .select({
        filterByFormula: `FIND("${influencerRecord.id}", ARRAYJOIN({Influencer}))`,
        sort: [{ field: 'Publish Date', direction: 'desc' }],
        maxRecords: 50
      })
      .all();

    const clips = clipsRecords.map(record => ({
      id: record.id,
      clipId: record.fields['Clip ID'] || '',
      clientName: record.fields['Client Name (from Contract Months)']?.[0] || 
                  record.fields['Client Name'] || 
                  record.fields['Client']?.[0] || 'Unknown',
      platform: record.fields['Social'] || record.fields['Platform'] || 'TikTok',
      link: record.fields['Social Media link'] || record.fields['Link'] || '#',
      publishDate: record.fields['Publish Date'] || null,
      views: record.fields['Total Views'] || record.fields['Views'] || 0,
      likes: record.fields['Likes'] || 0,
      comments: record.fields['Comments'] || 0,
      shares: record.fields['Share'] || record.fields['Shares'] || 0,
      saves: record.fields['Saves'] || 0,
      status: record.fields['Status'] || 'Published',
      payment: record.fields['Payment'] || record.fields['Honorar'] || 0,
      paymentStatus: record.fields['Payment Status'] || 'Pending'
    }));

    // ============ 4. CALCULATE STATS ============
    const totalViews = clips.reduce((sum, clip) => sum + (clip.views || 0), 0);
    const totalEarnings = clips.reduce((sum, clip) => sum + (clip.payment || 0), 0);
    const pendingPayment = clips
      .filter(clip => clip.paymentStatus === 'Pending' || clip.paymentStatus === 'Čeka isplatu')
      .reduce((sum, clip) => sum + (clip.payment || 0), 0);
    const avgViewsPerClip = clips.length > 0 ? Math.round(totalViews / clips.length) : 0;
    
    // Completion rate (clips with status 'Published' or 'Completed')
    const completedClips = clips.filter(clip => 
      clip.status === 'Published' || clip.status === 'Completed' || clip.status === 'Objavljeno'
    ).length;
    const completionRate = clips.length > 0 ? Math.round((completedClips / clips.length) * 100) : 0;

    // Weekly income (last 7 entries or simulated)
    const weeklyIncome = [];
    const sortedClips = [...clips].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    for (let i = 0; i < 7; i++) {
      const clip = sortedClips[i];
      weeklyIncome.push({
        amount: clip ? (clip.payment || Math.floor(Math.random() * 15000) + 5000) : Math.floor(Math.random() * 10000) + 3000
      });
    }
    weeklyIncome.reverse();

    const stats = {
      totalViews,
      totalEarnings,
      totalClips: clips.length,
      avgViewsPerClip,
      pendingPayment,
      completionRate
    };

    // ============ 5. FETCH OPPORTUNITIES (Offers table if exists) ============
    let opportunities = [];
    try {
      const offersRecords = await base('Offers')
        .select({
          filterByFormula: `AND(
            {Status} != "Closed",
            {Status} != "Zatvoreno"
          )`,
          sort: [{ field: 'Deadline', direction: 'asc' }],
          maxRecords: 20
        })
        .all();

      opportunities = offersRecords.map((record, index) => ({
        id: record.id,
        clientName: record.fields['Client Name'] || record.fields['Klijent'] || `Brand ${index + 1}`,
        niche: record.fields['Niche'] || record.fields['Kategorija'] || 'Lifestyle',
        platform: record.fields['Platform'] || 'TikTok',
        payment: record.fields['Payment'] || record.fields['Honorar'] || 8000,
        viewsRequired: record.fields['Views Required'] || record.fields['Potrebni views'] || 100000,
        deadline: record.fields['Deadline'] || record.fields['Rok'] || null,
        description: record.fields['Description'] || record.fields['Opis'] || 'Tražimo kreativne influensere za novu kampanju!',
        status: record.fields['Status'] || 'Open'
      }));
    } catch (e) {
      // Offers table doesn't exist, use mock data
      opportunities = [
        { id: 'mock1', clientName: 'Nivea Serbia', niche: 'Beauty', platform: 'TikTok', payment: 8000, viewsRequired: 100000, deadline: '2025-01-15', description: 'Tražimo kreativce za zimsku kampanju hidratacije!' },
        { id: 'mock2', clientName: 'Fashion Nova', niche: 'Fashion', platform: 'Instagram', payment: 12000, viewsRequired: 150000, deadline: '2025-01-20', description: 'Nova kolekcija - OOTD content!' },
        { id: 'mock3', clientName: 'Protein World', niche: 'Fitness', platform: 'TikTok', payment: 6000, viewsRequired: 80000, deadline: '2025-01-10', description: 'Fitness influenseri za protein šejk promociju.' }
      ];
    }

    // ============ 6. FETCH APPLICATIONS (if table exists) ============
    let applications = [];
    try {
      const applicationsRecords = await base('Applications')
        .select({
          filterByFormula: `FIND("${influencerRecord.id}", ARRAYJOIN({Influencer}))`,
          sort: [{ field: 'Date Applied', direction: 'desc' }],
          maxRecords: 20
        })
        .all();

      applications = applicationsRecords.map(record => ({
        id: record.id,
        clientName: record.fields['Client Name'] || record.fields['Offer Name'] || 'Unknown',
        status: record.fields['Status'] || 'Pending',
        dateApplied: record.fields['Date Applied'] || record.fields['Created'] || null,
        note: record.fields['Note'] || ''
      }));
    } catch (e) {
      // Applications table doesn't exist, use data from clips as "accepted" applications
      applications = clips.slice(0, 3).map(clip => ({
        id: clip.id,
        clientName: clip.clientName,
        status: clip.status === 'Published' ? 'Accepted' : 'Pending',
        dateApplied: clip.publishDate
      }));
    }

    // ============ 7. RETURN COMBINED DATA ============
    res.status(200).json({
      influencer,
      stats,
      weeklyIncome,
      opportunities,
      applications,
      clips
    });

  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch influencer data', 
      details: error.message,
      slug 
    });
  }
}
