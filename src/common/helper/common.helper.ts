const toQueryString = (obj:any) => {
    let parts = [];
    for (const property in obj) {
      const value = obj[property];
      if (value != null && value !== undefined) {
        parts.push(encodeURIComponent(property) + '=' + encodeURIComponent(value));
      }
    }

    return parts.join('&');
}


export const commonHelperService = {
    convertToQueryString: toQueryString
}