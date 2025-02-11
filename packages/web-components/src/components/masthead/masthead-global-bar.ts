/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { classMap } from 'lit-html/directives/class-map.js';
import { html, property, LitElement } from 'lit-element';
import HostListener from '../../internal/vendor/@carbon/web-components/globals/decorators/host-listener.js';
import HostListenerMixin from '../../internal/vendor/@carbon/web-components/globals/mixins/host-listener.js';
import FocusMixin from '../../internal/vendor/@carbon/web-components/globals/mixins/focus.js';
import ddsSettings from '../../internal/vendor/@carbon/ibmdotcom-utilities/utilities/settings/settings';
import styles from './masthead.scss';
import StableSelectorMixin from '../../globals/mixins/stable-selector';
import { carbonElement as customElement } from '../../internal/vendor/@carbon/web-components/globals/decorators/carbon-element.js';

const { stablePrefix: ddsPrefix } = ddsSettings;

/**
 * The action bar in masthead.
 *
 * @element dds-masthead-global-bar
 */
@customElement(`${ddsPrefix}-masthead-global-bar`)
class DDSMastheadGlobalBar extends FocusMixin(
  HostListenerMixin(StableSelectorMixin(LitElement))
) {
  /**
   * Search bar opened flag.
   */
  @property({ attribute: 'has-search-active', type: Boolean, reflect: true })
  private _hasSearchActive = false;

  /**
   * Handles toggle event from the search component.
   *
   * @param event The event.
   */
  @HostListener('parentRoot:eventToggleSearch')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleSearchToggle = (event: Event) => {
    if ((event as CustomEvent).detail.active !== undefined) {
      this._hasSearchActive = (event as CustomEvent).detail.active;
    }
  };

  /**
   * The shadow slot this action bar should be in.
   */
  @property({ reflect: true })
  slot = 'profile';

  render() {
    const { _hasSearchActive: hasSearchActive } = this;
    const classes = classMap({
      [`${ddsPrefix}-ce--header__global__container`]: true,
      [`${ddsPrefix}-ce--header__global__container--has-search-active`]:
        hasSearchActive,
    });
    return html` <div class="${classes}"><slot></slot></div> `;
  }

  /**
   * The name of the custom event fired after the seach is toggled.
   */
  static get eventToggleSearch() {
    return `${ddsPrefix}-search-with-typeahead-toggled`;
  }

  static get stableSelector() {
    return `${ddsPrefix}--masthead-global-bar`;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

export default DDSMastheadGlobalBar;
