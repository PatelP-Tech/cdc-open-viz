export function getQueryStringFilterValue(filter) {
  const urlParams = new URLSearchParams(window.location.search)
  if(filter.setByQueryParameter){ // Only check the query string if the filter is supposed to be set by QS param
    const filterValue = urlParams.get(filter.setByQueryParameter)
    if(filterValue && filter.values){
      for(let i = 0; i < filter.values.length; i++){
        if(filter.values[i] && filter.values[i].toLowerCase() === filterValue.toLowerCase()){
          return filter.values[i]
        }
      }
    }
  }
}

export function getQueryParams(filter) {
  const queryParams = {};
  for (const [key, value] of (new URLSearchParams(window.location.search)).entries()) {
    queryParams[key] = value
  }
  return queryParams;
}

export function updateQueryString(queryParams) {
  const updateUrl = `${window.location.origin}${window.location.pathname}?${Object.keys(queryParams).map(queryParam => `${queryParam}=${encodeURIComponent(queryParams[queryParam])}`).join('&')}`;
  window.history.pushState({path: updateUrl}, '', updateUrl);
}
