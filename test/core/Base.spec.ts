import { expect } from 'chai';
import { createTestContainer, cleanupTestContainer } from '../helpers/setup';
import Base from '../../src/core/Base';

describe('Base', () => {
  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const base = new Base();
      expect(base).to.be.an.instanceOf(Base);
      
      // For a base instance with no options, we can verify it has the expected behavior
      // Test with a custom property to ensure it doesn't exist yet
      expect(base.hasOwnProperty('testProperty')).to.be.false;
    });

    it('should initialize with provided options', () => {
      const options = { test: true, value: 42 };
      const base = new Base(options);
      expect(base.get('test')).to.be.true;
      expect(base.get('value')).to.equal(42);
    });
  });

  describe('Event Emitter', () => {
    it('should emit events', (done) => {
      const base = new Base();
      base.on('test', (data: string) => {
        expect(data).to.equal('test data');
        done();
      });
      base.emit('test', 'test data');
    });

    it('should handle multiple events', (done) => {
      const base = new Base();
      let count = 0;
      
      base.on('increment', () => {
        count++;
        if (count === 2) {
          done();
        }
      });

      base.emit('increment');
      base.emit('increment');
    });
  });
});
