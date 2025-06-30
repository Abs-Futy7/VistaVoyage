# VistaVoyage Complete Schema Documentation

## Overview
Comprehensive Pydantic schemas for all VistaVoyage models with full CRUD operations, validation, and response formatting.

## ✅ Available Schemas

### 1. Blog Schemas (`src/schemas/blog_schemas.py`)
- **BlogCreateModel**: Create new blog posts with image support
- **BlogUpdateModel**: Update existing blog posts
- **BlogResponseModel**: Full blog post response with all fields
- **BlogListResponseModel**: Paginated list of blog posts
- **BlogSummaryResponseModel**: Summary view without full content
- **BlogCategoryEnum**: Available blog categories

**Key Fields:**
- `title`, `author`, `excerpt`, `content`, `category`
- `cover_image` (Supabase URL)
- `tags` (array), `is_published`

### 2. Package Schemas (`src/schemas/package_schemas.py`)
- **PackageCreateModel**: Create new travel packages with images
- **PackageUpdateModel**: Update existing packages
- **PackageResponseModel**: Standard package response
- **PackageListResponseModel**: Paginated package list
- **PackageDetailResponseModel**: Detailed package view
- **PackageCategoryEnum**: Package categories
- **PackageDifficultyEnum**: Difficulty levels

**Key Fields:**
- `title`, `description`, `price`, `duration`, `location`
- `featured_image`, `images` (array of Supabase URLs)
- `category`, `difficulty`, `max_group_size`

### 3. Booking Schemas (`src/schemas/booking_schemas.py`)
- **BookingCreateModel**: Create new bookings with full details
- **BookingUpdateModel**: Update booking information
- **BookingResponseModel**: Complete booking response
- **BookingListResponseModel**: Paginated booking list
- **BookingStatusUpdateModel**: Update booking status only
- **BookingStatusEnum**: Booking status options
- **PaymentStatusEnum**: Payment status options

**Key Fields:**
- Customer details: `name`, `email`, `phone`
- Emergency contact information
- Booking details: `adults`, `children`, `travel_date`, `return_date`
- Financial: `total_amount`, `paid_amount`, `discount_amount`
- Special requirements: `special_requests`, `dietary_requirements`

### 4. Destination Schemas (`src/schemas/destination_schemas.py`)
- **DestinationCreateModel**: Create new destinations with images
- **DestinationUpdateModel**: Update destination information
- **DestinationResponseModel**: Full destination response
- **DestinationListResponseModel**: Paginated destination list

**Key Fields:**
- `name`, `description`, `country`, `region`
- Location: `latitude`, `longitude`, `timezone`
- Travel info: `climate`, `best_time_to_visit`
- `featured_image`, `images` (array of Supabase URLs)

### 5. Activity Schemas (`src/schemas/activity_schemas.py`)
- **ActivityCreateModel**: Create new activities with images
- **ActivityUpdateModel**: Update activity information
- **ActivityResponseModel**: Full activity response
- **ActivityListResponseModel**: Paginated activity list
- **ActivityDifficultyEnum**: Activity difficulty levels
- **ActivityCategoryEnum**: Activity categories

**Key Fields:**
- `name`, `description`, `category`
- Activity details: `duration_hours`, `difficulty_level`
- Requirements: `equipment_required`, `age_restriction`
- `featured_image`, `images` (array of Supabase URLs)

### 6. Offer Schemas (`src/schemas/offer_schemas.py`)
- **OfferCreateModel**: Create new promotional offers
- **OfferUpdateModel**: Update existing offers
- **OfferResponseModel**: Full offer response
- **OfferListResponseModel**: Paginated offer list
- **OfferTypeEnum**: Types of offers available

**Key Fields:**
- `title`, `description`, `offer_type`
- Discount details: `discount_percentage`, `discount_amount`
- Conditions: `minimum_booking_amount`, `maximum_discount_amount`
- Validity: `valid_from`, `valid_until`, `usage_limit`
- Targeting: `applicable_packages`, `minimum_group_size`

### 7. Promo Code Schemas (`src/schemas/promo_code_schemas.py`)
- **PromoCodeCreateModel**: Create new promo codes
- **PromoCodeUpdateModel**: Update promo codes
- **PromoCodeResponseModel**: Full promo code response
- **PromoCodeListResponseModel**: Paginated promo code list
- **PromoCodeValidationModel**: Validate promo code usage
- **PromoCodeValidationResponseModel**: Validation result

**Key Fields:**
- `code` (unique identifier)
- `offer_id` (linked offer)
- Usage tracking: `usage_count`, `usage_limit`
- Validation: discount calculation and eligibility

### 8. Trip Type Schemas (`src/schemas/trip_type_schemas.py`)
- **TripTypeCreateModel**: Create new trip types
- **TripTypeUpdateModel**: Update trip type information
- **TripTypeResponseModel**: Full trip type response
- **TripTypeListResponseModel**: Paginated trip type list

**Key Fields:**
- `name`, `description`, `category`
- `icon` (for UI display)

## 🎯 Schema Features

### ✅ **Comprehensive Validation**
- Field length limits and format validation
- Numeric constraints (positive values, ranges)
- Email validation for contact fields
- Enum validation for categories and statuses

### ✅ **Image Support**
- All content schemas support image fields
- `featured_image` for primary image
- `images` array for multiple images
- Integrated with Supabase storage buckets

### ✅ **Pagination Support**
- All list responses include pagination metadata
- Standard fields: `total`, `page`, `limit`, `total_pages`
- Consistent pagination pattern across all entities

### ✅ **Response Flexibility**
- Multiple response models for different use cases
- Summary models for list views
- Detailed models for full information
- Separate models for creation, updates, and responses

### ✅ **Business Logic Integration**
- Booking schemas support complex booking workflows
- Offer and promo code validation logic
- Payment status tracking
- Status change management

## 📋 Usage Examples

### Creating Content with Images
```python
# Create package with images
package_data = PackageCreateModel(
    title="Himalayan Adventure",
    description="Epic mountain trek...",
    price=1299.99,
    duration=7,
    location="Nepal",
    category="Adventure",
    difficulty="challenging",
    max_group_size=12,
    featured_image="https://supabase.../featured.jpg",
    images=[
        "https://supabase.../img1.jpg",
        "https://supabase.../img2.jpg"
    ]
)
```

### Booking Creation
```python
# Create comprehensive booking
booking_data = BookingCreateModel(
    package_id=123,
    customer_name="John Doe",
    customer_email="john@example.com",
    customer_phone="+1234567890",
    total_amount=2599.98,
    adults=2,
    children=0,
    travel_date=datetime(2025, 8, 15),
    special_requests="Vegetarian meals please"
)
```

### Promo Code Validation
```python
# Validate promo code
validation_data = PromoCodeValidationModel(
    code="SUMMER25",
    booking_amount=1500.00,
    package_id=123,
    group_size=4
)
```

## 🔄 Migration Compatibility
All schemas are compatible with the updated database models including:
- New image fields in destinations and activities
- Enhanced booking model with all customer details
- Complete offer and promo code system
- Comprehensive trip type management

## 🚀 Ready for Development
The schema system provides:
- ✅ Type safety with Pydantic validation
- ✅ Automatic API documentation generation
- ✅ Consistent error handling
- ✅ Full CRUD operation support
- ✅ Business logic validation
- ✅ Image management integration
- ✅ Pagination and filtering support

All schemas are properly exported in `src/schemas/__init__.py` for easy importing throughout the application.
