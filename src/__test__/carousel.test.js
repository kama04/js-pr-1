import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

const mainJsPath = path.resolve(__dirname, '../index.js')
const carouselCode = fs.readFileSync(mainJsPath, 'utf-8')

function setupDOM() {
  document.body.innerHTML = `
    <div id="carousel">
      <div id="slides-container" class="slides">
        <div class="slide active"></div>
        <div class="slide"></div>
        <div class="slide"></div>
      </div>

      <div id="indicators-container">
        <span class="indicator active" data-slide-to="0"></span>
        <span class="indicator" data-slide-to="1"></span>
        <span class="indicator" data-slide-to="2"></span>
      </div>

      <div class="controls">
        <button id="previous-btn"></button>
        <button id="pause-btn"></button>
        <button id="next-btn"></button>
      </div>

      <h2 class="slider__title">Acai Dessert</h2>
      <div class="slider__price"><span>$10.00 / piece</span></div>

      <div class="quantity-controls">
        <button id="decrease"></button>
        <input type="number" id="quantity" value="1" min="1">
        <button id="increase"></button>
        <button id="reset"></button>
      </div>
    </div>
  `
}

describe('Carousel Functionality', () => {
  let slides, indicators, prevBtn, nextBtn, pauseBtn, slidesContainer

  beforeEach(() => {
    setupDOM()
    vi.useFakeTimers()
    vi.spyOn(window, 'setInterval')
    vi.spyOn(window, 'clearInterval')
    eval(carouselCode)

    slides = document.querySelectorAll('.slide')
    indicators = document.querySelectorAll('.indicator')
    prevBtn = document.getElementById('previous-btn')
    nextBtn = document.getElementById('next-btn')
    pauseBtn = document.getElementById('pause-btn')
    slidesContainer = document.getElementById('slides-container')
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  test('Ініціалізація: перший слайд активний', () => {
    expect(slides[0].classList.contains('active')).toBe(true)
    expect(indicators[0].classList.contains('active')).toBe(true)
    expect(window.setInterval).toHaveBeenCalled()
  })

  test('Перехід до наступного слайда кнопкою', () => {
    nextBtn.click()
    expect(slides[0].classList.contains('active')).toBe(false)
    expect(slides[1].classList.contains('active')).toBe(true)
    expect(indicators[1].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Перехід до попереднього слайда кнопкою', () => {
    prevBtn.click()
    expect(slides[0].classList.contains('active')).toBe(false)
    expect(slides[2].classList.contains('active')).toBe(true)
    expect(indicators[2].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Пауза та відтворення', () => {
    pauseBtn.click()
    expect(pauseBtn.innerHTML).toContain('fa-play')
    expect(window.clearInterval).toHaveBeenCalled()
    pauseBtn.click()
    expect(pauseBtn.innerHTML).toContain('fa-pause')
    expect(window.setInterval).toHaveBeenCalledTimes(2)
  })

  test('Перехід через індикатори', () => {
    indicators[1].click()
    expect(slides[1].classList.contains('active')).toBe(true)
    expect(indicators[1].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Керування клавіатурою', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }))
    expect(slides[1].classList.contains('active')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }))
    expect(slides[0].classList.contains('active')).toBe(true)
    const spaceEvent = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
    const preventSpy = vi.spyOn(spaceEvent, 'preventDefault')
    document.dispatchEvent(spaceEvent)
    expect(preventSpy).toHaveBeenCalled()
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Свайпи мишею та сенсорно', () => {
    slidesContainer.dispatchEvent(new MouseEvent('mousedown', { clientX: 300 }))
    slidesContainer.dispatchEvent(new MouseEvent('mouseup', { clientX: 450 }))
    expect(slides[2].classList.contains('active')).toBe(true)
    slidesContainer.dispatchEvent(new MouseEvent('mousedown', { clientX: 300 }))
    slidesContainer.dispatchEvent(new MouseEvent('mouseup', { clientX: 150 }))
    expect(slides[0].classList.contains('active')).toBe(true)

    const touchStart = new Event('touchstart', { bubbles: true })
    Object.defineProperty(touchStart, 'changedTouches', { value: [{ clientX: 300 }] })
    const touchEnd = new Event('touchend', { bubbles: true })
    Object.defineProperty(touchEnd, 'changedTouches', { value: [{ clientX: 150 }] })
    slidesContainer.dispatchEvent(touchStart)
    slidesContainer.dispatchEvent(touchEnd)
    expect(slides[1].classList.contains('active')).toBe(true)
  })

  test('Автоматичне перемикання', () => {
    vi.advanceTimersByTime(2000)
    expect(slides[1].classList.contains('active')).toBe(true)
  })
})
