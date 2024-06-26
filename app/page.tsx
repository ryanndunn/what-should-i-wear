"use client";

import React, { useEffect, useState, SyntheticEvent } from 'react';
import { fetchWeatherData } from '@/app/lib/data';
import ZipForm from '@/app/ui/zip-form';

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
    top: "",
    bottom: ""
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
        //heavy jacket - 40 - 55
        //winter coat - 40 and below, 50 and below if windy, 55 and below if raining

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

      //top gear
      let tShirt,longShirt,heavyJacket,rainJacket,winterCoat,noShirt = 0;
      let setTop = "";

      if(openWeatherCurrent.main.feels_like > 70){
        tShirt = 10;

        if(rainRating > 50){

          rainJacket = 10;

          if(openWeatherCurrent.main.feels_like > 80){
            noShirt = 10;
          }

        } else {

          if(openWeatherCurrent.main.feels_like < 80 && windRating > 12 && cloudRating > 50){
            longShirt = 10;
          }

        }
      } else {

        if(rainRating > 50){

          rainJacket = 20;

          if(openWeatherCurrent.main.feels_like < 55){
            winterCoat = 10;

            if(openWeatherCurrent.main.feels_like < 33){
              winterCoat = 20;
            }
          }

        } else {
          
          tShirt = 0;
          longShirt = 10;

          if(openWeatherCurrent.main.feels_like < 55){
            longShirt = 0;
            heavyJacket = 10;

            if(openWeatherCurrent.main.feels_like < 50 && windRating > 12){
              winterCoat = 10;
              rainJacket = 0;
            }

            if(openWeatherCurrent.main.feels_like < 40){
              winterCoat = 10;
              rainJacket = 0;

              if(openWeatherCurrent.main.feels_like < 33){
                winterCoat = 20;
              }

            }
          }
        
        }
        
      }

      if(noShirt == 10){ 
          setTop = 'It is super hot and rainy, time to get in swim gear'; 
      } else {

          if(rainRating > 50){

            if(rainJacket == 10){ setTop = 'It is raining but not too cold. A rain jacket would be a good idea.';  }
            if(rainJacket == 20){ setTop = 'It is raining and cold. A rain jacket would be a good idea with a long sleeve layer underneath.';  }
            
            if(winterCoat == 10){ setTop = 'It is cold and raining. A waterproof (or resistant) winter coat would be ideal.'; }
            if(winterCoat == 20){ setTop = 'It is below freezing. A waterproof (or resistant) winter coat is necesary.'; }

          } else {

            if(tShirt == 10){ setTop = 'It is a nice day out. A t-shirt will do.';  }
            if(longShirt == 10){ setTop = 'It is a little colder, a long sleeve shirt or a t shirt and light jacket will be fine.'; }
            if(heavyJacket == 10){ setTop = 'It is cold. A heavy jacket with a layer underneath would be a good idea.'; }
            if(winterCoat == 10){ setTop = 'It is pretty cold out. A winter coat would be ideal.'; }
            if(winterCoat == 20){ setTop = 'It is below freezing. A winter coat is necesary.'; }

          }

      }
        
      

      //bottom gear
      let shorts,pants,trunks,longJohns = 0;
      let setBottom = "";

      if(openWeatherCurrent.main.feels_like > 70){
        shorts = 10;
        if(rainRating > 85){
          shorts = 0;
          trunks = 10;
        }
      } else {
        pants = 10;

        if(openWeatherCurrent.main.feels_like < 50){
          pants = 20;
        }

        if(openWeatherCurrent.main.feels_like < 35){
          pants = 0;
          longJohns = 10;
        }
      }

      if(shorts){ 
        if(shorts == 10){ setBottom = 'It is a nice day out. Put some shorts on.'; }
      }

      if(trunks){ 
        if(trunks == 10){ setBottom = 'It is a warm, but raining. Put some swim trunks on or shorts you don\'t mind getting wet.'; }
      }

      if(pants){ 
        if(pants == 10){ setBottom = 'It is a little chilly, put some pants on.'; }
        if(pants == 20){ setBottom = 'It is a pretty chilly, put some pants on.'; }
      }

      if(longJohns){ 
        if(longJohns == 10){ setBottom = 'It is freezing out. Layer up with some long johns underneath your pants!'; }
      }
      
      
      setClothesMan({
        head: setHead,
        eyes: setEyes,
        neck: setNeck,
        top: setTop,
        bottom: setBottom
      });

      console.log(govWeather);
      console.log(openWeatherCurrent);
      console.log(clothesMan);

    }



  },[govWeather,openWeatherCurrent]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    
    e.preventDefault();

    //getting/setting weather data
    fetchWeatherData(zip).then((weatherData) => {
      setGovWeather(weatherData.govWeather);
      setOpenWeatherCurrent(weatherData.openWeatherCurrent);
      setOpenWeather5Day(weatherData.openWeather5Day);
    });

  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZip(e.target.value);
  }

  return (
    <main className="font-poppins mx-10">

      <div className="front-page">

        <h1>What Should I Wear Today?</h1>

        <ZipForm handleSubmit={handleSubmit} zip={zip} handleOnChange={handleOnChange} />

      </div>

      <div className="weather-details">

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
        <h3>Neck: { zip === "" ? 'Zip Not Set' : clothesMan.neck }</h3>
        <h3>Top: { zip === "" ? 'Zip Not Set' : clothesMan.top }</h3>
        <h3>Bottom: { zip === "" ? 'Zip Not Set' : clothesMan.bottom }</h3>

        <h3>Gov Weather This Period Start Time: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].startTime }</h3>
        <h3>Gov Weather This Period End Time: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].endTime }</h3>
        <h3>Gov Weather This Period Percent Chance of Rain: { zip === "" ? 'Zip Not Set' : govWeather.properties.periods[0].probabilityOfPrecipitation.value }</h3>

      </div>
      
    </main>
  );
}