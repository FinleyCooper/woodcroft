import sqlite3
from database.create_tables import create_tables

class Databse:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection
        self.connection.execute("PRAGMA foreign_keys = ON")

        create_tables(self.connection)
    
    def get_booked_dates(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT ArrivalDate, DepartureDate FROM Bookings")
        return cursor.fetchall()
    
    def make_booking(self, name: str, phone: str, arrival_date: str, departure_date: str, notes: str = None, email: str = None):
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO Bookings (Name, Phone, ArrivalDate, DepartureDate, Notes, Email) VALUES (?, ?, ?, ?, ?, ?)",
            (name, phone, arrival_date, departure_date, notes, email)
        )
        self.connection.commit()

    def get_all_bookings(self, after_date: str = None):
        cursor = self.connection.cursor()
        if after_date:
            cursor.execute("SELECT * FROM Bookings WHERE ArrivalDate > ?", (after_date,))
        else:
            cursor.execute("SELECT * FROM Bookings")
        return cursor.fetchall()
    
    def remove_booking(self, booking_id: int):
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM Bookings WHERE Bookingid = ?", (booking_id,))
        self.connection.commit()