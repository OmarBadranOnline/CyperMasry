from app import app, db
import os

url = "postgresql://neondb_owner:npg_EG73AZskvMaT@ep-curly-cake-aepsah73-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Force new DB URI
app.config['SQLALCHEMY_DATABASE_URI'] = url

print(f"Connecting to: {url.split('@')[1]}...")

with app.app_context():
    try:
        print("Creating tables...")
        db.create_all()
        print("✅ Success! Tables created.")
        
        # Check if admin exists
        from models import User
        if not User.query.filter_by(username='omar_b_1').first():
            print("Seeding admin...")
            # Trigger seeding logic manually? Or just let app logic run?
            # App logic runs on creation but we are inside context.
            # Reuse seeding logic from app.py if possible?
            # app.py has manual seeding check inside `if __name__ == '__main__'`.
            
            # Let's import werkzeug and add manually to be safe.
            from werkzeug.security import generate_password_hash
            admin = User(
                username='omar_b_1',
                student_id='ADMIN-001',
                email='admin@cybermasry.edu',
                password_hash=generate_password_hash('2217966@@!&(^^'),
                is_admin=True,
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin seeded.")
        else:
            print("Admin already exists.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
