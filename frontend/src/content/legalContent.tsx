import type { ReactNode } from "react";

export type LegalPage = "imprint" | "privacy";

export const legalContent: Record<LegalPage, ReactNode> = {
    imprint: (
        <>
            <h1>Impressum</h1>
            <p>Angaben gemäß § 5 DDG</p>
            <p>
                Razvan Matis / glamoraz
                <br />
                Stephanstr. 28
                <br />
                90478 Nürnberg
                <br />
                Deutschland
            </p>
            <h2>Kontakt</h2>
            <p>
                E-Mail: r.matis.rm@gmail.com
                <br />
                Telefon: +49172-9483597
            </p>
        </>
    ),
    privacy: (
        <>
            <h1>Datenschutzerklärung</h1>
            <p>
                <strong>Stand: 27. August 2026</strong>
            </p>

            <h2>1. Verantwortlicher</h2>
            <p>
                Verantwortlicher für die Verarbeitung personenbezogener Daten im Rahmen
                dieses Self-Check-in-Services ist:
            </p>
            <p>
                <strong>Razvan Matis</strong>
                <br />
                <strong>glamoraz</strong>
                <br />
                Stephanstr. 28
                <br />
                90478 Nürnberg
                <br />
                Deutschland
            </p>
            <p>
                E-Mail: <a href="mailto:r.matis.rm@gmail.com">r.matis.rm@gmail.com</a>
            </p>

            <h2>2. Allgemeines zur Datenverarbeitung</h2>
            <p>
                Diese Webseite dient der Durchführung des digitalen
                Self-Check-in-Prozesses für Gäste eines von mir betriebenen
                Gästezimmers innerhalb meiner Unterkunft.
            </p>
            <p>
                Bei der Nutzung des Self-Check-in-Services werden personenbezogene Daten
                verarbeitet, soweit dies für die Prüfung einer bestehenden Buchung,
                die Bereitstellung des Zugangs zur Unterkunft sowie die damit
                verbundene Kommunikation erforderlich ist.
            </p>
            <p>
                Die Verarbeitung erfolgt nach den Grundsätzen der Rechtmäßigkeit,
                Zweckbindung, Datenminimierung und Vertraulichkeit.
            </p>

            <h2>3. Welche personenbezogenen Daten werden verarbeitet?</h2>
            <p>
                Im Rahmen des Self-Check-in-Prozesses können folgende personenbezogene
                Daten verarbeitet werden:
            </p>
            <ul>
                <li>Vorname und Nachname oder alternativ die Telefonnummer,</li>
                <li>Anreisedatum,</li>
                <li>Abreisedatum,</li>
                <li>technische Verbindungsdaten, insbesondere die IP-Adresse,</li>
                <li>
                    technische Daten und Protokolldaten, die bei der Nutzung des Dienstes
                    entstehen können,
                </li>
                <li>
                    im Rahmen der späteren Bereitstellung des Zugangscodes der
                    Zugangscode selbst sowie ein aus Vor- und Nachnamen gebildetes
                    Kürzel und der Gültigkeitszeitraum des Zugangscodes.
                </li>
            </ul>
            <p>Die Eingabe erfolgt über zwei mögliche Prüfverfahren:</p>
            <ol>
                <li>
                    Prüfung anhand von Vorname und Nachname sowie An- und Abreisedatum
                    oder
                </li>
                <li>
                    Prüfung anhand der Telefonnummer sowie An- und Abreisedatum.
                </li>
            </ol>

            <h2>4. Zweck der Verarbeitung</h2>
            <p>
                Die erhobenen Daten werden ausschließlich für die Durchführung und
                Absicherung des Self-Check-in-Prozesses verarbeitet.
            </p>
            <p>Insbesondere werden die Angaben verwendet, um:</p>
            <ul>
                <li>
                    zu überprüfen, ob eine tatsächliche Buchung für die angegebenen
                    Daten besteht,
                </li>
                <li>
                    die vom Gast angegebenen Daten mit den vorhandenen Buchungsdaten
                    abzugleichen,
                </li>
                <li>
                    sicherzustellen, dass der Self-Check-in nur von einem tatsächlich
                    gebuchten Gast durchgeführt werden kann,
                </li>
                <li>
                    einen individuellen Zugangscode für die Unterkunft zu erstellen bzw.
                    zu verwalten,
                </li>
                <li>
                    den Zugangscode für den gebuchten Aufenthaltszeitraum zu
                    konfigurieren,
                </li>
                <li>dem Gast den erstellten Zugangscode per E-Mail mitzuteilen,</li>
                <li>
                    bei technischen Fehlern eine interne Fehlerbenachrichtigung zu
                    ermöglichen.
                </li>
            </ul>
            <p>
                Eine Verarbeitung zu Werbe-, Analyse- oder Profilbildungszwecken findet
                über diesen Self-Check-in-Service nicht statt.
            </p>

            <h2>5. Rechtsgrundlage</h2>
            <p>
                Die Verarbeitung der personenbezogenen Daten erfolgt grundsätzlich auf
                Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung für
                die Durchführung des mit dem Gast bestehenden Beherbergungsvertrags
                bzw. für die Durchführung vorvertraglicher Maßnahmen erforderlich
                ist.
            </p>
            <p>
                Soweit die Verarbeitung für die technische Absicherung, den sicheren
                Betrieb und die Fehleranalyse des Self-Check-in-Services erforderlich
                ist, kann die Verarbeitung zusätzlich auf Art. 6 Abs. 1 lit. f DSGVO
                beruhen. Das berechtigte Interesse liegt insbesondere in der sicheren,
                zuverlässigen und missbrauchsresistenten Bereitstellung des digitalen
                Check-in-Services.
            </p>

            <h2>6. Abgleich mit Buchungsdaten über Smoobu</h2>
            <p>
                Zur Überprüfung der angegebenen Daten ruft der Self-Check-in-Service
                über eine technische Schnittstelle (API) die offenen Buchungen aus dem
                von mir verwendeten Buchungsverwaltungssystem{" "}
                <strong>Smoobu</strong> ab.
            </p>
            <p>
                Dabei werden die vom Gast eingegebenen Daten nicht an Smoobu
                übermittelt.
            </p>
            <p>
                Stattdessen ruft der Self-Check-in-Service die für die Buchungsprüfung
                erforderlichen vorhandenen Buchungsdaten ab und führt den Abgleich
                innerhalb des Self-Check-in-Services durch.
            </p>
            <p>
                Hierbei werden insbesondere Vorname, Nachname, Telefonnummer sowie An-
                und Abreisedaten aus den vorhandenen Buchungsdaten verarbeitet, soweit
                diese für die Prüfung erforderlich sind.
            </p>
            <p>
                Anbieter des Dienstes ist:
                <br />
                <br />
                <strong>Smoobu GmbH</strong>
                <br />
                Pappelallee 78/79
                <br />
                10437 Berlin
                <br />
                Deutschland
            </p>
            <p>
                Smoobu stellt für die Verarbeitung personenbezogener Daten
                entsprechende Regelungen zur Auftragsverarbeitung nach Art. 28 DSGVO
                bereit.
            </p>

            <h2>7. Nuki und digitaler Zugangscode</h2>
            <p>
                Zur Bereitstellung des digitalen Zugangs zur Unterkunft wird die
                technische Infrastruktur von <strong>Nuki</strong> verwendet.
            </p>
            <p>
                Nach erfolgreicher Buchungsprüfung und Erstellung des Zugangscodes
                werden an Nuki die für die Verwaltung des digitalen Zugangscodes
                erforderlichen Daten übermittelt.
            </p>
            <p>Hierzu gehören insbesondere:</p>
            <ul>
                <li>der erzeugte sechsstellige Zugangscode,</li>
                <li>der Beginn und das Ende der Gültigkeit des Zugangscodes,</li>
                <li>
                    ein aus dem ersten Buchstaben des Vor- und Nachnamens gebildetes
                    Kürzel,
                </li>
                <li>
                    der für die technische Verwaltung des Zugangscodes erforderliche
                    Zeitraum.
                </li>
            </ul>
            <p>
                Der vollständige Vor- und Nachname des Gastes wird für die
                Bezeichnung des Nuki-Zugangscodes nicht übermittelt. Stattdessen wird
                eine Bezeichnung verwendet, die aus dem Aufenthaltszeitraum und den
                Initialen des Gastes besteht.
            </p>
            <p>
                Nuki kann die für den Betrieb von Nuki Web erforderlichen Daten auf
                seinen Servern synchronisieren bzw. zwischenspeichern. Die Verarbeitung
                durch Nuki richtet sich ergänzend nach den Datenschutzbestimmungen von
                Nuki.
            </p>

            <h2>8. Versand von E-Mails über Brevo</h2>
            <p>
                Für den Versand von E-Mails verwendet der Self-Check-in-Service den
                Dienst <strong>Brevo</strong>.
            </p>
            <p>
                Nach erfolgreicher Erstellung eines Zugangscodes kann an den Gast eine
                E-Mail mit seinem Namen, dem Aufenthaltszeitraum und dem für ihn
                erstellten Zugangscode versendet werden.
            </p>
            <p>
                Im Falle technischer Fehler können außerdem interne
                Fehlerbenachrichtigungen versendet werden. Diese können insbesondere
                den Namen des betroffenen Gastes, den Aufenthaltszeitraum, den
                Zugangscode sowie Informationen über den aufgetretenen Fehler
                enthalten.
            </p>
            <p>Hierfür werden die erforderlichen Daten an Brevo übermittelt.</p>
            <p>
                Anbieter ist:
                <br />
                <br />
                <strong>Brevo SAS</strong>
                <br />
                106 Boulevard Haussmann
                <br />
                75008 Paris
                <br />
                Frankreich
            </p>
            <p>
                Brevo stellt einen Vertrag zur Auftragsverarbeitung (Data Processing
                Agreement) für die Verarbeitung personenbezogener Daten bereit.
            </p>

            <h2>9. Hosting und Bereitstellung über Cloudflare</h2>
            <p>
                Die Webseite und der technische Self-Check-in-Service werden über
                Dienste von <strong>Cloudflare</strong> bereitgestellt.
            </p>
            <p>
                Dabei werden technisch erforderliche Daten verarbeitet, die bei der
                Kommunikation zwischen dem Endgerät des Nutzers und dem
                Self-Check-in-Service entstehen können. Hierzu können insbesondere
                IP-Adresse, Zeitstempel, technische Anfrageinformationen sowie Fehler-
                und Protokolldaten gehören.
            </p>
            <p>
                Für den Backend-Service werden Cloudflare Workers eingesetzt. Die
                statischen Bestandteile des Frontends sowie ein für den Check-in
                erforderliches PDF-Dokument werden über Cloudflare Workers Assets
                bereitgestellt.
            </p>
            <p>
                Cloudflare kann im Rahmen seiner technischen Dienste Netzwerk- und
                Metadaten, insbesondere IP-Adressen, verarbeiten und für einen
                begrenzten Zeitraum Protokolldaten speichern.
            </p>
            <p>
                Im Backend des Self-Check-in-Services ist die Protokollierung von
                Worker-Ausführungen aktiviert. Dabei können insbesondere technische
                Ausführungsdaten, Fehler und vom Anwendungscode erzeugte Protokolle
                verarbeitet werden.
            </p>
            <p>
                Der Self-Check-in-Service verfügt über keine eigene Datenbank und
                legt die vom Gast eingegebenen Check-in-Daten nicht dauerhaft in einer
                eigenen Datenbank ab.
            </p>
            <p>
                Anbieter der Cloudflare-Dienste ist:
                <br />
                <br />
                <strong>Cloudflare, Inc.</strong>
                <br />
                101 Townsend Street
                <br />
                San Francisco, CA 94107
                <br />
                USA
            </p>
            <p>
                Cloudflare stellt für seine Dienste Datenschutzvereinbarungen und
                geeignete Garantien für internationale Datenübermittlungen bereit.
            </p>

            <h2>10. Keine eigene dauerhafte Speicherung der Check-in-Eingaben</h2>
            <p>
                Der Self-Check-in-Service selbst verfügt über keine eigene Datenbank.
            </p>
            <p>
                Die vom Gast eingegebenen Daten werden nicht dauerhaft durch den
                Self-Check-in-Service gespeichert. Die Daten werden während der
                jeweiligen Verarbeitung verwendet, um die Buchung zu prüfen und den
                Check-in durchzuführen.
            </p>
            <p>
                Eine dauerhafte Speicherung der eingegebenen Check-in-Daten in einer
                eigenen Datenbank findet nicht statt.
            </p>
            <p>
                Davon unberührt bleiben Daten, die bei den eingesetzten technischen
                Dienstleistern im Rahmen deren eigener technischer Verarbeitung,
                Protokollierung oder Bereitstellung der jeweiligen Dienste verarbeitet
                oder gespeichert werden können. Hierzu zählen insbesondere
                Cloudflare, Smoobu, Nuki und Brevo.
            </p>

            <h2>11. Protokollierung und Fehlerbehandlung</h2>
            <p>
                Zur Gewährleistung eines sicheren und zuverlässigen Betriebs können
                technische Vorgänge und Fehler protokolliert werden.
            </p>
            <p>
                Die Anwendung verwendet hierfür unter anderem die von Cloudflare
                Workers bereitgestellte Protokollierungsfunktion.
            </p>
            <p>
                Darüber hinaus können bei technischen Fehlern interne
                Fehlerbenachrichtigungen per E-Mail versendet werden. Diese können
                personenbezogene Daten enthalten, soweit dies zur Identifikation und
                Behebung des jeweiligen Fehlers erforderlich ist.
            </p>
            <p>
                Die Protokollierung dient ausschließlich der technischen Überwachung,
                Fehleranalyse und Sicherstellung des ordnungsgemäßen Betriebs des
                Self-Check-in-Services.
            </p>

            <h2>12. Cookies und Tracking</h2>
            <p>
                Der Self-Check-in-Service verwendet keine Cookies zu Analyse-, Werbe-
                oder Trackingzwecken.
            </p>
            <p>
                Es werden insbesondere keine Dienste wie Google Analytics, Meta Pixel
                oder vergleichbare Tracking- und Analysewerkzeuge eingesetzt.
            </p>
            <p>
                Eine Erstellung von Nutzerprofilen zu Werbe- oder Analysezwecken findet
                nicht statt.
            </p>

            <h2>13. Empfänger personenbezogener Daten</h2>
            <p>
                Im Rahmen des Self-Check-in-Services können personenbezogene Daten an
                folgende technische Dienstleister übermittelt bzw. durch diese
                verarbeitet werden:
            </p>
            <ul>
                <li>
                    <strong>Cloudflare</strong> - Hosting, Cloudflare Workers, Workers
                    Assets und technische Protokollierung,
                </li>
                <li>
                    <strong>Smoobu</strong> - Bereitstellung der Buchungsdaten über die
                    Smoobu API,
                </li>
                <li>
                    <strong>Nuki</strong> - Verwaltung des digitalen Zugangscodes zur
                    Unterkunft,
                </li>
                <li>
                    <strong>Brevo</strong> - Versand von E-Mails.
                </li>
            </ul>
            <p>
                Die jeweiligen Dienstleister verarbeiten Daten nur im Rahmen der für
                die jeweiligen Dienste erforderlichen Zwecke und, soweit erforderlich,
                auf Grundlage entsprechender Vereinbarungen zur Auftragsverarbeitung.
            </p>

            <h2>14. Übermittlung in Drittländer</h2>
            <p>
                Bei der Nutzung einzelner technischer Dienste kann eine Verarbeitung
                personenbezogener Daten außerhalb der Europäischen Union bzw. des
                Europäischen Wirtschaftsraums nicht vollständig ausgeschlossen
                werden.
            </p>
            <p>Dies betrifft insbesondere Cloudflare, Inc. mit Sitz in den USA.</p>
            <p>
                Für entsprechende internationale Datenübermittlungen verwendet
                Cloudflare nach eigenen Angaben geeignete datenschutzrechtliche
                Übermittlungsmechanismen, insbesondere das EU-U.S. Data Privacy
                Framework sowie, soweit erforderlich, Standardvertragsklauseln und
                ergänzende Schutzmaßnahmen.
            </p>

            <h2>15. Dauer der Speicherung</h2>
            <p>
                Die vom Gast unmittelbar in den Self-Check-in-Service eingegebenen
                Daten werden durch meine eigene Anwendung nicht dauerhaft gespeichert.
            </p>
            <p>
                Die Daten werden nur so lange verarbeitet, wie dies für die
                Durchführung des jeweiligen Check-in-Vorgangs erforderlich ist.
            </p>
            <p>
                Darüber hinaus können bei den eingesetzten Dienstleistern technische
                Protokoll-, Kommunikations- oder Zugangsdaten entsprechend deren
                jeweiligen Speicher- und Löschfristen gespeichert werden.
            </p>
            <p>Gesetzliche Aufbewahrungspflichten bleiben unberührt.</p>

            <h2>16. Datensicherheit</h2>
            <p>
                Zum Schutz der personenbezogenen Daten werden angemessene technische und
                organisatorische Maßnahmen eingesetzt.
            </p>
            <p>
                Die Übertragung zwischen dem Endgerät des Nutzers und dem
                Self-Check-in-Service erfolgt über eine verschlüsselte
                HTTPS-Verbindung.
            </p>
            <p>
                Auch die Kommunikation des Self-Check-in-Services mit den angebundenen
                externen Diensten erfolgt über verschlüsselte Verbindungen.
            </p>
            <p>
                Zugangsdaten und API-Schlüssel für die angebundenen Dienste werden
                serverseitig und nicht im öffentlich ausgelieferten Frontend
                verwendet.
            </p>

            <h2>17. Rechte der betroffenen Personen</h2>
            <p>
                Betroffene Personen haben nach Maßgabe der gesetzlichen
                Voraussetzungen insbesondere folgende Rechte:
            </p>
            <ul>
                <li>Recht auf Auskunft gemäß Art. 15 DSGVO,</li>
                <li>Recht auf Berichtigung gemäß Art. 16 DSGVO,</li>
                <li>Recht auf Löschung gemäß Art. 17 DSGVO,</li>
                <li>
                    Recht auf Einschränkung der Verarbeitung gemäß Art. 18 DSGVO,
                </li>
                <li>
                    Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO,
                </li>
                <li>
                    Recht auf Widerspruch gegen die Verarbeitung gemäß Art. 21 DSGVO,
                    soweit die gesetzlichen Voraussetzungen hierfür vorliegen.
                </li>
            </ul>
            <p>Zur Ausübung dieser Rechte genügt eine formlose Mitteilung an:</p>
            <p>
                <strong>
                    <a href="mailto:r.matis.rm@gmail.com">r.matis.rm@gmail.com</a>
                </strong>
            </p>

            <h2>18. Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde</h2>
            <p>
                Betroffene Personen haben gemäß Art. 77 DSGVO das Recht, sich bei
                einer Datenschutzaufsichtsbehörde über die Verarbeitung ihrer
                personenbezogenen Daten zu beschweren.
            </p>
            <p>
                Zuständige Aufsichtsbehörde für den nicht-öffentlichen Bereich in
                Bayern ist insbesondere:
            </p>
            <p>
                <strong>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong>
                <br />
                Promenade 18
                <br />
                91522 Ansbach
                <br />
                Deutschland
            </p>
            <p>
                E-Mail:{" "}
                <a href="mailto:poststelle@lda.bayern.de">
                    poststelle@lda.bayern.de
                </a>
            </p>
            <p>
                Das Recht auf Beschwerde besteht unabhängig von anderen
                verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfen.
            </p>

            <h2>19. Änderungen dieser Datenschutzerklärung</h2>
            <p>
                Ich behalte mir vor, diese Datenschutzerklärung anzupassen, wenn sich
                der Self-Check-in-Service, die eingesetzten technischen Dienste oder die
                rechtlichen Anforderungen ändern.
            </p>
            <p>
                Es gilt jeweils die zum Zeitpunkt des Besuchs bzw. der Nutzung des
                Self-Check-in-Services veröffentlichte Datenschutzerklärung.
            </p>
        </>
    )
};