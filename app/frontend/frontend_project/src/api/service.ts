import { getApiBase } from './constants';

//Still needs to be tested However this should stop the backend and the api from showing in inspect element

// construct endpoints to make them harder to extract
const getEndpoints = () => {
  const base = getApiBase();
  const paths = {
    stats: 'transactions/stats/',
    isoForest: 'isolation-forest/analyze/',
    randForest: 'random_forest/analyze/'
  };
  
  return {
    getStats: () => `${base}/${paths.stats}`,
    runIsolationForest: () => `${base}/${paths.isoForest}`,
    runRandomForest: () => `${base}/${paths.randForest}`
  };
};

// build the URLs only when called
export const apiService = {
  fetchTransactionStats: async () => {
    const response = await fetch(getEndpoints().getStats());
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
  
  runIsolationForest: async (params: Record<string, number>) => {
    const url = new URL(getEndpoints().runIsolationForest());
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  },
  
  runRandomForest: async (params: Record<string, number>) => {
    const url = new URL(getEndpoints().runRandomForest());
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  }
};
