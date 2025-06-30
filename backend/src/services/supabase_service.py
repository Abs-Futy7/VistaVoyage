import os
import uuid
from typing import Optional, Literal
from supabase import create_client, Client
from fastapi import UploadFile, HTTPException
import mimetypes
from ..config import Config


# Define bucket types
BucketType = Literal["blogs-images", "package-images", "destination-images", "activity-images"]


class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_KEY
        )
        # Define all available buckets
        self.buckets = {
            "blogs-images": "blogs-images",
            "package-images": "package-images", 
            "destination-images": "destination-images",
            "activity-images": "activity-images"
        }
    
    async def upload_image(self, file: UploadFile, bucket_type: BucketType) -> str:
        """
        Upload an image to the specified Supabase storage bucket and return the public URL
        """
        try:
            # Validate bucket type
            if bucket_type not in self.buckets:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid bucket type. Must be one of: {list(self.buckets.keys())}"
                )
            
            # Validate file type
            if not self._is_valid_image(file.filename):
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid file type. Only images (jpg, jpeg, png, gif, webp) are allowed."
                )
            
            # Generate unique filename
            file_extension = self._get_file_extension(file.filename)
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Read file content
            file_content = await file.read()
            
            # Upload to Supabase storage
            bucket_name = self.buckets[bucket_type]
            response = self.supabase.storage.from_(bucket_name).upload(
                path=unique_filename,
                file=file_content,
                file_options={
                    "content-type": file.content_type or self._get_content_type(file.filename)
                }
            )
            
            # Check if upload was successful
            # The response should be successful if no exception was raised
            if not response:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to upload image: No response from storage service"
                )
            
            # Get public URL
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(unique_filename)
            
            return public_url
            
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while uploading the image: {str(e)}"
            )
    
    # Specific upload methods for each bucket type
    async def upload_blog_image(self, file: UploadFile) -> str:
        """Upload a blog image to Supabase storage and return the public URL"""
        return await self.upload_image(file, "blogs-images")
    
    async def upload_package_image(self, file: UploadFile) -> str:
        """Upload a package image to Supabase storage and return the public URL"""
        return await self.upload_image(file, "package-images")
    
    async def upload_destination_image(self, file: UploadFile) -> str:
        """Upload a destination image to Supabase storage and return the public URL"""
        return await self.upload_image(file, "destination-images")
    
    async def upload_activity_image(self, file: UploadFile) -> str:
        """Upload an activity image to Supabase storage and return the public URL"""
        return await self.upload_image(file, "activity-images")
    
    async def delete_image(self, image_url: str, bucket_type: BucketType) -> bool:
        """
        Delete an image from the specified Supabase storage bucket using its URL
        """
        try:
            # Validate bucket type
            if bucket_type not in self.buckets:
                return False
            
            # Extract filename from URL
            filename = self._extract_filename_from_url(image_url)
            if not filename:
                return False
            
            # Delete from Supabase storage
            bucket_name = self.buckets[bucket_type]
            response = self.supabase.storage.from_(bucket_name).remove([filename])
            
            # If no exception was raised, consider it successful
            return True
            
        except Exception as e:
            print(f"Error deleting image: {str(e)}")
            return False
    
    # Specific delete methods for each bucket type
    async def delete_blog_image(self, image_url: str) -> bool:
        """Delete a blog image from Supabase storage using its URL"""
        return await self.delete_image(image_url, "blogs-images")
    
    async def delete_package_image(self, image_url: str) -> bool:
        """Delete a package image from Supabase storage using its URL"""
        return await self.delete_image(image_url, "package-images")
    
    async def delete_destination_image(self, image_url: str) -> bool:
        """Delete a destination image from Supabase storage using its URL"""
        return await self.delete_image(image_url, "destination-images")
    
    async def delete_activity_image(self, image_url: str) -> bool:
        """Delete an activity image from Supabase storage using its URL"""
        return await self.delete_image(image_url, "activity-images")
    
    async def list_images(self, bucket_type: BucketType, limit: int = 100, offset: int = 0) -> list:
        """
        List images in the specified bucket
        """
        try:
            if bucket_type not in self.buckets:
                return []
            
            bucket_name = self.buckets[bucket_type]
            response = self.supabase.storage.from_(bucket_name).list(
                path="",
                limit=limit,
                offset=offset
            )
            
            # Return the response data, or empty list if None
            return response if response else []
            
        except Exception as e:
            print(f"Error listing images: {str(e)}")
            return []
        
        
    def get_bucket_info(self) -> dict:
        """Get information about all available buckets"""
        return {
            "available_buckets": list(self.buckets.keys()),
            "bucket_descriptions": {
                "blogs-images": "Images for blog posts and articles",
                "package-images": "Images for travel packages",
                "destination-images": "Images for travel destinations",
                "activity-images": "Images for activities and attractions"
            }
        }
    
    def _is_valid_image(self, filename: str) -> bool:
        """Check if the file is a valid image type"""
        if not filename:
            return False
        
        valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        file_extension = self._get_file_extension(filename).lower()
        return file_extension in valid_extensions
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return os.path.splitext(filename)[1].lower()
    
    def _get_content_type(self, filename: str) -> str:
        """Get MIME type from filename"""
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'
    
    def _extract_filename_from_url(self, url: str) -> Optional[str]:
        """Extract filename from Supabase public URL"""
        try:
            # Supabase URLs typically end with the filename
            # Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
            parts = url.split('/')
            if parts and len(parts) > 0:
                return parts[-1]
            return None
        except Exception:
            return None
        
    


# Create a singleton instance
supabase_service = SupabaseService()
