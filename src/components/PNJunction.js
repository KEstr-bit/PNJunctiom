
import { 
  PHYSICS_CONFIG, 
  ELECTRON_CONFIG, 
  SIMULATION_CONFIG 
} from "../config";
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

    this.acceptorPercent = 0;
    this.donorPercent = 0;

    this.maxParticles = 0;
    this.temperature = 0;
    this.voltage = 0;

    this.currentPositiveN = 0;
    this.currentNegativeN = 0;
    this.currentPositiveP = 0;
    this.currentNegativeP = 0;

    this.maxPositiveN = 0;
    this.maxNegativeN = 0;
    this.maxPositiveP = 0;
    this.maxNegativeP = 0;
    
  }

  // Обновление состояния частиц (например, движение)
  update(time) {
    if(this.atoms.length === 0)
    {
      this.atoms = this.generateInitialAtoms();
      this.setupCrystalLattice();
    }

    this.applyForces();
    
    this.atoms.forEach(particle =>{ particle.update(time)});
    this.electrons.forEach(particle => particle.update(time));
    this.updateCollisions();
    this.checkRecombination();

    //this.checkHighEnergyElectrons();

    this.currentNegativeP = this.electrons.filter(electron => electron.x < this.x).length;
    this.currentNegativeN = this.electrons.filter(electron => electron.x > this.x).length;
    this.currentPositiveP = this.atoms.filter(atom => atom.charge > 0 && atom.canMove && atom.x < this.x).length;
    this.currentPositiveN = this.atoms.filter(atom => atom.charge > 0 && atom.canMove && atom.x > this.x).length;

    if(this.maxNegativeP - this.currentNegativeP > 0 && this.maxPositiveN - this.currentPositiveN > 0 )
    {
      this.electrons.push(new Electron(Math.random()*this.x, Math.random()*this.height))
        
      do{
        const atom = this.atoms[Math.floor(Math.random()*this.atoms.length)]
        if(atom.x > 400 && atom.charge === 0)
        {
          atom.charge++;
          this.currentNegativeP++;
          this.currentPositiveN++;
          break;
        }
      }while(true)

      }

    if(this.maxNegativeN - this.currentNegativeN > 0 && this.maxPositiveP - this.currentPositiveP > 0 )
    {
      this.electrons.push(new Electron(Math.random()*this.x + this.x, Math.random()*this.height))
        
      do{
        const atom = this.atoms[Math.floor(Math.random()*this.atoms.length)]
        if(atom.x < 400 && atom.charge === 0)
        {
          atom.charge++;
          this.currentNegativeN++;
          this.currentPositiveP++;
          break;
        }
      }while(true)

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
            ? new Indium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
            : new Silicium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
        );
      } else {
        particles.push(
          probability(this.donorPercent)
            ? new Arsenicum(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
            : new Silicium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
        );
      }
    }
  }

  return particles;
};

handleNewElectron(electron, atom) {
  if(atom instanceof Arsenicum)
  {
    this.electrons.push(electron);
    atom.charge++;
    if(atom.x < this.x)
  {
    
    this.currentNegativeP++;
    this.currentPositiveP++;
    
  }
  else
  {
    this.currentNegativeN++;
    this.currentPositiveN++;
  }
  }
  else
  if(atom.x < this.x)
    {
      if(this.maxNegativeP - this.currentNegativeP > 0 && this.maxPositiveP - this.currentPositiveP > 0 )
      {
      this.electrons.push(electron);
      console.log(atom)
      atom.charge++;

      this.currentNegativeP++;
      this.currentPositiveP++;
      }

    }
    else
    {
      if(this.maxNegativeN - this.currentNegativeN > 0 && this.maxPositiveN - this.currentPositiveN > 0 )
      {
      this.electrons.push(electron);
      console.log(atom)
      atom.charge++;

      this.currentNegativeN++;
      this.currentPositiveN++;
      }
    }
  }


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
              
    if (distance < ((atom.radius + electron.radius) * 1.5) && atom.canMove && atom.charge > 0) {
       atom.charge = 0;
       this.electrons.splice(this.electrons.indexOf(electron), 1);
    }
})
}


  applyForces() {
  const allParticles = [...this.atoms, ...this.electrons];
  
  // Применяем кулоновские силы между парами
  allParticles.forEach(p1 => {
    const p1C = p1.getCoords();
    allParticles.forEach(p2 => {
      if (p1 !== p2) {
      const p2C = p2.getCoords();
      const dx = p2.nextX - p1.nextX;
      const dy = p2.nextY - p1.nextY;
      const distanceSq = dx * dx + dy * dy;
      
      const minDistance = (p1.radius + p2.radius) * 0.5;
      const clampedDistanceSq = Math.max(distanceSq, minDistance * minDistance);
      
      const forceMagnitude = PHYSICS_CONFIG.K * p1.charge * p2.charge / clampedDistanceSq;
      const distance = Math.sqrt(clampedDistanceSq);
      const fx = forceMagnitude * (dx / distance);
      const fy = forceMagnitude * (dy / distance);
      
      p1.applyForce(fx, fy);
      }
     })
  
  
  // Затем применяем силу напряжения один раз для каждой частицы
  for (const particle of allParticles) {
    particle.applyForce(this.voltage * particle.charge*2, 0);
  }
  })
}

