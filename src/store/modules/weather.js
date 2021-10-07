import axios from 'axios';

export default {
    namespaced: true,
    state() {
      return {      
        locationInfo: {},
        defaultLocationInfo: {},
        weatherData: {},
        forecastFiveDaysData: [],
      };
    },
    mutations: {
     setLocationInfo(state, payload) {
      state.locationInfo = payload;
     },
     setDefaultLocationInfo(state, payload) {
       state.defaultLocationInfo = payload;
     },
     setWeather(state, payload) {
      state.weatherData = payload;
     },
     setForeCast(state, payload) {
        state.forecastFiveDaysData = payload;
     },
    },
    actions: {
      async loadLocationInfo(context, data) {
        const locationCity = data.location;
        const baseURL = 'https://dataservice.accuweather.com/';
        const autocompleteSearchUrl = 'locations/v1/cities/autocomplete';
        const locationInfoUrlWithParams = `${baseURL}${autocompleteSearchUrl}?apikey=${data.keyApi}&q=${locationCity}`;
        
        try {
          const res = await axios.get(locationInfoUrlWithParams);
          if (res.data.length > 0) { 
            const [locationInfoResponse] = res.data;
            context.commit('setLocationInfo', locationInfoResponse); 
          } else {
            throw new Error('Failed to fetch location Info!');
          }
        } catch(err) {
           const error = new Error(err.message || 'Failed to fetch location Info!');
           throw error;
        }    
      },
      async loadDefaultLocationInfo(context, data) {
        const locationCoordinates = data.location;
        const baseURL = 'https://dataservice.accuweather.com/';
        const geopositionSearchUrl = 'locations/v1/cities/geoposition/search';
        const locationInfoUrlWithParams = `${baseURL}${geopositionSearchUrl}?apikey=${data.keyApi}&q=${locationCoordinates}`;
      
        try {
          const res = await axios.get(locationInfoUrlWithParams);
          const locationInfoResponse = res.data;
          context.commit('setDefaultLocationInfo', locationInfoResponse);
         
        } catch(err) {
          const error = new Error(err.message || 'Failed to fetch Default location Info!');
          throw error;
        }      
      },
      async loadWeather(context, data ) {   
        const locationApi = data.api;
        const baseURL = 'https://dataservice.accuweather.com/';
        const currentConditionsUrl = 'currentconditions/v1/';
        const weatherUrlWithParams = `${baseURL}${currentConditionsUrl}${locationApi}?apikey=${data.keyApi}`;
         
        try {
          const res = await axios.get(weatherUrlWithParams);         
          const [responseDataWeather] = res.data;
          context.commit('setWeather', responseDataWeather);
        } catch(err) {
          const error = new Error(err.message || 'Failed to fetch weather!');
          console.log(err);
          throw error;
        } 
      },
      async loadForeCast(context, data) {
       const locationApi = data.api;
       const baseUrl = 'https://dataservice.accuweather.com/';
       const foreCastUrl = 'forecasts/v1/daily/5day/';                        
       const locationInfoUrlWithParams = `${baseUrl}${foreCastUrl}${locationApi}?apikey=${data.keyApi}&metric=true&details=true`;

        try {
          const responseLocationInfo = await fetch(locationInfoUrlWithParams);
          const responseDataLocationInfo = await responseLocationInfo.json();
          const locationInfoResponse = responseDataLocationInfo.DailyForecasts;
          
          context.commit('setForeCast', locationInfoResponse);
        } catch(err) {
           const error = new Error(err.message || 'Failed to fetch forecast!');
           console.log(err);
           throw error;
        }   
     }
    },
    getters: {
     getLocationInfo(state) {
      return state.locationInfo;
     },
     getDefaultLocationInfo(state) {
      return state.defaultLocationInfo;
     },
     getWeather(state) {
      return state.weatherData;
     },
     getForeCast(state) {
       return state.forecastFiveDaysData;
      },
     hasWeather(state) {
       return Object.keys(state.weatherData).length > 0;
      },
     hasForeCast(state) {
      return state.forecastFiveDaysData.length > 0;
     },
    }
};