<template>
    <div class="city-weather-container">
        <div class="weather-controls">
            <section class="left-controls">
                <div class="search-bar">
                 <input type="text" class="search-field" onkeydown="return /^[a-zA-Z\s]+$/.test(event.key)"
                    placeholder="Search Locations..." v-model="cityQuery" />
                 <button class="search-btn" @click="fetchWeather">Search</button>
                </div>
                 <button class="current-location-btn" @click="fetchCurrentLocationWeather">Get Current Location</button>
                 <button class="current-location-btn" @click="toggleTemperatureFormant">Change Temperature Format</button>
                <div v-if="errorMessage" class="input-errors"> {{ errorMessage }}</div>
                
            </section>

            <section class="right-controls">
                <button class="add-fvrts-btn" v-if="!isInFavorites" @click="storeLocationInFavoriteCities">&#9825; Add
                    To Favorites</button>
                <button class="rmv-btn" v-if="isInFavorites" @click="removeLocationFromFavoriteCities">Remove From
                    Favorites</button>
                <div class="favorite-indicator" v-if="isInFavorites">&#128154;Saved in favorites</div>
            </section>
        </div>
         
        <hr>

        <section class="main-weather-info">
            <div v-if="isLoading">
                <base-spinner></base-spinner>
            </div>
             <weather-item v-else-if="hasWeather" 
                :icon="getWeather.icon" 
                :cityname="getWeather.cityName"
                :weathertext="getWeather.weatherText" 
                :amount="getWeather.amount"
                :unit="getWeather.unit"></weather-item>
        </section>

        <div class="forecast-5-days" v-if="hasForeCast">
            <fore-cast-five-days 
                v-for="forecastItem in fetchForeCast" 
                :key="forecastItem.index"
                :date="forecastItem.Date" 
                :unit="forecastItem.Temperature.Maximum.Unit"
                :amount="forecastItem.Temperature.Maximum.Value"></fore-cast-five-days>
        </div>
    </div>
</template>

