import Route from '@ember/routing/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel =  InfinityModel.extend({
  buildParams() {
    let params = this._super(...arguments);
    params['categoryId'] = this.global.categoryId;
    return params;
  },
  afterInfinityModel(newObjects/*, infinityModel*/) {
    // smoke test.  not really doing anything.  tested at unit level
    return newObjects;
  }
});

export default Route.extend({
  global: service(),
  infinity: service(),

  model() {
    let global = this.global;
    return this.infinity.model(
      'post',
      {},
      ExtendedInfinityModel.extend({ global })
    );
  }
});
