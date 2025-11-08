"""
Script to clear all records from database tables
WARNING: This will delete all data!
"""

import os
from dotenv import load_dotenv
from database import db, Video, Moment, Clip
from flask import Flask
from config import Config

# Load environment variables
load_dotenv()

# Setup Flask app for database access
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


def clear_all_records():
    """Clear all records from all tables"""

    with app.app_context():
        print("=" * 60)
        print("⚠️  DATABASE CLEANUP WARNING ⚠️")
        print("=" * 60)
        print("This will DELETE ALL records from:")
        print("  - Videos table")
        print("  - Moments table")
        print("  - Clips table")
        print()

        # Count existing records
        video_count = Video.query.count()
        moment_count = Moment.query.count()
        clip_count = Clip.query.count()

        print(f"Current records:")
        print(f"  Videos: {video_count}")
        print(f"  Moments: {moment_count}")
        print(f"  Clips: {clip_count}")
        print()

        if video_count == 0 and moment_count == 0 and clip_count == 0:
            print("✅ Database is already empty. Nothing to delete.")
            return

        # Confirm deletion
        print("This action CANNOT be undone!")
        confirm = input("Type 'DELETE' to confirm: ")

        if confirm != 'DELETE':
            print("❌ Deletion cancelled.")
            return

        print()
        print("🗑️  Deleting records...")

        try:
            # Delete in correct order (child tables first due to foreign keys)
            # But with cascade='all, delete-orphan', we can delete from parent

            # Delete clips first
            if clip_count > 0:
                print(f"  Deleting {clip_count} clips...")
                Clip.query.delete()
                db.session.commit()
                print(f"  ✅ Deleted {clip_count} clips")

            # Delete moments
            if moment_count > 0:
                print(f"  Deleting {moment_count} moments...")
                Moment.query.delete()
                db.session.commit()
                print(f"  ✅ Deleted {moment_count} moments")

            # Delete videos
            if video_count > 0:
                print(f"  Deleting {video_count} videos...")
                Video.query.delete()
                db.session.commit()
                print(f"  ✅ Deleted {video_count} videos")

            print()
            print("=" * 60)
            print("✅ All records deleted successfully!")
            print("=" * 60)

            # Verify
            print()
            print("Verification:")
            print(f"  Videos: {Video.query.count()}")
            print(f"  Moments: {Moment.query.count()}")
            print(f"  Clips: {Clip.query.count()}")

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            db.session.rollback()
            print("Database changes have been rolled back.")


def clear_specific_table(table_name):
    """Clear records from a specific table"""

    with app.app_context():
        table_map = {
            'videos': (Video, 'Videos'),
            'moments': (Moment, 'Moments'),
            'clips': (Clip, 'Clips')
        }

        if table_name.lower() not in table_map:
            print(f"❌ Unknown table: {table_name}")
            print(f"Available tables: {', '.join(table_map.keys())}")
            return

        model, display_name = table_map[table_name.lower()]
        count = model.query.count()

        print("=" * 60)
        print(f"⚠️  Clearing {display_name} table")
        print("=" * 60)
        print(f"Current records: {count}")
        print()

        if count == 0:
            print(f"✅ {display_name} table is already empty.")
            return

        confirm = input(f"Delete all {count} {display_name.lower()}? (y/n): ")

        if confirm.lower() != 'y':
            print("❌ Deletion cancelled.")
            return

        try:
            print(f"🗑️  Deleting {count} {display_name.lower()}...")
            model.query.delete()
            db.session.commit()
            print(f"✅ Deleted {count} {display_name.lower()} successfully!")

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            db.session.rollback()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # Clear specific table
        table_name = sys.argv[1]
        clear_specific_table(table_name)
    else:
        # Clear all tables
        clear_all_records()
