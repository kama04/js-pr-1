// carousel.js

const DEFAULT_SETTINGS = {
    slideImages: [
        "../assets/img/acai-dessert.jpg",
        "../assets/img/brownie.jpg",
        "../assets/img/choco-cake.jpg",
        "../assets/img/pavlova_canelle.jpg",
        "../assets/img/tart-berry.jpg"
    ],
    slideNames: ["Acai Dessert", "Brownie", "Chocolate Cake", "Pavlova Canelle", "Berry Tart"],
    slidePrices: [10, 8, 12, 11, 9],
    timerInterval: 2000,
    startSlide: 0,
    isPlaying: true,
    swipeThreshold: 100
};

class Carousel {
    constructor(options = {}) {
        this.settings = { ...DEFAULT_SETTINGS, ...options };
        this.currentSlide = this.settings.startSlide;
        this.isPlaying = this.settings.isPlaying;
        this.timerId = null;
        this.swipeStartX = 0;
        this.swipeEndX = 0;

        this._createLayout();
        this._initProps();
        this._initControls();
        this._initIndicators();
        this._initEventsListeners();
        if (this.isPlaying) this._tick();
    }

    _createLayout() {
        this.container = document.createElement('div');
        this.container.id = 'carousel';
        this.container.classList.add('carousel');

        this.slidesContainer = document.createElement('div');
        this.slidesContainer.id = 'slides-container';
        this.slidesContainer.classList.add('slides');

        this.settings.slideImages.forEach((img, i) => {
            const slide = document.createElement('div');
            slide.classList.add('slide');
            if (i === this.currentSlide) slide.classList.add('active');
            slide.style.backgroundImage = `url(${img})`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            slide.style.backgroundRepeat = 'no-repeat';
            this.slidesContainer.appendChild(slide);
        });

        this.container.appendChild(this.slidesContainer);

        // Отдельные элементы для названия и цены
        this.titleElement = document.createElement('div');
        this.titleElement.classList.add('slider__title');
        this.titleElement.textContent = this.settings.slideNames[this.currentSlide];

        this.priceElement = document.createElement('div');
        this.priceElement.classList.add('slider__price');
        this.priceElement.textContent = `$${this.settings.slidePrices[this.currentSlide]} × 1`;

        this.container.appendChild(this.titleElement);
        this.container.appendChild(this.priceElement);

        document.body.appendChild(this.container);
    }

    _initProps() {
        this.slides = this.slidesContainer.querySelectorAll('.slide');
        this.SLIDE_COUNT = this.slides.length;
        this.timerInterval = this.settings.timerInterval;
    }

    _initControls() {
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.classList.add('controls');

        this.prevBtn = document.createElement('button');
        this.prevBtn.id = 'prev-btn';
        this.prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';

        this.pauseBtn = document.createElement('button');
        this.pauseBtn.id = 'pause-btn';
        this.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

        this.nextBtn = document.createElement('button');
        this.nextBtn.id = 'next-btn';
        this.nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';

        this.controlsContainer.append(this.prevBtn, this.pauseBtn, this.nextBtn);
        this.container.appendChild(this.controlsContainer);

        // Кнопки количества и покупка
        const quantityControls = document.createElement('div');
        quantityControls.classList.add('quantity-controls');

        this.decreaseBtn = document.createElement('button');
        this.decreaseBtn.id = 'decrease';
        this.decreaseBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';

        this.quantityInput = document.createElement('input');
        this.quantityInput.type = 'number';
        this.quantityInput.id = 'quantity';
        this.quantityInput.value = 1;
        this.quantityInput.min = 1;
        this.quantityInput.dataset.changed = "false";

        this.increaseBtn = document.createElement('button');
        this.increaseBtn.id = 'increase';
        this.increaseBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';

        this.resetBtn = document.createElement('button');
        this.resetBtn.id = 'reset';
        this.resetBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

        this.buyBtn = document.createElement('button');
        this.buyBtn.id = 'buy-btn';
        this.buyBtn.classList.add('slider__buy-btn');
        this.buyBtn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Buy';

        quantityControls.append(this.decreaseBtn, this.quantityInput, this.increaseBtn, this.resetBtn, this.buyBtn);
        this.container.appendChild(quantityControls);

        // Обработчики
        this.increaseBtn.addEventListener('click', () => this._increaseBtnHandler());
        this.decreaseBtn.addEventListener('click', () => this._decreaseBtnHandler());
        this.resetBtn.addEventListener('click', () => this._resetBtnHandler());
        this.quantityInput.addEventListener('input', () => this._quantityInputHandler());
        this.buyBtn.addEventListener('click', () => this._buyHandler());
    }

