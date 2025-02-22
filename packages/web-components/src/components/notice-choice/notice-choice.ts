/**
 * @license
 *
 * Copyright IBM Corp. 2020, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { checkPreferencesv3, loadContent } from './services';
import { html, LitElement, property, TemplateResult } from 'lit-element';
import {
  emailRegExp,
  pwsValueMap,
  resetToWorldWideContent,
  supportedLanguages,
  specialCountryBasedText,
} from './utils';
import countrySettings from './country-settings';
import ddsSettings from '../../internal/vendor/@carbon/ibmdotcom-utilities/utilities/settings/settings';
import settings from 'carbon-components/es/globals/js/settings';
import StableSelectorMixin from '../../globals/mixins/stable-selector';
import styles from './notice-choice.scss';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { worldWideContent } from './world-wide-content';
import { carbonElement as customElement } from '../../internal/vendor/@carbon/web-components/globals/decorators/carbon-element';

const { stablePrefix: ddsPrefix } = ddsSettings;
const { prefix } = settings;

/**
 * Notice Choice
 *
 * @element dds-notice-choice
 * @fires dds-notice-choice-change
 * The custom event fired when default choice loaded or user change some preferences.
 * The field and value should be taken from the detail object and send it to MRS.
 */
@customElement(`dds-notice-choice`)
class NoticeChoice extends StableSelectorMixin(LitElement) {
  /**
   * properties for passed attributes.
   */
  @property({ type: String, reflect: true, attribute: 'question-choices' })
  questionchoices = '1';

  @property({ type: String, attribute: 'country' })
  country = 'US';

  @property({ type: String, attribute: 'state' })
  state = '';

  @property({ type: String, attribute: 'language' })
  language = 'en';

  @property({ type: String, attribute: 'terms-condition-link' })
  termsConditionLink = html``;

  @property({ type: String, attribute: 'bpid-legal-text' })
  bpidLegalText = html``;

  @property({ type: Boolean, attribute: 'enable-all-opt-in' })
  enableAllOptIn;

  @property({ attribute: 'default-values' })
  defaultValues = {};

  @property({ type: String, attribute: 'email' })
  email = '';

  @property({ type: Boolean, attribute: 'hide-error-message' })
  hideErrorMessage = false;

  @property({ type: Boolean, attribute: 'show-legal-notice' })
  showLegalNotice = true;

  @property({ type: Object, attribute: false })
  checkboxes = {};

  @property({ type: Object, attribute: false })
  ncData: any;

  @property({ type: Boolean, attribute: false })
  changed = false;

  @property({ type: String, attribute: false })
  fetchedPref = '';

  @property({ type: Object, attribute: false })
  optInContent = {};

  @property({ type: Boolean, attribute: false })
  preventFormSubmission = false;

  @property({ type: Object, attribute: false })
  isMandatoryCheckboxDisplayed = { countryCode: '', isDisplayed: false };

  /**
   * End properties for passed attributes.
   */

  /**
   * properties for local state state management.
   */
  @property({ type: html, attribute: false })
  preText = html``;

  @property({ type: html, attribute: false })
  defaultPreText = html``;

  @property({ type: Object, attribute: false })
  values = {
    EMAIL: false,
    PHONE: false,
    NC_HIDDEN_EMAIL: worldWideContent.cc_default_status,
    NC_HIDDEN_PHONE: worldWideContent.cc_default_status,
  };

  @property({ reflect: true })
  hiddenEmail = '';

  @property({ reflect: true })
  hiddenPhone = '';

