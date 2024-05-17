import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  infinity: service(),

  actions: {
    /**
      Use service to load more posts if you can't get at the route

      @method loadMorePosts
      @param {ArrayProxy} - posts - existing infinityModels
     */
    loadMorePosts(posts) {
      this.infinity.loadNextPage(posts);
    },
    /**
      Use service to load more posts if you can't get at the route

      @method loadMorePostsPrevious
      @param {ArrayProxy} - posts - existing infinityModels
     */
    loadMorePostsPrevious(posts, increment) {
      this.infinity.loadNextPage(posts, increment);
    },
    /**
      Use service to replace the current collection with a new collection

      @method filterPosts
      @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
     */
    filterPosts(posts) {
      let arr = posts.toArray();
      let splitPosts = arr.filter(x => x.get('name').includes('a'));
      this.infinity.replace(this.model, splitPosts);
    },
    /**
      Use service to replace the current collection with a new collection

      @method flushPosts
      @param {ArrayProxy} posts - example payload from this.store.query('post', { name: 'Allen' })
     */
    flushPosts(posts) {
      this.infinity.flush(posts);
    }
  }
});
