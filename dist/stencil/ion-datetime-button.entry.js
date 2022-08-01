import { r as registerInstance, h, i as Host, j as getElement } from './index-8ed2108e.js';
import { g as getIonMode } from './ionic-global-648149f1.js';
import { a as addEventListener, c as componentOnReady } from './helpers-299f42d1.js';
import { p as printIonWarning, a as printIonError } from './index-05b398c2.js';
import { c as createColorClasses } from './theme-7ef00c83.js';
import { p as parseDate, e as getToday, I as is24Hour, M as getLocalizedDateTime, F as getMonthAndYear, J as getLocalizedTime, N as getMonthDayAndYear } from './parse-1fa30eca.js';

const iosDatetimeButtonCss = ":host{display:flex;align-items:center;justify-content:center}:host button{border-radius:8px;padding-left:12px;padding-right:12px;padding-top:6px;padding-bottom:6px;margin-left:2px;margin-right:2px;margin-top:0px;margin-bottom:0px;position:relative;transition:150ms color ease-in-out;border:none;background:var(--ion-color-step-300, #edeef0);color:var(--ion-text-color, #000);font-family:inherit;font-size:inherit;cursor:pointer;appearance:none;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{padding-left:unset;padding-right:unset;-webkit-padding-start:12px;padding-inline-start:12px;-webkit-padding-end:12px;padding-inline-end:12px}}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.time-active) #time-button,:host(.date-active) #date-button{color:var(--ion-color-base)}:host(.datetime-button-disabled){pointer-events:none}:host(.datetime-button-disabled) button{opacity:0.4}";

const mdDatetimeButtonCss = ":host{display:flex;align-items:center;justify-content:center}:host button{border-radius:8px;padding-left:12px;padding-right:12px;padding-top:6px;padding-bottom:6px;margin-left:2px;margin-right:2px;margin-top:0px;margin-bottom:0px;position:relative;transition:150ms color ease-in-out;border:none;background:var(--ion-color-step-300, #edeef0);color:var(--ion-text-color, #000);font-family:inherit;font-size:inherit;cursor:pointer;appearance:none;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{padding-left:unset;padding-right:unset;-webkit-padding-start:12px;padding-inline-start:12px;-webkit-padding-end:12px;padding-inline-end:12px}}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.time-active) #time-button,:host(.date-active) #date-button{color:var(--ion-color-base)}:host(.datetime-button-disabled){pointer-events:none}:host(.datetime-button-disabled) button{opacity:0.4}";

