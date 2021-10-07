<template>
  <h2 class="weather-title">Weather Info</h2>
    <div class="weather-data-sec">
      <div class="city-temperature-info">
        <div class="weather-img">
          <img :src="icon" alt="">
        </div>
        <div>
          <div class="current-city">{{ cityname }}</div>
          <div class="today-temperature">
            <span class="tmpr-amount">{{ amount }}</span>
            <span class="tmpr-unit">{{ unit }}</span>
          </div>
        </div>
      </div>
    </div>
    <h2 class="weather-text">{{ weathertext }}</h2>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    props: {
      amount: {
        type: Number as PropType<Number>,
        required: true
      },
      unit: {
        type: String as PropType<String>,
        required: true
      },
      cityname: {
        type: String as PropType<String>,
        required: true
      },
      icon: {
        type: String as PropType<String>,
        required: true
      },
      weathertext: {
        type: String as PropType<String>,
        required: true
      }
    },
  })
</script>

<style scoped>

  section{
    width: 80%;
    margin: 0 auto;

  }
  .weather-data-sec {
    display: flex;
    justify-content: center;
  }

  .city-temperature-info {
    display: flex;
    align-items: center;
  }
  .weather-title{
    text-align: center;
    color:#3e78d2;
  }
  .weather-text{
    text-align: center;
    color: #828993;
  }
</style>