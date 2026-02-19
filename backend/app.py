"""
IT 102 Extra Labs — Cyber-Masry Backend
Auth: JWT (PyJWT) — tokens in Authorization: Bearer <token> header
Passwords: werkzeug pbkdf2_sha256 hashing
Admin seed: username=omar_b_1, password=2217966@@!&(^^, student_id=ADMIN-001
"""
import os
import jwt as pyjwt
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User, Lab, Solve, LabProgress

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']  = 'sqlite:///cybermasry.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cyber-masry-secret-key-2025-IT102')
app.config['JWT_EXP_HOURS'] = 72   # tokens last 3 days

CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173',
                   'https://cyber-masry.netlify.app'])
db.init_app(app)


# ─── JWT helpers ──────────────────────────────────────────────────────────────
def make_token(user_id: int) -> str:
    payload = {
        'sub': str(user_id),
        'exp': datetime.now(timezone.utc) + timedelta(hours=app.config['JWT_EXP_HOURS']),
        'iat': datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def decode_token(token: str) -> dict | None:
    try:
        return pyjwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except (pyjwt.ExpiredSignatureError, pyjwt.InvalidTokenError):
        return None


def get_current_user() -> User | None:
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    payload = decode_token(auth[7:])
    if not payload:
        return None
    return db.session.get(User, payload.get('sub'))


# ─── Decorators ───────────────────────────────────────────────────────────────
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized — please log in'}), 401
        g.current_user = user
        # Touch last_active
        user.last_active = datetime.utcnow()
        db.session.commit()
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        if not g.current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


# ─── Seed Data ────────────────────────────────────────────────────────────────
def seed_data():
    # Seed default admin
    if not User.query.filter_by(username='omar_b_1').first():
        # Also remove old default admin if it exists
        old = User.query.filter_by(username='admin').first()
        if old:
            db.session.delete(old)
        admin = User(
            username='omar_b_1',
            student_id='ADMIN-001',
            email='admin@cybermasry.edu',
            password_hash=generate_password_hash('2217966@@!&(^^'),
            is_admin=True,
        )
        db.session.add(admin)
        print('[*] Admin created: omar_b_1')

    # Seed labs
    if Lab.query.count() == 0:
        labs = [
            Lab(id=1, title='El-Taqassi (التقصي)',
                description_ar='الاستطلاع السلبي — OSINT و Google Dorks',
                flag_secret='FLAG{CM_Recon_Master}', points=100, total_steps=9),
            Lab(id=2, title='El-Tafteesh (التفتيش)',
                description_ar='مسح البورتات — Nmap',
                flag_secret='FLAG{CM_Nmap_Pro}', points=150, total_steps=10),
            Lab(id=3, title='El-Daraaj El-Serry (الدراج السري)',
                description_ar='اكتشاف المسارات الخفية — Gobuster',
                flag_secret='FLAG{CM_Gobuster_Hunter}', points=175, total_steps=10),
            Lab(id=4, title='El-Ekhteraq (الاختراق)',
                description_ar='حقن SQL — من الخطأ للـ RCE',
                flag_secret='FLAG{CM_SQLi_King}', points=200, total_steps=10),
            Lab(id=5, title='El-Basaama (البصمة)',
                description_ar='جمع البنرات وتحليل الـ CVEs',
                flag_secret='FLAG{CM_Banner_Grabber}', points=250, total_steps=10),
        ]
        db.session.add_all(labs)
        print('[*] Labs seeded.')

    db.session.commit()


# ─── Root ─────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return jsonify({'platform': 'Cyber-Masry', 'version': '2.0.0', 'status': 'ok'})


# ─── Auth Routes ──────────────────────────────────────────────────────────────
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username   = (data.get('username') or '').strip()
    student_id = (data.get('student_id') or '').strip()
    email      = (data.get('email') or '').strip().lower()
    password   = data.get('password') or ''

    if not all([username, student_id, email, password]):
        return jsonify({'error': 'All fields required (username, student_id, email, password)'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken — اختار اسم تاني'}), 409
    if User.query.filter_by(student_id=student_id).first():
        return jsonify({'error': 'Student ID already registered'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        username=username,
        student_id=student_id,
        email=email,
        password_hash=generate_password_hash(password),
        is_admin=False,
    )
    db.session.add(user)
    db.session.commit()

    token = make_token(user.id)
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    user.last_active = datetime.utcnow()
    db.session.commit()

    token = make_token(user.id)
    return jsonify({'token': token, 'user': user.to_dict()})


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    return jsonify({'user': g.current_user.to_dict()})


# ─── Lab Routes ───────────────────────────────────────────────────────────────
@app.route('/api/labs', methods=['GET'])
def get_labs():
    return jsonify([lab.to_dict() for lab in Lab.query.order_by(Lab.id).all()])


@app.route('/api/labs/<int:lab_id>', methods=['GET'])
def get_lab(lab_id):
    lab = db.session.get(Lab, lab_id)
    if not lab:
        return jsonify({'error': 'Lab not found'}), 404
    return jsonify(lab.to_dict())


# ─── Progress Routes ──────────────────────────────────────────────────────────
@app.route('/api/progress', methods=['GET'])
@require_auth
def get_progress():
    """Return all per-lab step progress for the current user."""
    user = g.current_user
    progress = {p.lab_id: p.to_dict() for p in user.progress}
    solves   = {s.lab_id for s in user.solves}
    return jsonify({
        'progress': progress,
        'completed_labs': list(solves),
        'total_score': user.total_score,
    })


@app.route('/api/progress', methods=['POST'])
@require_auth
def save_progress():
    """
    Save a completed step.
    Body: { "lab_id": 2, "step_id": 3 }
    Automatically marks lab as solved + awards points when all steps are done.
    """
    data    = request.get_json() or {}
    lab_id  = data.get('lab_id')
    step_id = data.get('step_id')

    if not lab_id or not step_id:
        return jsonify({'error': 'lab_id and step_id required'}), 400

    lab = db.session.get(Lab, lab_id)
    if not lab:
        return jsonify({'error': 'Lab not found'}), 404

    user = g.current_user

    # Get or create progress row
    prog = LabProgress.query.filter_by(user_id=user.id, lab_id=lab_id).first()
    if not prog:
        prog = LabProgress(user_id=user.id, lab_id=lab_id, completed_steps='')
        db.session.add(prog)

    prog.add_step(step_id)
    lab_just_completed = False

    # Check if all steps done → award points
    if prog.is_fully_complete(lab.total_steps) and prog.completed_at is None:
        prog.completed_at = datetime.utcnow()
        already_solved = Solve.query.filter_by(user_id=user.id, lab_id=lab.id).first()
        if not already_solved:
            solve = Solve(user_id=user.id, lab_id=lab.id)
            db.session.add(solve)
            user.total_score += lab.points
            lab_just_completed = True

    db.session.commit()
    return jsonify({
        'ok': True,
        'lab_completed': lab_just_completed,
        'new_total_score': user.total_score,
        'completed_steps': prog.get_steps(),
    })


# ─── Admin Routes ─────────────────────────────────────────────────────────────
@app.route('/api/admin/stats', methods=['GET'])
@require_admin
def admin_stats():
    total_users = User.query.filter_by(is_admin=False).count()
    total_solves = Solve.query.count()
    labs = Lab.query.order_by(Lab.id).all()
    lab_stats = []
    for lab in labs:
        solves = Solve.query.filter_by(lab_id=lab.id).count()
        lab_stats.append({'lab_id': lab.id, 'title': lab.title, 'solves': solves, 'points': lab.points})
    return jsonify({
        'total_users': total_users,
        'total_solves': total_solves,
        'lab_stats': lab_stats,
    })


@app.route('/api/admin/users', methods=['GET'])
@require_admin
def admin_list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict(include_progress=True) for u in users])


@app.route('/api/admin/users', methods=['POST'])
@require_admin
def admin_create_user():
    data       = request.get_json() or {}
    username   = (data.get('username') or '').strip()
    student_id = (data.get('student_id') or '').strip()
    email      = (data.get('email') or '').strip().lower()
    password   = data.get('password') or ''
    is_admin   = bool(data.get('is_admin', False))

    if not all([username, student_id, email, password]):
        return jsonify({'error': 'username, student_id, email, password required'}), 400

    for field, value in [('username', username), ('student_id', student_id), ('email', email)]:
        if User.query.filter(getattr(User, field) == value).first():
            return jsonify({'error': f'{field} already exists'}), 409

    user = User(
        username=username, student_id=student_id, email=email,
        password_hash=generate_password_hash(password), is_admin=is_admin,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@require_admin
def admin_update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    if 'username' in data:
        new_username = data['username'].strip()
        existing = User.query.filter(User.username == new_username, User.id != user_id).first()
        if existing:
            return jsonify({'error': 'Username taken'}), 409
        user.username = new_username
    if 'email' in data:
        user.email = data['email'].strip().lower()
    if 'student_id' in data:
        user.student_id = data['student_id'].strip()
    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])
    if 'password' in data and data['password']:
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify(user.to_dict())


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@require_admin
def admin_delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.username == 'admin':
        return jsonify({'error': 'Cannot delete the root admin'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/api/admin/users/<int:user_id>/reset-progress', methods=['POST'])
@require_admin
def admin_reset_progress(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    LabProgress.query.filter_by(user_id=user_id).delete()
    Solve.query.filter_by(user_id=user_id).delete()
    user.total_score = 0
    db.session.commit()
    return jsonify({'ok': True})


# ─── Legacy: leaderboard ──────────────────────────────────────────────────────
@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.filter_by(is_admin=False).order_by(User.total_score.desc()).limit(20).all()
    return jsonify([u.to_dict() for u in users])


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
        print('[*] Cyber-Masry v2 backend running on http://localhost:5000')
    app.run(debug=True, port=5000)
