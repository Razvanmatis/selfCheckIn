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
                <strong>Stand: 27. September 2026</strong>
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
                verarbeitet, soweit dies für die Prüfung einer bestehenden Buchung, die
                Bereitstellung des Zugangs zur Unterkunft, die Kommunikation mit dem Gast
                sowie den Betrieb und die technische Absicherung des Services erforderlich
                ist.
            </p>
            <p>
                Der Service ermöglicht neben dem webbasierten Self-Check-in auch die
                Kommunikation mit Gästen über WhatsApp. Dabei können insbesondere
                Zugangsinformationen sowie Antworten auf Fragen des Gastes automatisiert
                übermittelt werden.
            </p>
            <p>
                Die Verarbeitung erfolgt nach den Grundsätzen der Rechtmäßigkeit,
                Zweckbindung, Datenminimierung und Vertraulichkeit.
            </p>

            <h2>3. Welche personenbezogenen Daten werden verarbeitet?</h2>
            <p>
                Im Rahmen des Self-Check-in-Prozesses und der damit verbundenen
                Kommunikation können folgende personenbezogene Daten verarbeitet werden:
            </p>
            <ul>
                <li>Vorname und Nachname,</li>
                <li>Telefonnummer,</li>
                <li>Anreisedatum,</li>
                <li>Abreisedatum,</li>
                <li>
                    im Rahmen der WhatsApp-Kommunikation die für WhatsApp verwendete
                    Telefonnummer,
                </li>
                <li>
                    Inhalte der über WhatsApp gesendeten und empfangenen Textnachrichten,
                </li>
                <li>
                    Zeitpunkte bzw. Zeitstempel der WhatsApp-Nachrichten,
                </li>
                <li>technische Verbindungsdaten, insbesondere die IP-Adresse,</li>
                <li>
                    technische Daten und Protokolldaten, die bei der Nutzung des Dienstes
                    entstehen können,
                </li>
                <li>
                    der für den Gast erzeugte Zugangscode sowie dessen
                    Gültigkeitszeitraum,
                </li>
                <li>
                    eine für die technische Bezeichnung des Nuki-Zugangscodes verwendete
                    Kurzbezeichnung aus dem Aufenthaltszeitraum und den Initialen des
                    Gastes,
                </li>
                <li>
                    eine interne Buchungskennung des verwendeten
                    Buchungsverwaltungssystems,
                </li>
                <li>
                    technische Statusinformationen zum Versand von WhatsApp-Nachrichten.
                </li>
            </ul>

            <p>
                Die Eingabe für den webbasierten Self-Check-in erfolgt über zwei mögliche
                Prüfverfahren:
            </p>
            <ol>
                <li>
                    Prüfung anhand von Vorname und Nachname sowie An- und Abreisedatum
                    oder
                </li>
                <li>
                    Prüfung anhand der Telefonnummer sowie An- und Abreisedatum.
                </li>
            </ol>

            <p>
                Bei der Kommunikation über WhatsApp wird die Telefonnummer des
                WhatsApp-Nutzers zur Zuordnung der Kommunikation und zur Bereitstellung
                der angeforderten Informationen verarbeitet.
            </p>

            <h2>4. Zweck der Verarbeitung</h2>
            <p>
                Die erhobenen Daten werden ausschließlich für die Durchführung,
                Verwaltung und Absicherung des Self-Check-in-Prozesses sowie für die
                damit verbundene Kommunikation mit dem Gast verarbeitet.
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
                    einen individuellen Zugangscode für die Unterkunft zu erstellen
                    bzw. zu verwalten,
                </li>
                <li>
                    den Zugangscode für den gebuchten Aufenthaltszeitraum zu
                    konfigurieren,
                </li>
                <li>
                    dem Gast den erstellten Zugangscode per E-Mail und/oder WhatsApp
                    mitzuteilen,
                </li>
                <li>
                    Gästen über WhatsApp Antworten auf Fragen zur Unterkunft und zum
                    Aufenthalt bereitzustellen,
                </li>
                <li>
                    den bisherigen Gesprächskontext bei der automatisierten Beantwortung
                    von WhatsApp-Fragen zu berücksichtigen,
                </li>
                <li>
                    den Betrieb und die technische Sicherheit des Services
                    sicherzustellen,
                </li>
                <li>
                    technische Fehler zu erkennen und interne
                    Fehlerbenachrichtigungen zu ermöglichen.
                </li>
            </ul>
            <p>
                Eine Verarbeitung zu Werbe-, Marketing-, Analyse- oder
                Profilbildungszwecken findet über diesen Self-Check-in-Service nicht
                statt.
            </p>

            <h2>5. Rechtsgrundlage</h2>
            <p>
                Die Verarbeitung der personenbezogenen Daten erfolgt grundsätzlich auf
                Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung für
                die Durchführung des mit dem Gast bestehenden Beherbergungsvertrags
                bzw. für die Durchführung vorvertraglicher Maßnahmen erforderlich ist.
            </p>
            <p>
                Dies gilt insbesondere für die Prüfung der Buchung, die Bereitstellung
                des Zugangscodes sowie die hierfür erforderliche Kommunikation mit dem
                Gast.
            </p>
            <p>
                Soweit die Verarbeitung für die technische Absicherung, den sicheren
                Betrieb, die Fehleranalyse und die Verhinderung von Missbrauch des
                Self-Check-in-Services erforderlich ist, kann die Verarbeitung zusätzlich
                auf Art. 6 Abs. 1 lit. f DSGVO beruhen. Das berechtigte Interesse liegt
                insbesondere in der sicheren, zuverlässigen und missbrauchsresistenten
                Bereitstellung des digitalen Check-in-Services.
            </p>

            <h2>6. Abgleich mit Buchungsdaten über Smoobu</h2>
            <p>
                Zur Überprüfung der angegebenen Daten ruft der Self-Check-in-Service
                über eine technische Schnittstelle (API) die erforderlichen
                Buchungsdaten aus dem von mir verwendeten
                Buchungsverwaltungssystem <strong>Smoobu</strong> ab.
            </p>
            <p>
                Dabei werden die vom Gast eingegebenen Daten nicht zur Durchführung der
                Buchungsprüfung an Smoobu übermittelt.
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
                Die Buchungsdaten werden außerdem innerhalb des Self-Check-in-Services
                vorübergehend in einer technischen Datenbank gespeichert, um die
                Buchungsverwaltung und insbesondere die Zuordnung und Verarbeitung
                von Buchungen für den Self-Check-in und die damit verbundene
                Kommunikation zu ermöglichen.
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
                    eine aus dem Aufenthaltszeitraum und den Initialen des Gastes
                    gebildete Kurzbezeichnung,
                </li>
                <li>
                    der für die technische Verwaltung des Zugangscodes erforderliche
                    Zeitraum.
                </li>
            </ul>
            <p>
                Der vollständige Vor- und Nachname des Gastes wird für die Bezeichnung
                des Nuki-Zugangscodes nicht verwendet. Stattdessen wird eine
                Bezeichnung verwendet, die aus dem Aufenthaltszeitraum und den
                Initialen des Gastes besteht, beispielsweise
                <strong> 30.09-02.10,MB</strong>.
            </p>
            <p>
                Nuki weist darauf hin, dass bei der Nutzung von Nuki Web für die
                Verwaltung und Steuerung eines Nuki-Geräts erforderliche Daten mit
                Nuki-Servern synchronisiert und dort gespeichert bzw. zwischengespeichert
                werden können. Hierzu können unter anderem sicherheitsrelevante Daten
                und Daten zur Verwaltung des Geräts gehören. Die Verarbeitung durch Nuki
                richtet sich ergänzend nach den Datenschutzbestimmungen von Nuki.
            </p>

            <h2>8. Versand und Empfang von WhatsApp-Nachrichten</h2>
            <p>
                Für die Kommunikation mit Gästen verwendet der Self-Check-in-Service
                die <strong>WhatsApp Business Platform</strong>.
            </p>
            <p>
                Über WhatsApp können insbesondere folgende Informationen übermittelt
                werden:
            </p>
            <ul>
                <li>Informationen zum Self-Check-in,</li>
                <li>der individuell erzeugte Zugangscode,</li>
                <li>
                    Antworten auf Fragen des Gastes zur Unterkunft und zum Aufenthalt.
                </li>
            </ul>
            <p>
                Für die Zuordnung der Kommunikation wird die Telefonnummer des
                WhatsApp-Nutzers verarbeitet.
            </p>
            <p>
                Anbieter bzw. Vertragspartner für die WhatsApp Business Platform in der
                Europäischen Region ist <strong>WhatsApp Ireland Limited</strong>,
                handelnd innerhalb der Meta-Unternehmensgruppe.
            </p>
            <p>
                WhatsApp verarbeitet im Rahmen der Bereitstellung der Plattform
                insbesondere Telefonnummern, Nachrichteninhalte sowie technische
                Nutzungs-, Zustell- und Protokollinformationen. Darüber hinaus kann
                WhatsApp bzw. Meta Daten für eigene Zwecke im Zusammenhang mit dem
                Betrieb, der Sicherheit, der Integrität und dem Schutz der Plattform
                verarbeiten.
            </p>
            <p>
                Die Verarbeitung durch WhatsApp bzw. Meta richtet sich ergänzend nach
                den jeweils geltenden Datenschutzinformationen und Bedingungen von
                WhatsApp und Meta.
            </p>
            <p>
                Anbieter:
                <br />
                <br />
                <strong>WhatsApp Ireland Limited</strong>
                <br />
                Merrion Road
                <br />
                Dublin 4
                <br />
                D04 X2K5
                <br />
                Irland
            </p>

            <h2>9. Speicherung von WhatsApp-Nachrichten</h2>
            <p>
                Zur Ermöglichung einer zusammenhängenden Kommunikation werden
                WhatsApp-Nachrichten innerhalb des Self-Check-in-Services in einer
                technischen Datenbank gespeichert.
            </p>
            <p>
                Gespeichert werden dabei insbesondere:
            </p>
            <ul>
                <li>die Telefonnummer des WhatsApp-Nutzers,</li>
                <li>die Rolle der Nachricht (Gast oder automatisierter Assistent),</li>
                <li>der Textinhalt der Nachricht,</li>
                <li>der Zeitpunkt der Speicherung.</li>
            </ul>
            <p>
                Die gespeicherten Nachrichten werden verwendet, um bei einer neuen
                Anfrage den bisherigen Gesprächsverlauf berücksichtigen zu können.
                Dadurch kann das automatisierte Antwortsystem auf den bisherigen
                Kontext des Gesprächs zurückgreifen.
            </p>
            <p>
                Die gespeicherten WhatsApp-Nachrichten werden regelmäßig automatisiert
                gelöscht. Nachrichten werden spätestens im Rahmen der täglichen
                Bereinigung gelöscht, sobald sie aufgrund der definierten
                Aufbewahrungsfrist nicht mehr erforderlich sind. Die aktuelle
                technische Aufbewahrungsfrist für den Gesprächsverlauf beträgt
                <strong> höchstens drei Tage</strong>.
            </p>
            <p>
                Die Speicherung dient ausschließlich der Durchführung der
                WhatsApp-Kommunikation und der Bereitstellung des für die jeweilige
                Unterhaltung erforderlichen Gesprächskontexts. Eine Nutzung der
                gespeicherten Nachrichten für Werbung, Marketing oder Profilbildung
                findet nicht statt.
            </p>

            <h2>10. Automatisierte Verarbeitung von WhatsApp-Anfragen durch KI</h2>
            <p>
                Eingehende WhatsApp-Textnachrichten können automatisiert durch ein
                KI-basiertes Antwortsystem verarbeitet werden.
            </p>
            <p>
                Hierzu wird die aktuelle Nachricht des Gastes zusammen mit dem
                vorhandenen Gesprächskontext an einen von Cloudflare bereitgestellten
                KI-Dienst übermittelt. Der Gesprächskontext kann dabei mehrere zuvor
                gespeicherte Nachrichten derselben WhatsApp-Unterhaltung enthalten.
            </p>
            <p>
                Zusätzlich kann das System allgemeine Informationen über die Unterkunft
                aus einer technischen Wissensdatenbank abrufen. Diese
                Wissensdatenbank enthält keine personenbezogenen Daten von Gästen.
            </p>
            <p>
                Die KI-Verarbeitung dient ausschließlich dazu, automatisierte Antworten
                auf Fragen des Gastes zur Unterkunft und zum Aufenthalt zu erzeugen.
            </p>
            <p>
                Es werden keine automatisierten Entscheidungen getroffen, die gegenüber
                dem Gast eine rechtliche Wirkung entfalten oder ihn in vergleichbarer
                Weise erheblich beeinträchtigen.
            </p>
            <p>
                Der verwendete KI-Dienst wird von <strong>Cloudflare </strong>
                bereitgestellt. Nach den Angaben von Cloudflare werden Eingaben und
                Ausgaben von Workers AI nicht zum Training der bereitgestellten
                KI-Modelle verwendet.
            </p>

            <h2>11. Speicherung von Buchungsdaten und technische Datenbank</h2>
            <p>
                Der Self-Check-in-Service verwendet eine technische Datenbank auf Basis
                von <strong>Cloudflare D1</strong>.
            </p>
            <p>
                In dieser Datenbank werden insbesondere Buchungsdaten verarbeitet,
                die für die Durchführung und Verwaltung des Self-Check-in-Prozesses
                erforderlich sind. Dazu können insbesondere folgende Daten gehören:
            </p>
            <ul>
                <li>Vorname und Nachname,</li>
                <li>Telefonnummer, soweit vorhanden,</li>
                <li>Anreise- und Abreisedatum,</li>
                <li>eine technische Kennung der Buchung bei Smoobu,</li>
                <li>
                    Zeitpunkte der Erstellung und Aktualisierung des Datensatzes,
                </li>
                <li>
                    ein technischer Status zur WhatsApp-Benachrichtigung.
                </li>
            </ul>
            <p>
                Die Datenbank wird insbesondere verwendet, um Buchungen zwischen
                verschiedenen Verarbeitungsvorgängen eindeutig zuzuordnen, die
                Bereitstellung des Self-Check-in-Services zu ermöglichen und den
                Versand von WhatsApp-Informationen technisch zu verwalten.
            </p>
            <p>
                Die gespeicherten Buchungsdaten werden automatisiert gelöscht, sobald
                das Abreisedatum vor dem aktuellen Datum liegt. Die Bereinigung erfolgt
                mindestens einmal täglich.
            </p>
            <p>
                Eine darüber hinausgehende dauerhafte Speicherung der Buchungsdaten
                durch den Self-Check-in-Service findet nicht statt, soweit keine
                gesetzlichen Aufbewahrungspflichten oder andere gesetzliche Gründe
                entgegenstehen.
            </p>

            <h2>12. Versand von E-Mails über Brevo</h2>
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
            <p>
                Hierfür werden die jeweils erforderlichen Daten an Brevo übermittelt.
            </p>
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
                Brevo stellt Regelungen zur Auftragsverarbeitung und zur Verarbeitung
                personenbezogener Daten im Rahmen seiner Dienste bereit.
            </p>

            <h2>13. Hosting und Bereitstellung über Cloudflare</h2>
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
                Im Backend des Self-Check-in-Services ist die Protokollierung von
                Worker-Ausführungen aktiviert. Dabei können insbesondere technische
                Ausführungsdaten, Fehler und vom Anwendungscode erzeugte Protokolle
                verarbeitet werden.
            </p>
            <p>
                Zusätzlich werden Cloudflare-Dienste für die technische Datenbank
                (Cloudflare D1), die KI-Verarbeitung (Workers AI) sowie die
                Wissenssuche (Vectorize) eingesetzt.
            </p>
            <p>
                Die in Vectorize gespeicherten Informationen beziehen sich ausschließlich
                auf allgemeine Informationen zur Unterkunft und enthalten keine
                personenbezogenen Daten von Gästen.
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

            <h2>14. Protokollierung und Fehlerbehandlung</h2>
            <p>
                Zur Gewährleistung eines sicheren und zuverlässigen Betriebs können
                technische Vorgänge und Fehler protokolliert werden.
            </p>
            <p>
                Die Anwendung verwendet hierfür unter anderem die von Cloudflare
                Workers bereitgestellte Protokollierungs- und
                Observability-Funktion.
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

            <h2>15. Cookies und Tracking</h2>
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

            <h2>16. Empfänger personenbezogener Daten</h2>
            <p>
                Im Rahmen des Self-Check-in-Services können personenbezogene Daten an
                folgende technische Dienstleister übermittelt bzw. durch diese
                verarbeitet werden:
            </p>
            <ul>
                <li>
                    <strong>Cloudflare</strong> – Hosting, Cloudflare Workers,
                    Workers Assets, D1, Workers AI, Vectorize und technische
                    Protokollierung,
                </li>
                <li>
                    <strong>Smoobu</strong> – Bereitstellung der Buchungsdaten über
                    die Smoobu API,
                </li>
                <li>
                    <strong>Nuki</strong> – Verwaltung des digitalen Zugangscodes zur
                    Unterkunft,
                </li>
                <li>
                    <strong>Brevo</strong> – Versand von E-Mails,
                </li>
                <li>
                    <strong>WhatsApp Ireland Limited / Meta</strong> – Übermittlung
                    und Empfang von WhatsApp-Nachrichten sowie Bereitstellung der
                    WhatsApp Business Platform.
                </li>
            </ul>
            <p>
                Die jeweiligen Dienstleister verarbeiten Daten im Rahmen der für die
                jeweiligen Dienste erforderlichen Zwecke und, soweit erforderlich,
                auf Grundlage entsprechender Vereinbarungen zur Auftragsverarbeitung
                oder anderer datenschutzrechtlicher Grundlagen.
            </p>

            <h2>17. Übermittlung in Drittländer</h2>
            <p>
                Bei der Nutzung einzelner technischer Dienste kann eine Verarbeitung
                personenbezogener Daten außerhalb der Europäischen Union bzw. des
                Europäischen Wirtschaftsraums nicht vollständig ausgeschlossen
                werden.
            </p>
            <p>
                Dies betrifft insbesondere Cloudflare und kann je nach eingesetztem
                Dienst und dessen technischer Infrastruktur auch weitere Anbieter
                betreffen.
            </p>
            <p>
                Für entsprechende internationale Datenübermittlungen kommen, soweit
                erforderlich, geeignete datenschutzrechtliche Übermittlungsmechanismen
                nach Art. 44 ff. DSGVO zum Einsatz. Hierzu können insbesondere
                Angemessenheitsbeschlüsse, Standardvertragsklauseln der Europäischen
                Kommission sowie ergänzende Schutzmaßnahmen gehören.
            </p>
            <p>
                Die konkrete Verarbeitung durch die jeweiligen Anbieter richtet sich
                ergänzend nach deren aktuellen Datenschutzbestimmungen und
                Vertragsbedingungen.
            </p>

            <h2>18. Dauer der Speicherung</h2>
            <p>
                Die im Rahmen des Self-Check-in-Services verarbeiteten Daten werden
                grundsätzlich nur so lange gespeichert, wie dies für den jeweiligen
                Zweck erforderlich ist.
            </p>
            <p>
                Buchungsdaten in der technischen Datenbank des Self-Check-in-Services
                werden automatisiert gelöscht, sobald das Abreisedatum vor dem
                aktuellen Datum liegt. Die Bereinigung erfolgt mindestens einmal
                täglich.
            </p>
            <p>
                WhatsApp-Nachrichten und der hierfür gespeicherte Gesprächskontext
                werden spätestens im Rahmen der täglichen automatisierten Bereinigung
                nach einer Aufbewahrungsdauer von höchstens drei Tagen gelöscht.
            </p>
            <p>
                Technische Protokolle, Kommunikationsdaten und Daten bei den
                eingesetzten externen Dienstleistern können entsprechend deren
                jeweiligen Speicher- und Löschfristen gespeichert werden.
            </p>
            <p>
                Gesetzliche Aufbewahrungspflichten bleiben unberührt.
            </p>

            <h2>19. Datensicherheit</h2>
            <p>
                Zum Schutz der personenbezogenen Daten werden angemessene technische
                und organisatorische Maßnahmen eingesetzt.
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

            <h2>20. Rechte der betroffenen Personen</h2>
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

            <h2>21. Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde</h2>
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

            <h2>22. Änderungen dieser Datenschutzerklärung</h2>
            <p>
                Ich behalte mir vor, diese Datenschutzerklärung anzupassen, wenn sich
                der Self-Check-in-Service, die eingesetzten technischen Dienste oder
                die rechtlichen Anforderungen ändern.
            </p>
            <p>
                Es gilt jeweils die zum Zeitpunkt des Besuchs bzw. der Nutzung des
                Self-Check-in-Services veröffentlichte Datenschutzerklärung.
            </p>
        </>
    )
};