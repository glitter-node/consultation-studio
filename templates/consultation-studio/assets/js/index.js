(function (global) {
  var React = global.React;
  var consultationStudioConfig = {
    brand: {
      defaults: {
        logoText: 'Consultation Studio',
        brandColor: '#0f766e',
        contactText: 'Contact us at support@example.com',
        branchNotice: 'Branch availability may vary by operating calendar.',
        completionNotice: 'A confirmation email will be sent after verification is completed.'
      }
    },
    assets: {
      shared: {
        css: [
          'assets/css/theme.css'
        ],
        js: [
          'assets/js/index.js'
        ]
      },
      public: {
        css: [
          'assets/css/public.css'
        ]
      },
      admin: {
        css: [
          'assets/css/admin.css'
        ]
      }
    }
  };

  function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeString(value) {
    return value == null ? '' : String(value);
  }

  function safeNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function toIsoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function buildAvailableDates(service, today) {
    var source = safeObject(service);
    if (!Object.keys(source).length) {
      return [];
    }

    var baseDate = today instanceof Date ? today : new Date();
    var minBookingDays = Math.max(0, safeNumber(source.min_booking_days, 0));
    var maxBookingDays = Math.max(minBookingDays, safeNumber(source.max_booking_days, minBookingDays));
    var dates = [];

    for (var offset = minBookingDays; offset <= maxBookingDays; offset += 1) {
      var date = new Date(baseDate);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + offset);
      dates.push(toIsoDate(date));
    }

    return dates;
  }

  function extractApiPayload(value) {
    if (Array.isArray(value)) {
      return value;
    }

    var source = safeObject(value);

    if (Array.isArray(source.data)) {
      return source.data;
    }

    if (source.data && typeof source.data === 'object' && !Array.isArray(source.data)) {
      return source.data;
    }

    return source;
  }

  function readBrand() {
    var current = safeObject(global.G7Core && global.G7Core.state && typeof global.G7Core.state.getGlobal === 'function'
      ? global.G7Core.state.getGlobal()
      : {});

    return Object.assign({}, consultationStudioConfig.brand.defaults, safeObject(current.consultationStudioBrand));
  }

  function getDataSource(id) {
    if (!global.G7Core || !global.G7Core.state || typeof global.G7Core.state.getDataSource !== 'function') {
      return undefined;
    }

    return global.G7Core.state.getDataSource(id);
  }

  function dispatch(action) {
    if (!global.G7Core || typeof global.G7Core.dispatch !== 'function') {
      return Promise.resolve(null);
    }

    return global.G7Core.dispatch(action);
  }

  function readSnapshot() {
    var localState = global.G7Core && global.G7Core.state && typeof global.G7Core.state.getLocal === 'function'
      ? safeObject(global.G7Core.state.getLocal())
      : {};
    var reservationPayload = extractApiPayload(getDataSource('reservation'));
    var verificationPayload = safeObject(extractApiPayload(getDataSource('reservation_verification')));
    var slotsPayload = extractApiPayload(getDataSource('available_slots'));
    var consultationTypes = safeArray(reservationPayload).map(function (item) {
      return safeObject(item);
    });
    var selectedConsultationTypeId = localState.selectedConsultationTypeId;
    var selectedConsultationType = consultationTypes.find(function (item) {
      return String(item.id == null ? '' : item.id) === String(selectedConsultationTypeId == null ? '' : selectedConsultationTypeId);
    }) || consultationTypes[0] || {};
    var availableDates = buildAvailableDates(selectedConsultationType);
    var availableSlots = safeArray(slotsPayload.slots || slotsPayload);
    var verificationState = verificationPayload.state !== undefined
      ? verificationPayload.state
      : verificationPayload.verified;

    return {
      local: localState,
      consultationTypes: consultationTypes,
      selectedConsultationType: safeObject(selectedConsultationType),
      availableDates: availableDates,
      availableSlots: availableSlots,
      verification: {
        state: verificationState === true ? 'verified' : (verificationState === false ? 'pending' : safeString(verificationState || 'pending')),
        email: safeString(verificationPayload.email)
      },
      summary: {
        reservationNumber: safeString(localState.reservationNumber),
        typeName: safeString(selectedConsultationType.name),
        branchName: safeString(localState.selectedBranchName),
        date: safeString(localState.selectedDate),
        slotLabel: safeString(localState.selectedSlotId),
        applicantName: safeString(safeObject(localState.applicant).name),
        applicantPhone: safeString(safeObject(localState.applicant).phone),
        applicantEmail: safeString(safeObject(localState.applicant).email)
      }
    };
  }

  function useRuntimeSnapshot() {
    if (!React || typeof React.useState !== 'function' || typeof React.useEffect !== 'function') {
      return readSnapshot();
    }

    var statePair = React.useState(readSnapshot());
    var snapshot = statePair[0];
    var setSnapshot = statePair[1];

    React.useEffect(function () {
      if (!global.G7Core || !global.G7Core.state || typeof global.G7Core.state.subscribe !== 'function') {
        return function () {};
      }

      return global.G7Core.state.subscribe(function () {
        setSnapshot(readSnapshot());
      });
    }, []);

    return snapshot;
  }

  function getChildren(props) {
    if (!props) {
      return undefined;
    }

    if (props.children !== undefined) {
      return props.children;
    }

    if (props.text !== undefined) {
      return props.text;
    }

    return undefined;
  }

  function getElementProps(props) {
    var next = {};
    var source = props || {};

    for (var key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }

      if (key === 'children' || key === 'text') {
        continue;
      }

      next[key] = source[key];
    }

    return next;
  }

  function mergeClassName() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
  }

  function withRuntimeHooks(tagName, elementProps) {
    var next = elementProps || {};
    var id = safeString(next.id);
    var className = safeString(next.className);

    if (tagName === 'form' && (id === 'reservation_lookup_form' || className.indexOf('cs-form-grid') !== -1)) {
      className = mergeClassName(className, 'cs-runtime-lookup-form');
    }

    if (tagName === 'div' && id === 'completion_status') {
      className = mergeClassName(className, 'cs-runtime-completion-status', 'cs-focus-card');
    }

    if (tagName === 'div' && id === 'reservation_status_card') {
      className = mergeClassName(className, 'cs-runtime-lookup-status', 'cs-focus-card');
    }

    if (tagName === 'div' && id === 'completion_notice') {
      className = mergeClassName(className, 'cs-notice-card');
    }

    if (className) {
      next.className = className;
    }

    return next;
  }

  function createBasicComponent(tagName) {
    if (!React || typeof React.createElement !== 'function') {
      return function () {
        return null;
      };
    }

    if (typeof React.forwardRef === 'function') {
      return React.forwardRef(function (props, ref) {
        var elementProps = withRuntimeHooks(tagName, getElementProps(props));
        elementProps.ref = ref;
        return React.createElement(tagName, elementProps, getChildren(props));
      });
    }

    return function (props) {
      return React.createElement(tagName, withRuntimeHooks(tagName, getElementProps(props)), getChildren(props));
    };
  }

  function renderButton(key, label, className, onClick, disabled, extraProps) {
    var buttonProps = Object.assign({
      key: key,
      type: 'button',
      className: className,
      disabled: !!disabled,
      onClick: onClick
    }, extraProps || {});

    return React.createElement('button', buttonProps, label);
  }

  function renderSection(props, children) {
    var elementProps = getElementProps(props);
    return React.createElement('section', elementProps, children);
  }

  function renderBlockHeader(title, subtitle, eyebrow) {
    return React.createElement('header', { className: 'cs-runtime-block-header' }, [
      eyebrow ? React.createElement('p', { key: 'eyebrow', className: 'cs-step-label cs-runtime-eyebrow' }, eyebrow) : null,
      React.createElement('h2', { key: 'title', className: 'cs-block-title' }, title),
      subtitle ? React.createElement('p', { key: 'subtitle', className: 'cs-page-copy' }, subtitle) : null
    ]);
  }

  function renderSummaryRow(key, label, value) {
    return React.createElement('div', { key: key, className: 'cs-summary-line cs-runtime-summary-row' }, [
      React.createElement('span', { key: 'label', className: 'cs-runtime-summary-key' }, label),
      React.createElement('strong', { key: 'value', className: 'cs-runtime-summary-value' }, safeString(value) || '-')
    ]);
  }

  function renderEmptyState(key, message) {
    return React.createElement('p', { key: key, className: 'cs-page-copy cs-runtime-empty-state' }, message);
  }

  var consultation_type_selector = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var selectedId = safeString(snapshot.local.selectedConsultationTypeId);
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-block', 'cs-runtime-consultation-type-selector');

        return renderSection(elementProps, [
          renderBlockHeader('Consultation Type', 'Select the counseling track that matches the student inquiry.', 'Step 1'),
          React.createElement('div', { key: 'list', className: 'cs-card-list cs-runtime-option-list' }, snapshot.consultationTypes.length
            ? snapshot.consultationTypes.map(function (item) {
                var itemId = safeString(item.id);
                var duration = safeNumber(item.duration_minutes, 0);
                return renderButton(
                  'consultation-type-' + itemId,
                  React.createElement('div', { className: 'cs-runtime-option-card-inner' }, [
                    React.createElement('strong', { key: 'name', className: 'cs-option-title' }, safeString(item.name)),
                    React.createElement('span', { key: 'copy', className: 'cs-option-copy' }, duration > 0 ? duration + ' minute session' : 'Consultation service')
                  ]),
                  mergeClassName('cs-option-card', 'cs-runtime-option-card', itemId === selectedId ? 'cs-option-card-active' : ''),
                  function () {
                    dispatch({
                      handler: 'setState',
                      params: {
                        target: 'local',
                        selectedConsultationTypeId: item.id == null ? null : item.id,
                        selectedDate: '',
                        selectedSlotId: null
                      }
                    });
                  },
                  false
                );
              })
            : renderEmptyState('empty', 'No consultation service is currently available.'))
        ]);
      })
    : function () { return null; };

  var date_picker = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var selectedDate = safeString(snapshot.local.selectedDate);
        var selectedConsultationTypeId = safeString(snapshot.local.selectedConsultationTypeId);
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-block', 'cs-runtime-date-picker');

        return renderSection(elementProps, [
          renderBlockHeader('Preferred Date', 'Available dates are generated from the selected consultation service.', 'Step 2'),
          React.createElement('div', { key: 'list', className: 'cs-chip-list cs-runtime-date-list' }, snapshot.availableDates.length
            ? snapshot.availableDates.map(function (item) {
                return renderButton(
                  'date-' + item,
                  React.createElement('span', { className: 'cs-runtime-chip-label' }, item),
                  mergeClassName('cs-chip', 'cs-runtime-date-chip', item === selectedDate ? 'cs-chip-active' : ''),
                  function () {
                    dispatch({
                      handler: 'setState',
                      params: {
                        target: 'local',
                        selectedDate: item,
                        selectedSlotId: null
                      }
                    }).then(function () {
                      dispatch({
                        handler: 'refetchDataSource',
                        params: {
                          dataSourceId: 'available_slots',
                          sync: true
                        }
                      });
                    });
                  },
                  !selectedConsultationTypeId
                );
              })
            : renderEmptyState('empty', selectedConsultationTypeId ? 'No selectable date is available.' : 'Select a consultation type first.'))
        ]);
      })
    : function () { return null; };

  var time_slot_grid = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var selectedSlotId = safeString(snapshot.local.selectedSlotId);
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-block', 'cs-runtime-time-slot-grid');

        return renderSection(elementProps, [
          renderBlockHeader('Time Slot', 'Choose a confirmed session slot to complete the reservation request.', 'Step 3'),
          React.createElement('div', { key: 'list', className: 'cs-slot-grid cs-runtime-slot-grid' }, snapshot.availableSlots.length
            ? snapshot.availableSlots.map(function (item) {
                var slotId = safeString(item);
                return renderButton(
                  'slot-' + slotId,
                  React.createElement('span', { className: 'cs-runtime-slot-label' }, slotId),
                  mergeClassName('cs-slot-button', 'cs-runtime-slot-button', slotId === selectedSlotId ? 'cs-slot-button-selected' : 'cs-slot-button-available'),
                  function () {
                    dispatch({
                      handler: 'setState',
                      params: {
                        target: 'local',
                        selectedSlotId: slotId
                      }
                    });
                  },
                  false
                );
              })
            : renderEmptyState('empty', 'Select a date to load available time slots.'))
        ]);
      })
    : function () { return null; };

  var reservation_summary = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var summary = snapshot.summary;
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-summary-card');

        return React.createElement('aside', elementProps, [
          renderBlockHeader('Reservation Summary', 'Review the current reservation snapshot before verification.'),
          React.createElement('div', { key: 'rows', className: 'cs-runtime-summary-body' }, [
            renderSummaryRow('type', 'Consultation Type', summary.typeName),
            renderSummaryRow('date', 'Date', summary.date),
            renderSummaryRow('slot', 'Time Slot', summary.slotLabel),
            renderSummaryRow('name', 'Applicant', summary.applicantName),
            renderSummaryRow('phone', 'Phone', summary.applicantPhone),
            renderSummaryRow('email', 'Email', summary.applicantEmail)
          ])
        ]);
      })
    : function () { return null; };

  var verification_status_box = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var state = safeString(snapshot.verification.state || 'pending');
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-verification-card');

        return renderSection(elementProps, [
          renderBlockHeader('Verification Status', 'An active contact email is required before the reservation can proceed.'),
          React.createElement('div', { key: 'body', className: 'cs-runtime-verification-body' }, [
            React.createElement('p', {
              key: 'state',
              className: 'cs-status-pill cs-runtime-state-badge',
              'data-state': state
            }, state),
            renderSummaryRow('email', 'Verification Email', snapshot.verification.email)
          ])
        ]);
      })
    : function () { return null; };

  var action_bar = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var email = safeString(safeObject(snapshot.local.applicant).email);
        elementProps.ref = ref;
        elementProps.className = mergeClassName(elementProps.className, 'cs-runtime-action-bar');

        return React.createElement('footer', elementProps, [
          renderBlockHeader('Verification Action', 'Send the contact verification email after confirming the applicant details.'),
          React.createElement('div', { key: 'actions', className: 'cs-inline-actions cs-runtime-action-group' }, [
            renderButton(
              'send-verification-email',
              React.createElement('span', { className: 'cs-runtime-button-label' }, 'Send Verification Email'),
              'cs-primary-button',
              function () {
                dispatch({
                  handler: 'apiCall',
                  target: '/modules/glitter-reservation/reservation/email-verifications',
                  params: {
                    method: 'POST',
                    body: {
                      email: email
                    }
                  }
                });
              },
              !email
            )
          ])
        ]);
      })
    : function () { return null; };

  var runtime = {
    config: consultationStudioConfig,
    brand: readBrand(),
    assets: consultationStudioConfig.assets,
    Button: createBasicComponent('button'),
    Div: createBasicComponent('div'),
    Form: createBasicComponent('form'),
    H1: createBasicComponent('h1'),
    H2: createBasicComponent('h2'),
    H3: createBasicComponent('h3'),
    Input: createBasicComponent('input'),
    P: createBasicComponent('p'),
    Span: createBasicComponent('span'),
    Textarea: createBasicComponent('textarea'),
    consultation_type_selector: consultation_type_selector,
    date_picker: date_picker,
    time_slot_grid: time_slot_grid,
    reservation_summary: reservation_summary,
    verification_status_box: verification_status_box,
    action_bar: action_bar
  };

  global.ConsultationStudio = runtime;
  global.consultationStudio = runtime;
})(typeof window !== 'undefined' ? window : globalThis);

