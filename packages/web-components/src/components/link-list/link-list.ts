/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { classMap } from 'lit-html/directives/class-map.js';
import { state, html, LitElement, property } from 'lit-element';
import settings from 'carbon-components/es/globals/js/settings.js';
import ddsSettings from '@carbon/ibmdotcom-utilities/es/utilities/settings/settings.js';
import StableSelectorMixin from '../../globals/mixins/stable-selector';
import { LINK_LIST_TYPE, LINK_LIST_ITEM_TYPE } from './defs';
import styles from './link-list.scss';
import DDSLinkListItem from './link-list-item';
import { carbonElement as customElement } from '../../internal/vendor/@carbon/web-components/globals/decorators/carbon-element';

const { prefix } = settings;
const { stablePrefix: ddsPrefix } = ddsSettings;

export enum END_TYPE_LAYOUT {
  /**
   * Default layout | 1 - 3 items
   */
  DEFAULT = 'default',

  /**
   * Two Columns - Split layout | 4 - 6 items
   */
  TWO_COLUMNS = 'two-columns',

  /**
   * Tree Columns Layout | 7 + items
   */
  THREE_COLUMNS = 'three-columns',
}

/**
 * Link list.
 *
 * @element dds-link-list
 * @slot heading - The heading content.
 */
@customElement(`${ddsPrefix}-link-list`)
class DDSLinkList extends StableSelectorMixin(LitElement) {
  /**
   * Defines the layout for the end layout - based on END_TYPE_LAYOUT
   */
  @state()
  private _endTypeLayout = END_TYPE_LAYOUT.DEFAULT;

  /**
   * Child items
   */
  @state()
  private _childItems: Element[] = [];

  /**
   * Handler for @slotChange, toggles the split layout class and set the children link-list-item to the same height
   *
   * @private
   */
  private _handleSlotChange(event: Event) {
    const { selectorItem } = this.constructor as typeof DDSLinkList;
    this._childItems = (event.target as HTMLSlotElement)
      .assignedNodes({ flatten: true })
      .filter(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node as Element)?.matches(selectorItem)
      ) as Element[];

    if (this._childItems.length > 3) {
      if (this._childItems.length < 7)
        this._endTypeLayout = END_TYPE_LAYOUT.TWO_COLUMNS;
      else this._endTypeLayout = END_TYPE_LAYOUT.THREE_COLUMNS;
    } else {
      this._endTypeLayout = END_TYPE_LAYOUT.DEFAULT;
    }
    if (this.type === LINK_LIST_TYPE.END) {
      this._childItems.forEach((elem) => {
        (elem as DDSLinkListItem).type = LINK_LIST_ITEM_TYPE.END;
      });
    }
  }

  /**
   * The link list type.
   * possible values are:
   * default - Vertically stacked card-like links;
   * vertical - Vertically stacked inline links;
   * horizontal - Horizontaly stacked inline links;
   * end - End of section variant - Inline links stacked up to three columns based on the quantity of links;
   */
  @property({ reflect: true })
  type = LINK_LIST_TYPE.DEFAULT;

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    const { type, _endTypeLayout: endTypeLayout } = this;
    const headingClasses = classMap({
      [`${ddsPrefix}-ce--link-list__heading__wrapper`]: true,
      [`${ddsPrefix}-ce--link-list__heading--split`]:
        type === LINK_LIST_TYPE.END &&
        endTypeLayout === END_TYPE_LAYOUT.TWO_COLUMNS,
    });
    const listTypeClasses =
      {
        [LINK_LIST_TYPE.HORIZONTAL]: `${prefix}--link-list__list--horizontal`,
        [LINK_LIST_TYPE.VERTICAL]: `${prefix}--link-list__list--vertical`,
        [LINK_LIST_TYPE.END]: `${ddsPrefix}-ce--link-list__list--end`,
      }[type] ?? `${prefix}--link-list__list--card`;
    const listClasses = classMap({
      [`${prefix}--link-list__list`]: true,
      [listTypeClasses]: true,
      [`${ddsPrefix}-ce--link-list__list--split`]:
        type === LINK_LIST_TYPE.END &&
        endTypeLayout === END_TYPE_LAYOUT.TWO_COLUMNS,
      [`${ddsPrefix}-ce--link-list__list--three-columns`]:
        type === LINK_LIST_TYPE.END &&
        endTypeLayout === END_TYPE_LAYOUT.THREE_COLUMNS,
    });
    return html`
      <div class="${headingClasses}"><slot name="heading"></slot></div>
      <ul name="list" class="${listClasses}">
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </ul>
    `;
  }

  updated() {
    if (this.type === LINK_LIST_TYPE.END) {
      this._childItems.forEach((elem) => {
        (elem as DDSLinkListItem).type = LINK_LIST_ITEM_TYPE.END;
      });
    }

    if (
      this.type === LINK_LIST_TYPE.HORIZONTAL ||
      this.type === LINK_LIST_TYPE.VERTICAL
    ) {
      this._childItems.forEach((elem) => {
        (elem as DDSLinkListItem).iconInline = true;
      });
    }
  }

  /**
   * A selector selecting the child items.
   */
  static get selectorItem() {
    return `${ddsPrefix}-link-list-item, ${ddsPrefix}-link-list-item-cta`;
  }

  static get stableSelector() {
    return `${ddsPrefix}--link-list`;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

/* @__GENERATE_REACT_CUSTOM_ELEMENT_TYPE__ */
export default DDSLinkList;
