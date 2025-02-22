/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import settings from 'carbon-components/es/globals/js/settings';
import { html, property, query, LitElement } from 'lit-element';
import Information16 from '@carbon/icons/lib/information/16';
import HostListener from '../../globals/decorators/host-listener';
import HostListenerMixin from '../../globals/mixins/host-listener';
import { find } from '../../globals/internal/collection-helpers';
import BXFloatingMenu from '../floating-menu/floating-menu';
import BXFloatingMenuTrigger from '../floating-menu/floating-menu-trigger';
import styles from './tooltip.scss';
import { carbonElement as customElement } from '../../globals/decorators/carbon-element';

const { prefix } = settings;

/**
 * Trigger button of tooltip.
 *
 * @element bx-tooltip
 */
@customElement(`${prefix}-tooltip`)
class BXTooltip
  extends HostListenerMixin(LitElement)
  implements BXFloatingMenuTrigger
{
  /**
   * The menu body.
   */
  private _menuBody: BXFloatingMenu | null = null;

  /**
   * The trigger button.
   */
  @query('#trigger')
  private _triggerNode!: HTMLElement;

  /**
   * Handles `click` event on this element.
   */
  @HostListener('click')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleClick = async () => {
    this.open = !this.open;
    const { open, updateComplete } = this;
    if (open) {
      await updateComplete;
      const { _menuBody: menuBody } = this;
      (
        menuBody?.shadowRoot?.querySelector(
          BXTooltip.selectorTooltipBody
        ) as HTMLElement
      )?.focus();
    }
  };

  /**
   * Handles `keydown` event on this element.
   */
  @HostListener('keydown')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleKeydown = async (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      this._handleClick();
    }
  };

  /**
   * `true` if the dropdown should be open.
   */
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * @returns The position of the trigger button in the viewport.
   */
  get triggerPosition() {
    const { _triggerNode: triggerNode } = this;
    if (!triggerNode) {
      throw new TypeError('Cannot find the trigger button.');
    }
    return triggerNode.getBoundingClientRect();
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
    if (!this.hasAttribute('tabindex')) {
      // TODO: Should we use a property?
      this.setAttribute('tabindex', '0');
    }
    if (!this.hasAttribute('aria-haspopup')) {
      this.setAttribute('aria-haspopup', 'true');
    }
    if (!this.hasAttribute('aria-expanded')) {
      this.setAttribute('aria-expanded', 'false');
    }
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    super.connectedCallback();
  }

  updated(changedProperties) {
    if (changedProperties.has('open')) {
      if (!this._menuBody) {
        this._menuBody = find(
          this.childNodes,
          (elem) => (elem.constructor as typeof BXFloatingMenu).FLOATING_MENU
        );
      }
      if (this._menuBody) {
        this._menuBody.open = this.open;
      }
      this.setAttribute('aria-expanded', String(Boolean(this.open)));
    }
  }

  render() {
    return html`
      ${Information16({ id: 'trigger' })}
      <slot></slot>
    `;
  }

  static get selectorTooltipBody() {
    return `.${prefix}--tooltip__content`;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

export default BXTooltip;
