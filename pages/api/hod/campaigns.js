// pages/api/hod/campaigns.js - HOD Dashboard API (Simplified)
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Parse date from various formats
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateStr);
};

// Calculate campaign status based on progress vs expected
const calculateStatus = (percentDelivered, startDate, endDate) => {
  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) {
    if (percentDelivered >= 100) return { status: 'DONE', color: 'green', priority: 4 };
    if (percentDelivered >= 80) return { status: 'OK', color: 'green', priority: 3 };
    if (percentDelivered >= 50) return { status: 'PRATI', color: 'yellow', priority: 2 };
    return { status: 'KASNI', color: 'red', priority: 1 };
  }
  
  const totalDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
  const daysPassed = Math.max((now - start) / (1000 * 60 * 60 * 24), 0);
  const daysRemaining = Math.max((end - now) / (1000 * 60 * 60 * 24), 0);
  
  const expectedProgress = Math.min((daysPassed / totalDays) * 100, 100);
  const actualProgress = percentDelivered || 0;
  const gap = actualProgress - expectedProgress;
  
  if (actualProgress >= 100) {
    return { status: 'DONE', color: 'green', priority: 4, gap, expectedProgress, daysRemaining: Math.round(daysRemaining) };
  }
  
  if (daysRemaining <= 7 && actualProgress < 85) {
    return { status: 'KRITIČNO', color: 'red', priority: 0, gap, expectedProgress, daysRemaining: Math.round(daysRemaining) };
  }
  
  if (gap < -20) {
    return { status: 'KASNI', color: 'red', priority: 1, gap, expectedProgress, daysRemaining: Math.round(daysRemaining) };
  }
  
  if (gap < -10) {
    return { status: 'PRATI', color: 'yellow', priority: 2, gap, expectedProgress, daysRemaining: Math.round(daysRemaining) };
  }
  
  return { status: 'OK', color: 'green', priority: 3, gap, expectedProgress, daysRemaining: Math.round(daysRemaining) };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all contract months - without specifying fields (get all)
    const contractMonths = await base('Contract Months')
      .select({
        maxRecords: 500
      })
      .all();

    // Fetch all clients for names
    const clients = await base('Clients')
      .select({
        maxRecords: 200
      })
      .all();

    const clientMap = {};
    clients.forEach(client => {
      // Try different possible field names for client name
      const name = client.fields['Name'] || client.fields['Client Name'] || client.fields['Company'] || client.fields['Ime'] || 'Unknown';
      clientMap[client.id] = {
        id: client.id,
        name: name,
        logo: client.fields['Logo']?.[0]?.url || null
      };
    });

    // Process campaigns - adapt to actual field names
    const campaigns = contractMonths.map(record => {
      const fields = record.fields;
      
      // Get client - could be array or single value
      const clientIds = fields['Client'] || [];
      const clientId = Array.isArray(clientIds) ? clientIds[0] : clientIds;
      let client = clientMap[clientId] || { id: clientId, name: 'Unknown', logo: null };
      
      // If client name is still Unknown, try to extract from Month field
      // Month format is typically "Client Name – Month Year"
      const monthField = fields['Month'] || '';
      if (client.name === 'Unknown' && monthField.includes('–')) {
        const extractedName = monthField.split('–')[0].trim();
        if (extractedName) {
          client = { ...client, name: extractedName };
        }
      }
      
      // Get percent delivered - try different possible field names
      // Airtable stores as decimal (0.5 = 50%), so multiply by 100
      let percentDelivered = fields['%Delivered'] || fields['% Delivered'] || fields['Percent Delivered'] || 0;
      if (percentDelivered > 0 && percentDelivered < 5) {
        // It's stored as decimal (0.5), convert to percent (50)
        percentDelivered = percentDelivered * 100;
      }
      
      // Get dates
      const startDate = fields['Start Date'] || fields['StartDate'] || fields['Start'];
      const endDate = fields['End Date'] || fields['EndDate'] || fields['End'];
      
      // Get goal - try different possible field names
      const goal = fields['Goal'] || fields['Views Goal'] || fields['Target'] || 0;
      
      // Get delivered views
      const delivered = fields['Number of Views Achieved'] || fields['Views Achieved'] || fields['Views'] || 0;
      
      const statusInfo = calculateStatus(percentDelivered, startDate, endDate);
      const remaining = Math.max(goal - delivered, 0);
      
      return {
        id: record.id,
        month: fields['Month'] || 'Unknown',
        client: client,
        clientId: clientId,
        startDate: startDate,
        endDate: endDate,
        percentDelivered: percentDelivered,
        goal: goal,
        delivered: delivered,
        remaining: remaining,
        likes: fields['Number of Likes Achieved'] || 0,
        comments: fields['Number of Comment Achieved'] || 0,
        shares: fields['Number of Shares Achieved'] || 0,
        publishedClips: fields['Published Clips'] || 0,
        contractStatus: fields['Contract Status'] || 'Active',
        airtableStatus: fields['Progress Status'] || '',
        influencerCount: (fields['Influencers'] || []).length,
        ...statusInfo
      };
    });

    // Filter only active campaigns AND with valid client
    const activeCampaigns = campaigns.filter(c => {
      // Skip campaigns without proper client
      if (!c.clientId || c.client.name === 'Unknown') return false;
      
      if (c.contractStatus === 'Active' || c.contractStatus === 'Active ') return true;
      if (c.endDate) {
        const end = parseDate(c.endDate);
        if (end) {
          const daysSinceEnd = (new Date() - end) / (1000 * 60 * 60 * 24);
          return daysSinceEnd <= 30;
        }
      }
      return false;
    });

    // Sort by priority (critical first), then by gap
    activeCampaigns.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (a.gap || 0) - (b.gap || 0);
    });

    // Calculate summary stats
    const stats = {
      total: activeCampaigns.length,
      critical: activeCampaigns.filter(c => c.status === 'KRITIČNO').length,
      behind: activeCampaigns.filter(c => c.status === 'KASNI').length,
      watch: activeCampaigns.filter(c => c.status === 'PRATI').length,
      ok: activeCampaigns.filter(c => c.status === 'OK').length,
      done: activeCampaigns.filter(c => c.status === 'DONE').length,
      totalGoal: activeCampaigns.reduce((sum, c) => sum + (c.goal || 0), 0),
      totalDelivered: activeCampaigns.reduce((sum, c) => sum + (c.delivered || 0), 0),
      avgDelivery: activeCampaigns.length > 0 
        ? activeCampaigns.reduce((sum, c) => sum + (c.percentDelivered || 0), 0) / activeCampaigns.length 
        : 0
    };

    // Group by client
    const byClient = {};
    activeCampaigns.forEach(campaign => {
      const cId = campaign.clientId;
      if (!byClient[cId]) {
        byClient[cId] = {
          client: campaign.client,
          campaigns: [],
          totalGoal: 0,
          totalDelivered: 0,
          criticalCount: 0,
          behindCount: 0
        };
      }
      byClient[cId].campaigns.push(campaign);
      byClient[cId].totalGoal += campaign.goal || 0;
      byClient[cId].totalDelivered += campaign.delivered || 0;
      if (campaign.status === 'KRITIČNO') byClient[cId].criticalCount++;
      if (campaign.status === 'KASNI') byClient[cId].behindCount++;
    });

    const clientStats = Object.values(byClient).map(client => ({
      ...client,
      avgDelivery: client.campaigns.length > 0
        ? client.campaigns.reduce((sum, c) => sum + (c.percentDelivered || 0), 0) / client.campaigns.length
        : 0,
      worstGap: Math.min(...client.campaigns.map(c => c.gap || 0))
    }));

    clientStats.sort((a, b) => {
      if (a.criticalCount !== b.criticalCount) return b.criticalCount - a.criticalCount;
      if (a.behindCount !== b.behindCount) return b.behindCount - a.behindCount;
      return a.worstGap - b.worstGap;
    });

    res.status(200).json({
      campaigns: activeCampaigns,
      stats,
      clientStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('HOD API Error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns', details: error.message });
  }
}