const DatetimeButton = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.datetimeEl = null;
    this.overlayEl = null;
    this.datetimePresentation = 'date-time';
    this.datetimeActive = false;
    /**
     * The color to use from your application's color palette.
     * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
     * For more information on colors, see [theming](/docs/theming/basics).
     */
    this.color = 'primary';
    /**
     * If `true`, the user cannot interact with the button.
     */
    this.disabled = false;
    /**
     * Check the value property on the linked
     * ion-datetime and then format it according
     * to the locale specified on ion-datetime.
     */
    this.setDateTimeText = () => {
      const { datetimeEl, datetimePresentation } = this;
      if (!datetimeEl) {
        return;
      }
      const { value, locale, hourCycle, preferWheel, multiple } = datetimeEl;
      if (multiple) {
        printIonWarning(`Multi-date selection cannot be used with ion-datetime-button.

Please upvote https://github.com/ionic-team/ionic-framework/issues/25668 if you are interested in seeing this functionality added.
      `, this.el);
        return;
      }
      /**
       * Both ion-datetime and ion-datetime-button default
       * to today's date and time if no value is set.
       */
      const parsedDatetime = parseDate(value || getToday());
      const use24Hour = is24Hour(locale, hourCycle);
      // TODO(FW-1865) - Remove once FW-1831 is fixed.
      parsedDatetime.tzOffset = undefined;
      this.dateText = this.timeText = undefined;
      switch (datetimePresentation) {
        case 'date-time':
        case 'time-date':
          const dateText = getMonthDayAndYear(locale, parsedDatetime);
          const timeText = getLocalizedTime(locale, parsedDatetime, use24Hour);
          if (preferWheel) {
            this.dateText = `${dateText} ${timeText}`;
          }
          else {
            this.dateText = dateText;
            this.timeText = timeText;
          }
          break;
        case 'date':
          this.dateText = getMonthDayAndYear(locale, parsedDatetime);
          break;
        case 'time':
          this.timeText = getLocalizedTime(locale, parsedDatetime, use24Hour);
          break;
        case 'month-year':
          this.dateText = getMonthAndYear(locale, parsedDatetime);
          break;
        case 'month':
          this.dateText = getLocalizedDateTime(locale, parsedDatetime, { month: 'long' });
          break;
        case 'year':
          this.dateText = getLocalizedDateTime(locale, parsedDatetime, { year: 'numeric' });
          break;
      }
    };
    /**
     * Waits for the ion-datetime to re-render.
     * This is needed in order to correctly position
     * a popover relative to the trigger element.
     */
    this.waitForDatetimeChanges = async () => {
      const { datetimeEl } = this;
      if (!datetimeEl) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        addEventListener(datetimeEl, 'ionRender', resolve, { once: true });
      });
    };
    this.handleDateClick = async (ev) => {
      const { datetimeEl, datetimePresentation } = this;
      if (!datetimeEl) {
        return;
      }
      let needsPresentationChange = false;
      /**
       * When clicking the date button,
       * we need to make sure that only a date
       * picker is displayed. For presentation styles
       * that display content other than a date picker,
       * we need to update the presentation style.
       */
      switch (datetimePresentation) {
        case 'date-time':
        case 'time-date':
          const needsChange = datetimeEl.presentation !== 'date';
          /**
           * The date+time wheel picker
           * shows date and time together,
           * so do not adjust the presentation
           * in that case.
           */
          if (!datetimeEl.preferWheel && needsChange) {
            datetimeEl.presentation = 'date';
            needsPresentationChange = true;
          }
          break;
      }
      /**
       * Track which button was clicked
       * so that it can have the correct
       * activated styles applied when
       * the modal/popover containing
       * the datetime is opened.
       */
      this.selectedButton = 'date';
      this.presentOverlay(ev, needsPresentationChange, this.dateTargetEl);
    };
    this.handleTimeClick = (ev) => {
      const { datetimeEl, datetimePresentation } = this;
      if (!datetimeEl) {
        return;
      }
      let needsPresentationChange = false;
      /**
       * When clicking the time button,
       * we need to make sure that only a time
       * picker is displayed. For presentation styles
       * that display content other than a time picker,
       * we need to update the presentation style.
       */
      switch (datetimePresentation) {
        case 'date-time':
        case 'time-date':
          const needsChange = datetimeEl.presentation !== 'time';
          if (needsChange) {
            datetimeEl.presentation = 'time';
            needsPresentationChange = true;
          }
          break;
      }
      /**
       * Track which button was clicked
       * so that it can have the correct
       * activated styles applied when
       * the modal/popover containing
       * the datetime is opened.
       */
      this.selectedButton = 'time';
      this.presentOverlay(ev, needsPresentationChange, this.timeTargetEl);
    };
    /**
     * If the datetime is presented in an
     * overlay, the datetime and overlay
     * should be appropriately sized.
     * These classes provide default sizing values
     * that developers can customize.
     * The goal is to provide an overlay that is
     * reasonably sized with a datetime that
     * fills the entire container.
     */
    this.presentOverlay = async (ev, needsPresentationChange, triggerEl) => {
      const { overlayEl } = this;
      if (!overlayEl) {
        return;
      }
      if (overlayEl.tagName === 'ION-POPOVER') {
        /**
         * When the presentation on datetime changes,
         * we need to wait for the component to re-render
         * otherwise the computed width/height of the
         * popover content will be wrong, causing
         * the popover to not align with the trigger element.
         */
        if (needsPresentationChange) {
          await this.waitForDatetimeChanges();
        }
        /**
         * We pass the trigger button element
         * so that the popover aligns with the individual
         * button that was clicked, not the component container.
         */
        overlayEl.present(Object.assign(Object.assign({}, ev), { detail: {
            ionShadowTarget: triggerEl,
          } }));
      }
      else {
        overlayEl.present();
      }
    };
  }
  async componentWillLoad() {
    const { datetime } = this;
    if (!datetime) {
      printIonError('An ID associated with an ion-datetime instance is required for ion-datetime-button to function properly.', this.el);
      return;
    }
    const datetimeEl = (this.datetimeEl = document.getElementById(datetime));
    if (!datetimeEl) {
      printIonError(`No ion-datetime instance found for ID '${datetime}'.`, this.el);
      return;
    }
    /**
     * Since the datetime can be used in any context (overlays, accordion, etc)
     * we track when it is visible to determine when it is active.
     * This informs which button is highlighted as well as the
     * aria-expanded state.
     */
    const io = new IntersectionObserver((entries) => {
      const ev = entries[0];
      this.datetimeActive = ev.isIntersecting;
    }, {
      threshold: 0.01,
    });
    io.observe(datetimeEl);
    /**
     * Get a reference to any modal/popover
     * the datetime is being used in so we can
     * correctly size it when it is presented.
     */
    const overlayEl = (this.overlayEl = datetimeEl.closest('ion-modal, ion-popover'));
    /**
     * The .ion-datetime-button-overlay class contains
     * styles that allow any modal/popover to be
     * sized according to the dimensions of the datetime.
     * If developers want a smaller/larger overlay all they need
     * to do is change the width/height of the datetime.
     * Additionally, this lets us avoid having to set
     * explicit widths on each variant of datetime.
     */
    if (overlayEl) {
      overlayEl.classList.add('ion-datetime-button-overlay');
    }
    componentOnReady(datetimeEl, () => {
      const datetimePresentation = (this.datetimePresentation = datetimeEl.presentation || 'date-time');
      /**
       * Set the initial display
       * in the rendered buttons.
       *
       * From there, we need to listen
       * for ionChange to be emitted
       * from datetime so we know when
       * to re-render the displayed
       * text in the buttons.
       */
      this.setDateTimeText();
      addEventListener(datetimeEl, 'ionChange', this.setDateTimeText);
      /**
       * Configure the initial selected button
       * in the event that the datetime is displayed
       * without clicking one of the datetime buttons.
       * For example, a datetime could be expanded
       * in an accordion. In this case users only
       * need to click the accordion header to show
       * the datetime.
       */
      switch (datetimePresentation) {
        case 'date-time':
        case 'date':
        case 'month-year':
        case 'month':
        case 'year':
          this.selectedButton = 'date';
          break;
        case 'time-date':
        case 'time':
          this.selectedButton = 'time';
          break;
      }
    });
  }
  render() {
    const { color, dateText, timeText, selectedButton, datetimeActive, disabled } = this;
    const mode = getIonMode(this);
    return (h(Host, { class: createColorClasses(color, {
        [mode]: true,
        [`${selectedButton}-active`]: datetimeActive,
        ['datetime-button-disabled']: disabled,
      }) }, dateText && (h("button", { class: "ion-activatable", id: "date-button", "aria-expanded": datetimeActive ? 'true' : 'false', onClick: this.handleDateClick, disabled: disabled, part: "native", ref: (el) => (this.dateTargetEl = el) }, h("slot", { name: "date-target" }, dateText), mode === 'md' && h("ion-ripple-effect", null))), timeText && (h("button", { class: "ion-activatable", id: "time-button", "aria-expanded": datetimeActive ? 'true' : 'false', onClick: this.handleTimeClick, disabled: disabled, part: "native", ref: (el) => (this.timeTargetEl = el) }, h("slot", { name: "time-target" }, timeText), mode === 'md' && h("ion-ripple-effect", null)))));
  }
  get el() { return getElement(this); }
};
DatetimeButton.style = {
  ios: iosDatetimeButtonCss,
  md: mdDatetimeButtonCss
};

export { DatetimeButton as ion_datetime_button };