<script lang="ts">
    import WeatherItem from '../components/weather/WeatherItem.vue';
    import ForeCastFiveDays from '../components/weather/ForeCastFiveDays.vue';

    import { defineComponent } from 'vue'

    export default defineComponent({
        components: {
            WeatherItem,
            ForeCastFiveDays,
        },
        data() {
            return {
                testArr: [] as any[],
                isLoading: true,
                isInFavorites: false,
                defaultLocationAPI: '215854',
                currentLocationAPI: '215854',
                defaultLocationCity: 'Tel Aviv',
                defaultGeoPosition: '',
                cityName: '',
                TemperatureFormat: 'Metric',
                cityQuery: '',
                //APIkey: 'KWM5jZQwAi8lfyrJkK9BfGOSNTAxlXfC',
                APIkey: '1BAKSQ0qyJYiMpAP4liSrutHJRd5a9zE',
                locationsStorageName: 'storedLocations',
                favoritesStorageName: 'storedFavoriteCities',
                errorMessage: '',
                testLocation: {
                    "LocalObservationDateTime": "2021-07-06T10:45:00+03:00",
                    "EpochTime": 1625557500,
                    "WeatherText": "Mostly sunny",
                    "WeatherIcon": 2,
                    "HasPrecipitation": false,
                    "PrecipitationType": null,
                    "IsDayTime": true,
                    "Temperature": {
                        "Metric": {
                            "Value": 31,
                            "Unit": "C",
                            "UnitType": 17
                        },
                        "Imperial": {
                            "Value": 86,
                            "Unit": "F",
                            "UnitType": 18
                        }
                    },
                },
            }
        },
        methods: {
            // isValidJson(item: string): boolean {
            //     try {
            //         item = JSON.parse(item);
            //     } catch (e) {
            //         console.log(e);
            //         return false;
            //     }
            //     return Array.isArray(item) && item.length > 0;
            // },
            checkIfInFavorites(): boolean {               
                if (!this.checkLocalStorageKeyExists(this.favoritesStorageName)) { 
                    return false;
                }
                
                const favoritesLocalStorage = localStorage.getItem(this.favoritesStorageName);    

                const locationName = this.cityName;
                const storedFavoritesArr: Array<{
                    location: String,
                    locationName: String, 
                    id: String
                }> = JSON.parse(favoritesLocalStorage || '{}');

                return storedFavoritesArr.some(el => el.locationName === locationName);
            },
            checkLocalStorageKeyExists(key: string): boolean {
             return !!localStorage.getItem(key);
            },
            createLocalStorage(storage: string): void {
             const itemsArr: Array<any> = [];
             localStorage.setItem(storage, JSON.stringify(itemsArr));
            },
            storeLocationInFavoriteCities(): void {
                const locationName = this.cityName;
                const storageName = this.favoritesStorageName;

                if (!this.checkLocalStorageKeyExists(storageName)) {
                   this.createLocalStorage(storageName); 
                }

                let favoriteItem = {
                    location: locationName.replace(' ', '_').toLowerCase(),
                    locationName,
                    id: this.currentLocationAPI
                }

                const storedFavorites: Array<{
                    location: String,
                    locationName: String, 
                    id: String
                    }> = JSON.parse(localStorage.getItem(storageName) || '{}');

                const isInLocalStorage = storedFavorites.some(item => {
                  return item.locationName === locationName;
                });

                if (!isInLocalStorage) {
                    storedFavorites.push(favoriteItem);
                    localStorage.setItem(storageName, JSON.stringify(storedFavorites));
                    this.isInFavorites = true;
                }
            },
            removeLocationFromFavoriteCities(): void {
                if (!this.checkLocalStorageKeyExists(this.favoritesStorageName)) {
                    return;
                }
                const locationName = this.cityName;
                const storageName = this.favoritesStorageName;

                const storedFavorites: Array<{
                    location: String,
                    locationName: String, 
                    id: String
                }> = JSON.parse(localStorage.getItem(storageName) || '{}');
           
                const isInLocalStorage = storedFavorites.some(item => item.locationName === locationName);

                if (isInLocalStorage) {
                    const filteredFavorites = storedFavorites.filter(item => item.locationName !== locationName);
                    localStorage.setItem(storageName, JSON.stringify(filteredFavorites));
                    this.isInFavorites = false;
                }                 
            },
            getLocationApiFromLocalStorage(locationCity: string): string {
                if (!this.checkLocalStorageKeyExists(this.locationsStorageName)) {
                    return '';
                }
                    
                const storedLocations: Array<{ 
                    location: string, 
                    locationApi: string 
                }> = JSON.parse(localStorage.getItem(this.locationsStorageName) || '{}');
                                    
                const itemLocationAPI = storedLocations.find(el => {
                    return el.location.toLowerCase() === locationCity.toLowerCase();
                });
                
                let locationApi = '';
                if (itemLocationAPI !== undefined) {
                    locationApi = itemLocationAPI.locationApi;
                    this.cityName = itemLocationAPI.location;
                    return locationApi;
                }     
                return locationApi;
            },
            storeLocationInLocalStorage(city: string, locationApi: string): void {
                if (!this.checkLocalStorageKeyExists(this.locationsStorageName)) {
                    this.createLocalStorage(this.locationsStorageName);
                }

                let locationItem = {
                    location: city,
                    locationApi: locationApi,
                }

                const storedLocations: Array<{
                    location: String, 
                    locationApi: String
                }> = JSON.parse(localStorage.getItem(this.locationsStorageName) || '{}');

                const isInLocalStorage = storedLocations.some(item => item.locationApi === locationApi);

                if (!isInLocalStorage) {
                    storedLocations.push(locationItem);
                    localStorage.setItem(this.locationsStorageName, JSON.stringify(storedLocations));
                }       
            },
            async loadWeather(locationApi: string): Promise<void> {
                try {
                    await this.$store.dispatch('weather/loadWeather', {
                     api: locationApi,
                     keyApi: this.APIkey
                    });
                } catch (err){
                    this.errorMessage = `${err.message} - Please try later`;
                }
                this.isLoading = false;
            },
            async loadForeCast(locationApi: string): Promise<void> {
                try {
                    await this.$store.dispatch('weather/loadForeCast', {
                     api: locationApi,
                     keyApi: this.APIkey
                    });
                } catch(err) {
                    this.errorMessage = `${err.message} - Please try later`;
                }
            },
            async fetchWeather(): Promise<void> {
                let locationCity = this.cityQuery;
                let locationApi = '';
                this.errorMessage = '';

                if (!locationCity.trim().length || 
                    locationCity.toLowerCase() === (this.defaultLocationCity).toLowerCase()) {
                     this.errorMessage = 'The field is empty or contains incorrect characters';
                     return;
                }

                //Check if locationAPI is stored in 'localStorage' by city name.
                locationApi = this.getLocationApiFromLocalStorage(locationCity);          
               
                if (locationApi) {
                    this.loadWeather(locationApi);
                    this.loadForeCast(locationApi);

                    this.currentLocationAPI = locationApi;
                    this.isInFavorites = this.checkIfInFavorites();
                    return;
                }
                    
                try {
                    await this.$store.dispatch('weather/loadLocationInfo', {
                        location: locationCity,
                        keyApi: this.APIkey
                    });                                         
                    const locationInfo = this.locationInfo;
                    locationApi = locationInfo.Key;                               
                                    
                    this.loadWeather(locationApi);
                    this.loadForeCast(locationApi);

                    this.currentLocationAPI = locationApi;
                    this.cityName = locationInfo.LocalizedName;
                    this.isInFavorites = this.checkIfInFavorites();

                    //Save location info in localstorage
                    if (locationInfo.LocalizedName && locationInfo.Key) {
                        this.storeLocationInLocalStorage(locationInfo.LocalizedName, locationInfo.Key);
                    }
                } catch(err) {
                    this.errorMessage = err.message + ' - Please try later';
                }
            },
            requestPosition(): Promise<object> {
                const options = {
                 enableHighAccuracy: true,
                };

                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        // eslint-disable-next-line no-undef
                        (pos: GeolocationPosition) => { resolve(pos); }, 
                        err => { reject (err); }, 
                        options
                    );
                });
            },
            async fetchCurrentLocationWeather() {
                if(!this.isSupportGeolocation) {
                    this.errorMessage = 'Geolocation is not available.';
                    return;
                }
                try {
                    const position: any = await this.requestPosition();
                    const coordsObj: { latitude: number, longitude: number } = { 
                     latitude:  position.coords.latitude,
                     longitude: position.coords.longitude
                    };

                    const geoCoordinates = `${coordsObj.latitude.toFixed(1)},${coordsObj.longitude.toFixed(1)}`;
         
                    await this.$store.dispatch('weather/loadDefaultLocationInfo', {
                     location: geoCoordinates,
                     keyApi: this.APIkey
                    });
                    const locationInfo = this.defaultLocationInfo;
                    const locationApi = locationInfo.Key;                   
                    this.cityName = locationInfo.LocalizedName;
                    this.currentLocationAPI = locationApi;

                    this.loadWeather(locationApi);
                    this.loadForeCast(locationApi);

                    this.isInFavorites = this.checkIfInFavorites();
                    } catch(err) {
                     this.errorMessage = `Sorry, but the following error occurred: '${err.message}`;
                     console.log(err);
                    }
            },
            initWeatherData(): void {
                let locationId = this.defaultLocationAPI;
                let locationName = this.defaultLocationCity;

                if (this.$route.query.locationId && this.$route.query.locationName) {
                    locationId = (this.$route.query.locationId).toString();
                    locationName = (this.$route.query.locationName).toString();
                }
                this.loadWeather(locationId); 
                this.loadForeCast(locationId);

                this.cityName = locationName;
                this.currentLocationAPI = locationId; 
                this.isInFavorites = this.checkIfInFavorites();       
            },
            isSupportGeolocation(): boolean {
             return "geolocation" in window.navigator;
            },
            toggleTemperatureFormant(): void {
               this.TemperatureFormat = (this.TemperatureFormat !== "Metric") ? "Metric" : "Imperial";              
            },   
        },
        computed: {
            getWeather(): object {
                const weatherOriginal: any = this.$store.getters['weather/getWeather'];
                type Weather = {
                    icon: String, 
                    cityName: String, 
                    amount: Number,
                    unit: String,
                    weatherText: String
                };
                const weatherNew = {} as Weather;

                let iconNumber = (weatherOriginal.WeatherIcon < 10) 
                 ? `0${weatherOriginal.WeatherIcon}` 
                 : weatherOriginal.WeatherIcon;

                if (Object.keys(weatherOriginal).length) {
                    weatherNew.icon = `https://developer.accuweather.com/sites/default/files/${iconNumber}-s.png`;
                    weatherNew.cityName = this.cityName;
                    weatherNew.amount = weatherOriginal.Temperature[this.TemperatureFormat].Value;
                    weatherNew.unit = this.TemperatureFormat === "Metric" ? '℃' : '℉';
                    weatherNew.weatherText = weatherOriginal.WeatherText;
                }

                return weatherNew;
            },
            locationInfo(): any {
                return this.$store.getters['weather/getLocationInfo'];
            },
            defaultLocationInfo(): any {
                return this.$store.getters['weather/getDefaultLocationInfo'];
            },
            fetchForeCast(): object {
                return this.$store.getters['weather/getForeCast'];
            },
            hasWeather(): boolean {
                return (!this.isLoading) && this.$store.getters['weather/hasWeather'];
            },
            hasForeCast(): boolean {
                return this.$store.getters['weather/hasForeCast'];
            },
            showTest(): any[] {
                return this.testArr;
            }
        },
        created() {
            this.initWeatherData();
        },
    })
