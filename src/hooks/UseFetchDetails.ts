import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

export function useSearchParamsHelper() {
  const { state } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  const updateParams = () => {
    const params = new URLSearchParams(searchParams);

    if (state.searchTerm) params.set('q', state.searchTerm);
    else params.delete('q');

    if (currentPage > 1) params.set('page', currentPage.toString());
    else params.delete('page');

    if (pageSize) params.set('pageSize', pageSize.toString());
    else params.delete('pageSize');

    setSearchParams(params);
    navigate(`/results?${params.toString()}`, { replace: false });

    return params;
  };

  return { updateParams, searchParams, setSearchParams };
}
