"""
Cyber-Masry — Database Models
Adds: password_hash, email, is_admin to User
New:  LabProgress (per-user, per-lab, per-step completion tracking)
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# ─── User ─────────────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80),  unique=True, nullable=False)
    student_id    = db.Column(db.String(20),  unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin      = db.Column(db.Boolean, default=False)
    total_score   = db.Column(db.Integer, default=0)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    last_active   = db.Column(db.DateTime, default=datetime.utcnow)

    solves    = db.relationship("Solve",       back_populates="user", lazy=True)
    progress  = db.relationship("LabProgress", back_populates="user", lazy=True)

    def to_dict(self, include_progress=False):
        data = {
            "id":          self.id,
            "username":    self.username,
            "student_id":  self.student_id,
            "email":       self.email,
            "is_admin":    self.is_admin,
            "total_score": self.total_score,
            "created_at":  self.created_at.isoformat(),
            "last_active": self.last_active.isoformat() if self.last_active else None,
        }
        if include_progress:
            data["progress"] = [p.to_dict() for p in self.progress]
            data["solves"]   = [s.to_dict() for s in self.solves]
        return data


# ─── Lab ──────────────────────────────────────────────────────────────────────
class Lab(db.Model):
    __tablename__ = "labs"

    id             = db.Column(db.Integer, primary_key=True)
    title          = db.Column(db.String(120), nullable=False)
    description_ar = db.Column(db.Text, nullable=False)
    flag_secret    = db.Column(db.String(200), nullable=False)
    points         = db.Column(db.Integer, default=100)
    total_steps    = db.Column(db.Integer, default=10)

    solves   = db.relationship("Solve",       back_populates="lab", lazy=True)
    progress = db.relationship("LabProgress", back_populates="lab", lazy=True)

    def to_dict(self):
        return {
            "id":             self.id,
            "title":          self.title,
            "description_ar": self.description_ar,
            "points":         self.points,
            "total_steps":    self.total_steps,
        }


# ─── Solve ────────────────────────────────────────────────────────────────────
class Solve(db.Model):
    """Recorded when a user fully completes a lab (all N steps)."""
    __tablename__ = "solves"

    id        = db.Column(db.Integer, primary_key=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    lab_id    = db.Column(db.Integer, db.ForeignKey("labs.id"),  nullable=False)
    solved_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="solves")
    lab  = db.relationship("Lab",  back_populates="solves")

    def to_dict(self):
        return {
            "id":        self.id,
            "user_id":   self.user_id,
            "lab_id":    self.lab_id,
            "solved_at": self.solved_at.isoformat(),
        }


# ─── LabProgress ──────────────────────────────────────────────────────────────
class LabProgress(db.Model):
    """
    Tracks which steps a user has completed within a lab.
    step_ids stored as comma-separated string: "1,2,3,5"
    One row per (user, lab) pair.
    """
    __tablename__ = "lab_progress"
    __table_args__ = (db.UniqueConstraint("user_id", "lab_id"),)

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    lab_id          = db.Column(db.Integer, db.ForeignKey("labs.id"),  nullable=False)
    completed_steps = db.Column(db.Text, default="")   # e.g. "1,2,3"
    completed_at    = db.Column(db.DateTime, nullable=True)  # set when all steps done
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="progress")
    lab  = db.relationship("Lab",  back_populates="progress")

    def get_steps(self):
        if not self.completed_steps:
            return []
        return [int(s) for s in self.completed_steps.split(",") if s]

    def add_step(self, step_id):
        steps = set(self.get_steps())
        steps.add(step_id)
        self.completed_steps = ",".join(str(s) for s in sorted(steps))

    def is_fully_complete(self, total_steps):
        return len(self.get_steps()) >= total_steps

    def to_dict(self):
        return {
            "lab_id":          self.lab_id,
            "completed_steps": self.get_steps(),
            "completed_at":    self.completed_at.isoformat() if self.completed_at else None,
        }