</script>

<style scoped>
   .city-weather-container {
        margin: 0 auto;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 1px 5px rgb(0 0 0 / 20%);
    }

    .main-weather-info {
        margin: 12px auto;
        background: #f4f4f5;
        border: 1px solid #dcdfe6;
        border-color: #d3d4d6;
        border-radius: 4px;
        padding: 14px 15px;
    }

    .weather-controls {
        display: flex;
        justify-content: space-between;
    }

    .left-controls .search-bar{
       display: flex;
    }

    .left-controls .search-bar .search-field{
        width: 250px;
        margin: 0px;
        padding-left: 10px;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: 100;
        font-style: italic;
        border: solid 1px;
        background: #f4f4f5;
        border-color: #d3d4d6;
        border-radius: 2px;
        background-color: aliceblue;
    }

    .left-controls .search-bar .search-field::placeholder{
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: #a0a2a7;
        opacity: 1; /* Firefox */
        }
        :-ms-input-placeholder { /* Internet Explorer 10-11 */
        color: #a0a2a7;
        }
        ::-ms-input-placeholder { /* Microsoft Edge */
        color: #a0a2a7;
    }

    .left-controls .search-bar .search-btn {
        border: none;
        border-radius: 2px;
        padding: 6px 14px;
        font-size: 14px;
        color: #ffffff;
        background-color: #409eff;
        border-color: #409eff;
        cursor: pointer;
        margin-left: 10px;
        cursor: pointer;
    }

    .left-controls .current-location-btn{
        border: none;
        border-radius: 2px;
        padding: 6px 14px;
        font-size: 13px;
        color: #ffffff;
        background-color: #909399;
        border-color: #909399;
        cursor: pointer;
        margin-top: 10px;
        margin-right: 5px;
        cursor: pointer;
    }

    .right-controls{
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .forecast-5-days {
        display: flex;
        justify-content: space-between;
    }

    .no-weather-block {
        margin: 20px auto;
        padding: 38px;
        text-align: center;
        color: #e6a23c;
        background: #fdf6ec;
        border: solid 1px;
        border-color: #f5dab1;
        border-radius: 2px;
    }

    .favorite-indicator {
        color: #00ad00;
    }

    .add-fvrts-btn {
        height: 28px;
        border: none;
        border-radius: 4px;
        padding: 0px 14px;
        font-size: 14px;
        color: #fff;
        background-color: #67c23a;
        border-color: #67c23a;
        cursor: pointer;
    }

    .rmv-btn {
        height: 28px;
        border: none;
        border-radius: 4px;
        padding: 6px 14px;
        font-size: 14px;
        color: #ffffff;
        background-color: #f56c6c;
        cursor: pointer;
    }

    hr {
        border: 0;
        height: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }

    .input-errors {
        color: #f56c6c;
        padding: 5px 5px;
        background: #fef0f0;
        border: 1px solid;
        border-color: #fbc4c4;
        border-radius: 2px;
        font-size: 12px;
        margin-top: 6px;
    }

.weather-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.weather-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.weather-enter-active {
  transition: all 0.3s ease-out;
}

.weathere-leave-active {
  transition: all 0.3s ease-in;
}

.weather-enter-to,
.weather-leave-from {
  opacity: 1;
  transform: translateY(0);
}

    /****************** Mobile ******************/
    @media only screen and (max-width: 1024px) {
       .weather-controls {
        flex-direction: column;
       }

       .city-weather-container{
        box-shadow: none;
       }

       .left-controls{
           margin-bottom: 20px;
       }

       .left-controls .search-bar {
        display: flex;
        flex-direction: column;
       }

       .left-controls .current-location-btn{
          width: 100%;

       }

       .left-controls .search-bar .search-field{
           width: 100%;
           height: 36px;
           margin-bottom: 10px;
           font-size: 16px;
       }

       .left-controls .search-bar .search-btn{
           margin-left: 0px;
           font-size: 19px;
       }

       .forecast-5-days{
           flex-direction: column;
       }

       .forecast-item{
         width: 100%;
         margin-bottom: 10px;
       }
    }
</style>