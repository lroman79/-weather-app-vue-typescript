import axios from 'axios';

export default {
    namespaced: true,
    state() {
      return {      
        locationInfo: {},
        error: '',
        weatherData: {},
      };
    },
    mutations: {
     setLocationInfo(state, payload) {
      state.locationInfo = payload;
     },
     setWeather(state, payload) {
      state.weatherData = payload;
     },
     error(state, data) {
      return state.error = data;
     },
    },
    actions: {
      async loadWeather(context, data) {
    
        const locationApi = data.api;
        const baseURL = 'https://dataservice.accuweather.com/';
        const currentConditionsUrl = 'currentconditions/v1/';
        const weatherUrlWithParams = `${baseURL}${currentConditionsUrl}${locationApi}?apikey=${data.keyApi}`;

        try {
         const res = await axios.get(weatherUrlWithParams);
         const [responseDataWeather] = res.data;
         context.commit('setWeather', responseDataWeather);
         return res;
        } catch(err) {
          const error = new Error(err.message || 'Failed to fetch weather!');
           console.log(err);
           throw error; 
        }
      }
    },
    getters: {
     getLocationInfo(state) {
      return state.locationInfo;
     },
     hasLocationInfo(state) {
      return state.locationInfo;
     },
     getWeather(state) {
      return state.weatherData;
     },
    }
};