> **GERMAN**, english below

# Berichtsheft-Editor-X Backend Teil
Dieses Backend wurde innerhalb eines **zweiwöchigen Sprints** als Prüfungssimulation für die IHK entwickelt. Es stellt eine **REST-API** auf Basis von **C# (.NET)** bereit, um digitale Berichtshefte zu verwalten.

# Berichtsheft-Editor-X Frontend Teil
Später auch in einem **zweiwöchigen Sprint** erstellt. Es stellt eine Angular Web App bereit um mit dem Backend kommunizieren zu können.

# Features & Technik
* **Struktur:** Saubere Trennung durch Controller-, Service- und Model-Layer.
* **Authentifizierung:** JWT-basierter Login (User können nur eigene Daten abrufen).
* **Datenhaltung:** SQLite Datenbank und Entity Framework.
* **Dokumentation:** Interaktive API-Prüfung via Swagger.

> **Sicherheitshinweis:** Da das Projekt als zweiwöchige Simulation entwickelt wurde, liegt der Fokus auf der Funktionalität. Die Datenhaltung in der SQLite-Datenbank erfolgt unverschlüsselt und die Authentifizierung dient der Nutzertrennung; eine produktionsreife Verschlüsselung der Berichtsdateien war für dieses Projekt nie vorgesehen.

## Nutzung
Siehe `.env`-Beispieldatei.

> **ENGLISH**

# Berichtsheft-Editor-X Backend
This backend was developed within a two-week sprint as part of an IHK exam simulation. It provides a REST API based on C# (.NET) for managing digital training reports.

# Berichtsheft-Editor-X Frontend
The frontend was also developed in a two-week sprint. It provides an Angular web application that communicates with the backend.

# Features & Technology
* **Architecture:** Clean separation using controller, service, and model layers
* **Authentication:** JWT-based login (users can only access their own data)
* **Data Storage:** SQLite database with Entity Framework
* **Documentation:** Interactive API testing via Swagger

> **Security Note:** As this project was developed as a two-week simulation, the focus was on functionality. Data in the SQLite database is stored unencrypted, and authentication is intended for user separation only. Production-ready encryption of report files was not part of the project scope.

## Usage
See the example `.env` file.
