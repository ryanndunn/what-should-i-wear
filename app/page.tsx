"use client";

import React, { useEffect, useState, SyntheticEvent } from 'react';
import { fetchWeatherData } from '@/app/lib/data';

export default function Page() {

  //weather data
  const [zip, setZip] = useState("");
  const [govWeather, setGovWeather] = useState({
    properties: {
      periods: [
        {
          startTime: "",
          endTime: "",
          probabilityOfPrecipitation: {
            value: 0
          },
          isDaytime: true
        }
      ]
    }
  });
  const [openWeatherCurrent, setOpenWeatherCurrent] = useState({
    main: {
      feels_like: 0,
      humidity: 0
    },
    clouds: {
      all: 0
    },
    wind: {
      speed: 0,
      gust: 0
    },
    rain: {
      "1h": 0
    }
  });
  const [openWeather5Day, setOpenWeather5Day] = useState({});

  //weather ratings
  const [tempRating, setTempRating] = useState(0);
  const [humidityRating, setHumidityRating] = useState(0);
  const [rainRating, setRainRating] = useState(0);
  const [cloudRating, setCloudRating] = useState(0);
  const [windRating, setWindRating] = useState(0);

  //clothes objects
  const [clothesMan, setClothesMan] = useState({
    head: "",
    eyes: "",
    neck: "",
  });

  useEffect(() => {

    //temp rating (percentage rating)
    const temp = openWeatherCurrent.main.feels_like;
    const tempLow = 10;
    const tempHigh = 110;
    const newTempRating = temp == 0 ? 0 : ((temp - tempLow)/(tempHigh - tempLow)) * 100;
    setTempRating(newTempRating);

    //humidity rating (humidity percentage)
    const humidity = openWeatherCurrent.main.humidity;
    setHumidityRating(humidity);

    //cloud rating (percent cloudiness)
    const clouds = openWeatherCurrent.clouds.all;
    setCloudRating(clouds);

    //wind rating (wind speed, accounting for gust)
    const windSpeed = openWeatherCurrent.wind.speed;
    const windGust = openWeatherCurrent.wind.gust > 0 || openWeatherCurrent.wind.gust === undefined ? windSpeed : openWeatherCurrent.wind.gust;
    setWindRating((windSpeed + windGust) / 2);

    //openWeather Rain Data (is it raining right now?)
    const govWeatherStart = govWeather.properties.periods[0].startTime;
    const govWeatherEnd = govWeather.properties.periods[0].endTime;
    const govWeatherPrecipitation = govWeather.properties.periods[0].probabilityOfPrecipitation.value;

    if(govWeatherStart){

      //gov rain rating
      const govWeatherStartStamp = new Date(govWeatherStart).getTime();
      const govWeatherEndStamp = new Date(govWeatherEnd).getTime();
      const govWeatherPeriodHours = (govWeatherEndStamp - govWeatherStartStamp) / 1000 / 60 / 60;
      const calcGovRainRating = (((govWeatherPrecipitation / govWeatherPeriodHours) + govWeatherPrecipitation) / 200) * 100;

      let calcRainRating = calcGovRainRating;
      
      //openweather rain rating
      if(openWeatherCurrent.rain !== undefined){
        const rainMM = openWeatherCurrent.rain['1h'];
        const calcOpenRainRating = (rainMM > 10 ? 100 : openWeatherCurrent.rain['1h'] * 2) + 80;
        calcRainRating = govWeatherPeriodHours >= 3 ? (govWeatherPrecipitation + calcOpenRainRating) / 2 : (calcGovRainRating + govWeatherPrecipitation + calcOpenRainRating) / 3;
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


    if(zip !== ""){

      //head gear
      let hat = 0;
      let setHead = "";
      
      if(windRating < 20 && govWeather.properties.periods[0].isDaytime){
        if(openWeatherCurrent.main.feels_like > 40){
          hat = 10;
          if(cloudRating < 30){
            hat = 20;
            if(openWeatherCurrent.main.feels_like > 80){
              hat = 30;
            }
          }
        }
      }

      if(hat){
        if(hat == 10){ setHead = 'A hat would be ok to wear.'; }
        if(hat == 20){ setHead = 'You should wear a hat today to block out the sun.'; }
        if(hat == 30){ setHead = 'You should wear a hat today to block out the sun. It is hot right now, maybe a hat with mesh lining to keep breathable.'; }
      }

      //eyes gear
      let sunglasses = 0;
      let setEyes = "";

      if(cloudRating < 80 && govWeather.properties.periods[0].isDaytime){
        sunglasses = 10;
        if(cloudRating < 50){
          sunglasses = 20;
          if(cloudRating < 20){
            sunglasses = 30;
          }
        }
      }

      if(sunglasses){
        if(sunglasses == 10){ setEyes = 'It is kinda cloudy, but sunglasses would be nice.'; }
        if(sunglasses == 20){ setEyes = 'It is a little cloudy, but you should probably wear sunglasses.'; }
        if(sunglasses == 30){ setEyes = 'It is sunny, sunglasses would be a good bet.'; }
      }

      //neck gear
      let scarf = 0;
      let setNeck = "";

      if(openWeatherCurrent.main.feels_like < 40){
        scarf = 10;
        if(windRating > 12){
          scarf = 20;
          if(cloudRating > 20){
            scarf = 30;
          }
        }
      }

      if(scarf){
        if(scarf == 10){ setNeck = 'It is cold, but not that windy. a scarf would be nice'; }
        if(scarf == 20){ setNeck = 'It is cold and windy, a scarf would be recommended'; }
        if(scarf == 30){ setNeck = 'It is cold and very windy, a scarf would be a good bet.'; }
      }
      
      setClothesMan({
        head: setHead,
        eyes: setEyes,
        neck: setNeck
      });

      console.log(govWeather);
      console.log(openWeatherCurrent);
      console.log(clothesMan);

    }



  },[govWeather,openWeatherCurrent]);

  const handleSubmit = (e: SyntheticEvent) => {
    
    e.preventDefault();

    //getting/setting weather data
    fetchWeatherData(zip).then((weatherData) => {
      setGovWeather(weatherData.govWeather);
      setOpenWeatherCurrent(weatherData.openWeatherCurrent);
      setOpenWeather5Day(weatherData.openWeather5Day);
    });

  };

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

      <h3>Feels Like: { zip === "" ? 'Zip Not Set' : openWeatherCurrent.main.feels_like }</h3>
      <h3>Temp Rating: { zip === "" ? 'Zip Not Set' : tempRating }</h3>
      <h3>Humidity Rating: { zip === "" ? 'Zip Not Set' : humidityRating }</h3>
      <h3>Rain Rating: { zip === "" ? 'Zip Not Set' : rainRating }</h3>
      <h3>Cloud Rating: { zip === "" ? 'Zip Not Set' : cloudRating }</h3>
      <h3>Wind Rating: { zip === "" ? 'Zip Not Set' : windRating }</h3>

      <p>Outside for a few hours</p>

      <h3>As a man, I would wear:</h3>
      <h3>Head: { zip === "" ? 'Zip Not Set' : clothesMan.head }</h3>
      <h3>Eyes: { zip === "" ? 'Zip Not Set' : clothesMan.eyes }</h3>
      <h3>Neck: { zip === "" ? 'Zip Not Set' : clothesMan.scarf }</h3>

      <h3>Gov Weather This Period Start Time: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].startTime }</h3>
      <h3>Gov Weather This Period End Time: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].endTime }</h3>
      <h3>Gov Weather This Period Percent Chance of Rain: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].probabilityOfPrecipitation.value }</h3>
      
    </main>
  );
}