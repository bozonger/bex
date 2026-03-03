# Berichtsheft-Editor-X Backend Teil

## Übersicht
Dieses Backend wurde innerhalb eines **zweiwöchigen Sprints** als Prüfungssimulation für die IHK entwickelt. Es stellt eine **REST-API** auf Basis von **C# (.NET)** bereit, um digitale Berichtshefte zu verwalten.

## Features & Technik
* **Struktur:** Saubere Trennung durch Controller-, Service- und Model-Layer.
* **Authentifizierung:** JWT-basierter Login (User können nur eigene Daten abrufen).
* **Datenhaltung:** SQLite Datenbank und Entity Framework.
* **Dokumentation:** Interaktive API-Prüfung via Swagger.

> **Sicherheitshinweis:** Da das Projekt als zweiwöchige Simulation entwickelt wurde, liegt der Fokus auf der Funktionalität. Die Datenhaltung in der SQLite-Datenbank erfolgt unverschlüsselt und die Authentifizierung dient der Nutzertrennung; eine produktionsreife Verschlüsselung der Berichtsdateien war für dieses Projekt nie vorgesehen.

## Nutzung
Siehe `.env`-Beispieldatei.

# Berichtsheft-Editor-X Frontend Teil
