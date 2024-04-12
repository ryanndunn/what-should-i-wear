"use client";

import React, { useEffect, useState, SyntheticEvent } from 'react';
import { ApiKeys } from "@/app/secrets/api-keys";

export default function Home() {

  const [zip, setZip] = useState("");
  const [zipData, setZipData] = useState({});
  const [govWeather, setGovWeather] = useState({});
  const [openWeatherCurrent, setOpenWeatherCurrent] = useState({});
  const [openWeather5Day, setOpenWeather5Day] = useState({});
  const [tempRating, setTempRating] = useState(false);
  const [humidityRating, setHumidityRating] = useState(false);
  const [rainRating, setRainRating] = useState(false);

  useEffect(() => {

    //openWeather Rain Data
    const openWeather = Object.keys(openWeatherCurrent).length === 0 ? false : openWeatherCurrent;
    const govWeatherStart = Object.keys(govWeather).length === 0 ? false : govWeather.properties.periods[0].startTime;
    const govWeatherEnd = Object.keys(govWeather).length === 0 ? false : govWeather.properties.periods[0].endTime;
    const govWeatherPrecipitation = Object.keys(govWeather).length === 0 ? false : govWeather.properties.periods[0].probabilityOfPrecipitation.value;

    if(govWeatherStart){

      //gov rain rating
      const govWeatherStartStamp = new Date(govWeatherStart).getTime();
      const govWeatherEndStamp = new Date(govWeatherEnd).getTime();
      const govWeatherPeriodHours = (govWeatherEndStamp - govWeatherStartStamp) / 1000 / 60 / 60;
      const calcGovRainRating = (((govWeatherPrecipitation / govWeatherPeriodHours) + govWeatherPrecipitation) / 200) * 100;

      let calcRainRating = calcGovRainRating;
      
      //openweather rain rating
      if(openWeather.rain !== undefined){
        const rainMM = openWeather.rain['1h'];
        const calcOpenRainRating = (rainMM > 10 ? 100 : openWeather.rain['1h'] * 3) + 70;
        calcRainRating = govWeatherPeriodHours >= 3 ? (govWeatherPrecipitation + calcOpenRainRating) / 2 : (calcGovRainRating + govWeatherPrecipitation + calcOpenRainRating) / 3;
        console.log(calcGovRainRating);
        console.log(calcOpenRainRating);
        console.log(govWeatherPrecipitation);
        console.log(rainMM);
        console.log(govWeatherPeriodHours);
      }

      
      setRainRating(calcRainRating);

    }



  },[govWeather,openWeatherCurrent]);

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
            
            //temp rating
            const temp = responseBody.main.feels_like;
            const tempLow = 32;
            const tempHigh = 100;
            const newTempRating = (temp - tempLow)/(tempHigh - tempLow);
            setTempRating(newTempRating);

            //humidity rating
            const humidity = responseBody.main.humidity;
            setHumidityRating(humidity);


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

  //console.log(zipData);
  //console.log(govWeather);
  //console.log(openWeatherCurrent);
  //console.log(openWeather5Day);

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

      <p>Outside right now</p>

      <h3>Feels Like: { Object.keys(openWeatherCurrent).length === 0 ? '' : openWeatherCurrent.main.feels_like }</h3>
      <h3>Temp Rating: { tempRating === false ? 'no rating' : tempRating }</h3>
      <h3>Humidity Rating: { humidityRating === false ? 'no rating' : humidityRating }</h3>
      <h3>Rain Rating: { rainRating === false ? 'no rating' : rainRating }</h3>

      <p>Outside for a few hours</p>

      <h3>Gov Weather This Period Start Time: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].startTime }</h3>
      <h3>Gov Weather This Period End Time: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].endTime }</h3>
      <h3>Gov Weather This Period Percent Chance of Rain: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].probabilityOfPrecipitation.value }</h3>
      
    </main>
  );
}