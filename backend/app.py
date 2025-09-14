import sqlite3

from database import Databse
from flask import Flask, request, jsonify
from decorators import authorisation_required

app = Flask(__name__)
app.config.from_object('config.DevConfig')


connection  = sqlite3.connect('database/data/db.sqlite3', check_same_thread=False)

db = Databse(connection)

@app.route('/api/booked-dates', methods=['GET'])
def get_booked_dates():
    booked_dates = db.get_booked_dates()
    return {"booked_dates": booked_dates}



@app.route('/api/make-booking', methods=['POST'])
@authorisation_required()
def make_booking():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    arrival_date = data.get('arrival_date')
    departure_date = data.get('departure_date')
    notes = data.get('notes', None)
    email = data.get('email', None)

    if not all([name, phone, arrival_date, departure_date]):
        return jsonify({"error": "Missing required fields"}), 400

    db.make_booking(name, phone, arrival_date, departure_date, notes, email)
    return jsonify({"message": "Booking created successfully"}), 201

@app.route("/api/remove-booking/<int:booking_id>", methods=['DELETE'])
@authorisation_required()
def remove_booking(booking_id):
    db.remove_booking(booking_id)
    return jsonify({"message": "Booking removed successfully"}), 200

@app.route('/api/all-bookings', methods=['GET'])
@authorisation_required()
def get_all_bookings():
    after_date = request.args.get('after_date', None)
    bookings = db.get_all_bookings(after_date)
    return jsonify({"bookings": bookings}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True)