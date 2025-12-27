// pages/api/shipments/index.js
// API for Shipments - GET all, POST new, PATCH update status, DELETE
// Fixed to fetch influencer and campaign names from linked tables
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============ GET - Fetch shipments with names ============
  if (req.method === 'GET') {
    try {
      // 1. First, get all influencers for name lookup
      const influencerMap = {};
      try {
        const influencerRecords = await base('Influencers')
          .select({ fields: ['Influencer Name'], maxRecords: 2000 })
          .all();
        influencerRecords.forEach(rec => {
          influencerMap[rec.id] = rec.fields['Influencer Name'] || 'Unknown';
        });
      } catch (e) {
        console.log('Could not fetch influencers:', e.message);
      }

      // 2. Get all contract months for name lookup
      const contractMonthMap = {};
      try {
        const monthRecords = await base('Contract Months')
          .select({ fields: ['Month'], maxRecords: 1000 })
          .all();
        monthRecords.forEach(rec => {
          contractMonthMap[rec.id] = rec.fields['Month'] || 'Unknown Campaign';
        });
      } catch (e) {
        console.log('Could not fetch contract months:', e.message);
      }

      // 3. Get all coordinators for name lookup
      const coordinatorMap = {};
      try {
        const coordRecords = await base('Users')
          .select({ fields: ['Name'], maxRecords: 100 })
          .all();
        coordRecords.forEach(rec => {
          coordinatorMap[rec.id] = rec.fields['Name'] || 'Unknown';
        });
      } catch (e) {
        console.log('Could not fetch coordinators:', e.message);
      }

      // 4. Now get shipments
      const records = await base('Shipments')
        .select({ maxRecords: 500 })
        .all();
      
      const shipments = records.map(record => {
        const fields = record.fields;
        
        // Get IDs from link fields
        const influencerId = fields['Influencer']?.[0] || null;
        const contractMonthId = fields['Contract Month']?.[0] || null;
        const coordinatorId = fields['Coordinator']?.[0] || null;
        
        // Look up names from our maps
        const influencerName = influencerId ? influencerMap[influencerId] : '';
        const contractMonthName = contractMonthId ? contractMonthMap[contractMonthId] : '';
        const coordinatorName = coordinatorId ? coordinatorMap[coordinatorId] : '';
        
        return {
          id: record.id,
          name: fields['Shipment Name'] || '',
          influencerId,
          influencerName: influencerName || 'Nepoznat influencer',
          contractMonthId,
          contractMonthName: contractMonthName || 'Bez kampanje',
          coordinatorId,
          coordinatorName: coordinatorName || '',
          status: fields['Status'] || 'Čeka slanje',
          items: fields['Items'] || [],
          trackingNumber: fields['Tracking Number'] || '',
          courier: fields['Courier'] || '',
          sentDate: fields['Sent Date'] || null,
          deliveredDate: fields['Delivered Date'] || null,
          notes: fields['Notes'] || '',
          createdAt: fields['Created'] || null
        };
      });
      
      // Group by status for summary
      const summary = {
        total: shipments.length,
        waiting: shipments.filter(s => s.status === 'Čeka slanje').length,
        inTransit: shipments.filter(s => s.status === 'U dostavi').length,
        delivered: shipments.filter(s => s.status === 'Dostavljeno').length
      };
      
      return res.status(200).json({ shipments, summary });
      
    } catch (error) {
      console.error('Shipments GET error:', error);
      return res.status(500).json({ error: 'Failed to fetch shipments', details: error.message });
    }
  }
  
  // ============ POST - Create new shipment ============
  if (req.method === 'POST') {
    const { influencerId, contractMonthId, coordinatorId, items, courier, notes } = req.body;
    
    if (!influencerId || !contractMonthId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['influencerId', 'contractMonthId'] 
      });
    }
    
    try {
      const fields = {
        'Status': 'Čeka slanje'
      };
      
      // Generate unique shipment name
      const timestamp = Date.now();
      const shortId = timestamp.toString(36).toUpperCase();
      fields['Shipment Name'] = `SHP-${shortId}`;
      
      // Link fields
      if (influencerId) fields['Influencer'] = [influencerId];
      if (contractMonthId) fields['Contract Month'] = [contractMonthId];
      if (coordinatorId) fields['Coordinator'] = [coordinatorId];
      
      // Items - valid options only
      const validItems = ['2x majica M', '1x parfem', '1x kozmetika set', '3x sample proizvoda'];
      let notesText = notes || '';
      
      if (items) {
        let itemsArray = typeof items === 'string' 
          ? items.split(',').map(i => i.trim()).filter(Boolean)
          : Array.isArray(items) ? items : [];
        
        const validItemsToSave = itemsArray.filter(item => validItems.includes(item));
        if (validItemsToSave.length > 0) {
          fields['Items'] = validItemsToSave;
        }
        
        // Custom items go to notes
        const customItems = itemsArray.filter(item => !validItems.includes(item));
        if (customItems.length > 0) {
          const customText = 'Sadržaj: ' + customItems.join(', ');
          notesText = notesText ? `${notesText}\n${customText}` : customText;
        }
      }
      
      if (notesText) fields['Notes'] = notesText;
      
      // Courier
      const validCouriers = ['Pošta', 'Preuzimanje u kancelariji', 'Glovo/Wolt'];
      if (courier && validCouriers.includes(courier)) {
        fields['Courier'] = courier;
      }
      
      const newRecord = await base('Shipments').create([{ fields }]);
      
      return res.status(201).json({
        success: true,
        message: 'Paket je kreiran!',
        shipment: { id: newRecord[0].id, status: 'Čeka slanje' }
      });
      
    } catch (error) {
      console.error('Shipments POST error:', error);
      return res.status(500).json({ error: 'Failed to create shipment', details: error.message });
    }
  }
  
  // ============ PATCH - Update shipment status ============
  if (req.method === 'PATCH') {
    const { shipmentId, status, trackingNumber, courier, notes } = req.body;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
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
      if (courier) updateFields['Courier'] = courier;
      if (notes !== undefined) updateFields['Notes'] = notes;
      
      const updatedRecord = await base('Shipments').update([
        { id: shipmentId, fields: updateFields }
      ]);
      
      return res.status(200).json({
        success: true,
        message: status ? `Status: ${status}` : 'Ažurirano',
        shipment: { id: updatedRecord[0].id, status: updatedRecord[0].fields['Status'] }
      });
      
    } catch (error) {
      console.error('Shipments PATCH error:', error);
      return res.status(500).json({ error: 'Failed to update', details: error.message });
    }
  }
  
  // ============ DELETE - Delete shipment ============
  if (req.method === 'DELETE') {
    const { shipmentId } = req.body;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }
    
    try {
      await base('Shipments').destroy([shipmentId]);
      return res.status(200).json({ success: true, message: 'Obrisano' });
    } catch (error) {
      console.error('Shipments DELETE error:', error);
      return res.status(500).json({ error: 'Failed to delete', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
