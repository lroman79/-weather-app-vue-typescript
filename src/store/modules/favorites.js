import axios from 'axios';

export default {
    namespaced: true,
    state() {
      return {      
        weatherData: {},
      };
    },
    mutations: {
     setWeather(state, payload) {
      state.weatherData = payload;
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
     getWeather(state) {
      return state.weatherData;
     },
    }
};