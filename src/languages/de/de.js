module.exports = {
  de: {
    Reschedule: 'Umplanen',
    Cancel: 'Abbrechen',
    Schedule: 'Zeitplan',
    'ORDER TYPE': 'ART DER BESTELLUNG',
    CUSTOMER: 'KUNDEN',
    STATUS: 'STATUS',
    'CREATED ON': 'ERSTELLT AM',
    'DUE DATE': 'FERTIGUNGSDATUM',
    TECHNICIAN: 'TECHNIKER',
    Unschedule: 'Abmeldung',
    Units: '1 {UnitVariable}',
    elevators: 'Aufzüge',
    meters: 'Zähler',
    'there are 3 {{units}}': 'es gibt 3 {{units}}',
    'there are 3 elevators': 'es sind 3 Meter',
    'there are 3 meters': 'es gibt 3 Aufzüge',
    'es gibt 3 Aufzüge': 'there are 3 units',
    '{{name}} does not exists': '{{name}} existiert nicht',
    'the emergency at {{address}} is assigned to {{name}} at {{time}}':
      'der Notfall unter {{address}} wird {{name}} um {{time}} zugewiesen',

    // LOGIN
    'Service Manager Portal': 'Service Manager Portal',
    'The unified Application made for Service Managers with smart job assignments, real-time overview of Units under Maintenance (UuM) and out-of-the-box ERP Integrations!':
      'Das Dashboard für Service Manager mit intelligenter Ressourcenzuteilung, Echtzeit-Übersicht des Anlagenportfolios und sofort einsatzbereite ERP-Integrationen!',
    Login: 'Anmelden',
    'Email address': 'E-Mail Adresse',
    Password: 'Passwort',
    'Forgot Password?': 'Passwort vergessen?',
    'Enter a valid email': 'Geben Sie eine gültige E-Mail ein',
    'Email is required': 'E-Mail ist erforderlich',
  },
};

// Dynamic data example
// Units: '1 {UnitVariable}',
// 'elevators': 'Aufzüge',
// 'meters': 'Zähler',
// 'there are 3 {{units}}': 'es gibt 3 {{units}}',
// 'there are 3 elevators': 'es sind 3 Meter',
// 'there are 3 meters': 'es gibt 3 Aufzüge',
// '{{name}} does not exists': '{{name}} existiert nicht',

// usage examples
// {t('{{name}} does not exists', {name: 'Dapeng'})}
//   {t('there are 3 {{units}}', {units: t('meters', {}) })} *
