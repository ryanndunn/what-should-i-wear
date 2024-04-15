"use client";

import React, { useEffect, useState, SyntheticEvent } from 'react';
import { ApiKeys } from "@/app/secrets/api-keys";

export default function Home() {

  const [zip, setZip] = useState("");
  const [zipData, setZipData] = useState({});
  const [govWeather, setGovWeather] = useState({});
  const [openWeatherCurrent, setOpenWeatherCurrent] = useState({});
  const [openWeather5Day, setOpenWeather5Day] = useState({});
  const [clothesMan, setClothesMan] = useState({
    head: false
  });

  //weather ratings
  const [tempRating, setTempRating] = useState(false);
  const [humidityRating, setHumidityRating] = useState(false);
  const [rainRating, setRainRating] = useState(false);
  const [cloudRating, setCloudRating] = useState(false);
  const [windRating, setWindRating] = useState(false);



  //

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
        const calcOpenRainRating = (rainMM > 10 ? 100 : openWeather.rain['1h'] * 2) + 80;
        calcRainRating = govWeatherPeriodHours >= 3 ? (govWeatherPrecipitation + calcOpenRainRating) / 2 : (calcGovRainRating + govWeatherPrecipitation + calcOpenRainRating) / 3;
        // console.log(calcGovRainRating);
        // console.log(calcOpenRainRating);
        // console.log(govWeatherPrecipitation);
        // console.log(rainMM);
        // console.log(govWeatherPeriodHours);
      }

      
      setRainRating(calcRainRating);

    }

    //gear ratings
      //head
        //hat - sunny, not too windy, not too cold
        //beanie - cold/snowing - 40 and below or windy or cloudy to 55
        //nothing - cloudy, nice temp

      //top
        //t-shirt - 70 and above
        //long sleeve shirt - 55 - 70
        //light jacket - 55 - 70 or cloudy and windy combo
        //rain jacket - 45 - 75 and raining above 50%
        //winter coat - 45 and below

      //bottom
        //shorts - 70 and above
        //pants - 70 and below
        //long johns - freezing


    if(tempRating !== false && humidityRating !== false && rainRating !== false && cloudRating !== false && windRating !== false){ console.log('all set');

      let hat = false;
      let setHead = false;
      
      if(windRating < 20){console.log('wind less than 20');
        if(openWeather.main.feels_like > 40){
          hat = 10;

          if(cloudRating < 30){
            hat = 20;

            if(openWeather.main.feels_like > 80){
              hat = 30;
            }
          }
        }
      }

      console.log(hat);

      if(hat){
        if(hat == 10){ setHead = 'A hat would be ok to wear.'}
        if(hat == 20){ setHead = 'You should wear a hat today to block out the sun.'}
        if(hat == 30){ setHead = 'You should wear a hat today to block out the sun. It is hot right now, maybe a hat with mesh lining to keep breathable.'}
      }


      
      setClothesMan({
        head: setHead ? setHead : 'nothing on head'
      });

      console.log(clothesMan);

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

            console.log(responseBody);
            
            //temp rating
            const temp = responseBody.main.feels_like;
            const tempLow = 10;
            const tempHigh = 110;
            const newTempRating = (temp - tempLow)/(tempHigh - tempLow);
            setTempRating(newTempRating);

            //humidity rating
            const humidity = responseBody.main.humidity;
            setHumidityRating(humidity);

            //cloud rating
            const clouds = responseBody.clouds.all;
            setCloudRating(clouds);

            //wind rating
            const windSpeed = responseBody.wind.speed;
            const windGust = responseBody.wind.gust === undefined ? windSpeed : responseBody.wind.gust;
            setWindRating((windSpeed + windGust) / 2);


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
      <h3>Cloud Rating: { cloudRating === false ? 'no rating' : cloudRating }</h3>
      <h3>Wind Rating: { windRating === false ? 'no rating' : windRating }</h3>

      <p>Outside for a few hours</p>

      <h3>As a man, I would wear:</h3>
      <h3>Head: { clothesMan.head ? clothesMan.head : 'nothing on head' }</h3>

      <h3>Gov Weather This Period Start Time: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].startTime }</h3>
      <h3>Gov Weather This Period End Time: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].endTime }</h3>
      <h3>Gov Weather This Period Percent Chance of Rain: { Object.keys(govWeather).length === 0 ? '' : govWeather.properties.periods[0].probabilityOfPrecipitation.value }</h3>
      
    </main>
  );
}