    _initIndicators() {
        this.indicatorContainer = document.createElement('div');
        this.indicatorContainer.classList.add('indicators');

        this.slides.forEach((_, i) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.dataset.slideTo = i;
            indicator.style.backgroundImage = `url(${this.settings.slideImages[i]})`;
            indicator.style.backgroundSize = 'cover';
            indicator.style.backgroundPosition = 'center';
            indicator.style.backgroundRepeat = 'no-repeat';
            if (i === this.currentSlide) indicator.classList.add('active');
            this.indicatorContainer.appendChild(indicator);
        });

        this.indicators = this.indicatorContainer.querySelectorAll('.indicator');
        this.container.appendChild(this.indicatorContainer);
    }

    _initEventsListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.pauseBtn.addEventListener('click', () => this.pausePlay());

        this.indicatorContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('indicator')) {
                this._gotoNth(+e.target.dataset.slideTo);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); this.pausePlay(); }
            if (e.code === 'ArrowLeft') this.prev();
            if (e.code === 'ArrowRight') this.next();
        });
    }

    _updatePrice() {
        const quantity = parseInt(this.quantityInput.value);
        const price = this.settings.slidePrices[this.currentSlide];
    
        if (quantity === 1) {
            this.priceElement.textContent = `€${price} / piece`;
        } else {
            const total = quantity * price;
            this.priceElement.textContent = `${quantity} × €${price} = €${total}`;
        }
    }
    

    _increaseBtnHandler() {
        this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
        this.quantityInput.dataset.changed = "true";
        this.pause();
        this._updatePrice();
    }

    _decreaseBtnHandler() {
        if (parseInt(this.quantityInput.value) > 1) {
            this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
            this.quantityInput.dataset.changed = "true";
            this._updatePrice();
        }
    }

    _quantityInputHandler() {
        if (this.quantityInput.value < 1) this.quantityInput.value = 1;
        this.quantityInput.dataset.changed = "true";
        this._updatePrice();
    }

    _resetBtnHandler() {
        this.quantityInput.value = 1;
        this.quantityInput.dataset.changed = "false";
        this._updatePrice();
    }

    _buyHandler() {
        alert(`Спасибо за покупку!\nВы купили ${this.quantityInput.value} × ${this.settings.slideNames[this.currentSlide]}`);
        this._resetBtnHandler();
    }

    _gotoNth(n) {
        // сброс количества при смене слайда
        if (this.quantityInput.dataset.changed === "true") {
            this._resetBtnHandler();
        }

        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        this.currentSlide = (n + this.SLIDE_COUNT) % this.SLIDE_COUNT;

        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');

        this.titleElement.textContent = this.settings.slideNames[this.currentSlide];
        this._updatePrice();
    }

    next() {
        this._gotoNth(this.currentSlide + 1);
    }

    prev() {
        this._gotoNth(this.currentSlide - 1);
    }

    pause() {
        if (!this.isPlaying) return;
        clearInterval(this.timerId);
        this.isPlaying = false;
        this.pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        this._tick();
    }

    pausePlay() {
        this.isPlaying ? this.pause() : this.play();
    }

    _tick() {
        clearInterval(this.timerId);
        this.timerId = setInterval(() => this._gotoNth(this.currentSlide + 1), this.timerInterval);
    }
}

class SwipeCarousel extends Carousel {
    constructor(options) {
        super(options);
        this.swipeThreshold = this.settings.swipeThreshold;
        this._initSwipeListeners();
    }

    _initSwipeListeners() {
        this.slidesContainer.addEventListener('touchstart', (e) => this._swipeStart(e), { passive: false });
        this.slidesContainer.addEventListener('touchend', (e) => this._swipeEnd(e));
        this.slidesContainer.addEventListener('mousedown', (e) => this._swipeStart(e));
        this.slidesContainer.addEventListener('mouseup', (e) => this._swipeEnd(e));
        this.slidesContainer.addEventListener('mouseleave', (e) => this._swipeEnd(e));
    }

    _swipeStart(e) {
        if (e instanceof MouseEvent) this.swipeStartX = e.clientX;
        if (e instanceof TouchEvent) {
            e.preventDefault();
            this.swipeStartX = e.changedTouches[0].clientX;
        }
        this.swipeEndX = 0;
    }

    _swipeEnd(e) {
        if (e instanceof MouseEvent) this.swipeEndX = e.clientX;
        if (e instanceof TouchEvent) this.swipeEndX = e.changedTouches[0].clientX;

        const diff = this.swipeEndX - this.swipeStartX;
        if (diff > this.swipeThreshold) this.prev();
        if (diff < -this.swipeThreshold) this.next();
    }
}

const carousel = new SwipeCarousel();