checkHighEnergyElectrons() {
  // Threshold for considering an electron "fast" (adjust as needed)
  const SPEED_THRESHOLD = ELECTRON_CONFIG.SPEED_THRESHOLD;
  const CREATION_DISTANCE = ELECTRON_CONFIG.CREATION_DISTANCE;
  
  // Make a copy of current electrons array since we might modify it
  const currentElectrons = [...this.electrons];
  
  currentElectrons.forEach(electron => {
    const speed = Math.sqrt(electron.speedX * electron.speedX + electron.speedY * electron.speedY);
    
    if (speed > SPEED_THRESHOLD) {
      // Calculate direction vector
      const directionX = electron.speedX / speed;
      const directionY = electron.speedY / speed;
      
      // Create new electron slightly in front of the fast one
      const newX = electron.x + directionX * CREATION_DISTANCE;
      const newY = electron.y + directionY * CREATION_DISTANCE;
      
      // Check if position is within bounds
      if (newX > 0 && newX < this.width && newY > 0 && newY < this.height) {
        if(probability(Math.sqrt(this.temperature)))
        {
        const newElectron = new Electron(newX, newY);
        
        // Set similar velocity (with slight randomness)
        newElectron.speedX = electron.speedX;
        newElectron.speedY = electron.speedY;
        
        this.electrons.push(newElectron);
        
        // Reduce original electron's energy slightly
        electron.speedX *= 0.8;
        electron.speedY *= 0.8;
        }
      }
    }
  });
}

