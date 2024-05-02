import { ApiKeys } from "@/app/secrets/api-keys";

export async function fetchWeatherData(zip: string) {
      
        //get zip coords
        const response = await fetch(
          `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${ApiKeys['open_weather_map']}`
        );
      
        if (response.ok) {
          const zipData = await response.json();
  
          const lat = zipData.lat;
          const lon = zipData.lon;
  
          const fetchGovWeather = async function(lat: number,lon: number) {
  
            const pointsResponse = await fetch(
              `https://api.weather.gov/points/${lat},${lon}`
            );
          
            if (pointsResponse.ok) {
              
              const pointsResponseBody = await pointsResponse.json();
              const gridId = pointsResponseBody.properties.gridId;
              const gridX = pointsResponseBody.properties.gridX;
              const gridY = pointsResponseBody.properties.gridY;
          
              const response = await fetch(
                `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`
              );
              
                if (response.ok) {
          
                  const govWeather = await response.json();
          
                  return govWeather;
          
                }
            }
          }
  
  
          const fetchOpenWeatherCurrent =  async function(lat: number,lon: number) {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${ApiKeys['open_weather_map']}`
            );
            if (response.ok) {
              const openWeatherCurrent = await response.json();
              return openWeatherCurrent;
            }
          }
  
          const fetchOpenWeather5Day =  async function(lat: number,lon: number) {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${ApiKeys['open_weather_map']}`
            );
            if (response.ok) {
              const openWeather5Day = await response.json();
              return openWeather5Day;
            }
          }
  
          const govWeather = await fetchGovWeather(lat,lon);
          const openWeatherCurrent = await fetchOpenWeatherCurrent(lat,lon);
          const openWeather5Day = await fetchOpenWeather5Day(lat,lon);
  
          return {
            govWeather: govWeather,
            openWeatherCurrent: openWeatherCurrent,
            openWeather5Day: openWeather5Day
          }; 

        } else {
            return {};
        }

}