import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  customStore: service(),
  infinity: service(),

  model() {
    return this.infinity.model('custom-model', { store: this.customStore, storeFindMethod: 'findAll' });
  }
});
