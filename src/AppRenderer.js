import React from 'react';
import './App.css';
import { Electron } from './components/Electron';
import { Atom } from './components/Atom';
import { probability } from './utils/helpers';
import { SimulationCanvas } from './SimulationCanvas';
import { PNJunction } from './components/PNJunction';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export class AppRenderer extends React.Component {
  renderPNJunctionIndicator() {
    const { voltage } = this.props;
    const leftSign = voltage >= 0 ? '+' : '-';
    const rightSign = voltage >= 0 ? '-' : '+';

    return (
      <div
        style={{
          position: 'absolute',
          left: '398px',
          top: '0',
          width: '4px',
          height: '100%',
          borderLeft: '2px dashed #e67e22',
          borderRight: '2px dashed #e67e22',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#e67e22',
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '2px 5px',
            borderRadius: '3px'
          }}
        >
          p-n переход
        </div>
      </div>
    );
  }

  renderControlPanel() {
    const { isRunning, speedMultiplier } = this.props;
    
    return (
      <div style={{ 
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '6px'
      }}>
        <h3 style={{ 
          marginTop: 0,
          marginBottom: '15px',
          color: '#444'
        }}>
          Параметры системы
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <button
            onClick={this.props.toggleSimulation}
            style={{
              padding: '8px 15px',
              backgroundColor: isRunning ? '#e74c3c' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            {isRunning ? 'Пауза' : 'Старт'}
          </button>
          
          <button
            onClick={this.props.resetSimulation}
            style={{
              padding: '8px 15px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            Перезагрузка
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1
          }}>
            <button
              onClick={this.props.decreaseSpeed}
              disabled={speedMultiplier <= 0.25}
              style={{
                padding: '8px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: speedMultiplier > 0.25 ? 'pointer' : 'not-allowed',
                opacity: speedMultiplier > 0.25 ? 1 : 0.6,
                fontWeight: 'bold',
                flex: 1
              }}
            >
              -
            </button>
            
            <div style={{
              padding: '8px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {speedMultiplier}x
            </div>
            
            <button
              onClick={this.props.increaseSpeed}
              disabled={speedMultiplier >= 8}
              style={{
                padding: '8px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: speedMultiplier < 8 ? 'pointer' : 'not-allowed',
                opacity: speedMultiplier < 8 ? 1 : 0.6,
                fontWeight: 'bold',
                flex: 1
              }}
            >
              +
            </button>
          </div>
        </div>
        
        {this.renderSliders()}
      </div>
    );
  }

  renderSliders() {
    const { 
      acceptorPercent, 
      donorPercent, 
      temperature, 
      voltage,
      handleAcceptorChange,
      handleDonorChange,
      handleTemperatureChange,
      handleVoltageChange
    } = this.props;

    return (
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555'
          }}>
            Акцепторы (In): {acceptorPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={acceptorPercent}
            onChange={handleAcceptorChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555'
          }}>
            Доноры (As): {donorPercent}%
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={donorPercent}
            onChange={handleDonorChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555'
          }}>
            Температура: {temperature}°C
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={temperature}
            onChange={handleTemperatureChange}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555'
          }}>
            Напряжение: {voltage}В
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={voltage}
            onChange={handleVoltageChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  }

 renderCurrentGraph() {
  const { averagedMeasurements } = this.props;
  
  return (
    <div style={{ height: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={averagedMeasurements}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time"
            label={{ value: 'Время (мин)', position: 'insideBottomRight', offset: -5 }}
            tickFormatter={(time) => `${(time/60).toFixed(1)}`}
          />
          <YAxis
            label={{ value: 'Ток (А)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(current) => {
              // Убираем лишние нули после точки
              const formatted = current.toFixed(3);
              return formatted.replace(/\.?0+$/, '');
            }}
          />
          <Line 
            type="monotone"
            dataKey="current"
            stroke="#3498db"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
  renderSystemState() {
  const { simulationEngine } = this.props;
  
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      fontSize: '14px'
    }}>
      {/* Текущие значения */}
      <div>
        <h4 style={{ 
          margin: '0 0 10px',
          color: '#555',
          borderBottom: '1px solid #ddd',
          paddingBottom: '5px'
        }}>
          Текущие значения
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div>
            <div style={{ color: '#777' }}>Дырок в n-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.currentPositiveN.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Электронов в n-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.currentNegativeN.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Дырок в p-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.currentPositiveP.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Электронов в p-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.currentNegativeP.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Максимальные значения */}
      <div>
        <h4 style={{ 
          margin: '0 0 10px',
          color: '#555',
          borderBottom: '1px solid #ddd',
          paddingBottom: '5px'
        }}>
          Максимальные значения
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div>
            <div style={{ color: '#777' }}>Дырок в n-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.maxPositiveN.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Электронов в n-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.maxNegativeN.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Дырок в p-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.maxPositiveP.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ color: '#777' }}>Электронов в p-области:</div>
            <div style={{ fontWeight: 'bold' }}>
              {simulationEngine.maxNegativeP.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  renderLegend() {
    return (
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#e74c3c', 
            borderRadius: '50%', 
            marginRight: '8px' 
          }}></div>
          <span>Кремний (Si)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#9b59b6', 
            borderRadius: '50%', 
            marginRight: '8px' 
          }}></div>
          <span>Индий (In)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#2ecc71', 
            borderRadius: '50%', 
            marginRight: '8px' 
          }}></div>
          <span>Мышьяк (As)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#3498db', 
            borderRadius: '50%', 
            marginRight: '8px' 
          }}></div>
          <span>Электроны</span>
        </div>
      </div>
    );
  }

  render() {
    const { voltage, particles } = this.props;
    const leftSign = voltage >= 0 ? '+' : '-';
    const rightSign = voltage >= 0 ? '-' : '+';

    return (
      <div className="App" style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '20px' 
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          margin: '0 0 20px',
          color: '#333'
        }}>
          Модель p-n перехода
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Блок симуляции */}
          <div style={{ 
            flex: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '10px',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: leftSign === '+' ? '#e74c3c' : '#3498db',
                marginRight: '15px',
                width: '40px',
                textAlign: 'center'
              }}>
                {leftSign}
              </div>
              
              <div style={{ position: 'relative' }}>
                <SimulationCanvas particles={particles || []} />
                {this.renderPNJunctionIndicator()}
              </div>
              
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: rightSign === '+' ? '#e74c3c' : '#3498db',
                marginLeft: '15px',
                width: '40px',
                textAlign: 'center'
              }}>
                {rightSign}
              </div>
            </div>

            {this.renderControlPanel()}
          </div>

          {/* Блок графика и информации */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flex: 1
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                График тока
              </h3>
              {this.renderCurrentGraph()}
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                Состояние системы
              </h3>
              {this.renderSystemState()}
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                marginTop: 0,
                marginBottom: '15px',
                color: '#444'
              }}>
                Легенда
              </h3>
              {this.renderLegend()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}