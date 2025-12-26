// pages/api/influencer/update-profile.js
// API endpoint for updating influencer profile data
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed. Use POST, PUT, or PATCH.' });
  }

  const { influencerId, ...updateData } = req.body;

  if (!influencerId) {
    return res.status(400).json({ error: 'Influencer ID is required' });
  }

  try {
    // ============ 1. VERIFY INFLUENCER EXISTS ============
    let influencer;
    try {
      influencer = await base('Influencers').find(influencerId);
    } catch (e) {
      return res.status(404).json({ error: 'Influencer not found', influencerId });
    }

    // ============ 2. MAP UPDATE FIELDS ============
    // Map frontend field names to Airtable field names
    const fieldMapping = {
      // Try multiple possible Airtable field names
      phone: ['Phone', 'Telefon', 'Phone Number'],
      city: ['City', 'Grad', 'Location'],
      tiktokHandle: ['TikTok Handle', 'TikTok', 'TikTok Username'],
      instagramHandle: ['Instagram Handle', 'Instagram', 'Instagram Username'],
      shirtSize: ['Shirt Size', 'Veličina majice', 'T-Shirt Size'],
      pantsSize: ['Pants Size', 'Veličina pantalona', 'Pants'],
      shoeSize: ['Shoe Size', 'Broj cipela', 'Shoes'],
      categories: ['Categories', 'Kategorije', 'Niches'],
      bio: ['Bio', 'About', 'Description'],
      email: ['Email', 'E-mail', 'Email Address']
    };

    // Get existing field names from the record to know which names Airtable uses
    const existingFieldNames = Object.keys(influencer.fields);
    
    // Build the update object with correct field names
    const fieldsToUpdate = {};
    
    for (const [frontendKey, possibleNames] of Object.entries(fieldMapping)) {
      if (updateData[frontendKey] !== undefined) {
        // Find which field name exists in Airtable
        const matchingFieldName = possibleNames.find(name => existingFieldNames.includes(name));
        
        if (matchingFieldName) {
          fieldsToUpdate[matchingFieldName] = updateData[frontendKey];
        } else {
          // Use first option as default
          fieldsToUpdate[possibleNames[0]] = updateData[frontendKey];
        }
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update',
        receivedFields: Object.keys(updateData)
      });
    }

    // ============ 3. UPDATE RECORD ============
    const updatedRecord = await base('Influencers').update([
      {
        id: influencerId,
        fields: fieldsToUpdate
      }
    ]);

    // ============ 4. RETURN UPDATED DATA ============
    const updated = updatedRecord[0];
    
    res.status(200).json({
      success: true,
      message: 'Profil je uspešno ažuriran!',
      influencer: {
        id: updated.id,
        name: updated.fields['Influencer Name'] || updated.fields['Name'] || 'Unknown',
        phone: updated.fields['Phone'] || updated.fields['Telefon'] || '',
        city: updated.fields['City'] || updated.fields['Grad'] || '',
        tiktokHandle: updated.fields['TikTok Handle'] || updated.fields['TikTok'] || '',
        instagramHandle: updated.fields['Instagram Handle'] || updated.fields['Instagram'] || '',
        shirtSize: updated.fields['Shirt Size'] || updated.fields['Veličina majice'] || '',
        pantsSize: updated.fields['Pants Size'] || updated.fields['Veličina pantalona'] || '',
        shoeSize: updated.fields['Shoe Size'] || updated.fields['Broj cipela'] || '',
        categories: updated.fields['Categories'] || updated.fields['Kategorije'] || [],
        bio: updated.fields['Bio'] || ''
      },
      updatedFields: Object.keys(fieldsToUpdate)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile', 
      details: error.message 
    });
  }
}
