var reguaFio = new Swiper(".regua-fio-wraper.swiper", {
  slidesPerView: 3,
  loop: true,
  autoplay: {
      delay: 2500,
      disableOnInteraction: true,
  },
  updateOnWindowResize: true,
  centeredSlides: false,
  breakpoints: {
    0: {
        slidesPerView: 1
      },
    480: {
        slidesPerView: 1
      },  
    670: {
        slidesPerView: 1
      },
    768: {
      slidesPerView: 3
    },
    1024: {
      slidesPerView: 3
    }
  },
});