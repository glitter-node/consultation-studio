export const consultationStudioConfig = {
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
  },
  layout: {
    public: {
      baseLayout: '_base'
    },
    admin: {
      baseLayout: '_base'
    }
  },
  errorLayouts: {
    error404: 'error_404',
    error500: 'error_500'
  }
};

export function getConsultationStudioConfig() {
  return consultationStudioConfig;
}
