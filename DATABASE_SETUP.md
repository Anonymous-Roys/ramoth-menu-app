# Database Setup for Ramoth Menu App

## Quick Setup

1. **Run the main setup script in Supabase SQL Editor:**
   ```sql
   -- Copy and paste the contents of setup-database.sql
   ```

2. **Add profile fields (if upgrading existing database):**
   ```sql
   -- Copy and paste the contents of profile-setup.sql
   ```

## Database Schema

### Users Table
- `id` - UUID primary key
- `generated_id` - Unique user identifier (e.g., "darhin4332")
- `first_name` - User's first name (read-only)
- `last_name` - User's last name (read-only)
- `name` - Full name (generated field)
- `department` - User's department (editable)
- `role` - admin/worker/distributor
- `unique_number` - 4-digit unique number
- `phone` - Phone number (editable)
- `email` - Email address (editable)
- `profilePicture` - Base64 image data (editable)

### Meals Table
- `id` - UUID primary key
- `name` - Meal name
- `description` - Meal description
- `date` - Date for the meal

### Meal Selections Table
- `id` - UUID primary key
- `user_id` - References users.generated_id
- `meal_id` - References meals.id
- `date` - Selection date
- `time` - Selection time
- `collected` - Collection status

## Security (RLS Policies)

- Users can read all user data (for admin functions)
- Users can only update their own profile
- Admins can manage all users
- Users can only manage their own meal selections
- Distributors can update collection status

## Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Profile Picture Storage

Profile pictures are stored as base64 strings in the database:
- Maximum size: 2MB
- Supported formats: All image types
- Automatic validation in frontend