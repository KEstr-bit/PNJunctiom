export const ELECTRON_CONFIG = {
  RADIUS: 5,
  MASS: 1,
  CHARGE: -1,
  DEFAULT_COLOR: '#0000FF'
};

export const PHYSICS_CONFIG = {
  K: -1000000, 
};
// Константы для атома
export const ATOM_CONFIG = {
  DEFAULT_RADIUS: 10, // Радиус атома по умолчанию
  MOVEMENT_FACTOR: 0.1, // Фактор колебательного движения
  ELECTRON_EMISSION_FACTOR: 2, // Множитель расстояния для эмиссии электрона
  ELECTRON_EMISSION_SPEED: 1000, // Базовая скорость эмитированного электрона
  TEMPERATURE_DIVISOR: 200, // Делитель в формуле вероятности
  TEMPERATURE_BASE: 1.67, // Основание степени в формуле вероятности
  EMISSION_PROBABILITY_FACTOR: 10 // Множитель вероятности эмиссии
};
// Константы для настроек атома мышьяка
export const ARSENICUM_COLOR = 'green';
export const ARSENICUM_CHARGE = 1;
export const ARSENICUM_STARTING_CHARGE = 0;
export const MIN_TEMPERATURE_FOR_MOVEMENT = 1;
// Константы для генерации решетки
export const LATTICE_CONSTANTS = {
  DEFAULT_SPACING: 40,
  INITIAL_POSITION_OFFSET: 20,
  JUNCTION_X_POSITION: 400
};
// Константы для физики частиц
export const PHYSICS_CONSTANTS = {
  COLLISION_MULTIPLIER: 1.5,
  DRAG_COEFFICIENT: 0.01,
  VOLTAGE_FORCE_MULTIPLIER: 100,
  CURRENT_DIVIDER: 100,
  SPEED_DECAY: 0.99, // Коэффициент замедления скорости (трение)
  FONT_SIZE_RATIO: 30 // Отношение размера шрифта к радиусу частицы
};
// Константы для высокоэнергетических электронов
export const HIGH_ENERGY_CONSTANTS = {
  SPEED_THRESHOLD: 1500,
  CREATION_DISTANCE: 40,
  ENERGY_REDUCTION_FACTOR: 0.8
};
// Константы для генерации носителей заряда
export const CHARGE_CARRIER_CONSTANTS = {
  TEMPERATURE_FACTOR: 2,
  BASE_CHARGE_CARRIERS: 2,
  HALF_DIVISOR: 2,
  PERCENTAGE_DIVISOR: 100
};
// Константы для настроек атома кремния
export const SILICIUM_ELECTRON_COUNT = 2; // Количество электронов на внешней оболочке
export const SILICIUM_CHARGE = 0; // Начальный заряд атома
export const SILICIUM_COLOR = 'red'; // Цвет визуализации атома
// Константы для настроек атома индия
export const INDIUM_COLOR = 'purple';
export const INDIUM_CHARGE = 1;
export const INDIUM_STARTING_CHARGE = 0;
export const ACTIVATION_TEMPERATURE = 10;

;

