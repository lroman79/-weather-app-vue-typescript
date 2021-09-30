<template>
  <div class="fvorites-container">
    <section>
        <h3 class="favorite-title">Favorite Weather</h3>
        <div class="favorite-item-wrp" v-if="hasFavoriteLocations">  
            <favorite-city
                v-for="favoriteItem in favoriteItems"
                :key="favoriteItem.index"
                :id="favoriteItem.id"
                :weathertext="favoriteItem.WeatherText"
                :cityname="favoriteItem.cityName"
                :date="favoriteItem.LocalObservationDateTime"
                :unit="favoriteItem.Temperature.Metric.Unit"
                :amount="favoriteItem.Temperature.Metric.Value"
            ></favorite-city>
        </div>
        <div class="empty-favorites-sec" v-else>No Favorite Weather found!</div>
    </section>
   </div>
</template>

<script lang="ts">
import FavoriteCity from '../components/weather/FavoriteCity.vue';

import { defineComponent } from 'vue'; 

export default defineComponent({
    components: {
     FavoriteCity
    },
    data() {
        return {
            storedLocationsArr: [] as any[],
            weatherArr: [] as object[],
            favoritesStorageName: 'storedFavoriteCities',
            APIkey: 'KWM5jZQwAi8lfyrJkK9BfGOSNTAxlXfC',
            //APIkey: '1BAKSQ0qyJYiMpAP4liSrutHJRd5a9zE',
        }
    },
    methods: {
        loadWeather(locationApi: string): Promise<Object> {             
            return this.$store.dispatch('favorites/loadWeather', { api: locationApi, keyApi: this.APIkey });                                  
        },
        setWeatherArr(): void { 

            const locationsArr: Array<{
                    location: string,
                    locationName: string, 
                    id: string
            }> = this.getFavoriteCities;

            locationsArr.forEach( async (item) => {    
                if(Object.keys(item).length !== 0) {

                    const locationObj = {               
                        cityName : item.locationName,
                        id : item.id
                    }
                    try {
                        await this.loadWeather(item.id);
                        const weatherObj: object = this.getWeather;
                        const finalWeatherObj: object = { ...weatherObj, ...locationObj };
                        this.weatherArr.push(finalWeatherObj);
                    } catch(err) { 
                        console.log(err);                            
                    }  
                }
            });                      
        },
        getLocationsFromLocalStorage(): Promise<void> {  
         return new Promise((resolve, reject) => {
            if (localStorage.getItem(this.favoritesStorageName) !== null) {

              const storedFavoritesArr: [] = JSON.parse(localStorage.getItem(this.favoritesStorageName) || '{}');

              if (storedFavoritesArr && storedFavoritesArr.length > 0) {
                this.storedLocationsArr = storedFavoritesArr;
                resolve();                                      
              } else {
                reject(new Error('No favorites found!'));
              }
            } else {
              reject(new Error('No favorites found!'));
            }
         });               
        },
        async initFavoriteWeather() {
         try {
          await this.getLocationsFromLocalStorage();
          this.setWeatherArr();
         } catch(err) {
            console.log(err);
         }
        },
    },
    computed: {
        favoriteItems(): object[] {
            return this.weatherArr;
        },
        getWeather(): object { 
            const weather: object = this.$store.getters['favorites/getWeather'];
            return weather;
        },
        getFavoriteCities(): any {
            return this.storedLocationsArr;
        },
        hasFavoriteLocations(): boolean {
            return this.weatherArr && this.weatherArr.length > 0;
        }
    },
    created() {
     this.initFavoriteWeather();
    }
})
</script>

<style scoped>
.favorite-title{
    text-align: center;
    color: #67c23a;
}
.fvorites-container{
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
}
.favorite-item-wrp{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.empty-favorites-sec{
    padding: 17px;
    text-align: center;
    color: #e6a23c;
    background: #fdf6ec;
    border: 1px solid;
    border-color: #f5dab1;
}

  /****************** Mobile ******************/
    @media only screen and (max-width: 1024px) {
        .fvorites-container{
         box-shadow: none;
        }
        .favorite-item-wrp{
            flex-direction: column;
            justify-content: center;
        }
    }

</style>