  prepareCheckboxes() {
    if (this.ncData) {
      const OptInContent = this.ncData;
      this.preText = OptInContent.preText;
      this.defaultPreText = OptInContent.preText;
      const newCheckboxes = this._buildCheckboxes();
      this.checkboxes = newCheckboxes;
      this.performUpdate();
    }
  }
  defaultLoadContent() {
    loadContent(
      'en',
      (ncData) => {
        this.ncData = ncData;
        this.prepareCheckboxes();
        this.countryChanged();
      },
      (error) => {
        console.error('error loading content', error);
      }
    );
  }
  connectedCallback() {
    super.connectedCallback();
    const [language] = this.language.split(/[-_]/);

    let defaultLanguage = 'en';
    if (supportedLanguages(this.language)) {
      defaultLanguage = supportedLanguages(this.language);
    } else if (supportedLanguages(language)) {
      defaultLanguage = supportedLanguages(language);
    }

    loadContent(
      defaultLanguage,
      (ncData) => {
        this.ncData = ncData;
        this.prepareCheckboxes();
        this.countryChanged();
      },
      () => {
        this.defaultLoadContent();
      }
    );
  }
  setDefaultSelections() {
    if (!this.enableAllOptIn && this.checkboxes) {
      const newValues = { ...this.values };
      Object.keys(this.checkboxes).forEach((key) => {
        const option = this._getOptionByQuestion(key);
        newValues[key] = !!(
          option.checked === 'true' || option.checked === true
        );
        if (
          this.defaultValues &&
          Object.prototype.hasOwnProperty.call(this.defaultValues, key)
        ) {
          newValues[key] = this.defaultValues[key];
        }
        const hiddenFieldName = `NC_HIDDEN_${key}`;
        newValues[hiddenFieldName] = option[hiddenFieldName];

        this._onChange(hiddenFieldName, newValues[key] ? 'OPT_IN' : 'OPT_OUT');
      });
      if (JSON.stringify(this.values) !== JSON.stringify(newValues)) {
        this.values = newValues;
      }
    }
  }
  countryChangeAction() {
    const splitValue = this.language;
    if (splitValue == 'en') {
      this.preText = this.preTextTemplate();
    }
    this.preventFormSubmission = false;
    if (this.ncData?.mandatoryCheckbox[this.country?.toLocaleLowerCase()]) {
      const countyCode = this.country?.toLocaleLowerCase();
      const countryBasedText = specialCountryBasedText(countyCode);
      this._onChange(
        this.ncData?.mandatoryCheckbox[countyCode][countryBasedText].mrs_field,
        'countyBasedCheckedNo'
      );

      this.isMandatoryCheckboxDisplayed.countryCode = countyCode;
      this.isMandatoryCheckboxDisplayed.isDisplayed = true;

      this.preventFormSubmission = true;
      this._onChange('preventFormSubmission', 'formSubmissionNo');
    } else {
      this._onChange('preventFormSubmission', 'formSubmissionYes');
    }
    /**
     * @description if the user already interacted with the checkboxes,
     * skip country default selection.
     */
    if (!this.changed && !this.fetchedPref) {
      /**
       * @description
       * change checkbox checked option based on new country.
       */
      this.setDefaultSelections();
    }
  }
  countryChanged() {
    resetToWorldWideContent();
    this.countryChangeAction();
  }
  /**
   *
   * @param name name of the attribute
   * @param oldVal old value of the attribute
   * @param newVal new value of the attrbute
   */
  attributeChangedCallback(name, oldVal, newVal) {
    const hasValue = newVal !== null && oldVal !== null;
    super.attributeChangedCallback(name, oldVal, newVal);
    switch (name) {
      case 'question-choices': {
        // Reload checkbox options when questionchoices changed
        if (oldVal !== newVal) {
          this.prepareCheckboxes();
          this.setDefaultSelections();
        }
        break;
      }
      case 'language': {
        // load content when locale changed.
        const [language] = newVal.split(/[-_]/);

        let defaultLanguage = 'en';
        if (supportedLanguages(newVal)) {
          defaultLanguage = supportedLanguages(newVal);
        } else if (supportedLanguages(language)) {
          defaultLanguage = supportedLanguages(language);
        }

        if (hasValue && oldVal !== newVal) {
          loadContent(
            defaultLanguage,
            (ncData) => {
              this.ncData = ncData;
              this.prepareCheckboxes();
            },
            () => {
              this.defaultLoadContent();
            }
          );
        }
        break;
      }
      case 'country': {
        /**
         * load content when country value changed.
         */
        if (
          hasValue &&
          oldVal !== newVal &&
          countrySettings[newVal.toLocaleLowerCase()]
        ) {
          this.countryChanged();
        }
        break;
      }
      case 'enable-all-opt-in':
        this.setDefaultSelections();
        break;
      case 'email': {
        if (newVal) {
          if (newVal !== this.fetchedPref) {
            // Handle throttle using debounce approach.
            if (emailRegExp.test(newVal)) {
              setTimeout(() => {
                this.emailChanged(newVal);
              }, 1000);
            }
          }
        } else {
          if (this.fetchedPref) {
            this.fetchedPref = newVal;
          }
        }
        break;
      }
      case 'hide-error-message': {
        if (oldVal !== newVal) {
          this.hideErrorMessage = JSON.parse(newVal);
          this.countryBasedLegalNotice();
        }

        break;
      }
      case 'show-legal-notice': {
        this.showLegalNotice = JSON.parse(newVal);
        break;
      }
    }
  }

