"""
Image utilities for VistaVoyage backend
Provides helper functions for image management across all models
"""
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from ..services.supabase_service import supabase_service


class ImageManager:
    """Central image management utility for all VistaVoyage entities"""
    
    BUCKET_MAPPING = {
        'blog': 'blogs-images',
        'package': 'package-images', 
        'destination': 'destination-images',
        'activity': 'activity-images'
    }
    
    @classmethod
    async def upload_image(cls, file: UploadFile, entity_type: str) -> str:
        """
        Upload an image for a specific entity type
        
        Args:
            file: The uploaded file
            entity_type: Type of entity (blog, package, destination, activity)
            
        Returns:
            Public URL of the uploaded image
        """
        if entity_type not in cls.BUCKET_MAPPING:
            raise ValueError(f"Invalid entity type: {entity_type}")
        
        bucket_type = cls.BUCKET_MAPPING[entity_type]
        
        if entity_type == 'blog':
            return await supabase_service.upload_blog_image(file)
        elif entity_type == 'package':
            return await supabase_service.upload_package_image(file)
        elif entity_type == 'destination':
            return await supabase_service.upload_destination_image(file)
        elif entity_type == 'activity':
            return await supabase_service.upload_activity_image(file)
    
    @classmethod
    async def delete_image(cls, image_url: str, entity_type: str) -> bool:
        """
        Delete an image for a specific entity type
        
        Args:
            image_url: URL of the image to delete
            entity_type: Type of entity (blog, package, destination, activity)
            
        Returns:
            True if deletion was successful
        """
        if entity_type not in cls.BUCKET_MAPPING:
            return False
        
        if entity_type == 'blog':
            return await supabase_service.delete_blog_image(image_url)
        elif entity_type == 'package':
            return await supabase_service.delete_package_image(image_url)
        elif entity_type == 'destination':
            return await supabase_service.delete_destination_image(image_url)
        elif entity_type == 'activity':
            return await supabase_service.delete_activity_image(image_url)
        
        return False
    
    @classmethod
    async def upload_multiple_images(cls, files: List[UploadFile], entity_type: str) -> List[str]:
        """
        Upload multiple images for a specific entity type
        
        Args:
            files: List of uploaded files
            entity_type: Type of entity (blog, package, destination, activity)
            
        Returns:
            List of public URLs of the uploaded images
        """
        urls = []
        for file in files:
            try:
                url = await cls.upload_image(file, entity_type)
                urls.append(url)
            except Exception as e:
                print(f"Failed to upload image {file.filename}: {str(e)}")
                continue
        
        return urls
    
    @classmethod
    async def delete_multiple_images(cls, image_urls: List[str], entity_type: str) -> Dict[str, bool]:
        """
        Delete multiple images for a specific entity type
        
        Args:
            image_urls: List of image URLs to delete
            entity_type: Type of entity (blog, package, destination, activity)
            
        Returns:
            Dictionary mapping image URLs to deletion success status
        """
        results = {}
        for url in image_urls:
            try:
                success = await cls.delete_image(url, entity_type)
                results[url] = success
            except Exception as e:
                print(f"Failed to delete image {url}: {str(e)}")
                results[url] = False
        
        return results
    
    @classmethod
    def get_supported_entities(cls) -> List[str]:
        """Get list of supported entity types"""
        return list(cls.BUCKET_MAPPING.keys())
    
    @classmethod
    def get_bucket_for_entity(cls, entity_type: str) -> Optional[str]:
        """Get bucket name for a specific entity type"""
        return cls.BUCKET_MAPPING.get(entity_type)
    
    @classmethod
    def validate_entity_type(cls, entity_type: str) -> bool:
        """Validate if entity type is supported"""
        return entity_type in cls.BUCKET_MAPPING


# Convenience functions
async def upload_blog_image(file: UploadFile) -> str:
    """Upload a blog image"""
    return await ImageManager.upload_image(file, 'blog')

async def upload_package_image(file: UploadFile) -> str:
    """Upload a package image"""
    return await ImageManager.upload_image(file, 'package')

async def upload_destination_image(file: UploadFile) -> str:
    """Upload a destination image"""
    return await ImageManager.upload_image(file, 'destination')

async def upload_activity_image(file: UploadFile) -> str:
    """Upload an activity image"""
    return await ImageManager.upload_image(file, 'activity')

async def delete_blog_image(image_url: str) -> bool:
    """Delete a blog image"""
    return await ImageManager.delete_image(image_url, 'blog')

async def delete_package_image(image_url: str) -> bool:
    """Delete a package image"""
    return await ImageManager.delete_image(image_url, 'package')

async def delete_destination_image(image_url: str) -> bool:
    """Delete a destination image"""
    return await ImageManager.delete_image(image_url, 'destination')

async def delete_activity_image(image_url: str) -> bool:
    """Delete an activity image"""
    return await ImageManager.delete_image(image_url, 'activity')
