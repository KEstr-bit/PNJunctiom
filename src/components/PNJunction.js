class PNJunction {
  constructor(width, height, x, y) {
    this.width = width; // ширина p-n перехода
    this.height = height; // высота p-n перехода
    this.x = x; // координата x перехода
    this.particles = []; // массив частиц
  }

  // Обновление состояния частиц (например, движение)
  update(time) {

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