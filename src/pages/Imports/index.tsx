import {useLayoutEffect} from 'react';
import {Box} from '@mui/system';
import useTheme from '@mui/material/styles/useTheme';
import {Divider, Grid, Typography} from '@mui/material';

import {InfoCard} from 'components/InfoCard';
import {NuvoImporter} from 'nuvo-react';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const ImportSettings = ({getCurrentPageTitle}: Props) => {
  const theme = useTheme();

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('Data Import Settings');
    }
  }, []);

  return (
    <InfoCard
      containerStyles={{minHeight: '31em'}}
      showHeaderBackground
      header={<Typography variant="subtitle1">Importing Items</Typography>}>
      <Box>
        <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
          <Grid item xs={12}>
            <Grid container flexDirection="row">
              <Grid item xs={4} textAlign="center">
                <Typography>Company</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'service_company',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'unternehmensname',
                        label: 'Unternehmensname',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'rechnungsadresse',
                        label: 'Rechnungsadresse',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'postanschrift',
                        label: 'Postanschrift',
                        columnType: 'string',
                      },
                      {
                        key: 'email',
                        label: 'E-Mail',
                        columnType: 'email',
                      },
                      {
                        key: 'telefon',
                        label: 'Telefon',
                        columnType: 'string',
                      },
                      {
                        key: 'website',
                        label: 'Website',
                        columnType: 'string',
                      },
                      {
                        key: 'geschaeftsfuehrer',
                        label: 'Geschäftsführer',
                        columnType: 'string',
                      },
                      {
                        key: 'amtsgericht',
                        label: 'Amtsgericht',
                        columnType: 'string',
                      },
                      {
                        key: 'handelsregisternummer',
                        label: 'Handelsregisternummer',
                        columnType: 'string',
                      },
                      {
                        key: 'bank',
                        label: 'Bank',
                        columnType: 'string',
                      },
                      {
                        key: 'kontonummer',
                        label: 'Kontonummer',
                        columnType: 'string',
                      },
                      {
                        key: 'iban',
                        label: 'IBAN',
                        columnType: 'string',
                      },
                      {
                        key: 'bic',
                        label: 'BIC',
                        columnType: 'string',
                      },
                      {
                        key: 'waehrung',
                        label: 'Währung',
                        columnType: 'currency_code',
                        allowCustomOptions: true,
                        isMultiSelect: false,
                      },
                      {
                        key: 'mehrwertsteuer_in_',
                        label: 'Mehrwertsteuer (in %)',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'umsatzsteuernummer',
                        label: 'Umsatzsteuernummer',
                        columnType: 'string',
                      },
                      {
                        key: 'jaehrliche_urlaubstage_fuer_mitarbeiter',
                        label: 'Jährliche Urlaubstage für Mitarbeiter',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'sprache',
                        label: 'Sprache',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'English',
                            value: 'English',
                            type: 'string',
                          },
                          {
                            label: 'Deutsch',
                            value: 'Deutsch',
                            type: 'string',
                          },
                          {
                            label: 'Serbian',
                            value: 'Serbian',
                            type: 'string',
                          },
                          {
                            label: 'Russia',
                            value: 'Russia',
                            type: 'string',
                          },
                          {
                            label: 'Danish',
                            value: 'Danish',
                            type: 'string',
                          },
                          {
                            label: 'Italian',
                            value: 'Italian',
                            type: 'string',
                          },
                          {
                            label: 'Georgian',
                            value: 'Georgian',
                            type: 'string',
                          },
                        ],
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                        allowCustomOptions: true,
                        isMultiSelect: false,
                      },
                      {
                        key: 'datumsformat',
                        label: 'Datumsformat',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'dd.MM.yyyy',
                            value: 'dd.MM.yyyy',
                            type: 'string',
                          },
                          {
                            label: 'dd/MM/yyyy',
                            value: 'dd/MM/yyyy',
                            type: 'string',
                          },
                          {
                            label: 'yyyy-MM-dd',
                            value: 'yyyy-MM-dd',
                            type: 'string',
                          },
                        ],
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                        isMultiSelect: false,
                      },
                      {
                        key: 'zeitformat',
                        label: 'Zeitformat',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'HOUR_24',
                            value: 'HOUR_24',
                            type: 'string',
                          },
                          {
                            label: 'HOUR_12',
                            value: 'HOUR_12',
                            type: 'string',
                          },
                        ],
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                        isMultiSelect: false,
                      },
                      {
                        key: 'zeitzone',
                        label: 'Zeitzone',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'Europe/London',
                            value: 'Europe/London',
                            type: 'string',
                          },
                          {
                            label: 'Europe/Berlin',
                            value: 'Europe/Berlin',
                            type: 'string',
                          },
                          {
                            label: 'Europe/Dublin',
                            value: 'Europe/Dublin',
                            type: 'string',
                          },
                          {
                            label: 'Asia/Tbilisi',
                            value: 'Asia/Tbilisi',
                            type: 'string',
                          },
                        ],
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                        isMultiSelect: false,
                      },
                      {
                        key: 'sekundaere_adressen_zweigstellen_falls_vorhanden',
                        label:
                          'Sekundäre Adressen (Zweigstellen, falls vorhanden)',
                        columnType: 'string',
                      },
                      {
                        key: 'logo',
                        label: 'Logo',
                        columnType: 'string',
                      },
                      {
                        key: 'vertragsnamen_fuer_wartungsvertraege',
                        label: 'Vertragsnamen für Wartungsverträge',
                        columnType: 'string',
                      },
                      {
                        key: 'vertragsnamen_fuer_nichtwartungsvertraege',
                        label: 'Vertragsnamen für NICHT-Wartungsverträge',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Company File
                </NuvoImporter>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography>Employee</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'employee',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'mitarbeiternummer',
                        label: 'Mitarbeiternummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                      },
                      {
                        key: 'anrede',
                        label: 'Anrede',
                        columnType: 'string',
                      },
                      {
                        key: 'vorname',
                        label: 'Vorname',
                        columnType: 'string',
                      },
                      {
                        key: 'nachname',
                        label: 'Nachname',
                        columnType: 'string',
                      },
                      {
                        key: 'email',
                        label: 'E-Mail',
                        columnType: 'email',
                      },
                      {
                        key: 'telefon',
                        label: 'Telefon',
                        columnType: 'phone',
                      },
                      {
                        key: 'anschrift',
                        label: 'Anschrift',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'rolle_im_unternehmen',
                        label: 'Rolle im Unternehmen',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'SERVICE_MANAGER',
                            value: 'SERVICE_MANAGER',
                            type: 'string',
                          },
                          {
                            label: 'TECHNICIAN',
                            value: 'TECHNICIAN',
                            type: 'string',
                          },
                        ],
                        isMultiSelect: true,
                        allowCustomOptions: true,
                      },
                      {
                        key: 'vorgesetzer',
                        label: 'Vorgesetzer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                        ],
                      },
                      {
                        key: 'arbeitszeiten',
                        label: 'Arbeitszeiten',
                        columnType: 'string',
                      },
                      {
                        key: 'urlaubkrankheit',
                        label: 'Urlaub/Krankheit',
                        columnType: 'string',
                      },
                      {
                        key: 'team',
                        label: 'Team',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Employee File
                </NuvoImporter>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography>Customer</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'customer',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'kundennummer',
                        label: 'Kundennummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'kundename',
                        label: 'Kundename',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'email',
                        label: 'E-Mail',
                        columnType: 'email',
                      },
                      {
                        key: 'telefonnummer_des_kunden',
                        label: 'Telefonnummer des Kunden',
                        columnType: 'phone',
                      },
                      {
                        key: 'adressenzeile_1',
                        label: 'Adressenzeile 1',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'adressenzeile_2',
                        label: 'Adressenzeile 2',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'postleitzahl',
                        label: 'Postleitzahl',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'stadt',
                        label: 'Stadt',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'land',
                        label: 'Land',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'emailadresse_fuer_rechnungen',
                        label: 'Emailadresse für Rechnungen',
                        columnType: 'email',
                      },
                      {
                        key: 'prioritaet',
                        label: 'Priorität',
                        columnType: 'string',
                      },
                      {
                        key: 'kunde_seit_datum',
                        label: 'Kunde seit (Datum)',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'website_des_kunden',
                        label: 'Website des Kunden',
                        columnType: 'url',
                      },
                      {
                        key: 'kontaktperson',
                        label: 'Kontaktperson',
                        columnType: 'string',
                      },
                      {
                        key: 'telefonnummer_kontaktperson',
                        label: 'Telefonnummer Kontaktperson',
                        columnType: 'phone',
                      },
                      {
                        key: 'kostenstelle',
                        label: 'Kostenstelle',
                        columnType: 'string',
                      },
                      {
                        key: 'steuernummer',
                        label: 'Steuernummer',
                        columnType: 'string',
                      },
                      {
                        key: 'leistungsempfaenger',
                        label: 'Leistungsempfänger',
                        columnType: 'string',
                      },
                      {
                        key: 'ladresszeile_1',
                        label: 'L-Adresszeile 1',
                        columnType: 'string',
                      },
                      {
                        key: 'ladresszeile_2',
                        label: 'L-Adresszeile 2',
                        columnType: 'string',
                      },
                      {
                        key: 'lpostleitzahl',
                        label: 'L-Postleitzahl',
                        columnType: 'string',
                      },
                      {
                        key: 'lstadt',
                        label: 'L-Stadt',
                        columnType: 'string',
                      },
                      {
                        key: 'lland',
                        label: 'L-Land',
                        columnType: 'string',
                      },
                      {
                        key: 'rechnung_ueber',
                        label: 'Rechnung über',
                        columnType: 'string',
                      },
                      {
                        key: 'radresszeile_1',
                        label: 'R-Adresszeile 1',
                        columnType: 'string',
                      },
                      {
                        key: 'radresszeile_2',
                        label: 'R-Adresszeile 2',
                        columnType: 'string',
                      },
                      {
                        key: 'rpostleitzahl',
                        label: 'R-Postleitzahl',
                        columnType: 'string',
                      },
                      {
                        key: 'rstadt',
                        label: 'R-Stadt',
                        columnType: 'string',
                      },
                      {
                        key: 'rland',
                        label: 'R-Land',
                        columnType: 'string',
                      },
                      {
                        key: '2te__telefonnummer_des_kunden',
                        label: '2te. Telefonnummer des Kunden',
                        columnType: 'phone',
                      },
                      {
                        key: 'customer_notes',
                        label: 'Customer Notes',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Customer File
                </NuvoImporter>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider
          sx={{background: theme.palette.divider, mt: '1.5em'}}
          flexItem
        />
      </Box>
      <Divider sx={{background: theme.palette.divider, mt: '1.5em'}} flexItem />
      <Box>
        <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
          <Grid item xs={12}>
            <Grid container flexDirection="row">
              <Grid item xs={4} textAlign="center">
                <Typography>Contact Person</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'contact_person',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'anrede',
                        label: 'Anrede',
                        columnType: 'string',
                      },
                      {
                        key: 'vorname',
                        label: 'Vorname',
                        columnType: 'string',
                      },
                      {
                        key: 'nachname',
                        label: 'Nachname',
                        columnType: 'string',
                      },
                      {
                        key: 'rolle_der_kontaktperson',
                        label: 'Rolle der Kontaktperson',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'GENERAL_MANAGER',
                            value: 'GENERAL_MANAGER',
                            type: 'string',
                          },
                          {
                            label: 'ASSISTANCE',
                            value: 'ASSISTANCE',
                            type: 'string',
                          },
                          {
                            label: 'FACILITY_MANAGER',
                            value: 'FACILITY_MANAGER',
                            type: 'string',
                          },
                          {
                            label: 'PROPERTY_MANAGER',
                            value: 'PROPERTY_MANAGER',
                            type: 'string',
                          },
                          {
                            label: 'CONTACT_PERSON',
                            value: 'CONTACT_PERSON',
                            type: 'string',
                          },
                          {
                            label: 'ASSET_OWNER',
                            value: 'ASSET_OWNER',
                            type: 'string',
                          },
                          {
                            label: 'OTHER_CONTACT',
                            value: 'OTHER_CONTACT',
                            type: 'string',
                          },
                          {
                            label: 'OTHERS',
                            value: 'OTHERS',
                            type: 'string',
                          },
                        ],
                        isMultiSelect: false,
                      },
                      {
                        key: 'email',
                        label: 'E-Mail',
                        columnType: 'email',
                      },
                      {
                        key: 'telefon',
                        label: 'Telefon',
                        columnType: 'phone',
                      },
                      {
                        key: 'kundenummer',
                        label: 'Kundenummer',
                        columnType: 'string',
                      },
                      {
                        key: 'weitere_telefonnummer',
                        label: 'Weitere Telefonnummer',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Contact Person File
                </NuvoImporter>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography>Elevator</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'elevator',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'anlagennummer',
                        label: 'Anlagennummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'kundennummer',
                        label: 'Kundennummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'vertragsnummer',
                        label: 'Vertragsnummer',
                        columnType: 'string',
                      },
                      {
                        key: 'adressenzeile_1',
                        label: 'Adressenzeile 1',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'adressenzeile_2',
                        label: 'Adressenzeile 2',
                        columnType: 'string',
                      },
                      {
                        key: 'postleitzahl',
                        label: 'Postleitzahl',
                        columnType: 'string',
                      },
                      {
                        key: 'stadt',
                        label: 'Stadt',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'land',
                        label: 'Land',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'gebaeudestandort',
                        label: 'Gebäude/Standort',
                        columnType: 'string',
                      },
                      {
                        key: 'segment_der_immobilie',
                        label: 'Segment der Immobilie',
                        columnType: 'string',
                      },
                      {
                        key: 'schluesselstandort',
                        label: 'Schlüsselstandort',
                        columnType: 'string',
                      },
                      {
                        key: 'parkplatz',
                        label: 'Parkplatz',
                        columnType: 'string',
                      },
                      {
                        key: 'entfernung',
                        label: 'Entfernung',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'fahrtzeit',
                        label: 'Fahrtzeit',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'fahrtkosten',
                        label: 'Fahrtkosten',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'kategorie',
                        label: 'Kategorie',
                        columnType: 'string',
                      },
                      {
                        key: 'hersteller',
                        label: 'Hersteller',
                        columnType: 'string',
                      },
                      {
                        key: 'modell',
                        label: 'Modell',
                        columnType: 'string',
                      },
                      {
                        key: 'fabriknummer',
                        label: 'Fabriknummer',
                        columnType: 'string',
                      },
                      {
                        key: 'ausgabenlimit',
                        label: 'Ausgabenlimit',
                        columnType: 'string',
                      },
                      {
                        key: 'baujahr',
                        label: 'Baujahr',
                        columnType: 'date',
                        outputFormat: 'YYYY',
                      },
                      {
                        key: 'letzter_besuch',
                        label: 'Letzter Besuch',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'datum_der_letzten_züs_pruefung',
                        label: 'Datum der letzten ZÜS Prüfung',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'züs_zyklus',
                        label: 'ZÜS Zyklus',
                        columnType: 'string',
                      },
                      {
                        key: 'anzahl_der_techniker',
                        label: 'Anzahl der Techniker',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'prioritaet',
                        label: 'Priorität',
                        columnType: 'string',
                      },
                      {
                        key: 'dauer_der_wartung',
                        label: 'Dauer der Wartung',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'prioritaet_techniker',
                        label: 'Priorität Techniker',
                        columnType: 'string',
                      },
                      {
                        key: 'anzahl_der_haltestellenetagen',
                        label: 'Anzahl der Haltestellen/Etagen',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'antrieb',
                        label: 'Antrieb',
                        columnType: 'string',
                      },
                      {
                        key: 'kapazitaet',
                        label: 'Kapazität',
                        columnType: 'string',
                      },
                      {
                        key: 'geschwindigkeit',
                        label: 'Geschwindigkeit',
                        columnType: 'string',
                      },
                      {
                        key: 'steuerungsmodell',
                        label: 'Steuerungsmodell',
                        columnType: 'string',
                      },
                      {
                        key: 'iotgeraeteids',
                        label: 'IoT-Geräte-IDs',
                        columnType: 'string',
                      },
                      {
                        key: 'kabinentyp',
                        label: 'Kabinentyp',
                        columnType: 'string',
                      },
                      {
                        key: 'kabinengewicht',
                        label: 'Kabinengewicht',
                        columnType: 'string',
                      },
                      {
                        key: 'gegengewicht',
                        label: 'Gegengewicht',
                        columnType: 'string',
                      },
                      {
                        key: 'hubhoehe',
                        label: 'Hubhöhe',
                        columnType: 'string',
                      },
                      {
                        key: 'schachthoehe',
                        label: 'Schachthöhe',
                        columnType: 'string',
                      },
                      {
                        key: 'personenanzahl',
                        label: 'Personenanzahl',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'autodialer_hersteller',
                        label: 'Autodialer Hersteller',
                        columnType: 'string',
                      },
                      {
                        key: 'system_id',
                        label: 'System ID',
                        columnType: 'string',
                      },
                      {
                        key: 'telefonverbindung',
                        label: 'Telefonverbindung',
                        columnType: 'string',
                      },
                      {
                        key: 'telefonnnummer_des_aufzuges',
                        label: 'Telefonnnummer des Aufzuges',
                        columnType: 'phone',
                      },
                      {
                        key: 'simkartennummer',
                        label: 'Simkartennummer',
                        columnType: 'string',
                      },
                      {
                        key: 'simkarten_pin',
                        label: 'Simkarten Pin',
                        columnType: 'string',
                      },
                      {
                        key: 'callcenter',
                        label: 'Call-Center',
                        columnType: 'string',
                      },
                      {
                        key: 'installationsort',
                        label: 'Installationsort',
                        columnType: 'string',
                      },
                      {
                        key: 'offene_tage',
                        label: 'Offene Tage',
                        columnType: 'string',
                      },
                      {
                        key: 'öffnungszeiten',
                        label: 'Öffnungszeiten',
                        columnType: 'date',
                        outputFormat: 'HH:mm',
                      },
                      {
                        key: 'termin',
                        label: 'Termin',
                        columnType: 'category',
                        dropdownOptions: [
                          {
                            label: 'ja',
                            value: 'true',
                            type: 'string',
                          },
                          {
                            label: 'nein',
                            value: 'false',
                            type: 'string',
                          },
                        ],
                        allowCustomOptions: false,
                        isMultiSelect: false,
                      },
                      {
                        key: 'benachrichtigung_erforderlich',
                        label: 'Benachrichtigung erforderlich',
                        columnType: 'string',
                      },
                      {
                        key: 'benachrichtigung_faellig',
                        label: 'Benachrichtigung fällig',
                        columnType: 'string',
                      },
                      {
                        key: 'dokumentehandbuecherbilder',
                        label: 'Dokumente/Handbücher/Bilder',
                        columnType: 'string',
                      },
                      {
                        key: 'notizen_freier_text',
                        label: 'Notizen (Freier Text)',
                        columnType: 'string',
                      },
                      {
                        key: 'offene_todos',
                        label: 'Offene To-Dos',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Elevator File
                </NuvoImporter>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography>Contract</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'contract',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'vertragsname',
                        label: 'Vertragsname',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'vertragsnummer',
                        label: 'Vertragsnummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'vertragsposition',
                        label: 'Vertragsposition',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'kundennummer',
                        label: 'Kundennummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'anlagennummer',
                        label: 'Anlagennummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'startdatum',
                        label: 'Startdatum',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'enddatum',
                        label: 'Enddatum',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'preis_pro_rechnung',
                        label: 'Preis pro Rechnung',
                        columnType: 'currency_eur',
                      },
                      {
                        key: 'wartungen_pro_jahr',
                        label: 'Wartungen pro Jahr',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'erste_wartung',
                        label: 'Erste Wartung',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'erste_rechnung',
                        label: 'Erste Rechnung',
                        columnType: 'date',
                        outputFormat: 'YYYY-MM-DD',
                      },
                      {
                        key: 'rechnungen_pro_jahr',
                        label: 'Rechnungen pro Jahr',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'verlaengerungsperiode',
                        label: 'Verlängerungsperiode',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'kuendigungsfrist',
                        label: 'Kündigungsfrist',
                        columnType: 'int',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'beschreibung',
                        label: 'Beschreibung',
                        columnType: 'string',
                      },
                      {
                        key: 'jaehrliche_preisanpassungen',
                        label: 'Jährliche Preisanpassungen',
                        columnType: 'float',
                        numberFormat: 'eu',
                      },
                      {
                        key: 'sla_service_level_agreement',
                        label: 'SLA (Service Level Agreement)',
                        columnType: 'string',
                      },
                      {
                        key: 'pdf_des_vertrags',
                        label: 'PDF des Vertrags',
                        columnType: 'string',
                      },
                      {
                        key: 'group',
                        label: 'Group',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Contract File
                </NuvoImporter>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider
          sx={{background: theme.palette.divider, mt: '1.5em'}}
          flexItem
        />
      </Box>
      <Divider sx={{background: theme.palette.divider, mt: '1.5em'}} flexItem />
      <Box>
        <Grid container width="100%" mt="2.5em" mb="2em" gap={2}>
          <Grid item xs={12}>
            <Grid container flexDirection="row">
              <Grid item xs={4} textAlign="center">
                <Typography>Article</Typography>
                <NuvoImporter
                  licenseKey="C4Z6kzjAJFHbuUO5ut+KN5JAUocfZiYmVS9QMoo1TCk="
                  settings={{
                    developerMode: true,
                    identifier: 'article',
                    multipleFileUpload: true,
                    columns: [
                      {
                        key: 'artikelnummer_oder_nummer',
                        label: 'Artikelnummer oder Nummer',
                        columnType: 'string',
                        validations: [
                          {
                            validate: 'unique',
                          },
                          {
                            validate: 'required',
                          },
                        ],
                      },
                      {
                        key: 'bezeichnung',
                        label: 'Bezeichnung',
                        columnType: 'string',
                      },
                      {
                        key: 'kategorie',
                        label: 'Kategorie',
                        columnType: 'string',
                      },
                      {
                        key: 'subkategorie',
                        label: 'Subkategorie',
                        columnType: 'string',
                      },
                      {
                        key: 'hersteller',
                        label: 'Hersteller',
                        columnType: 'string',
                      },
                      {
                        key: 'modell',
                        label: 'Modell',
                        columnType: 'string',
                      },
                      {
                        key: 'beschreibung',
                        label: 'Beschreibung',
                        columnType: 'string',
                      },
                      {
                        key: 'mwst__einkauf',
                        label: 'MwSt. Einkauf',
                        columnType: 'currency_eur',
                      },
                      {
                        key: 'mwst__verkauf',
                        label: 'MwSt. Verkauf',
                        columnType: 'currency_eur',
                      },
                      {
                        key: 'einheit',
                        label: 'Einheit',
                        columnType: 'string',
                      },
                      {
                        key: 'einkaufspreis_ohne_mwst_',
                        label: 'Einkaufspreis (ohne MwSt.)',
                        columnType: 'currency_eur',
                      },
                      {
                        key: 'verkaufspreis_ohne_mwst_',
                        label: 'Verkaufspreis (ohne MwSt.)',
                        columnType: 'currency_eur',
                      },
                      {
                        key: 'hauptlieferanten',
                        label: 'Hauptlieferanten',
                        columnType: 'string',
                      },
                      {
                        key: 'lieferantenartikelnummer',
                        label: 'Lieferanten-Artikelnummer',
                        columnType: 'string',
                      },
                      {
                        key: '2__lieferanten',
                        label: '2. Lieferanten',
                        columnType: 'string',
                      },
                      {
                        key: '2__lieferantenartikelnummer',
                        label: '2. Lieferanten-Artikelnummer',
                        columnType: 'string',
                      },
                      {
                        key: '3__lieferanten',
                        label: '3. Lieferanten',
                        columnType: 'string',
                      },
                      {
                        key: '3__lieferantenartikelnummer',
                        label: '3. Lieferanten-Artikelnummer',
                        columnType: 'string',
                      },
                      {
                        key: 'andere_lieferanten_name_email_telefon_adresse_website',
                        label:
                          'Andere Lieferanten (Name, E-Mail, Telefon, Adresse, Website)',
                        columnType: 'string',
                      },
                      {
                        key: 'bildurl_oder_bilder',
                        label: 'Bild-URL oder Bilder',
                        columnType: 'string',
                      },
                      {
                        key: 'lagerort',
                        label: 'Lagerort',
                        columnType: 'string',
                      },
                      {
                        key: 'aktueller_bestand',
                        label: 'Aktueller Bestand',
                        columnType: 'string',
                      },
                      {
                        key: 'maximaler_bestand',
                        label: 'Maximaler Bestand',
                        columnType: 'string',
                      },
                      {
                        key: 'mindestbestand',
                        label: 'Mindestbestand',
                        columnType: 'string',
                      },
                      {
                        key: 'mindestbestellmenge',
                        label: 'Mindestbestellmenge',
                        columnType: 'string',
                      },
                      {
                        key: 'qrcode',
                        label: 'QR-Code',
                        columnType: 'string',
                      },
                      {
                        key: 'typ',
                        label: 'Typ',
                        columnType: 'string',
                      },
                      {
                        key: 'lieferanten_id',
                        label: 'Lieferanten ID',
                        columnType: 'string',
                      },
                      {
                        key: 'artikelartnr',
                        label: 'ARTIKELARTNR',
                        columnType: 'string',
                      },
                      {
                        key: 'warengruppe',
                        label: 'Warengruppe',
                        columnType: 'string',
                      },
                    ],
                  }}
                  onResults={(result, errors, complete) => {
                    console.log('Result:', result);
                    console.log('Error rows:', errors);
                    complete();
                  }}>
                  Select Article File
                </NuvoImporter>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider
          sx={{background: theme.palette.divider, mt: '1.5em'}}
          flexItem
        />
      </Box>
      <Divider sx={{background: theme.palette.divider, mt: '1.5em'}} flexItem />
    </InfoCard>
  );
};

export default ImportSettings;
