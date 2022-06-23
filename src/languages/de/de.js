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

    // Reset password
    'Forgot Password': 'Passwort vergessen',
    "We'll send a password reset code to the below email address":
      '	Wir senden Ihnen einen Code zum Zurücksetzen des Passworts an die unten angegebene E-Mail-Adresse.',
    'Please enter the reset code we sent to your email address.':
      '	Bitte geben Sie den Code zum Zurücksetzen des Passworts ein, den wir an Ihre E-Mail-Adresse gesendet haben.',
    'Re-enter password': 'Passwort erneut eingeben',
    'Get reset code': 'Code zum Zurücksetzen erhalten',
    Back: 'Zurück',
    'PIN is required': 'PIN ist erforderlich',
    "Didn't receive the code?": 'Haben Sie den Code nicht erhalten?',
    Resend: 'Erneut senden',
    Next: 'Weiter',
    Go: 'Weiter',
    'Reset password': 'Passwort zurücksetzen',
    'Reset code is required': 'Code zum Zurücksetzen ist erforderlich',
    'Reset code must be at least 6 characters':
      'Der Code zum Zurücksetzen muss mindestens 6 Zeichen lang sein.',
    'Reset code must be at most 6 characters':
      'Der Code zum Zurücksetzen darf höchstens 6 Zeichen lang sein.',
    'This field is required': 'Dieses Feld ist erforderlich',
    'Set a new password': 'Ein neues Passwort festlegen',
    'Password should contain at least 6 characters':
      'Das Passwort muss mindestens 6 Zeichen enthalten',
    'Password should contain at least 1 number':
      'Das Passwort muss mindestens 1 Zahl enthalten',
    'Passwords must match': 'Passwörter müssen übereinstimmen',
    'Code sent successfully': 'Code erfolgreich gesendet',
    'User account not found': 'Benutzerkonto nicht gefunden',
    'Sorry, we failed to fulfill the request at this time. Please try again':
      'Es tut uns leid, wir konnten die Anfrage zu diesem Zeitpunkt nicht erfüllen. Bitte versuchen Sie es erneut.',
    'Password reset successfully': 'Passwort erfolgreich zurückgesetzt',
    'Invalid Code': 'Ungültiger Code',

    // Service Orders
    'Order types': 'Auftragsarten',
    'Clear all': 'Alle löschen',
    'Service Orders': 'Aufträge',
    'New Order': 'Neuer Auftrag',
    Ongoing: 'Läuft',
    All: 'Alle',
    NUMBER: 'NUMMER',
    ADDRESS: 'ADRESSE',
    'UNIT NUMBER': 'ANLAGENNUMMER',
    Unscheduled: 'Ungeplant',
    Completed: 'Abgeschlossen',
    Expired: 'Abgelaufen',
    Cancelled: 'Abgesagt',
    Repair: 'Reparatur',
    Emergency: 'Personeneinschluss',
    Callout: 'Störung',
    Pending: 'Ausstehend',
    Regular: 'Regulär',
    'Search order type, customer, address etc.':
      'Suche nach Auftragsart, Kunde, Adresse usw.',
    'Unassigned Orders': 'Nicht zugewiesene Aufträge',
    Today: 'Heute',
    Yesterday: 'Gestern',
    Tomorrow: 'Morgen',
    'Assign Technician': 'Techniker zuweisen',
    'Ready to schedule': 'Bereit zur Zuweisung',
    Scheduling: 'Terminplanung',
    Init: 'Begonnen',
    'Search Unassigned Orders': 'Suche nach nicht zugewiesenen Aufträgen',
    'Due in': 'Fällig in',
    'Show Unassigned Orders': 'Nicht zugewiesene Aufträge anzeigen',
    'Search technician': 'Techniker suchen',
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
