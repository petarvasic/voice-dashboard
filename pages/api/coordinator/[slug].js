// pages/api/coordinator/[slug].js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    // Test 1: Get all contract months (no filter)
    const allMonths = await base('Contract Months')
      .select({ maxRecords: 5 })
      .firstPage();

    // Test 2: Get active contract months
    const activeMonths = await base('Contract Months')
      .select({ 
        filterByFormula: `{Contract Status} = "Active"`,
        maxRecords: 5 
      })
      .firstPage();

    res.status(200).json({
      slug: slug,
      test1_allMonths: allMonths.length,
      test1_firstMonth: allMonths[0]?.fields['Month'] || 'none',
      test2_activeMonths: activeMonths.length,
      test2_firstActive: activeMonths[0]?.fields['Month'] || 'none'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
