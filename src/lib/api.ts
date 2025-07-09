interface CompanyItem {
  title: string;
}

interface CompanySearchResponse {
  items?: CompanyItem[];
  error?: string;
}

export const searchCompanies = async (query: string): Promise<CompanySearchResponse> => {
  try {
    console.log(`Searching for companies matching: ${query}`);
    const response = await fetch(`/api/companies/search?query=${encodeURIComponent(query)}`);
    
    const data = await response.json();
    console.log(`API response status: ${data}`);
    if (data.error) {
      console.warn(`API returned error: ${data.error}`);
    }
    return data;
  } catch (error) {
    console.error('Error in searchCompanies:', error);
    return { error: 'Failed to fetch companies' };
  }
};