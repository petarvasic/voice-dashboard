// pages/api/shipments/index.js
// API for Shipments - GET all, POST new, PATCH update status, DELETE
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
      
      // Debug: log first record to see field names
      if (records.length > 0) {
        console.log('Shipment fields available:', Object.keys(records[0].fields));
        console.log('First record fields:', JSON.stringify(records[0].fields, null, 2));
      }
      
      const shipments = records.map(record => {
        const fields = record.fields;
        
        // Try multiple possible field names for influencer name
        const influencerName = 
          fields['Influencer Name'] ||                           // Direct field
          fields['Name (from Influencer)']?.[0] ||              // Lookup array
          fields['Influencer Name (from Influencer)']?.[0] ||   // Another lookup format
          fields['Influencer (from Influencer)']?.[0] ||        // Yet another format
          '';
        
        // Try multiple possible field names for contract month / campaign name
        const contractMonthName = 
          fields['Contract Month Name'] ||                       // Direct field
          fields['Month (from Contract Month)']?.[0] ||         // Lookup array
          fields['Name (from Contract Month)']?.[0] ||          // Another lookup
          fields['Month']?.[0] ||                               // Simple lookup
          fields['Contract Month Name (from Contract Month)']?.[0] ||
          '';
        
        // Try to get coordinator name
        const coordinatorName = 
          fields['Coordinator Name'] ||
          fields['Name (from Coordinator)']?.[0] ||
          fields['Coordinator (from Coordinator)']?.[0] ||
          '';
        
        return {
          id: record.id,
          name: fields['Shipment Name'] || fields['Name'] || '',
          influencerId: fields['Influencer']?.[0] || null,
          influencerName: influencerName,
          contractMonthId: fields['Contract Month']?.[0] || null,
          contractMonthName: contractMonthName,
          coordinatorId: fields['Coordinator']?.[0] || null,
          coordinatorName: coordinatorName,
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
      // Build fields object
      const fields = {
        'Status': 'Čeka slanje'
      };
      
      // Shipment Name is REQUIRED (Primary Key) - generate unique name
      const timestamp = Date.now();
      const shortId = timestamp.toString(36).toUpperCase();
      fields['Shipment Name'] = `SHP-${shortId}`;
      
      // Link fields must be arrays of record IDs
      if (influencerId) fields['Influencer'] = [influencerId];
      if (contractMonthId) fields['Contract Month'] = [contractMonthId];
      if (coordinatorId) fields['Coordinator'] = [coordinatorId];
      
      // Items is a multi-select field with ONLY these valid options:
      const validItems = ['2x majica M', '1x parfem', '1x kozmetika set', '3x sample proizvoda'];
      
      // Process items - valid options go to Items field, custom text goes to Notes
      let notesText = notes || '';
      
      if (items) {
        let itemsArray = [];
        if (typeof items === 'string') {
          itemsArray = items.split(',').map(item => item.trim()).filter(Boolean);
        } else if (Array.isArray(items)) {
          itemsArray = items;
        }
        
        // Filter to only valid options for Items field
        const validItemsToSave = itemsArray.filter(item => validItems.includes(item));
        if (validItemsToSave.length > 0) {
          fields['Items'] = validItemsToSave;
        }
        
        // Custom text (not matching valid options) goes to Notes
        const customItems = itemsArray.filter(item => !validItems.includes(item));
        if (customItems.length > 0) {
          const customItemsText = 'Sadržaj: ' + customItems.join(', ');
          notesText = notesText ? `${notesText}\n${customItemsText}` : customItemsText;
        }
      }
      
      if (notesText) {
        fields['Notes'] = notesText;
      }
      
      // Courier is a single-select field - must match exactly
      const validCouriers = ['Pošta', 'Preuzimanje u kancelariji', 'Glovo/Wolt'];
      if (courier && validCouriers.includes(courier)) {
        fields['Courier'] = courier;
      }
      
      console.log('Creating shipment with fields:', JSON.stringify(fields));
      
      const newRecord = await base('Shipments').create([{ fields }]);
      
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
      console.error('Error details:', error.message);
      return res.status(500).json({ 
        error: 'Failed to create shipment', 
        details: error.message,
        airtableError: error.error || null
      });
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
  
  // ============ DELETE - Delete shipment ============
  if (req.method === 'DELETE') {
    const { shipmentId } = req.body;
    
    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }
    
    try {
      await base('Shipments').destroy([shipmentId]);
      
      return res.status(200).json({
        success: true,
        message: 'Paket obrisan'
      });
      
    } catch (error) {
      console.error('Shipments DELETE error:', error);
      return res.status(500).json({ error: 'Failed to delete shipment', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
