import { PHYSICS_CONFIG } from "../config";

class PNJunction {
  constructor(width, height, x, y) {
    this.width = width; // ширина p-n перехода
    this.height = height; // высота p-n перехода
    this.x = x; // координата x перехода
    this.particles = []; // массив частиц
  }

  // Обновление состояния частиц (например, движение)
  update(time) {
    this.applyForces();
    this.particles.forEach(particle => particle.update(time));
  }

  // Метод для расчета всех электромагнитных сил между частицами
  applyForces() {
    const k = 9e9; 

    // Перебираем все пары частиц
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        // Вычисляем расстояние между частицами
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distanceSq = dx * dx + dy * dy;
        
        // Чтобы избежать деления на ноль и слишком больших сил при малых расстояниях
        const minDistance = (p1.radius + p2.radius) * 0.5;
        const clampedDistanceSq = Math.max(distanceSq, minDistance * minDistance);
        
        // Закон Кулона: F = k * q1 * q2 / r^2
        const forceMagnitude = PHYSICS_CONFIG.K * p1.charge * p2.charge / clampedDistanceSq;
        
        // Нормализуем вектор направления и умножаем на силу
        const distance = Math.sqrt(clampedDistanceSq);
        const fx = forceMagnitude * dx / distance;
        const fy = forceMagnitude * dy / distance;
        
        // Применяем силы к обеим частицам (3-й закон Ньютона)
        p1.applyForce(-fx, -fy); // Сила действующая на p1 со стороны p2
        p2.applyForce(fx, fy);   // Сила действующая на p2 со стороны p1
      }
    }
  }

  setParticles(particles){
    this.particles = [];
    this.particles = particles;
  }

  // Добавление частицы в переход
  addParticle(particle) {
    this.particles.push(particle);
  }

  // Удаление частицы по индексу
  removeParticle(index) {
    if (index >= 0 && index < this.particles.length) {
      this.particles.splice(index, 1);
    }
  }

  
}