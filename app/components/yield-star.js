import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const {
  A,
  Component
} = Ember;

export default Component.extend({
  init() {
    this._super();
  },

  log(logName, str) {
    this.get(logName).pushObject(str);
  },

  parentTask: task(function* () {
    this.set('childTaskLog', A([]));
    let log = (str) => this.get('childTaskLog').pushObject(str);
    log('(parent) starting');
    yield timeout(50);
    log('(parent) starting child');
    yield this.get('childTask').perform(log, () => this.get('parentTask').cancelAll());
    log('(parent) child completed');
    yield timeout(50);
    log('(parent) continuing');
  }).drop(),

  yieldStarTask: task(function* () {
    this.set('yieldStarLog', A([]));
    let log = (str) => this.get('yieldStarLog').pushObject(str);
    log('(parent) starting');
    yield timeout(50);
    log('(parent) starting child');
    yield* childImpl(log, () => this.get('yieldStarTask').cancelAll());
    log('(parent) child completed');
    yield timeout(50);
    log('(parent) continuing');
  }).drop(),

  yieldTask: task(function* () {
    this.set('yieldLog', A([]));
    let log = (str) => this.get('yieldLog').pushObject(str);
    log('(parent) starting');
    yield timeout(50);
    log('(parent) starting child');
    yield childImpl(log, () => this.get('yieldTask').cancelAll());
    log('(parent) child completed');
    yield timeout(50);
    log('(parent) continuing');
  }).drop(),

  childTask: task(childImpl)
});

function* childImpl(log, cancel) {
  log('(child) running');
  yield timeout(5);
  log('(child) canceling parent');
  cancel();
  log('(child) canceled parent');
  yield timeout(5);
  log('(child) continuing');
}