(function (global) {
  var STORAGE_KEY = 'g7_theme_mode';
  var DEFAULT_MODE = 'light';
  var MODES = { light: true, dim: true, dark: true };

  function normalizeTheme(value) {
    return MODES[value] ? value : DEFAULT_MODE;
  }

  function getSystemTheme() {
    if (!global.matchMedia) {
      return DEFAULT_MODE;
    }

    return global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : DEFAULT_MODE;
  }

  function getStoredTheme() {
    try {
      return global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
    } catch (error) {
      return null;
    }
  }

  function resolveTheme() {
    return normalizeTheme(getStoredTheme() || getSystemTheme());
  }

  function applyTheme(theme, persist) {
    var resolved = normalizeTheme(theme);

    if (global.document && global.document.documentElement) {
      global.document.documentElement.dataset.theme = resolved;
    }

    if (persist) {
      try {
        if (global.localStorage) {
          global.localStorage.setItem(STORAGE_KEY, resolved);
        }
      } catch (error) {
        /* noop */
      }
    }

    return resolved;
  }

  function initThemeMode() {
    var theme = applyTheme(resolveTheme(), false);

    if (global.matchMedia) {
      var darkMedia = global.matchMedia('(prefers-color-scheme: dark)');
      var listener = function () {
        if (!getStoredTheme()) {
          applyTheme(resolveTheme(), false);
        }
      };

      if (typeof darkMedia.addEventListener === 'function') {
        darkMedia.addEventListener('change', listener);
      } else if (typeof darkMedia.addListener === 'function') {
        darkMedia.addListener(listener);
      }
    }

    return theme;
  }

  global.ConsultationStudioTheme = {
    STORAGE_KEY: STORAGE_KEY,
    resolve: resolveTheme,
    apply: function (theme) { return applyTheme(theme, true); },
    init: initThemeMode
  };

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', initThemeMode, { once: true });
    } else {
      initThemeMode();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (global) {
  var themeApi = global.ThemeMode || global.ConsultationStudioTheme;
  var VALID_MODES = { light: true, dim: true, dark: true };

  if (!themeApi || !global.document) {
    return;
  }

  function normalizeTheme(mode) {
    return VALID_MODES[mode] ? mode : 'light';
  }

  function resolveTheme() {
    if (themeApi.resolveTheme) {
      return normalizeTheme(themeApi.resolveTheme());
    }

    if (themeApi.resolve) {
      return normalizeTheme(themeApi.resolve());
    }

    return normalizeTheme(global.document.documentElement.dataset.theme || 'light');
  }

  function applyTheme(mode) {
    var resolved = normalizeTheme(mode);

    if (themeApi.setTheme) {
      themeApi.setTheme(resolved);
      return resolved;
    }

    if (themeApi.apply) {
      themeApi.apply(resolved);
      return resolved;
    }

    global.document.documentElement.dataset.theme = resolved;
    return resolved;
  }

  function getNextTheme(mode) {
    if (mode === 'light') {
      return 'dim';
    }

    if (mode === 'dim') {
      return 'dark';
    }

    return 'light';
  }

  function toLabel(mode) {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  function getThemeModeButtons() {
    return Array.prototype.slice.call(
      global.document.querySelectorAll('[data-theme-mode], [data-theme-option], .cs-theme-nav-button')
    );
  }

  function syncThemeModeButtons(current) {
    getThemeModeButtons().forEach(function (button) {
      var mode = normalizeTheme(button.getAttribute('data-theme-mode') || button.getAttribute('data-theme-option') || 'light');
      var isActive = mode === current;
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('cs-nav-button-primary', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.setAttribute('data-theme-current', mode);
    });
  }

  function syncThemeToggleButton(current) {
    var button = global.document.querySelector('.cs-theme-toggle-button');
    var label = button ? button.querySelector('.cs-theme-toggle-button__label') : null;
    var next = getNextTheme(current);

    if (!button || !label) {
      return;
    }

    label.textContent = toLabel(current);
    button.setAttribute('data-theme-current', current);
    button.setAttribute('aria-label', 'Current theme: ' + toLabel(current) + '. Click to switch theme.');
    button.setAttribute('title', 'Current theme: ' + toLabel(current));
    button.setAttribute('data-theme-next', next);
  }

  function syncThemeControls() {
    var current = resolveTheme();
    syncThemeToggleButton(current);
    syncThemeModeButtons(current);
  }

  function handleThemeControlClick(event) {
    var target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('.cs-theme-toggle-button, [data-theme-mode], [data-theme-option], .cs-theme-nav-button')
      : null;

    if (!target) {
      return;
    }

    if (target.classList.contains('cs-theme-toggle-button')) {
      applyTheme(getNextTheme(resolveTheme()));
      syncThemeControls();
      return;
    }

    var explicitMode = target.getAttribute('data-theme-mode') || target.getAttribute('data-theme-option');
    if (!explicitMode) {
      return;
    }

    applyTheme(explicitMode);
    syncThemeControls();
  }

  global.document.addEventListener('click', handleThemeControlClick);

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', function () {
      syncThemeControls();
    }, { once: true });
  } else {
    syncThemeControls();
  }
})(typeof window !== 'undefined' ? window : globalThis);