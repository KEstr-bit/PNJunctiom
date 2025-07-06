import { PHYSICS_CONFIG } from "../config";
import { Electron } from './Electron';
import  {Atom}  from './Atom';

import  {Arsenicum}  from './Arsenicum';

import { probability } from '../utils/helpers';
import { Silicium } from "./Silicium";
import  {Indium}  from './Indium';

export class PNJunction {
  constructor(width, height, x) {
    this.width = width; // ширина p-n перехода
    this.height = height; // высота p-n перехода
    this.x = x; // координата x перехода
    this.atoms = []; // массив частиц
    this.electrons = []

    this.acceptorPercent = 5;
    this.donorPercent = 5;

    this.maxParticles = 10;
    this.temperature = 0;
    this.voltage = 0;

    this.currentPositive = 0;
    this.currentNegative = 0;

    
  }

  // Обновление состояния частиц (например, движение)
  update(time) {
    if(this.atoms.length === 0)
    {
      this.atoms = this.generateInitialAtoms();
      this.setupCrystalLattice();
    }

    //console.log('timesss:', this.particles)
    this.applyForces();
    
    this.atoms.forEach(particle =>{ particle.update(time)});
    this.electrons.forEach(particle => particle.update(time));
    this.updateCollisions();
    this.checkRecombination();

    this.currentNegative = this.electrons.length;
    this.currentPositive = this.atoms.filter(atom => atom.charge > 0 && atom.canMove).length;

    if(this.maxParticles - (this.currentNegative + this.currentPositive)/2 >= 2)
    {
      this.electrons.push(new Electron(Math.random()*this.x + this.x, Math.random()*this.height))
      do{
        
        const atom = this.atoms[Math.floor(Math.random()*this.atoms.length - 1)]
        if(atom.x < 400 && atom.charge === 0)
        {
          atom.charge++;
          break;
        }

      }while(true);
    }

  }

  
  
generateInitialAtoms() {
      const particles = [];
      const spacing = 40;
  
      for (let y = 20; y < this.height; y += spacing) {
        for (let x = 20; x < this.width; x += spacing) {
          if (x < this.x) {
            particles.push(
              probability(this.acceptorPercent)
                ? new Indium(x, y, (electron) => this.electrons.push(electron))
                : new Silicium(x, y, (electron) => this.electrons.push(electron))
            );
          } else {
            particles.push(
              probability(this.donorPercent)
                ? new Arsenicum(x, y, (electron) => this.electrons.push(electron))
                : new Silicium(x, y, (electron) => this.electrons.push(electron))
            );
          }
        }
      }
  
      return particles;
    };

checkRecombination()
{
  this.electrons.forEach(electron => {
    let x = Math.floor(electron.x / 40);
    let y = Math.floor(electron.y / 40);
    let index = Math.floor(this.width / 40 * y + x);

    const atom = this.atoms[index];

    const dx = atom.x - electron.x;
    const dy = atom.y - electron.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
              
    if (distance < (atom.radius + electron.radius) && atom.canMove && atom.charge > 0) {
       atom.charge = 0;
       this.electrons.splice(this.electrons.indexOf(electron), 1);
    }
})

}

  applyForces() {
  const allParticles = [...this.atoms, ...this.electrons];
  
  // Применяем кулоновские силы между парами
  for (let i = 0; i < allParticles.length; i++) {
    for (let j = i + 1; j < allParticles.length; j++) {
      const p1 = allParticles[i];
      const p2 = allParticles[j];
      
      const p1C = p1.getCoords();
      const p2C = p2.getCoords();

      const dx = p2C.x - p1C.x;
      const dy = p2C.y - p1C.y;
      const distanceSq = dx * dx + dy * dy;
      
      const minDistance = (p1.radius + p2.radius) * 0.5;
      const clampedDistanceSq = Math.max(distanceSq, minDistance * minDistance);
      
      const forceMagnitude = PHYSICS_CONFIG.K * p1.charge * p2.charge / clampedDistanceSq;
      const distance = Math.sqrt(clampedDistanceSq);
      const fx = forceMagnitude * dx / distance;
      const fy = forceMagnitude * dy / distance;
      
      p1.applyForce(-fx, -fy);
      p2.applyForce(fx, fy);
    }
  }
  
  // Затем применяем силу напряжения один раз для каждой частицы
  for (const particle of allParticles) {
    particle.applyForce(this.voltage * PHYSICS_CONFIG.K * particle.charge, 0);
  }
}

updateCollisions()
{
  this.electrons.forEach(electron => {
    if(electron.nextX > this.width - electron.radius)
    {
      electron.speedX = 0;
      electron.x =   this.width - electron.radius;
      electron.nextX = electron.x;
    }

    if(electron.nextX < electron.radius)
    {
      electron.speedX = 0;
      electron.x = electron.radius;
      electron.nextX = electron.x;
    }

    if(electron.nextY > this.height - electron.radius)
    {
      electron.speedY = 0;
      electron.y =   this.height - electron.radius;
      electron.nextY = electron.y;
    }

    if(electron.nextY < electron.radius)
    {
      electron.speedY = 0;
      electron.y = electron.radius;
      electron.nextY = electron.y;
    }

  })
}

  // Метод для установки соседей всем атомам
  setupCrystalLattice() {
  // Проверяем, является ли количество частиц полным квадратом
  const gridWidth = Math.floor(this.width / 40);
    const gridHeight = Math.floor(this.height / 40);

  if (gridWidth * gridHeight !== this.atoms.length) {
    console.error("Количество частиц должно быть полным квадратом для квадратной решетки");
    return;
  }
  
  for (let i = 0; i < this.atoms.length; i++) {
    const neighbors = [];
    const row = Math.floor(i / gridWidth);
    const col = i % gridWidth;
    
    // Добавляем соседей (если они существуют)
    if (row > 0) neighbors.push(this.atoms[i - gridWidth]); // верхний
    if (row <  gridHeight - 1) neighbors.push(this.atoms[i + gridWidth]); // нижний
    if (col > 0) neighbors.push(this.atoms[i - 1]); // левый
    if (col < gridWidth - 1) neighbors.push(this.atoms[i + 1]); // правый
    
    this.atoms[i].setNeighbors(neighbors);
  }
}


setAcceptorPercent(acceptorPercent) {

}

setDonorPercent(donorPercent) {

}

setVoltage(voltage)
{
  this.voltage = voltage;
}

setTemperature(temperature)
{

}

  // Получить все кружки в симуляции
 getAllCircles() {
  const circles = [...this.atoms, ...this.electrons];
  return circles;
}

  getCurrent() {
  
  // Суммируем speedX всех электронов
  let sum = 0;
  this.atoms.forEach(atom => {
    sum += atom.charge * (atom.nextX - atom.x);
  })
  return -sum;
}

}

  