updateCollisions()
{
   const allParticles = [...this.atoms, ...this.electrons];

  allParticles.forEach(electron => {
    const coords = electron.getCoords();
    let newX = coords.x;
    let newY = coords.y;

    if(coords.x > this.width - electron.radius)
    {
      electron.speedX = 0;
      newX =  this.width - electron.radius;
      electron.nextX = newX;
    }

    if(coords.x < electron.radius)
    {
      electron.speedX = 0;
      newX = electron.radius;
      electron.nextX = newX;
    }

    if(coords.y > this.height - electron.radius)
    {
      electron.speedY = 0;
      newY =   this.height - electron.radius;
      electron.nextY = newY;
    }

    if(coords.y < electron.radius)
    {
      electron.speedY = 0;
      newY = electron.radius;
      electron.nextY = newY;
    }

    electron.setCoords(newX, newY);

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
  if (acceptorPercent === this.acceptorPercent) return;

  const gridWidth = Math.floor(this.width / 40);
  const gridHeight = Math.floor(this.height / 40);

  if (acceptorPercent > this.acceptorPercent) {
    // Увеличиваем концентрацию акцепторов - заменяем случайные Si на In
    const siAtoms = this.atoms.filter(atom => 
      atom.x < this.x && atom.constructor.name === 'Silicium'
    );

    // Сначала находим атомы Si, у которых все соседи - Si
    const suitableSiAtoms = siAtoms.filter(siAtom => {
      const neighbors = siAtom.neighbors;
      return neighbors.every(neighbor => neighbor.constructor.name === 'Silicium');
    });

    // Выбираем случайные подходящие атомы Si для замены
    const atomsToReplace = Math.min(
      Math.floor(siAtoms.length * (acceptorPercent - this.acceptorPercent) / 100),
      suitableSiAtoms.length
    );

    for (let i = 0; i < atomsToReplace; i++) {
      const randomIndex = Math.floor(Math.random() * suitableSiAtoms.length);
      const atomToReplace = suitableSiAtoms[randomIndex];
      const index = this.atoms.indexOf(atomToReplace);
      
      if (index !== -1) {
        this.atoms[index] = new Indium(
          atomToReplace.x, 
          atomToReplace.y, 
          (electron, atom) => this.handleNewElectron(electron, atom)
        );
        // Удаляем замененный атом из массива suitableSiAtoms
        suitableSiAtoms.splice(randomIndex, 1);
      }
    }
  } else {
    // Уменьшаем концентрацию акцепторов - заменяем случайные In на Si
    let inAtoms = this.atoms.filter(atom => 
      atom.x < this.x && atom instanceof Indium
    );

    const atomsToReplace = Math.min(
      Math.floor(inAtoms.length - (this.atoms.length / 2) * (acceptorPercent) / 100),
      inAtoms.length
    );

    for (let i = 0; i < atomsToReplace; i++) {
      if (inAtoms.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * inAtoms.length);
      const atomToReplace = inAtoms[randomIndex];
      const index = this.atoms.indexOf(atomToReplace);
      
      if (index !== -1) {
        this.atoms[index] = new Silicium(
          atomToReplace.x, 
          atomToReplace.y, 
          (electron, atom) => this.handleNewElectron(electron, atom)
        );
        // Удаляем замененный атом из массива inAtoms
        inAtoms.splice(randomIndex, 1);
      }
    }
  }

  this.acceptorPercent = acceptorPercent;
  this.setupCrystalLattice(); // Обновляем соседей после изменений
  this.maxPositiveP = this.atoms.filter(atom => atom instanceof Indium).length*Math.sqrt(this.temperature);
  this.maxNegativeN = this.atoms.filter(atom => atom instanceof Arsenicum).length*Math.sqrt(this.temperature);
  this.maxPositiveN = 2*Math.sqrt(this.temperature);
  this.maxNegativeP = 2*Math.sqrt(this.temperature);
}

setDonorPercent(donorPercent) {

  if (donorPercent === this.donorPercent) return;

  const gridWidth = Math.floor(this.width / 40);
  const gridHeight = Math.floor(this.height / 40);

  if (donorPercent > this.donorPercent) {

    // Увеличиваем концентрацию доноров - заменяем случайные Si на As
    const siAtoms = this.atoms.filter(atom => 
      atom.x >= this.x && atom.constructor.name === 'Silicium'
    );

    // Сначала находим атомы Si, у которых все соседи - Si
    const suitableSiAtoms = siAtoms.filter(siAtom => {
      const neighbors = siAtom.neighbors;
      return neighbors.every(neighbor => neighbor.constructor.name === 'Silicium');
    });

    // Выбираем случайные подходящие атомы Si для замены
    const atomsToReplace = Math.min(
      Math.floor(siAtoms.length * (donorPercent - this.donorPercent) / 100),
      suitableSiAtoms.length
    );

    for (let i = 0; i < atomsToReplace; i++) {
      const randomIndex = Math.floor(Math.random() * suitableSiAtoms.length);
      const atomToReplace = suitableSiAtoms[randomIndex];
      const index = this.atoms.indexOf(atomToReplace);
      
      if (index !== -1) {
        this.atoms[index] = new Arsenicum(
          atomToReplace.x, 
          atomToReplace.y, 
          (electron, atom) => this.handleNewElectron(electron, atom)
        );
        // Удаляем замененный атом из массива suitableSiAtoms
        suitableSiAtoms.splice(randomIndex, 1);
      }
    }
  } else {
    
    
    // Уменьшаем концентрацию доноров - заменяем случайные As на Si
    let asAtoms = this.atoms.filter(atom => 
      atom.x >= this.x && atom instanceof Arsenicum
    );

    const atomsToReplace = Math.min(
      Math.floor(asAtoms.length - (this.atoms.length / 2) * (donorPercent) / 100),
      asAtoms.length
    );

    for (let i = 0; i < atomsToReplace; i++) {
      if (asAtoms.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * asAtoms.length);
      const atomToReplace = asAtoms[randomIndex];
      const index = this.atoms.indexOf(atomToReplace);
      
      if (index !== -1) {
        this.atoms[index] = new Silicium(
          atomToReplace.x, 
          atomToReplace.y, 
          (electron, atom) => this.handleNewElectron(electron, atom)
        );
        // Удаляем замененный атом из массива asAtoms
        asAtoms.splice(randomIndex, 1);
      }
    }
  }

  this.donorPercent = donorPercent;
  this.setupCrystalLattice(); // Обновляем соседей после изменений
  this.maxPositiveP = this.atoms.filter(atom => atom instanceof Indium).length*Math.sqrt(this.temperature);
  this.maxNegativeN = this.atoms.filter(atom => atom instanceof Arsenicum).length*Math.sqrt(this.temperature);
  this.maxPositiveN = 2*Math.sqrt(this.temperature);
  this.maxNegativeP = 2*Math.sqrt(this.temperature);
}

setVoltage(voltage)
{
  this.voltage = voltage;
}

setTemperature(temperature)
{
  this.temperature = temperature;
  this.atoms.forEach(atom => atom.setTemperature(temperature));

  this.maxPositiveP = this.atoms.filter(atom => atom instanceof Indium).length*Math.sqrt(this.temperature);
  this.maxNegativeN = this.atoms.filter(atom => atom instanceof Arsenicum).length*Math.sqrt(this.temperature);
  this.maxPositiveN = 2*Math.sqrt(this.temperature);
  this.maxNegativeP = 2*Math.sqrt(this.temperature);
  
}

  // Получить все кружки в симуляции
 getAllCircles() {
  const circles = [...this.atoms, ...this.electrons];
  return circles;
}

reset()
{
   this.atoms = []; // массив частиц
    this.electrons = [];
}

  getCurrent() {
  
  // Суммируем speedX всех электронов
  let sum = 0;
  this.electrons.forEach(electron=> {
    sum -= electron.charge * electron.speedX;
  })
  this.atoms.forEach(electron=> {
    sum -= electron.charge * electron.speedX;
  })
  return -sum/100;
}

}

  
