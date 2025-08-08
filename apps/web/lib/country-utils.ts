import * as ct from "countries-and-timezones";

export const getCountryFromTimezone = (timezone: string) => {
  if (!timezone) return null;
  const timezoneInfo = ct.getTimezone(timezone);
  if (!timezoneInfo?.countries?.length) return null;

  const countryCode = timezoneInfo.countries[0];
  const country = ct.getCountry(countryCode as ct.CountryCode);
  return {
    name: country?.name || countryCode,
    code: countryCode,
  };
};

export const getCountryFlag = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};
