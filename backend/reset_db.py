#!/usr/bin/env python3
"""
Reset database - Delete and recreate with new schema
"""

import os
from database.models import Base, engine

db_path = "storage/accounts.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"✓ Deleted old database: {db_path}")

Base.metadata.create_all(bind=engine)
print("✓ Created new database with updated schema")

from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\n✓ Created {len(tables)} tables:")
for table in tables:
    print(f"  - {table}")

print("\n✅ Database reset complete! Restart your server now.")