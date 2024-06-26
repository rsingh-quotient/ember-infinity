import { alias } from '@ember/object/computed';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import InViewportMixin from 'ember-in-viewport';
import { run } from '@ember/runloop';
import {
  get,
  set,
  computed,
  observer,
  defineProperty
} from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

const InfinityLoaderComponent = Component.extend(InViewportMixin, {
  infinity: service(),

  classNames: ['infinity-loader'],
  classNameBindings: ['infinityModelContent.reachedInfinity', 'viewportEntered:in-viewport'],
  /**
   * @public
   * @property eventDebounce
   * @default 50
   */
  eventDebounce: 50,
  /**
   * @public
   * @property loadingText
   */
  loadingText: 'Loading Infinite Model...',
  /**
   * @public
   * @property loadedText
   */
  loadedText: 'Infinite Model Entirely Loaded.',
  /**
   * @public
   * @property hideOnInfinity
   * @default false
   */
  hideOnInfinity: false,
  /**
   * @public
   * @property developmentMode
   * @default false
   */
  developmentMode: false,
  /**
   * indicate to infinity-loader to load previous page
   *
   * @public
   * @property loadPrevious
   * @default false
   */
  loadPrevious: false,
  /**
   * set if have scrollable area
   *
   * @public
   * @property scrollable
   */
  scrollable: null,
  /**
   * offset from bottom of target and viewport
   *
   * @public
   * @property triggerOffset
   * @defaul 0
   */
  triggerOffset: 0,
  /**
   * https://emberjs.com/api/ember/3.0/classes/Component/properties/isVisible?anchor=isVisible
   *
   * @property isVisible
   */
  isVisible: true,

  willInsertElement() {
    if (this._isInfinityPromiseArray) {
      defineProperty(this, 'infinityModelContent', alias('infinityModel.promise'));
    } else {
      defineProperty(this, 'infinityModelContent', alias('infinityModel'));
    }
  },

  /**
   * setup ember-in-viewport properties
   *
   * @method didInsertElement
   */
  didInsertElement() {
    this._super(...arguments);

    let scrollableArea = this.scrollable;

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: this.triggerOffset,
        left: 0
      },
      scrollableArea,
    });
    let infinityModel = this.infinityModelContent;
    if (infinityModel) {
      set(infinityModel, '_scrollable', scrollableArea);
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this._cancelTimers();
  },

  _isInfinityPromiseArray: computed('infinityModel', function() {
    return this.infinityModel instanceof InfinityPromiseArray;
  }),

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didEnterViewport
   */
  didEnterViewport() {
    if (
      this.developmentMode ||
      typeof FastBoot !== 'undefined' ||
      this.isDestroying ||
      this.isDestroyed
    ) {
      return false;
    }

    if (this.loadPrevious) {
      return this._debounceScrolledToTop();
    }
    return this._debounceScrolledToBottom();
  },

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didExitViewport
   */
  didExitViewport() {
    this._cancelTimers();
  },

  /**
   * @method loadedStatusDidChange
   */
  loadedStatusDidChange: observer('infinityModelContent.reachedInfinity', 'hideOnInfinity', function () {
    if (get(this, 'infinityModelContent.reachedInfinity') && this.hideOnInfinity) {
      set(this, 'isVisible', false);
    }
  }),

  /**
   * only load previous page if route started on a page greater than 1 && currentPage is > 0
   *
   * @method _debounceScrolledToTop
   */
  _debounceScrolledToTop() {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    const infinityModelContent = this.infinityModelContent;

    function loadPreviousPage() {
      if (typeof(this.infinityLoad) === 'function') {
        // closure action
        return this.infinityLoad(infinityModelContent, -1);
      } else {
        this.infinity.infinityLoad(infinityModelContent, -1)
      }
    }

    if (get(infinityModelContent, 'firstPage') > 1 && get(infinityModelContent, 'currentPage') > 0) {
      this._debounceTimer = run.debounce(this, loadPreviousPage, this.eventDebounce);
    }
  },

  /**
   * @method _debounceScrolledToBottom
   */
  _debounceScrolledToBottom() {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    function loadMore() {
      // resolve to create thennable
      // type is <InfinityModel|Promise|null>
      let infinityModelContent = resolve(this.infinityModelContent);

      infinityModelContent.then((content) => {
        if (typeof(this.infinityLoad) === 'function') {
          // closure action (if you need to perform some other logic)
          return this.infinityLoad(content);
        } else {
          // service action
          this.infinity.infinityLoad(content, 1)
            .then(() => {
              if (get(content, '_canLoadMore')) {
                this._checkScrollableHeight();
              }
            });
        }
      });
    }
    this._debounceTimer = run.debounce(this, loadMore, this.eventDebounce);
  },

  /**
   * recursive function to fill page with records
   *
   * @method _checkScrollableHeight
   */
  _checkScrollableHeight() {
    if (this._viewportHeight() > this.element.offsetTop) {
      // load again
      this._debounceScrolledToBottom();
    }
  },

  _cancelTimers() {
    run.cancel(this._debounceTimer);
  },

  /**
    calculate the height of the viewport

    @private
    @method _viewportHeight
    @return Integer
   */
  _viewportHeight() {
    if (typeof FastBoot === 'undefined') {
      let isScrollable = !!this.scrollable;
      let viewportElem = isScrollable ? document.querySelector(this.scrollable) : window;
      return isScrollable ? viewportElem.clientHeight : viewportElem.innerHeight;
    }
  }
});

export default InfinityLoaderComponent;
