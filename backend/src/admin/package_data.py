import uuid
from datetime import datetime

packages_data = [
    {
        "id": str(uuid.uuid4()),
        "title": "Bali Adventure",
        "description": "Experience the beauty of Bali with our comprehensive adventure package",
        "price": 1299.0,
        "duration_days": 7,
        "duration_nights": 6,
        "destination_id": str(uuid.uuid4()),  # This should match a real destination ID
        "trip_type_id": str(uuid.uuid4()),    # This should match a real trip type ID
        "offer_id": None,
        "featured_image": None,
        "is_featured": True,
        "is_active": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Paris Romance",
        "description": "A romantic getaway in the city of love",
        "price": 1899.0,
        "duration_days": 5,
        "duration_nights": 4,
        "destination_id": str(uuid.uuid4()),  # This should match a real destination ID
        "trip_type_id": str(uuid.uuid4()),    # This should match a real trip type ID
        "offer_id": None,
        "featured_image": None,
        "is_featured": False,
        "is_active": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]