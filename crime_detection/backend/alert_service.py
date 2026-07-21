"""SMS and email notifications. Delivery is disabled until .env is configured."""

import os
import smtplib
from email.message import EmailMessage

try:
    from twilio.rest import Client
except ImportError:
    Client = None

from backend.database import SessionLocal
from backend.models import NotificationLog, User


class AlertService:
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.default_country_code = os.getenv("TWILIO_DEFAULT_COUNTRY_CODE", "+91")
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.email_from = os.getenv("EMAIL_FROM", self.smtp_user or "")

    @property
    def sms_enabled(self):
        return Client is not None and all([self.twilio_sid, self.twilio_token, self.twilio_number])

    @property
    def email_enabled(self):
        return all([self.smtp_host, self.smtp_user, self.smtp_password, self.email_from])

    def _phone_number(self, phone):
        if not phone:
            return None
        value = phone.strip().replace(" ", "").replace("-", "")
        return value if value.startswith("+") else f"{self.default_country_code}{value}"

    def _log(self, notification_type, status, incident_id=None):
        db = SessionLocal()
        try:
            db.add(NotificationLog(incident_id=incident_id, notification_type=notification_type, status=status))
            db.commit()
        finally:
            db.close()

    def send_sms(self, phone, message, incident_id=None):
        target = self._phone_number(phone)
        if not target or not self.sms_enabled:
            self._log("sms", "SKIPPED_NOT_CONFIGURED", incident_id)
            return
        try:
            Client(self.twilio_sid, self.twilio_token).messages.create(
                body=message, from_=self.twilio_number, to=target
            )
            self._log("sms", "SENT", incident_id)
        except Exception:
            self._log("sms", "FAILED", incident_id)

    def send_email(self, recipient, subject, message, incident_id=None):
        if not recipient or not self.email_enabled:
            self._log("email", "SKIPPED_NOT_CONFIGURED", incident_id)
            return
        email = EmailMessage()
        email["Subject"], email["From"], email["To"] = subject, self.email_from, recipient
        email.set_content(message)
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(email)
            self._log("email", "SENT", incident_id)
        except Exception:
            self._log("email", "FAILED", incident_id)

    def send_surveillance_started(self, user):
        message = "Surveillance has started successfully. You will receive an alert when a verified anomaly is detected."
        self.send_sms(user.phone, message)
        self.send_email(user.email, "Surveillance started", message)

    def send_anomaly_alert(self, incident_id, prediction, confidence):
        message = f"Security alert: anomaly detected. Prediction: {prediction}. Confidence: {confidence * 100:.1f}%."
        db = SessionLocal()
        try:
            recipients = [
                (user.phone, user.email, user.emergency_phone, user.emergency_email)
                for user in db.query(User).all()
            ]
        finally:
            db.close()

        sent_sms, sent_email = set(), set()
        for phone, email, emergency_phone, emergency_email in recipients:
            for recipient in (phone, emergency_phone):
                normalised = self._phone_number(recipient)
                if normalised and normalised not in sent_sms:
                    self.send_sms(recipient, message, incident_id)
                    sent_sms.add(normalised)
            for recipient in (email, emergency_email):
                if recipient and recipient.lower() not in sent_email:
                    self.send_email(recipient, "Security alert: anomaly detected", message, incident_id)
                    sent_email.add(recipient.lower())


alert_service = AlertService()
