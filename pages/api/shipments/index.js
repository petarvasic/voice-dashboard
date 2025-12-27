// pages/api/shipments/index.js
// API for Shipments - GET all, POST new, PATCH update status
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============ GET - Fetch shipments ============
  if (req.method === 'GET') {
    const { coordinatorId, contractMonthId, status } = req.query;
    
    try {
      let filterFormula = '';
      
      if (coordinatorId) {
        filterFormula = `FIND("${coordinatorId}", ARRAYJOIN({Coordinator}))`;
      } else if (contractMonthId) {
        filterFormula = `FIND("${contractMonthId}", ARRAYJOIN({Contract Month}))`;
      } else if (status) {
        filterFormula = `{Status} = "${status}"`;
      }
      
      const selectOptions = {
        maxRecords: 500
      };
      
      if (filterFormula) {
        selectOptions.filterByFormula = filterFormula;
      }
      
      const records = await base('Shipments')
        .select(selectOptions)
        .all();
      
      const shipments = records.map(record => ({
        id: record.id,
        name: record.fields['Name'] || '',
        influencerId: record.fields['Influencer']?.[0] || null,
        influencerName: record.fields['Influencer Name'] || record.fields['Influencer (from Influencer)']?.[0] || '',
        contractMonthId: record.fields['Contract Month']?.[0] || null,
        contractMonthName: record.fields['Contract Month Name'] || record.fields['Month (from Contract Month)']?.[0] || '',
        coordinatorId: record.fields['Coordinator']?.[0] || null,
        coordinatorName: record.fields['Coordinator Name'] || record.fields['Name (from Coordinator)']?.[0] || '',
        status: record.fields['Status'] || 'Čeka slanje',
        items: record.fields['Items'] || '',
        trackingNumber: record.fields['Tracking Number'] || '',
        courier: record.fields['Courier'] || '',
        sentDate: record.fields['Sent Date'] || null,
        deliveredDate: record.fields['Delivered Date'] || null,
        notes: record.fields['Notes'] || '',
        createdAt: record.fields['Created'] || null
      }));
      
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
      const newRecord = await base('Shipments').create([
        {
          fields: {
            'Influencer': [influencerId],
            'Contract Month': [contractMonthId],
            'Coordinator': coordinatorId ? [coordinatorId] : [],
            'Status': 'Čeka slanje',
            'Items': items || '',
            'Courier': courier || '',
            'Notes': notes || ''
          }
        }
      ]);
      
      return res.status(201).json({
        success: true,
        message: 'Paket je kreiran!',
        shipment: {
          id: newRecord[0].id,
          status: 'Čeka slanje'
        }
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
        
        // Auto-set dates based on status
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
        {
          id: shipmentId,
          fields: updateFields
        }
      ]);
      
      return res.status(200).json({
        success: true,
        message: status ? `Status promenjen u "${status}"` : 'Paket ažuriran',
        shipment: {
          id: updatedRecord[0].id,
          status: updatedRecord[0].fields['Status']
        }
      });
      
    } catch (error) {
      console.error('Shipments PATCH error:', error);
      return res.status(500).json({ error: 'Failed to update shipment', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
