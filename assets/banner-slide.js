// Obtendo o valor do atributo data-tempodelay como uma string
var tempoDelayString = document.querySelector("#banner-slide").dataset.tempodelay;

// Convertendo a string em um número (float)
var tempoDelay = parseFloat(tempoDelayString);

// Multiplicando por 1000 para converter para milissegundos
var tempoFinal = tempoDelay * 1000;


const swiper = new Swiper('#banner-slide', {
  effect: "fade",
  autoplay: {
    delay: tempoFinal,
    disableOnInteraction: true
  },
  pagination:{
    el: "#banner-bloco-pagination",
    clickable: true
  },
  lazyLoading: true,
  loop: true,
});