  private checkBoxChange($event: any) {
    const id = $event.target.id;

    const checked = $event.target.checked;
    const newValues = {
      ...this.values,
    };
    newValues[id] = !!checked;
    this.values = newValues;

    this.changed = true;
    const hiddenFieldName = `NC_HIDDEN_${id}`;
    const hiddenFieldStatus = checked ? 'PERMISSION' : 'SUPPRESSION';
    this.values[id] = {};
    this.values[id]['checkBoxStatus'] = hiddenFieldStatus;
    this._onChange(hiddenFieldName, hiddenFieldStatus);
    this._onChange(
      `${hiddenFieldName}_VALUE`,
      `NC_HIDDEN_${hiddenFieldStatus}`
    );
  }
  static get stableSelector() {
    return `${ddsPrefix}--notice-choice`;
  }
  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
  checkBoxLegalChange($event: any) {
    const legalCheckbox = $event.target;
    const isChecked = legalCheckbox.checked;
    const legalTextError = legalCheckbox.parentNode.querySelector('.nc-error');
    const countyBasedText = isChecked
      ? 'countyBasedCheckedYes'
      : 'countyBasedCheckedNo';

    if (legalTextError) {
      legalTextError.style.display = isChecked ? 'none' : '';
    }

    const countyCode = this.country?.toLocaleLowerCase();
    const countryBasedText = specialCountryBasedText(countyCode);

    legalCheckbox.value = isChecked ? 1 : 0;
    this.preventFormSubmission = !isChecked;
    const preventFormSubmissionValue = isChecked
      ? 'formSubmissionYes'
      : 'formSubmissionNo';
    this._onChange('preventFormSubmission', preventFormSubmissionValue);
    this._onChange(
      this.ncData?.mandatoryCheckbox[countyCode][countryBasedText].mrs_field,
      countyBasedText
    );
  }

  countryBasedLegalNotice() {
    const country = this.country.toLocaleLowerCase();
    const itemTemplates: Array<TemplateResult> = [];

    if (
      this.ncData?.mandatoryCheckbox &&
      this.ncData.mandatoryCheckbox[country]
    ) {
      const mandatoryCheckboxes: { [key: string]: any } =
        this.ncData.mandatoryCheckbox[country];

      for (const [key, mandatoryCheckbox] of Object.entries(
        mandatoryCheckboxes
      )) {
        const legalTextName = key.replace(/([A-Z]+)/g, '-$1').toLowerCase();
        let mandatoryCheckboxTemplate = html`
          <span>
            <div class="${prefix}--form-item bx--checkbox-wrapper">
              <p part=${legalTextName} class=${legalTextName}>
                <input
                  type="checkbox"
                  class="${prefix}--checkbox"
                  id="${mandatoryCheckbox.mrs_field}"
                  name="${mandatoryCheckbox.mrs_field}"
                  @change="${this.checkBoxLegalChange}" />
                <label
                  for="${mandatoryCheckbox.mrs_field}"
                  class="${prefix}--checkbox-label ${prefix}--nc__checkbox-${mandatoryCheckbox.mrs_field}"
                  ><span class="${prefix}--checkbox-label-text" dir="auto"
                    >${mandatoryCheckbox.text}
                  </span>
                </label>
                ${!this.hideErrorMessage && this.preventFormSubmission
                  ? html`<span
                      class="nc-error"
                      style="color:#da1e28;font-size:.75rem"
                      >${mandatoryCheckbox.error}</span
                    >`
                  : ''}
              </p>
            </div>
          </span>
        `;
        itemTemplates.push(mandatoryCheckboxTemplate);
      }
    }

    return itemTemplates;
  }

