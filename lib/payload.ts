// Frontend utility to fetch data from Payload CMS
export const fetchPayload = async (endpoint: string) => {
  const response = await fetch(`/api/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch from Payload: ${response.statusText}`);
  }
  return response.json();
};

export const fetchGlobal = async (slug: string) => {
  const response = await fetch(`/api/globals/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch global from Payload: ${response.statusText}`);
  }
  return response.json();
};

export const fetchCollection = async (slug: string) => {
  const response = await fetch(`/api/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collection from Payload: ${response.statusText}`);
  }
  return response.json();
};
