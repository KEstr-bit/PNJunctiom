import { PHYSICS_CONSTANTS } from '../config';
import './Particle.css';

export default class Particle {
  //Создает новую частицу с заданными параметрами

  constructor(x, y, mass, charge, color, radius) {
    // Позиция частицы
    this.x = x;
    this.y = y;
    this.nextX = x; // Позиция на следующем шаге (для предсказания)
    this.nextY = y;
    
    // Физические свойства
    this.mass = mass;
    this.charge = charge;
    this.radius = radius;
    
    // Динамические параметры
    this.accelX = 0;  // Ускорение по X
    this.accelY = 0;  // Ускорение по Y
    this.speedX = 0;  // Скорость по X
    this.speedY = 0;  // Скорость по Y
    
    // Визуальные свойства
    this.color = color;
  }

  //Обновляет состояние частицы с течением времени
  update(time) {
    // Применяем трение для постепенного замедления
    this.speedX *= PHYSICS_CONSTANTS.SPEED_DECAY;
    this.speedY *= PHYSICS_CONSTANTS.SPEED_DECAY;
  }

  //Возвращает текущие координаты частицы
  getCoords() {
    return {x: this.x, y: this.y};
  }

  //Устанавливает новые координаты частицы
  setCoords(x, y) {
    this.x = x;
    this.y = y;
  }

  //Возвращает символ заряда частицы

  getChargeSymbol() {
    if (this.charge > 0) return '+';
    if (this.charge < 0) return '-';
    return ' ';
  }

  //Генерирует стили для визуализации частицы

  getDynamicStyles() {
    return {
      left: `${this.x - this.radius}px`,
      top: `${this.y - this.radius}px`,
      width: `${this.radius * 2}px`,
      height: `${this.radius * 2}px`,
      backgroundColor: this.color,
      fontSize: `${PHYSICS_CONSTANTS.FONT_SIZE_RATIO}px`,
      lineHeight: `2px`, // Центрирование текста по вертикали
    };
  }

  //Рендерит визуальное представление частицы
  render() {
    return (
      <div className="particle" style={this.getDynamicStyles()}>
        {this.getChargeSymbol()}
      </div>
    );
  }

  //Применяет силу к частице (F = ma)
  applyForce(fx, fy) {
    this.accelX += fx / this.mass;
    this.accelY += fy / this.mass;
  }
}