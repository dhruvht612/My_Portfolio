import { fetchPortfolioFromSupabase } from '../lib/portfolioFetchers'
import { useSupabaseQuery } from './useSupabaseQuery'

/** Full portfolio slice for `PortfolioProvider`. */
export function useSupabasePortfolioSlice() {
  return useSupabaseQuery((client) => fetchPortfolioFromSupabase(client), [])
}
