// pages/api/shipments/index.js
// API for Shipments - GET all, POST new, PATCH update status, DELETE
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
      // Get influencer names
      const influencerMap = {};
      try {
        const recs = await base('Influencers').select({ fields: ['Influencer Name'], maxRecords: 2000 }).all();
        recs.forEach(r => { influencerMap[r.id] = r.fields['Influencer Name'] || 'Unknown'; });
      } catch (e) { console.log('Influencers error:', e.message); }

      // Get campaign names
      const campaignMap = {};
      try {
        const recs = await base('Contract Months').select({ fields: ['Month'], maxRecords: 1000 }).all();
        recs.forEach(r => { campaignMap[r.id] = r.fields['Month'] || 'Unknown'; });
      } catch (e) { console.log('Campaigns error:', e.message); }

      // Get shipments
      const records = await base('Shipments').select({ maxRecords: 500 }).all();
      
      const shipments = records.map(record => {
        const f = record.fields;
        const influencerId = f['Influencer']?.[0] || null;
        const contractMonthId = f['Contract Month']?.[0] || null;
        
        // Content comes from Notes field (what coordinator typed)
        const packageContent = f['Notes'] || '';
        
        return {
          id: record.id,
          name: f['Shipment Name'] || '',
          influencerId,
          influencerName: influencerId ? (influencerMap[influencerId] || 'Nepoznat') : 'Nepoznat',
          contractMonthId,
          contractMonthName: contractMonthId ? (campaignMap[contractMonthId] || 'Bez kampanje') : 'Bez kampanje',
          status: f['Status'] || 'Čeka slanje',
          packageContent, // This is what coordinator typed
          trackingNumber: f['Tracking Number'] || '',
          courier: f['Courier'] || '',
          sentDate: f['Sent Date'] || null,
          deliveredDate: f['Delivered Date'] || null,
          createdAt: f['Created'] || null
        };
      });
      
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
    const { influencerId, contractMonthId, coordinatorId, items, courier, notes } = req.body;
    
    if (!influencerId || !contractMonthId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const fields = { 'Status': 'Čeka slanje' };
      
      // Generate unique name
      fields['Shipment Name'] = `SHP-${Date.now().toString(36).toUpperCase()}`;
      
      // Links
      if (influencerId) fields['Influencer'] = [influencerId];
      if (contractMonthId) fields['Contract Month'] = [contractMonthId];
      if (coordinatorId) fields['Coordinator'] = [coordinatorId];
      
      // Package content goes directly to Notes (what coordinator typed in "SADRŽAJ PAKETA")
      // Combine items input and notes into one Notes field
      let notesContent = '';
      if (items && items.trim()) {
        notesContent = items.trim();
      }
      if (notes && notes.trim()) {
        notesContent = notesContent ? `${notesContent}\n${notes.trim()}` : notes.trim();
      }
      if (notesContent) {
        fields['Notes'] = notesContent;
      }
      
      // Courier
      const validCouriers = ['Pošta', 'Preuzimanje u kancelariji', 'Glovo/Wolt'];
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
      
      if (trackingNumber !== undefined) updateFields['Tracking Number'] = trackingNumber;
      
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
