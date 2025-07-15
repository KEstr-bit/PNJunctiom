import { 
  PHYSICS_CONFIG, 
  ELECTRON_CONFIG, 
  SIMULATION_CONFIG, 
  CHARGE_CARRIER_CONSTANTS,
  HIGH_ENERGY_CONSTANTS,
  LATTICE_CONSTANTS,
  PHYSICS_CONSTANTS,
} from "../config";


import { Electron } from './Electron';
import { Atom } from './Atom';
import { Arsenicum } from './Arsenicum';
import { probability } from '../utils/helpers';
import { Silicium } from "./Silicium";
import { Indium } from './Indium';

export class PNJunction {
  constructor(width, height, x) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.atoms = [];
    this.electrons = [];

    // Процент легирующих примесей
    this.acceptorPercent = 0;
    this.donorPercent = 0;

    // Параметры среды
    this.temperature = 0;
    this.voltage = 0;

    // Текущие количества носителей заряда
    this.currentPositiveN = 0;
    this.currentNegativeN = 0;
    this.currentPositiveP = 0;
    this.currentNegativeP = 0;

    // Максимальные количества носителей заряда
    this.maxPositiveN = 0;
    this.maxNegativeN = 0;
    this.maxPositiveP = 0;
    this.maxNegativeP = 0;
  }

  update(time) {
    // Инициализация атомов при первом обновлении
    if (this.atoms.length === 0) {
      this.atoms = this.generateInitialAtoms();
      this.setupCrystalLattice();
    }

    // Применение физических сил
    this.applyForces();
    this.checkRecombination();

    // Обновление всех частиц
    this.atoms.forEach(particle => particle.update(time));
    this.electrons.forEach(particle => particle.update(time));
    this.updateCollisions();
    
    // Подсчет текущих носителей заряда
    this.updateChargeCarriersCount();

    // Генерация новых электронов при необходимости
    this.generateNewElectrons();
  }

  // Подсчет количества носителей заряда в областях P и N
  updateChargeCarriersCount() {
    this.currentNegativeP = this.electrons.filter(electron => electron.x < this.x).length;
    this.currentNegativeN = this.electrons.filter(electron => electron.x > this.x).length;
    this.currentPositiveP = this.atoms.filter(atom => atom.charge > 0 && atom.canMove && atom.x < this.x).length;
    this.currentPositiveN = this.atoms.filter(atom => atom.charge > 0 && atom.canMove && atom.x > this.x).length;
  }

  // Генерация новых электронов при наличии свободных мест
  generateNewElectrons() {
    if (this.maxNegativeP - this.currentNegativeP > 0 && this.maxPositiveN - this.currentPositiveN > 0) {
      this.electrons.push(new Electron(Math.random() * this.x, Math.random() * this.height));
        
      do {
        const atom = this.atoms[Math.floor(Math.random() * this.atoms.length)];
        if (atom.x > LATTICE_CONSTANTS.JUNCTION_X_POSITION && atom.charge === 0) {
          atom.charge=1;
          this.currentNegativeP++;
          this.currentPositiveN++;
          break;
        }
      } while (true);
    }

    if (this.maxNegativeN - this.currentNegativeN > 0 && this.maxPositiveP - this.currentPositiveP > 0) {
      this.electrons.push(new Electron(Math.random() * this.x + this.x, Math.random() * this.height));
        
      do {
        const atom = this.atoms[Math.floor(Math.random() * this.atoms.length)];
        if (atom.x < LATTICE_CONSTANTS.JUNCTION_X_POSITION && atom.charge === 0) {
          atom.charge=1;
          this.currentNegativeN++;
          this.currentPositiveP++;
          break;
        }
      } while (true);
    }
  }

  // Генерация начального расположения атомов
  generateInitialAtoms() {
    const particles = [];
    
    for (let y = LATTICE_CONSTANTS.INITIAL_POSITION_OFFSET; y < this.height; y += LATTICE_CONSTANTS.DEFAULT_SPACING) {
      for (let x = LATTICE_CONSTANTS.INITIAL_POSITION_OFFSET; x < this.width; x += LATTICE_CONSTANTS.DEFAULT_SPACING) {
        if (x < this.x) {
          // P-область (акцепторы)
          particles.push(
            probability(this.acceptorPercent)
              ? new Indium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
              : new Silicium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
          );
        } else {
          // N-область (доноры)
          particles.push(
            probability(this.donorPercent)
              ? new Arsenicum(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
              : new Silicium(x, y, (electron, atom) => this.handleNewElectron(electron, atom))
          );
        }
      }
    }

    return particles;
  }

  // Обработка появления нового электрона
  handleNewElectron(electron, atom) {
    if (atom instanceof Arsenicum) {
      // Для донорных атомов электроны сразу становятся свободными
      this.electrons.push(electron);
      if (atom.x < this.x) {
        this.currentNegativeP++;
        this.currentPositiveP++;
      } else {
        this.currentNegativeN++;
        this.currentPositiveN++;
      }
    } else {
      // Для акцепторных атомов проверяем возможность генерации
      if (atom.x < this.x) {
        if (this.maxNegativeP - this.currentNegativeP > 0 && this.maxPositiveP - this.currentPositiveP > 0) {
          this.electrons.push(electron);
          atom.charge++;
          this.currentNegativeP++;
          this.currentPositiveP++;
        }
      } else {
        if (this.maxNegativeN - this.currentNegativeN > 0 && this.maxPositiveN - this.currentPositiveN > 0) {
          this.electrons.push(electron);
          atom.charge++;
          this.currentNegativeN++;
          this.currentPositiveN++;
        }
      }
    }
  }

  // Проверка рекомбинации электронов с дырками
  checkRecombination() {
    this.electrons.forEach(electron => {
      let x = Math.floor(electron.x / LATTICE_CONSTANTS.DEFAULT_SPACING);
      let y = Math.floor(electron.y / LATTICE_CONSTANTS.DEFAULT_SPACING);
      let index = Math.floor(this.width / LATTICE_CONSTANTS.DEFAULT_SPACING * y + x);

      const atom = this.atoms[index];

      const dx = atom.x - electron.x;
      const dy = atom.y - electron.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
                
      if (distance < ((atom.radius + electron.radius) * PHYSICS_CONSTANTS.COLLISION_MULTIPLIER) && atom.canMove && atom.charge > 0) {
        atom.charge = 0;
        this.electrons.splice(this.electrons.indexOf(electron), 1);
      }
    });
  }

  // Применение физических сил к частицам
  applyForces() {
    const allParticles = [...this.atoms, ...this.electrons];
    
    allParticles.forEach(p1 => {
      const p1C = p1.getCoords();
      allParticles.forEach(p2 => {
        if (p1 !== p2) {
          const p2C = p2.getCoords();
          const dx = p2.nextX - p1.nextX;
          const dy = p2.nextY - p1.nextY;
          const distanceSq = (dx * dx + dy * dy) / 10;
          
          const minDistance = (p1.radius + p2.radius) * 0.5;
          const clampedDistanceSq = Math.max(distanceSq, minDistance * minDistance);
          
          const forceMagnitude = PHYSICS_CONFIG.K * p1.charge * p2.charge / clampedDistanceSq;
          const distance = Math.sqrt(clampedDistanceSq);
          const fx = forceMagnitude * (dx / distance);
          const fy = forceMagnitude * (dy / distance);
          
          p1.applyForce(fx, fy);
        }
      });
    
      for (const particle of allParticles) {
        // Применение силы от напряжения и силы сопротивления
        particle.applyForce(this.voltage * particle.charge * PHYSICS_CONSTANTS.VOLTAGE_FORCE_MULTIPLIER, 0);
        particle.applyForce(-particle.speedX * PHYSICS_CONSTANTS.DRAG_COEFFICIENT, -particle.speedY * PHYSICS_CONSTANTS.DRAG_COEFFICIENT);
      }
    });
  }

  // Проверка высокоэнергетических электронов
  checkHighEnergyElectrons() {
    const currentElectrons = [...this.electrons];
    
    currentElectrons.forEach(electron => {
      const speed = Math.sqrt(electron.speedX * electron.speedX + electron.speedY * electron.speedY);
      
      if (speed > HIGH_ENERGY_CONSTANTS.SPEED_THRESHOLD) {
        const directionX = electron.speedX / speed;
        const directionY = electron.speedY / speed;
        
        const newX = electron.x + directionX * HIGH_ENERGY_CONSTANTS.CREATION_DISTANCE;
        const newY = electron.y + directionY * HIGH_ENERGY_CONSTANTS.CREATION_DISTANCE;
        
        if (newX > 0 && newX < this.width && newY > 0 && newY < this.height) {
          if (probability(Math.sqrt(this.temperature))) {
            const newElectron = new Electron(newX, newY);
            
            newElectron.speedX = electron.speedX * HIGH_ENERGY_CONSTANTS.ENERGY_REDUCTION_FACTOR;
            newElectron.speedY = electron.speedY * HIGH_ENERGY_CONSTANTS.ENERGY_REDUCTION_FACTOR;
            
            this.electrons.push(newElectron);
            
            electron.speedX *= HIGH_ENERGY_CONSTANTS.ENERGY_REDUCTION_FACTOR;
            electron.speedY *= HIGH_ENERGY_CONSTANTS.ENERGY_REDUCTION_FACTOR;
          }
        }
      }
    });
  }

  // Обновление столкновений со стенками
  updateCollisions() {
    const allParticles = [...this.atoms, ...this.electrons];

    allParticles.forEach(electron => {
      const coords = electron.getCoords();
      let newX = coords.x;
      let newY = coords.y;

      if (coords.x > this.width - electron.radius) {
        electron.speedX = 0;
        newX = this.width - electron.radius;
        electron.nextX = newX;
      }

      if (coords.x < electron.radius) {
        electron.speedX = 0;
        newX = electron.radius;
        electron.nextX = newX;
      }

      if (coords.y > this.height - electron.radius) {
        electron.speedY = 0;
        newY = this.height - electron.radius;
        electron.nextY = newY;
      }

      if (coords.y < electron.radius) {
        electron.speedY = 0;
        newY = electron.radius;
        electron.nextY = newY;
      }

      electron.setCoords(newX, newY);
    });
  }

  // Настройка кристаллической решетки
  setupCrystalLattice() {
    const gridWidth = Math.floor(this.width / LATTICE_CONSTANTS.DEFAULT_SPACING);
    const gridHeight = Math.floor(this.height / LATTICE_CONSTANTS.DEFAULT_SPACING);

    if (gridWidth * gridHeight !== this.atoms.length) {
      console.error("Количество частиц должно быть полным квадратом для квадратной решетки");
      return;
    }
    
    // Установка соседей для каждого атома
    for (let i = 0; i < this.atoms.length; i++) {
      const neighbors = [];
      const row = Math.floor(i / gridWidth);
      const col = i % gridWidth;
      
      if (row > 0) neighbors.push(this.atoms[i - gridWidth]);
      if (row < gridHeight - 1) neighbors.push(this.atoms[i + gridWidth]);
      if (col > 0) neighbors.push(this.atoms[i - 1]);
      if (col < gridWidth - 1) neighbors.push(this.atoms[i + 1]);
      
      this.atoms[i].setNeighbors(neighbors);
    }
  }

  // Установка процента акцепторных примесей
  setAcceptorPercent(acceptorPercent) {
    if (acceptorPercent === this.acceptorPercent) return;

    const gridWidth = Math.floor(this.width / LATTICE_CONSTANTS.DEFAULT_SPACING);
    const gridHeight = Math.floor(this.height / LATTICE_CONSTANTS.DEFAULT_SPACING);

    if (acceptorPercent > this.acceptorPercent) {
      // Замена кремния на индий (акцепторы)
      const siAtoms = this.atoms.filter(atom => 
        atom.x < this.x && atom.constructor.name === 'Silicium'
      );

      const suitableSiAtoms = siAtoms.filter(siAtom => {
        const neighbors = siAtom.neighbors;
        return neighbors.every(neighbor => neighbor.constructor.name === 'Silicium');
      });

      const atomsToReplace = Math.min(
        Math.floor(siAtoms.length * (acceptorPercent - this.acceptorPercent) / CHARGE_CARRIER_CONSTANTS.PERCENTAGE_DIVISOR),
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
          suitableSiAtoms.splice(randomIndex, 1);
        }
      }
    } else {
      // Замена индия на кремний (уменьшение акцепторов)
      let inAtoms = this.atoms.filter(atom => 
        atom.x < this.x && atom instanceof Indium
      );

      const atomsToReplace = Math.min(
        Math.floor(inAtoms.length - (this.atoms.length / CHARGE_CARRIER_CONSTANTS.HALF_DIVISOR) * (acceptorPercent) / CHARGE_CARRIER_CONSTANTS.PERCENTAGE_DIVISOR),
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
          inAtoms.splice(randomIndex, 1);
        }
      }
    }

    this.setTemperature(this.temperature);
    this.acceptorPercent = acceptorPercent;
    this.setupCrystalLattice();
    this.updateMaxChargeCarriers();
  }

  // Установка процента донорных примесей
  setDonorPercent(donorPercent) {
    if (donorPercent === this.donorPercent) return;

    const gridWidth = Math.floor(this.width / LATTICE_CONSTANTS.DEFAULT_SPACING);
    const gridHeight = Math.floor(this.height / LATTICE_CONSTANTS.DEFAULT_SPACING);

    if (donorPercent > this.donorPercent) {
      // Замена кремния на мышьяк (доноры)
      const siAtoms = this.atoms.filter(atom => 
        atom.x >= this.x && atom.constructor.name === 'Silicium'
      );

      const suitableSiAtoms = siAtoms.filter(siAtom => {
        const neighbors = siAtom.neighbors;
        return neighbors.every(neighbor => neighbor.constructor.name === 'Silicium');
      });

      const atomsToReplace = Math.min(
        Math.floor(siAtoms.length * (donorPercent - this.donorPercent) / CHARGE_CARRIER_CONSTANTS.PERCENTAGE_DIVISOR),
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
          suitableSiAtoms.splice(randomIndex, 1);
        }
      }
    } else {
      // Замена мышьяка на кремний (уменьшение доноров)
      let asAtoms = this.atoms.filter(atom => 
        atom.x >= this.x && atom instanceof Arsenicum
      );

      const atomsToReplace = Math.min(
        Math.floor(asAtoms.length - (this.atoms.length / CHARGE_CARRIER_CONSTANTS.HALF_DIVISOR) * (donorPercent) / CHARGE_CARRIER_CONSTANTS.PERCENTAGE_DIVISOR),
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
          asAtoms.splice(randomIndex, 1);
        }
      }
    }

    this.donorPercent = donorPercent;
    this.setTemperature(this.temperature);
    this.setupCrystalLattice();
    this.updateMaxChargeCarriers();
  }

  // Обновление максимального количества носителей заряда
  updateMaxChargeCarriers() {
    const PP = (this.atoms.filter(atom => atom instanceof Indium).length);
    const NN = (this.atoms.filter(atom => atom instanceof Arsenicum).length);
    if(this.temperature === 0)
      this.maxPositiveP = this.maxNegativeN = this.maxPositiveN = this.maxNegativeP = 0;
    else
    {
    this.maxPositiveP = Math.floor(PP + (50 - PP)*1.67**(-300/this.temperature));
    this.maxNegativeN = Math.floor(NN + (50 - NN)*1.67**(-300/this.temperature));
    this.maxPositiveN = this.temperature**2/4000;
    this.maxNegativeP = this.temperature**2/4000;
    }
  }

  // Установка напряжения
  setVoltage(voltage) {
    this.voltage = voltage;
  }

  // Установка температуры
  setTemperature(temperature) {
    this.temperature = temperature;
    this.atoms.forEach(atom => atom.setTemperature(temperature));
    this.updateMaxChargeCarriers();
  }

  // Получение всех частиц для отрисовки
  getAllCircles() {
    return [...this.atoms, ...this.electrons];
  }

  // Сброс состояния
  reset() {
    this.atoms = [];
    this.electrons = [];
  }

  // Расчет тока
  getCurrent() {
    let sum = 0;
    this.electrons.forEach(electron => {
      sum -= electron.charge * electron.speedX;
    });
    this.atoms.forEach(electron => {
      sum -= electron.charge * electron.speedX;
    });
    return -sum / PHYSICS_CONSTANTS.CURRENT_DIVIDER;
  }
}