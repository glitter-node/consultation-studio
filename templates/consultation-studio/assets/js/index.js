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

  function createBasicComponent(tagName) {
    if (!React || typeof React.createElement !== 'function') {
      return function () {
        return null;
      };
    }

    if (typeof React.forwardRef === 'function') {
      return React.forwardRef(function (props, ref) {
        var elementProps = getElementProps(props);
        elementProps.ref = ref;
        return React.createElement(tagName, elementProps, getChildren(props));
      });
    }

    return function (props) {
      return React.createElement(tagName, getElementProps(props), getChildren(props));
    };
  }

  function renderButton(key, label, className, onClick, disabled) {
    return React.createElement('button', {
      key: key,
      type: 'button',
      className: className,
      disabled: !!disabled,
      onClick: onClick
    }, label);
  }

  function renderSection(props, children) {
    var elementProps = getElementProps(props);
    return React.createElement('section', elementProps, children);
  }

  var consultation_type_selector = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var selectedId = safeString(snapshot.local.selectedConsultationTypeId);
        elementProps.ref = ref;

        return renderSection(elementProps, [
          React.createElement('h2', { key: 'title', className: 'cs-block-title' }, 'Consultation Type'),
          React.createElement('div', { key: 'list', className: 'cs-card-list' }, snapshot.consultationTypes.map(function (item) {
            var itemId = safeString(item.id);
            return renderButton(
              'consultation-type-' + itemId,
              safeString(item.name),
              mergeClassName('cs-option-card', itemId === selectedId ? 'is-active' : ''),
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
          }))
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

        return renderSection(elementProps, [
          React.createElement('h2', { key: 'title', className: 'cs-block-title' }, 'Available Dates'),
          React.createElement('div', { key: 'list', className: 'cs-chip-list' }, snapshot.availableDates.map(function (item) {
            return renderButton(
              'date-' + item,
              item,
              mergeClassName('cs-chip', item === selectedDate ? 'is-active' : ''),
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
          }))
        ]);
      })
    : function () { return null; };

  var time_slot_grid = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var selectedSlotId = safeString(snapshot.local.selectedSlotId);
        elementProps.ref = ref;

        return renderSection(elementProps, [
          React.createElement('h2', { key: 'title', className: 'cs-block-title' }, 'Available Time Slots'),
          React.createElement('div', { key: 'list', className: 'cs-chip-list' }, snapshot.availableSlots.map(function (item) {
            var slotId = safeString(item);
            return renderButton(
              'slot-' + slotId,
              slotId,
              mergeClassName('cs-chip', slotId === selectedSlotId ? 'is-active' : ''),
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
          }))
        ]);
      })
    : function () { return null; };

  var reservation_summary = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var summary = snapshot.summary;
        elementProps.ref = ref;

        return React.createElement('aside', elementProps, [
          React.createElement('h2', { key: 'title', className: 'cs-block-title' }, 'Reservation Summary'),
          React.createElement('p', { key: 'type', className: 'cs-summary-line' }, 'Type: ' + safeString(summary.typeName)),
          React.createElement('p', { key: 'date', className: 'cs-summary-line' }, 'Date: ' + safeString(summary.date)),
          React.createElement('p', { key: 'slot', className: 'cs-summary-line' }, 'Time: ' + safeString(summary.slotLabel)),
          React.createElement('p', { key: 'email', className: 'cs-summary-line' }, 'Email: ' + safeString(summary.applicantEmail))
        ]);
      })
    : function () { return null; };

  var verification_status_box = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        elementProps.ref = ref;

        return renderSection(elementProps, [
          React.createElement('h2', { key: 'title', className: 'cs-block-title' }, 'Verification Status'),
          React.createElement('p', { key: 'state', className: 'cs-status-pill' }, safeString(snapshot.verification.state)),
          React.createElement('p', { key: 'email', className: 'cs-summary-line' }, 'Email: ' + safeString(snapshot.verification.email))
        ]);
      })
    : function () { return null; };

  var action_bar = typeof React.forwardRef === 'function'
    ? React.forwardRef(function (props, ref) {
        var snapshot = useRuntimeSnapshot();
        var elementProps = getElementProps(props);
        var email = safeString(safeObject(snapshot.local.applicant).email);
        elementProps.ref = ref;

        return React.createElement('footer', elementProps, React.createElement('div', { className: 'cs-inline-actions' }, [
          renderButton(
            'send-verification-email',
            'Send Verification Email',
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
        ]));
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
