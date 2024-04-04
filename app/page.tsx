import { ApiKeys } from "@/app/secrets/api-keys";

async function fetchWeather() {

  const pointsResponse = await fetch(
    `https://api.weather.gov/points/39.401859,-76.605049`
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

export default async function Home() {
  const data = await fetchWeather();

  console.log(data.properties);
  console.log(data.properties.periods[0].probabilityOfPrecipitation);
  console.log(data.properties.periods[0].dewpoint);
  console.log(data.properties.periods[0].relativeHumidity);

  return (
    <main className="font-poppins mx-10">
      <p>What Should I Wear Today?</p>
    </main>
  );
}