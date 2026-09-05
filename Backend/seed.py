"""
Seed data for NeuroNex application.
Automatically creates dummy users with predefined Dummy IDs.
"""

from database import SessionLocal
from models import User

DUMMY_USERS = [
    {
        "dummy_id": "NN-ADMIN-001",
        "name": "Alex Chen",
        "email": "alex.chen@etheric.app",
        "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAmIq6O2iDUHmu96A_EPaAaZHjkFWvROu-DVfhlVZimnHTRU1_E3o42DlpGVS1DjenYjqqe5OrpvGkr5ttxHjIN8CIVuKuW27zy38rMhuAQTGfX1pjoq4AAECZzxojKIrAW0U0_IpGF40btQPZYG58orKcGC2ZAFG3bFLhfR16bKBqRdzyBFwIRoO0Mcc4doHwqDyLvJuxTE7gwR0z5_Zk1EJHKUWxciK0vXTIDEb_3U6_VYnACQXAF"
    },
    {
        "dummy_id": "NN-1001",
        "name": "Jordan Lee",
        "email": "jordan.l@etheric.app",
        "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAc5Hg54M0trR5K-TY5vTWq7KZVOv5caA9RlNXaz_I-ahHLyK5a8rQ2Q0NewWSuL3TObUl-doa_aAAFhU5SXOFnWcbhoReYnySSI5nHQloeXZ6XmlmfCgMWREp-DTavl4OvKjYfDF1l1U_ab4ww8Zs-9ii5oX_yuJ441aplVgvrTMfwZ7t2WEriO6Og5RB2-YyTEEE7_acXYd0C4hZEGyGhUjldnPVfw-UjOfIggvtt55zhWNDE2PI-"
    },
    {
        "dummy_id": "NN-1002",
        "name": "Sarah Connor",
        "email": "s.connor@etheric.app",
        "avatar_url": None  # Will use initials
    },
    {
        "dummy_id": "NN-1003",
        "name": "Michael Lee",
        "email": "michael.l@etheric.app",
        "avatar_url": None
    },
    {
        "dummy_id": "NN-1004",
        "name": "Priya Patel",
        "email": "priya.p@etheric.app",
        "avatar_url": None
    },
    {
        "dummy_id": "NN-1005",
        "name": "Lisa Wang",
        "email": "lisa.w@etheric.app",
        "avatar_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCAFnWYfoEq9wQ5HnshuH1sRAS2TjuZn9cVA6cD8t1ru3pqEnKxSxa6SCEcjbccrKHeT2L3jqL4Gi0ut_puXudnZAF8YgObI94ql6qRobcOn30q-jAh3byJ3gTXXqZAIoKAYQONd5-uHy5DdGUQVeQK5wNmbMcFzdfPH56z4CKWSb_bI-OwwcLTN7WMUW5CsxDK9GqCSGeT2kTYJEp9QrMM1kVUPCfnN3z7yov7Fg8LTS8Z5YmGMpfK"
    }
]


def seed_users():
    """
    Seed the database with dummy users.
    Checks if users already exist before inserting.
    """
    db = SessionLocal()
    try:
        for user_data in DUMMY_USERS:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.dummy_id == user_data["dummy_id"]
            ).first()
            
            if not existing_user:
                user = User(**user_data)
                db.add(user)
                print(f"Seeding user: {user_data['name']} ({user_data['dummy_id']})")
        
        db.commit()
        print("[OK] All dummy users seeded successfully!")
    except Exception as e:
        print(f"[ERROR] Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
