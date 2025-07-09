
import type { NextApiRequest, NextApiResponse } from 'next'

const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY!
const COMPANIES_HOUSE_BASE_URL = 'https://api.company-information.service.gov.uk'

type CompanyItem = {
  company_number: string;
  title: string;
  address_snippet: string;
  company_status: string;
  company_type: string;
  description_identifier: string[];
  kind: string;
  links: { self: string };
}

type CompaniesHouseResponse = {
  items?: CompanyItem[];
  start_index: number;
  page_number: number;
  kind: string;
  total_results: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter' })
  }

  const auth = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64')
  console.log('Attempting to call Companies House API...', auth);

  try {
    const apiRes = await fetch(`${COMPANIES_HOUSE_BASE_URL}/search/companies?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!apiRes.ok) {
      console.error(`Companies House API error: ${apiRes.status} ${apiRes.statusText}`);
      return res.status(apiRes.status).json({ 
        error: `Companies House API error: ${apiRes.status}`,
        items: [] 
      });
    }

    const data: CompaniesHouseResponse = await apiRes.json();
    console.log(`Found ${data.total_results} companies matching "${query}"`);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching company data:', error);
    return res.status(500).json({ 
      error: 'Internal server error while fetching company data',
      items: []
    });
  }
}
