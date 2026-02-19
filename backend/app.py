"""
IT 102 Extra Labs - Cyber-Masry Backend
Author: Omar Badran
Description: Flask API for the gamified ethical hacking platform.
             100% SIMULATED - No real hacking tools or network requests.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Lab, Solve

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cybermasry.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'cyber-masry-dev-key-2025'

CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])
db.init_app(app)


# ─── Seed Data ────────────────────────────────────────────────────────────────
def seed_labs():
    if Lab.query.count() == 0:
        labs = [
            Lab(
                id=1,
                title='El-Taqassi (Reconnaissance)',
                description_ar=(
                    'في المهمة دي، هنستخدم Google Dorks. دي طرق بحث متقدمة '
                    'بتطلع حاجات جوجل العادي مخبيها.'
                ),
                flag_secret='FLAG{Omar_Badran_Recon_Master}',
                points=100,
            ),
            Lab(
                id=2,
                title='El-Bab El-Maftooh (Network Scanning)',
                description_ar='هنستخدم nmap عشان نعرف البورتات المفتوحة على السيرفر.',
                flag_secret='FLAG{Omar_Badran_Scanner_Pro}',
                points=150,
            ),
            Lab(
                id=3,
                title='El-Password (Brute Force)',
                description_ar='هنتعلم إزاي الـ Brute Force بيشتغل وإزاي نحمي نفسنا منه.',
                flag_secret='FLAG{Omar_Badran_Password_Cracker}',
                points=200,
            ),
        ]
        db.session.add_all(labs)
        db.session.commit()
        print('[*] Labs seeded successfully.')


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return jsonify({
        'platform': 'IT 102 Extra Labs - Cyber-Masry',
        'creator': 'Omar Badran',
        'version': '1.0.0',
        'status': 'SIMULATED ENVIRONMENT - Educational Use Only',
    })


@app.route('/api/labs', methods=['GET'])
def get_labs():
    """Return all labs (without the flag secrets)."""
    labs = Lab.query.all()
    return jsonify([lab.to_dict() for lab in labs])


@app.route('/api/labs/<int:lab_id>', methods=['GET'])
def get_lab(lab_id):
    lab = Lab.query.get_or_404(lab_id)
    return jsonify(lab.to_dict())


@app.route('/api/submit-flag', methods=['POST'])
def submit_flag():
    """
    Validate a flag submission.
    Body: { "lab_id": 1, "flag": "FLAG{...}", "username": "...", "student_id": "..." }
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    lab_id = data.get('lab_id')
    submitted_flag = data.get('flag', '').strip()
    username = data.get('username', 'anonymous')
    student_id = data.get('student_id', '0000')

    lab = Lab.query.get(lab_id)
    if not lab:
        return jsonify({'success': False, 'message': 'Lab not found'}), 404

    if submitted_flag != lab.flag_secret:
        return jsonify({
            'success': False,
            'messageAr': 'الـ Flag غلط.. جرب تاني!',
            'message': 'Incorrect flag. Try again!',
        }), 200

    # Get or create user
    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        user = User(username=username, student_id=student_id, total_score=0)
        db.session.add(user)
        db.session.flush()

    # Check if already solved
    already_solved = Solve.query.filter_by(user_id=user.id, lab_id=lab.id).first()
    points_awarded = 0
    if not already_solved:
        solve = Solve(user_id=user.id, lab_id=lab.id)
        db.session.add(solve)
        user.total_score += lab.points
        points_awarded = lab.points

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Correct flag!',
        'messageAr': 'مبروك! لقيت الثغرة! 🎉',
        'points_awarded': points_awarded,
        'total_score': user.total_score,
    })


@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    """Return top 10 users by score."""
    users = User.query.order_by(User.total_score.desc()).limit(10).all()
    return jsonify([u.to_dict() for u in users])


@app.route('/api/users', methods=['POST'])
def create_user():
    """Register a new student."""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('student_id'):
        return jsonify({'error': 'username and student_id are required'}), 400

    existing = User.query.filter_by(student_id=data['student_id']).first()
    if existing:
        return jsonify({'error': 'Student ID already registered', 'user': existing.to_dict()}), 409

    user = User(username=data['username'], student_id=data['student_id'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_labs()
        print('[*] Cyber-Masry backend running on http://localhost:5000')
        print('[*] SIMULATED ENVIRONMENT - No real network connections made.')
    app.run(debug=True, port=5000)
