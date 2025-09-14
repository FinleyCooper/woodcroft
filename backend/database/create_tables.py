import sqlite3


def create_tables(connection: sqlite3.Connection):
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS Bookings (
            Bookingid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            Name TEXT NOT NULL,
            Phone TEXT NOT NULL,
            Email TEXT,
            ArrivalDate DATE NOT NULL,
            DepartureDate DATE NOT NULL,
            Notes TEXT
        );
        """
    )