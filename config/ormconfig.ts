export default {
    type: 'sqlite',
    database: ':memory:',
    entities: ['src/**/*.entity.ts'],
    synchronize: true,
  };