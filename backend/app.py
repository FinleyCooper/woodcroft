from datetime import timedelta
import sqlite3

from email.utils import formataddr
from redmail import gmail
from database import Databse
from flask import Flask, request, jsonify
from decorators import authorisation_required

app = Flask(__name__)
app.config.from_object('config.DevConfig')

connection  = sqlite3.connect('database/data/db.sqlite3', check_same_thread=False)

db = Databse(connection)


gmail.username = app.config.get("EMAIL_USERNAME")
gmail.password = app.config.get("EMAIL_PASSWORD")
gmail.default_sender = app.config.get("EMAIL_DEFAULT_SENDER")

def send_booking_enquiry(name, email, phone, arrival_date, departure_date, message):
    try:
        gmail.send(
            receivers=[gmail.default_sender],
            sender=formataddr((name, gmail.username)),
            subject="Woodcroft - New Booking Enquiry",
            html="""
            <h2>New Booking Enquiry</h2>
            <p><strong>Name:</strong> {{ name }}</p>
            <p><strong>Email:</strong> {{ email }}</p>
            <p><strong>Phone:</strong> {{ phone }}</p>
            <p><strong>Arrival Date:</strong> {{ arrival_date }}</p>
            <p><strong>Departure Date:</strong> {{ departure_date }}</p>
            <p><strong>Message:</strong> {{ message }}</p>
            """,
            body_params={
                "name": name,
                "email": email,
                "phone": phone,
                "arrival_date": arrival_date,
                "departure_date": departure_date,
                "message": message or "N/A"
            },
        )
        print("Booking enquiry email sent successfully.")
        return True
    except Exception as e:
        print(f"Failed to send booking enquiry email: {e}")
    return False

@app.route('/api/booked-dates', methods=['GET'])
def get_booked_dates():
    booked_dates = db.get_booked_dates()

    all_booked_dates = []
    for date_range in booked_dates:
        start_date, end_date = date_range
        current_date = start_date
        while current_date <= end_date:
            all_booked_dates.append(current_date)
            current_date += timedelta(days=1)

    return jsonify({"booked_dates": all_booked_dates}), 200


@app.route('/api/enquiry', methods=['POST'])
def submit_enquiry():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    check_in_date = data.get('checkin')
    check_out_date = data.get('checkout')
    message = data.get('message')

    if not all([name, email, check_in_date, check_out_date]):
        return jsonify({"error": "Missing required fields"}), 400

    if send_booking_enquiry(name, email, phone, check_in_date, check_out_date, message):
        return jsonify({"message": "Enquiry submitted successfully"}), 201

    return jsonify({"error": "Failed to send enquiry"}), 500


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