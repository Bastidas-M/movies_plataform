module.exports = {
    moduleDirectories: ['node_modules', 'src'],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
      // Si usas alias como @/ o rutas personalizadas
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };
  