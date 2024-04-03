import { ApiKeys } from "@/app/secrets/api-keys";

async function fetchdetails() {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=39.401859&lon=-76.605049&appid=${ApiKeys['open_weather_map']}`
  );

  console.log(response);
  if (response.ok) {
    const responseBody = await response.json();
    // console.log(`data ${data}`);
    // setData(responseBody);
    //console.log(`data ${responseBody}`);
    return responseBody;
  }
}
// eslint-disable-next-line @next/next/no-async-client-component
export default async function Home() {
  const data = await fetchdetails();

  console.log(data);

  return (
    <main className="font-poppins mx-10">
      <p>What Should I Wear Today?</p>
    </main>
  );
}