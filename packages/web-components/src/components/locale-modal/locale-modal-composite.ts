/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, property, LitElement } from 'lit-element';
import ifNonNull from '../../internal/vendor/@carbon/web-components/globals/directives/if-non-null.js';
import LocaleAPI from '@carbon/ibmdotcom-services/es/services/Locale/Locale.js';
import ddsSettings from '../../internal/vendor/@carbon/ibmdotcom-utilities/utilities/settings/settings';
import altlangs from '../../internal/vendor/@carbon/ibmdotcom-utilities/utilities/altlangs/altlangs.js';
import HostListener from '../../internal/vendor/@carbon/web-components/globals/decorators/host-listener.js';
import HostListenerMixin from '../../internal/vendor/@carbon/web-components/globals/mixins/host-listener.js';
import HybridRenderMixin from '../../globals/mixins/hybrid-render';
import {
  Country,
  LocaleList,
} from '../../internal/vendor/@carbon/ibmdotcom-services-store/types/localeAPI.d';
import './locale-modal';
import DDSLocaleModal from './locale-modal';
import './regions';
import './region-item';
import './locale-search';
import './locale-item';
import styles from './locale-modal-composite.scss';
import { carbonElement as customElement } from '../../internal/vendor/@carbon/web-components/globals/decorators/carbon-element.js';

const { stablePrefix: ddsPrefix } = ddsSettings;

/**
 * Container component for locale modal.
 *
 * @element dds-locale-modal-composite
 */
@customElement(`${ddsPrefix}-locale-modal-composite`)
class DDSLocaleModalComposite extends HostListenerMixin(
  HybridRenderMixin(LitElement)
) {
  /**
   * @param countries A country list.
   * @returns Sorted version of the given country list.
   */
  private _sortCountries(countries: Country[]) {
    return countries.sort((lhs, rhs) =>
      this.collatorCountryName.compare(lhs.name, rhs.name)
    );
  }

  /**
   * The placeholder for `loadLocaleList()` Redux action that may be mixed in.
   *
   * @internal
   */
  _loadLocaleList?: (language?: string) => Promise<LocaleList>;

  /**
   * The placeholder for `setLanguage()` Redux action that may be mixed in.
   *
   * @internal
   */
  _setLanguage?: (language: string) => void;

  /**
   * The g11n collator to use for sorting contry names.
   */
  @property({ attribute: false })
  collatorCountryName = new Intl.Collator();

  /**
   * The language to show in the UI.
   */
  @property({ attribute: 'lang-display' })
  langDisplay?: string;

  /**
   * The language used for query.
   */
  @property()
  language?: string;

  /**
   * The locale list.
   */
  @property({ attribute: false })
  localeList?: LocaleList;

  /**
   * `true` to open the modal.
   */
  @property({ type: Boolean })
  open = false;

  /**
   * The region chosen by user.
   */
  @property()
  chosenRegion?: string;

  @HostListener(DDSLocaleModal.eventRegionUpdated)
  protected _handleRegionUpdatedEvent(event) {
    this.chosenRegion = event.detail.region || undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  async getLangDisplay() {
    const response = await LocaleAPI.getLangDisplay();
    return response;
  }

  firstUpdated() {
    const { language } = this;
    if (language) {
      this._setLanguage?.(language);
    }
    this._loadLocaleList?.(language);

    this.getLangDisplay().then((res) => {
      this.langDisplay = res;
    });
  }

  updated(changedProperties) {
    const { language } = this;
    if (changedProperties.has('language')) {
      if (language) {
        this._setLanguage?.(language);
        this._loadLocaleList?.(language).catch(() => {}); // The error is logged in the Redux store
      }
    }
  }

  renderLightDOM() {
    const { chosenRegion, langDisplay, localeList, open } = this;
    const { localeModal, regionList } = localeList ?? {};
    const {
      availabilityText,
      headerTitle,
      modalClose,
      searchClearText,
      searchLabel,
      searchPlaceholder,
      unavailabilityText,
    } = localeModal ?? {};
    const pageLangs: { [locale: string]: string } = altlangs();
    if (
      Object.keys(pageLangs).length === 0 &&
      (regionList?.length as number) > 0
    ) {
      const messages = [
        'Detected that `<link rel="alternate">` is likely missing.',
        'The locale search UI will yield to an empty result.',
      ];
      console.warn(messages.join(' ')); // eslint-disable-line no-console
    }
    const massagedCountryList = regionList?.reduce(
      (acc, { countryList, name: region }) => {
        this._sortCountries(countryList).forEach(
          ({ name: country, locale: localeItems }) => {
            localeItems.forEach(([locale, language]) => {
              const href = pageLangs[locale];
              if (href) {
                acc.push({
                  locale,
                  region,
                  country,
                  href,
                  language,
                });
              }
            });
          }
        );
        return acc;
      },
      [] as {
        href: string;
        locale: string;
        region: string;
        country: string;
        language: string;
      }[]
    );
    return html`
      <dds-locale-modal
        close-button-assistive-text="${ifNonNull(modalClose)}"
        header-title="${ifNonNull(headerTitle)}"
        lang-display="${ifNonNull(langDisplay)}"
        ?open="${open}">
        <dds-regions title="${ifNonNull(headerTitle)}">
          ${regionList?.map(({ countryList, name }) => {
            const isInvalid =
              countryList.length === 0 ||
              massagedCountryList?.find(({ region }) => region === name) ===
                undefined;
            return html`
              <dds-region-item
                ?invalid="${isInvalid}"
                name="${name}"></dds-region-item>
            `;
          })}
        </dds-regions>

        <dds-locale-search
          close-button-assistive-text="${ifNonNull(searchClearText)}"
          label-text="${ifNonNull(searchLabel)}"
          placeholder="${ifNonNull(searchPlaceholder)}"
          availability-label-text="${ifNonNull(availabilityText)}"
          unavailability-label-text="${ifNonNull(unavailabilityText)}">
          ${chosenRegion
            ? html`
                ${massagedCountryList
                  ?.filter(({ region }) => {
                    return region === chosenRegion;
                  })
                  .map(
                    ({ country, href, language, locale, region }) => html`
                      <dds-locale-item
                        country="${country}"
                        href="${href}"
                        language="${language}"
                        locale="${locale}"
                        region="${region}">
                      </dds-locale-item>
                    `
                  )}
              `
            : ``}
        </dds-locale-search>
      </dds-locale-modal>
    `;
  }

  render() {
    return html` <slot></slot> `;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

/* @__GENERATE_REACT_CUSTOM_ELEMENT_TYPE__ */
export default DDSLocaleModalComposite;
