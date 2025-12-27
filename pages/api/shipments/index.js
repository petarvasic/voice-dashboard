// pages/api/shipments/index.js
// API for Shipments - v6 with coordinator filtering
// HOD sees all, coordinators see only their clients' shipments
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============ GET ============
  if (req.method === 'GET') {
    try {
      const { coordinatorId, role } = req.query;
      
      // Get influencer names
      const influencerMap = {};
      try {
        const recs = await base('Influencers').select({ fields: ['Influencer Name'], maxRecords: 2000 }).all();
        recs.forEach(r => { influencerMap[r.id] = r.fields['Influencer Name'] || 'Unknown'; });
      } catch (e) { console.log('Influencers fetch error:', e.message); }

      // Get campaign/contract month info including coordinator
      const campaignMap = {};
      const campaignCoordinatorMap = {}; // Maps campaign ID to coordinator ID
      try {
        const recs = await base('Contract Months').select({ 
          fields: ['Month', 'Coordinator'],
          maxRecords: 1000 
        }).all();
        recs.forEach(r => { 
          campaignMap[r.id] = r.fields['Month'] || 'Unknown';
          // Store coordinator ID for this campaign
          if (r.fields['Coordinator'] && r.fields['Coordinator'][0]) {
            campaignCoordinatorMap[r.id] = r.fields['Coordinator'][0];
          }
        });
      } catch (e) { console.log('Campaigns fetch error:', e.message); }

      // Get all shipments
      const records = await base('Shipments').select({ maxRecords: 500 }).all();
      
      let shipments = records.map(record => {
        const f = record.fields;
        const influencerId = f['Influencer']?.[0] || null;
        const contractMonthId = f['Contract Month']?.[0] || null;
        
        // Get the coordinator ID from the campaign
        const shipmentCoordinatorId = contractMonthId ? campaignCoordinatorMap[contractMonthId] : null;
        
        return {
          id: record.id,
          name: f['Shipment Name'] || '',
          influencerId,
          influencerName: influencerId ? (influencerMap[influencerId] || 'Nepoznat') : 'Nepoznat',
          contractMonthId,
          contractMonthName: contractMonthId ? (campaignMap[contractMonthId] || 'Bez kampanje') : 'Bez kampanje',
          coordinatorId: shipmentCoordinatorId, // Coordinator who owns this campaign
          status: f['Status'] || 'Čeka slanje',
          packageContent: f['Notes'] || '',
          trackingNumber: f['Tracking Number'] || '',
          courier: f['Courier'] || '',
          sentDate: f['Sent Date'] || null,
          deliveredDate: f['Delivered Date'] || null,
          createdAt: f['Created'] || null
        };
      });
      
      // Filter by coordinator if not HOD
      // HOD (role === 'HOD') sees everything
      // Regular coordinators see only shipments for their campaigns
      if (coordinatorId && role !== 'HOD') {
        shipments = shipments.filter(s => s.coordinatorId === coordinatorId);
      }
      
      const summary = {
        total: shipments.length,
        waiting: shipments.filter(s => s.status === 'Čeka slanje').length,
        inTransit: shipments.filter(s => s.status === 'U dostavi').length,
        delivered: shipments.filter(s => s.status === 'Dostavljeno').length
      };
      
      return res.status(200).json({ shipments, summary });
    } catch (error) {
      console.error('GET error:', error);
      return res.status(500).json({ error: 'Failed to fetch', details: error.message });
    }
  }
  
  // ============ POST ============
  if (req.method === 'POST') {
    const { influencerId, contractMonthId, items, courier, notes } = req.body;
    
    if (!influencerId || !contractMonthId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const fields = {
        'Status': 'Čeka slanje',
        'Shipment Name': `SHP-${Date.now().toString(36).toUpperCase()}`,
        'Influencer': [influencerId],
        'Contract Month': [contractMonthId]
      };
      
      // Package content goes to Notes
      let notesContent = '';
      if (items && items.trim()) notesContent = items.trim();
      if (notes && notes.trim()) {
        notesContent = notesContent ? `${notesContent}\n${notes.trim()}` : notes.trim();
      }
      if (notesContent) fields['Notes'] = notesContent;
      
      // Courier
      const validCouriers = ['Pošta', 'Preuzimanje u kancelariji', 'Glovo/Wolt', 'Kurir'];
      if (courier && validCouriers.includes(courier)) {
        fields['Courier'] = courier;
      }
      
      const newRecord = await base('Shipments').create([{ fields }]);
      
      return res.status(201).json({
        success: true,
        message: 'Paket kreiran!',
        shipment: { id: newRecord[0].id }
      });
    } catch (error) {
      console.error('POST error:', error);
      return res.status(500).json({ error: 'Failed to create', details: error.message });
    }
  }
  
  // ============ PATCH ============
  if (req.method === 'PATCH') {
    const { shipmentId, status, trackingNumber } = req.body;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID required' });
    }
    
    try {
      const updateFields = {};
      
      if (status) {
        updateFields['Status'] = status;
        if (status === 'U dostavi') {
          updateFields['Sent Date'] = new Date().toISOString().split('T')[0];
        } else if (status === 'Dostavljeno') {
          updateFields['Delivered Date'] = new Date().toISOString().split('T')[0];
        }
      }
      
      if (trackingNumber !== undefined) {
        updateFields['Tracking Number'] = trackingNumber;
      }
      
      await base('Shipments').update([{ id: shipmentId, fields: updateFields }]);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('PATCH error:', error);
      return res.status(500).json({ error: 'Failed to update', details: error.message });
    }
  }
  
  // ============ DELETE ============
  if (req.method === 'DELETE') {
    const { shipmentId } = req.body;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID required' });
    }
    
    try {
      await base('Shipments').destroy([shipmentId]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('DELETE error:', error);
      return res.status(500).json({ error: 'Failed to delete', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
