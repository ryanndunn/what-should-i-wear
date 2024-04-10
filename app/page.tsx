"use client";

import React, { useEffect, useState, SyntheticEvent } from 'react';
import { ApiKeys } from "@/app/secrets/api-keys";

export default function Home() {

  const [zip, setZip] = useState("");
  const [zipData, setZipData] = useState({});
  const [govWeather, setGovWeather] = useState({});
  const [openWeatherCurrent, setOpenWeatherCurrent] = useState({});
  const [openWeather5Day, setOpenWeather5Day] = useState({});

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();


    async function fetchWeatherData() {
      
      //get zip coords
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${ApiKeys['open_weather_map']}`
      );
    
      if (response.ok) {
        const responseBody = await response.json();
        setZipData(responseBody);

        const lat = responseBody.lat;
        const lon = responseBody.lon;

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
        
                const responseBody = await response.json();
                setGovWeather(responseBody);
        
                return responseBody;
        
              }
          }
        }


        const fetchOpenWeatherCurrent =  async function(lat: number,lon: number) {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${ApiKeys['open_weather_map']}`
          );
          if (response.ok) {
            const responseBody = await response.json();
            setOpenWeatherCurrent(responseBody);
            return responseBody;
          }
        }

        const fetchOpenWeather5Day =  async function(lat: number,lon: number) {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${ApiKeys['open_weather_map']}`
          );
          if (response.ok) {
            const responseBody = await response.json();
            setOpenWeather5Day(responseBody);
            return responseBody;
          }
        }

        const govWeather = fetchGovWeather(lat,lon);
        const openWeatherCurrent = fetchOpenWeatherCurrent(lat,lon);
        const openWeather5Day = fetchOpenWeather5Day(lat,lon);

        return responseBody;
      }
    }

    fetchWeatherData();
  };

  console.log(zipData);
  console.log(govWeather);
  console.log(openWeatherCurrent);
  console.log(openWeather5Day);

  return (
    <main className="font-poppins mx-10">
      
      <form onSubmit={handleSubmit}>
        <label>
          Zip:
          <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <p>What Should I Wear Today?</p>
      <p>Outside for a few hours</p>
      <h3>High: { Object.keys(openWeatherCurrent).length === 0 ? '' : openWeatherCurrent.main.temp_max }</h3>
      <h3>Low: { Object.keys(openWeatherCurrent).length === 0 ? '' : openWeatherCurrent.main.temp_min }</h3>
      
    </main>
  );
}