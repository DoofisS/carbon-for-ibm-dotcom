/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import settings from 'carbon-components/es/globals/js/settings';
import { html, property, LitElement } from 'lit-element';
import { carbonElement as customElement } from '../../globals/decorators/carbon-element';
import FocusMixin from '../../globals/mixins/focus';
import styles from './overflow-menu.scss';

const { prefix } = settings;

/**
 * Overflow menu item.
 *
 * @element bx-overflow-menu-item
 */
@customElement(`${prefix}-overflow-menu-item`)
class BXOverflowMenuItem extends FocusMixin(LitElement) {
  /**
   * `true` if the action is danger.
   */
  @property({ type: Boolean, reflect: true })
  danger = false;

  /**
   * `true` if the overflow menu item should be disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * The link href of the overflow menu item.
   */
  @property()
  href = '';

  createRenderRoot() {
    return this.attachShadow({
      mode: 'open',
      delegatesFocus:
        Number((/Safari\/(\d+)/.exec(navigator.userAgent) ?? ['', 0])[1]) <=
        537,
    });
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'menuitem');
    }
    super.connectedCallback();
  }

  render() {
    return this.href
      ? html`
          <a
            class="${prefix}--overflow-menu-options__btn"
            ?disabled=${this.disabled}
            href="${this.href}"
            tabindex="${this.disabled ? -1 : 0}"
            ><slot></slot
          ></a>
        `
      : html`
          <button
            class="${prefix}--overflow-menu-options__btn"
            ?disabled=${this.disabled}
            tabindex="${this.disabled ? -1 : 0}">
            <slot></slot>
          </button>
        `;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

export default BXOverflowMenuItem;
