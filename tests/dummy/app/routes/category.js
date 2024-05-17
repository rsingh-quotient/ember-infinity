import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  infinity: service(),

  model(params) {
    return this.infinity.model('post', { category: params.category, perPage: 2 });
  }
});
