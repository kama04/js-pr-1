const container = document.querySelector('#carousel')
const slidesContainer = container.querySelector('#slides-container')
const slides = container.querySelectorAll('.slide');
const indicators = container.querySelectorAll('.indicator')
const indicatorContainer = container.querySelector('#indicators-container')
const pauseBtn = container.querySelector('#pause-btn');
const previousBtn = container.querySelector('#previous-btn');
const nextBtn = container.querySelector('#next-btn');
const title = document.querySelector('.slider__title');
const price = document.querySelector('.slider__price span');
const decreaseBtn = document.getElementById('decrease');
const increaseBtn = document.getElementById('increase');
const quantityInput = document.getElementById('quantity');
const resetBtn = document.getElementById('reset');

const slideNames = ["Acai Dessert", "Brownie", "Chocolate Cake", "Pavlova Canelle", "Berry Tart"];
const slidePrices = [10, 8, 12, 11, 9];

const SLIDE_COUNT = slides.length;
const TIMER_INTERVAL = 2000;
const FA_PAUSE = '<i class="fa-solid fa-pause"></i>';
const FA_PLAY = '<i class="fa-solid fa-play"></i>';
const CODE_SPACE = 'Space';
const CODE_ARROW_LEFT = 'ArrowLeft';
const CODE_ARROW_RIGHT = 'ArrowRight';
const SWIPE_THRESHOLD = 50;


let currentSlide = 0;
let timerId = null;
let isPlaying = true;
let swipeStartX = 0;
let swipeEndX = 0;

function gotoNth(n) {
slides[currentSlide].classList.toggle('active')
indicators[currentSlide].classList.toggle('active')
indicators[currentSlide].style.background = null
currentSlide = (n + SLIDE_COUNT) % SLIDE_COUNT
slides[currentSlide].classList.toggle('active')
indicators[currentSlide].classList.toggle('active')
indicators[currentSlide].style.background = window.getComputedStyle(slides[currentSlide]).background;
title.textContent = slideNames[currentSlide];
basePrice = slidePrices[currentSlide];

updatePrice();
}

function updatePrice() {
    const quantity = parseInt(quantityInput.value, 10);
    const totalPrice = basePrice * quantity;
  
    // Если количество изменено вручную — ставим паузу
    if (quantityInput.dataset.changed === "true") pauseHandler();
  
    price.textContent =
      quantity > 1 ? `$${totalPrice.toFixed(2)}` : `$${basePrice.toFixed(2)} / piece`;
  }
  

function gotoPrev(){
gotoNth(currentSlide - 1);
}

function gotoNext(){
gotoNth(currentSlide + 1);
}

function tick(){
    timerId = setInterval(gotoNext, TIMER_INTERVAL);
}

function pauseHandler() {
    if(!isPlaying) return;
    pauseBtn.innerHTML = FA_PLAY;
    isPlaying =!isPlaying;
    clearInterval(timerId);
 }

function playHandler() {
    if(isPlaying) return;
    pauseBtn.innerHTML = FA_PAUSE;
    isPlaying =!isPlaying;
    tick();
 }
function togglePlayHandler() {
    isPlaying ? pauseHandler() : playHandler();
}

function nextHandler() {
    gotoNext();
    pauseHandler();
}

function prevHandler() {
    gotoPrev();
    pauseHandler();
}

function indicatorClickHandler(e) {
    const { target } = e;
    if (target && target.classList.contains('indicator')) {
        pauseHandler();
        gotoNth(+target.dataset.slideTo);
    }
}

function keyDownHandler(e) {
    const code = e.code;

    if (code === CODE_SPACE) {
        e.preventDefault();
        togglePlayHandler();
    }
    if (code === CODE_ARROW_LEFT) prevHandler();
    if (code === CODE_ARROW_RIGHT) nextHandler();
}

function swipeStartHandler(e) {
    if (e instanceof MouseEvent) {
        swipeStartX = e.clientX;
    } else if (e instanceof TouchEvent) {
        e.preventDefault(); 
        swipeStartX = e.changedTouches[0].clientX;
    }
    swipeEndX = 0;
}


function swipeEndHandler(e) {
    if (e instanceof MouseEvent) {
        swipeEndX = e.clientX;
    } else if (e instanceof TouchEvent) {
        swipeEndX = e.changedTouches[0].clientX;
    }
    
    const diff = swipeEndX - swipeStartX;

    if(diff > SWIPE_THRESHOLD) prevHandler();
    if(diff < -SWIPE_THRESHOLD) nextHandler();
}


increaseBtn.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
    quantityInput.dataset.changed = "true";
    updatePrice();
  });
  
  decreaseBtn.addEventListener("click", () => {
    if (parseInt(quantityInput.value) > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
      quantityInput.dataset.changed = "true";
      updatePrice();
    }
  });
  
  quantityInput.addEventListener("input", () => {
    if (quantityInput.value < 1) quantityInput.value = 1;
    quantityInput.dataset.changed = "true";
    updatePrice();
  });
  
  // === Сброс выбора ===
  resetBtn.addEventListener("click", () => {
    quantityInput.value = 1;
    quantityInput.dataset.changed = "false";
    updatePrice();
    startAutoSlide(); // снова запускаем автослайд
  });
pauseBtn.addEventListener('click', togglePlayHandler);
previousBtn.addEventListener('click', prevHandler);
nextBtn.addEventListener('click', nextHandler);
indicatorContainer.addEventListener('click', indicatorClickHandler);
document.addEventListener('keydown', keyDownHandler);
slidesContainer.addEventListener('touchstart', swipeStartHandler, { passive: false });
slidesContainer.addEventListener('touchend', swipeEndHandler);
slidesContainer.addEventListener('mousedown', swipeStartHandler);
slidesContainer.addEventListener('mouseup', swipeEndHandler);
slidesContainer.addEventListener('mouseleave', swipeEndHandler);

// Инициализация карусели
tick();