  checkBoxTemplate(checkbox, checked, hiddenBox) {
    this._onChange(`${hiddenBox.id}_VALUE`, `NC_HIDDEN_${hiddenBox.value}`);
    return html`<span>
      <div class="${prefix}--form-item bx--checkbox-wrapper">
        <input
          type="checkbox"
          class="${prefix}--checkbox"
          id="${checkbox.id}"
          name="${checkbox.id}"
          ?checked=${checked}
          @change="${this.checkBoxChange}" />
        <label
          for="${checkbox.id}"
          class="${prefix}--checkbox-label ${prefix}--nc__checkbox-${checkbox.id}"
          ><span class="${prefix}--checkbox-label-text" dir="auto"
            >${checkbox.labelText}
          </span>
        </label>
        <input
          type="hidden"
          id=${hiddenBox.id}
          name=${hiddenBox.id}
          value=${hiddenBox.value} />
      </div>
    </span>`;
  }
  preTextTemplate() {
    if (this.ncData) {
      const country = this.country?.toLocaleLowerCase();
      const ecmTranslateContent = this.ncData;
      let preText = ecmTranslateContent.preText;

      if (ecmTranslateContent.state[country]) {
        const state = this.state.toLocaleLowerCase() || '';
        if (
          country === 'us' &&
          (state === 'ca' || state === '' || typeof state === 'undefined')
        ) {
          preText = ecmTranslateContent.state[country]['ca'].preText;
        } else {
          preText = ecmTranslateContent.state[country][state]
            ? ecmTranslateContent.state[country][state].preText
            : ecmTranslateContent.preText;
        }
      }

      if (ecmTranslateContent.country[country]) {
        preText = ecmTranslateContent.country[country.toLowerCase()].preText;
      }

      return html`${unsafeHTML(preText)}`;
    } else {
      return html``;
    }
  }
  postTextTemplate() {
    if (this.ncData) {
      const OtherPreferences = this.ncData.trialPrivacyText;
      let postText = this.ncData.postText;

      if (postText) {
        postText = '<p part="ncPostText">' + postText + '</p>';
      }

      if (!this.termsConditionLink.strings && this.termsConditionLink) {
        let originalValue = OtherPreferences;
        const matchedValue = originalValue.match(/<tc>.*<\/tc>/g);
        if (matchedValue) {
          const anrTagHtml = matchedValue[0].replace(/<tc>|<\/tc>/g, '');
          const link = `<a href='${this.termsConditionLink}' target='_blank' class='ibm-tooltip' >${anrTagHtml}</a>`;
          const reg = new RegExp('<tc>' + anrTagHtml + '</tc>', 'g');

          postText =
            postText +
            originalValue
              .replace(reg, link)
              .replace(/<p>/g, '<p part="nc-trial-text" id="nc-trial-text">');
        }
      }
      if (postText !== '') {
        postText =
          "<div part='ncPostTextContainer' id='ncPostTextContainer'>" +
          postText +
          '</div>';
      }
      return html`${unsafeHTML(postText)}`;
    } else {
      return html``;
    }
  }
  getBpidLegalText() {
    if (this.bpidLegalText) {
      return html`<p>${this.bpidLegalText}</p>`;
    } else {
      return ``;
    }
  }
  render() {
    if (
      this.isMandatoryCheckboxDisplayed.isDisplayed &&
      this.country.toLocaleLowerCase() !==
        this.isMandatoryCheckboxDisplayed.countryCode
    ) {
      const countryBasedText = specialCountryBasedText(
        this.isMandatoryCheckboxDisplayed.countryCode
      );

      this._onChange(
        this.ncData?.mandatoryCheckbox[
          this.isMandatoryCheckboxDisplayed.countryCode
        ][countryBasedText].mrs_field,
        'countyBasedCheckedNo'
      );
    }
    return html`<section class="${prefix}--nc">
    <p part='ncHeading' id="ncHeading" class="${ddsPrefix}--nc__pre-text">${
      this.showLegalNotice ? this.countryBasedLegalNotice() : ''
    } ${this.preTextTemplate()} </p>
      <div part='${prefix}--checkbox-group' class="${prefix}--checkbox-group">
            ${
              Object.keys(this.checkboxes).length !== 0
                ? Object.keys(this.checkboxes).length > 0 &&
                  Object.keys(this.checkboxes).map((key) => {
                    const checked = this.values[key];
                    const checkbox = this.checkboxes[key];
                    const hiddenBox = {
                      id: 'NC_HIDDEN_' + key,
                      value: this.values[key]['checkBoxStatus']
                        ? this.values[key]['checkBoxStatus']
                        : this.values[key]
                        ? 'PERMISSION'
                        : 'UNCHANGED',
                    };
                    key === 'EMAIL' ? (this.hiddenEmail = hiddenBox.value) : '';
                    key === 'PHONE' ? (this.hiddenPhone = hiddenBox.value) : '';
                    return this.checkBoxTemplate(checkbox, checked, hiddenBox);
                  })
                : ''
            }

          </div>
          <div part='${prefix}--nc__post-text' class="${prefix}--nc__post-text"
          >${this.postTextTemplate()}</div>
          <input type='hidden' id="preventFormSubmission" name="preventFormSubmission" value=${
            this.preventFormSubmission
          } />
        </div>
        ${this.getBpidLegalText()}
    </section>`;
  }
  protected emailChanged(email) {
    if (this.changed === false) {
      checkPreferencesv3(email).then((response) => {
        const questionChoiceStatus =
          countrySettings[this.country.toLocaleLowerCase()];

        if (response === 'S' && questionChoiceStatus.email === 'opt-out') {
          this.values = {
            ...this.values,
            EMAIL: false,
            ...{ checkBoxStatus: 'UNCHANGED' },
          };
          this._onChange('NC_HIDDEN_EMAIL', null);
        } else {
          this.values = {
            ...this.values,
            EMAIL: questionChoiceStatus.email === 'opt-out' ? true : false,
            ...{
              checkBoxStatus:
                questionChoiceStatus.email === 'opt-out'
                  ? 'PERMISSION'
                  : 'UNCHANGED',
            },
          };
          this._onChange('NC_HIDDEN_EMAIL', null);
        }
      });
    }
  }
  protected _getOptionByQuestion = (question) => {
    const questionChoiceStatus = this.country
      ? countrySettings[this.country.toLocaleLowerCase()]
      : { email: 'opt-in', phone: 'opt-in' };

    let option;
    switch (question) {
      case 'EMAIL': {
        option = {
          id: '0',
          checked: questionChoiceStatus.email === 'opt-out' ? true : false,
          optionTextPost: this.ncData.email,
          NC_HIDDEN_EMAIL:
            questionChoiceStatus.email === 'opt-out' ? 'OPT_OUT' : 'OPT_IN',
        };
        break;
      }
      case 'PHONE': {
        option = {
          id: '1',
          checked: questionChoiceStatus.phone === 'opt-out' ? true : false,
          optionTextPost: this.ncData.telephone,
          NC_HIDDEN_PHONE:
            questionChoiceStatus.phone === 'opt-out' ? 'OPT_OUT' : 'OPT_IN',
        };
        break;
      }

      default: {
        option = {
          id: '0',
          checked: questionChoiceStatus.email === 'opt-out' ? true : false,
          optionTextPost: this.ncData.email,
          NC_HIDDEN_EMAIL:
            questionChoiceStatus.email === 'opt-out' ? 'OPT_OUT' : 'OPT_IN',
        };
        break;
      }
    }

    return option;
  };
  protected _buildCheckboxes() {
    const fieldElements: any = {};
    const fieldCollections = {
      EMAIL: {
        id: 'EMAIL',
        labelText: this._getOptionByQuestion('EMAIL').optionTextPost,
      },
      PHONE: {
        id: 'PHONE',
        labelText: this._getOptionByQuestion('PHONE').optionTextPost,
      },
    };
    if (this.questionchoices) {
      // by email
      if (this.questionchoices.indexOf('1') > -1) {
        fieldElements.EMAIL = fieldCollections.EMAIL;
      }
      // by Phone
      if (this.questionchoices.indexOf('2') > -1) {
        fieldElements.PHONE = fieldCollections.PHONE;
      }
    }
    return fieldElements;
  }

  _onChange(field: string, value: string | null) {
    const pwsFieldsMap = {
      NC_HIDDEN_EMAIL: 'permission_email',
      NC_HIDDEN_PHONE: 'permission_phone',
      preventFormSubmission: 'preventFormSubmission',
      Q_CHINA_PIPL: 'Q_CHINA_PIPL',
      NC_HIDDEN_EMAIL_VALUE: 'NC_HIDDEN_EMAIL',
      NC_HIDDEN_PHONE_VALUE: 'NC_HIDDEN_PHONE',
    };

    if (Object.prototype.hasOwnProperty.call(pwsFieldsMap, field)) {
      field = pwsFieldsMap[field];
    }

    const init = {
      bubbles: true,
      detail: {
        field,
        value: pwsValueMap(value),
      },
    };
    this.dispatchEvent(
      new CustomEvent(`${ddsPrefix}-notice-choice-change`, init)
    );
  }
}

export default NoticeChoice;
