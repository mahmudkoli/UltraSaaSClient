const toQueryString = (obj: any) => {
  const parts: any[] = []
  for (const property in obj) {
    const value = obj[property]
    if (value != null && value !== undefined) {
      parts.push(encodeURIComponent(property) + '=' + encodeURIComponent(value))
    }
  }

  return parts.join('&')
}

export const commonHelperService = {
  convertToQueryString: toQueryString
}
