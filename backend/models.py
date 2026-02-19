from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    total_score = db.Column(db.Integer, default=0)

    solves = db.relationship("Solve", back_populates="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "student_id": self.student_id,
            "total_score": self.total_score,
        }


class Lab(db.Model):
    __tablename__ = "labs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description_ar = db.Column(db.Text, nullable=False)
    flag_secret = db.Column(db.String(200), nullable=False)
    points = db.Column(db.Integer, default=100)

    solves = db.relationship("Solve", back_populates="lab", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description_ar": self.description_ar,
            "points": self.points,
            # NOTE: flag_secret is never sent to the client
        }


class Solve(db.Model):
    __tablename__ = "solves"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    lab_id = db.Column(db.Integer, db.ForeignKey("labs.id"), nullable=False)
    solved_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="solves")
    lab = db.relationship("Lab", back_populates="solves")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lab_id": self.lab_id,
            "solved_at": self.solved_at.isoformat(),
        }
