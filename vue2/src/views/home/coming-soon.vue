<template>
  <div>
  <div class="dividing-line">
    <div class="upcoming">
      即将上映
    </div>
  </div>
  <ul>
    <v-film-item type="COMING_SOON" v-for="(film, index) in films" :film="film"></v-film-item>
  </ul>
    </div>
</template>

<style lang="less">
  .dividing-line {
    position: relative;
    margin-top: 30px;
    margin-bottom: 30px;
    border-bottom: 1px solid #a8a8a8;
  }

  .upcoming {
    width: 65px;
    height: 20px;
    margin: 0 auto;
    margin-bottom: -10px;
    border-radius: 5px;
    font-size: 10px;
    line-height: 20px;
    text-align: center;
    color: #eee;
    background-color: #a7a7a7;
  }
</style>

<script>
  export default{
    props: {
      films: {
        type: Array,
        required: true
      }
    }
  }
</script>
