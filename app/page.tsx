import { ApiKeys } from "@/app/secrets/api-keys";

async function fetchZipCode() {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/zip?zip=21234,US&appid=${ApiKeys['open_weather_map']}`
  );

  if (response.ok) {
    const responseBody = await response.json();
    console.log(responseBody);
    return responseBody;
  }
}

async function fetchGovWeather(lat: number,lon: number) {

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

        const responseBody = await response.json();

        return responseBody;

      }
  }
}

async function fetchOpenWeather(lat: number,lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKeys['open_weather_map']}`
  );
  if (response.ok) {
    const responseBody = await response.json();
    return responseBody;
  }
}

export default async function Home() {
  const fetchZip = await fetchZipCode();
  const lat = fetchZip.lat;
  const lon = fetchZip.lon;
  const govData = await fetchGovWeather(lat,lon);
  const openData = await fetchOpenWeather(lat,lon);

  console.log(govData.properties);
  console.log(openData);
  // console.log(govData.properties.periods[0].probabilityOfPrecipitation);
  // console.log(govData.properties.periods[0].dewpoint);
  // console.log(govData.properties.periods[0].relativeHumidity);

  //console.log(openData);

  return (
    <main className="font-poppins mx-10">
      <p>What Should I Wear Today?</p>
      
    </main>
  );
}