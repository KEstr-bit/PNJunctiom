import { probability } from '../utils/helpers';
import { Electron } from './Electron';
import Particle from './Particle';

export class Atom extends Particle {
  constructor(x, y, mass, charge, color, radius, onGenerateChargeCarrier) {
    super(
        x, 
        y, 
        mass,
        charge, 
        color, 
        radius
    );

    this.onGenerateChargeCarrier = onGenerateChargeCarrier;
    this.baseX = x;
    this.baseY = y;
    this.chargeX = x;
    this.chargeY = y;
    this.canMove = true;
    this.temperature = 0;
    this.neighbors = []; // Соседние атомы
  }

   getCoords(){
    const data = {x: this.chargeX, y: this.chargeY}
    return data
  }

  // Метод для установки соседей
  setNeighbors(neighbors) {
    this.neighbors = neighbors;
  }

  setTemperature(temperature)
  {
    this.temperature = temperature;
  }

  move(time)
  {
    // Применяем ускорение (если есть)
    this.speedX += this.accelX * time;
    this.speedY += this.accelY * time;

    this.accelX = 0;
    this.accelY = 0;

    // Обновляем позицию на основе скорости
    this.nextX = this.chargeX + this.speedX * time;
    this.nextY = this.chargeY + this.speedY * time;
  }

  update(time)
  {

    if(this.canMove)
      this.move(time)

    if(this.charge >= 0 && probability(Math.sqrt(this.temperature)))
    {
    
      const angle = Math.random() * Math.PI * 2; // Случайный угол
      const electronX = this.x + Math.cos(angle) * this.radius * 2;
      const electronY = this.y + Math.sin(angle) * this.radius * 2;
      this.onGenerateChargeCarrier(new Electron(electronX, electronY))
    }

  }


}