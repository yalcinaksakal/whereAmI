//

"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

const renderCountry = function (data, classname = "") {
  const html = `        
      <article class="country ${classname}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +data.population / 1000000
        ).toFixed(1)} m people</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
      </article>`;

  countriesContainer.insertAdjacentHTML("beforeend", html);
};

const renderErr = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
};

const whereAmI = async function () {
  try {
    //GeoLocation

    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, () =>
        rej(new Error("Couldn't get your position."))
      )
    );

    const { latitude: lat, longitude: lng } = pos.coords;

    //Reverse GeoLocation
    const resRvrsGeo = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);

    //CATCH ERROR
    if (!resRvrsGeo.ok) throw new Error("Reverse GeoLocation error.");

    const dataCountry = await resRvrsGeo.json();
    countriesContainer.insertAdjacentHTML(
      "beforeend",
      `<label class="country__name">${dataCountry.city}, ${dataCountry.country} </label>`
    );
    // Get country data
    const res = await fetch(
      `https://restcountries.eu/rest/v2/name/${dataCountry.country}`
    );

    //CATCH ERROR
    if (!res.ok) throw new Error("Couldn't get your country's data.");

    const data = await res.json();
    // render country
    renderCountry(data[0]);

    //check if neighbours exist
    if (!data[0].borders.length)
      throw new Error("Your country has no neighbours.");

    //render neighbours

    data[0].borders.map(async neighbour => {
      //get neighbour data
      const res = await fetch(
        `https://restcountries.eu/rest/v2/alpha/${neighbour}`
      );

      const data = await res.json();
      renderCountry(data, "neighbour");
    });

    //return dataCountry.city + ", " + dataCountry.country; //async function will return a pormise, not value
  } catch (err) {
    console.log(err);
    renderErr(err.message);
    throw err;
  }
};

btn.addEventListener("click", async function () {
  try {
    countriesContainer.innerHTML = "";
    await whereAmI();
  } catch (err) {}
});
