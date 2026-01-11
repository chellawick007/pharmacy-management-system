from fastapi import APIRouter, HTTPException
from app.database import get_database
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_notifications(
    read: Optional[bool] = None,
    priority: Optional[str] = None,
    limit: int = 50
):
    """
    Get all notifications with optional filters.
    """
    db = get_database()
    
    try:
        # Build query
        query = {}
        if read is not None:
            query["read"] = read
        if priority:
            query["priority"] = priority
        
        # Fetch notifications, sorted by creation date (newest first)
        notifications_cursor = db.notifications.find(query).sort("created_at", -1).limit(limit)
        notifications = await notifications_cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for notif in notifications:
            notif["_id"] = str(notif["_id"])
        
        return notifications
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")


@router.get("/unread-count")
async def get_unread_count():
    """
    Get count of unread notifications.
    """
    db = get_database()
    
    try:
        count = await db.notifications.count_documents({"read": False})
        return {"unread_count": count}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting notifications: {str(e)}")


@router.post("/generate")
async def generate_notifications():
    """
    Manually trigger notification generation based on current inventory status.
    This checks for low stock, expiring medicines, and expired items.
    """
    db = get_database()
    
    try:
        # Get all medicines
        medicines_cursor = db.medicines.find()
        medicines = await medicines_cursor.to_list(length=10000)
        
        today = datetime.now()
        notifications_created = 0
        
        for med in medicines:
            med_id = str(med["_id"])
            med_name = med.get("name", "Unknown")
            quantity = med.get("quantity", 0)
            reorder_level = med.get("reorder_level", 50)
            
            # Check for low stock
            if quantity < reorder_level and quantity > 0:
                # Check if notification already exists for this medicine (within last 24 hours)
                existing = await db.notifications.find_one({
                    "type": "low_stock",
                    "medicine_id": med_id,
                    "created_at": {"$gte": (today - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")}
                })
                
                if not existing:
                    notification = {
                        "type": "low_stock",
                        "priority": "warning",
                        "title": "Low Stock Alert",
                        "message": f"{med_name} is running low. Current stock: {quantity}, Reorder level: {reorder_level}",
                        "medicine_id": med_id,
                        "medicine_name": med_name,
                        "read": False,
                        "created_at": today.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    await db.notifications.insert_one(notification)
                    notifications_created += 1
            
            # Check for out of stock
            elif quantity == 0:
                existing = await db.notifications.find_one({
                    "type": "out_of_stock",
                    "medicine_id": med_id,
                    "created_at": {"$gte": (today - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")}
                })
                
                if not existing:
                    notification = {
                        "type": "out_of_stock",
                        "priority": "critical",
                        "title": "Out of Stock",
                        "message": f"{med_name} is out of stock. Immediate reorder required!",
                        "medicine_id": med_id,
                        "medicine_name": med_name,
                        "read": False,
                        "created_at": today.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    await db.notifications.insert_one(notification)
                    notifications_created += 1
            
            # Check for expiring medicines
            expiry_str = med.get("expiry_date", "")
            if expiry_str:
                try:
                    expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d")
                    days_to_expiry = (expiry_date - today).days
                    
                    # Expired
                    if days_to_expiry < 0:
                        existing = await db.notifications.find_one({
                            "type": "expired",
                            "medicine_id": med_id,
                            "created_at": {"$gte": (today - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")}
                        })
                        
                        if not existing:
                            notification = {
                                "type": "expired",
                                "priority": "critical",
                                "title": "Medicine Expired",
                                "message": f"{med_name} has expired. Remove from inventory immediately!",
                                "medicine_id": med_id,
                                "medicine_name": med_name,
                                "read": False,
                                "created_at": today.strftime("%Y-%m-%d %H:%M:%S")
                            }
                            await db.notifications.insert_one(notification)
                            notifications_created += 1
                    
                    # Expiring within 30 days
                    elif days_to_expiry <= 30:
                        existing = await db.notifications.find_one({
                            "type": "expiring_soon",
                            "medicine_id": med_id,
                            "created_at": {"$gte": (today - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")}
                        })
                        
                        if not existing:
                            priority = "critical" if days_to_expiry <= 7 else "warning"
                            notification = {
                                "type": "expiring_soon",
                                "priority": priority,
                                "title": "Medicine Expiring Soon",
                                "message": f"{med_name} will expire in {days_to_expiry} days (Expiry: {expiry_str})",
                                "medicine_id": med_id,
                                "medicine_name": med_name,
                                "read": False,
                                "created_at": today.strftime("%Y-%m-%d %H:%M:%S")
                            }
                            await db.notifications.insert_one(notification)
                            notifications_created += 1
                
                except ValueError:
                    pass
        
        return {
            "message": f"Generated {notifications_created} new notifications",
            "notifications_created": notifications_created
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating notifications: {str(e)}")


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """
    Mark a notification as read.
    """
    db = get_database()
    
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True, "read_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification marked as read"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notification as read: {str(e)}")


@router.put("/mark-all-read")
async def mark_all_as_read():
    """
    Mark all notifications as read.
    """
    db = get_database()
    
    try:
        result = await db.notifications.update_many(
            {"read": False},
            {"$set": {"read": True, "read_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
        )
        
        return {
            "message": f"Marked {result.modified_count} notifications as read",
            "count": result.modified_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notifications as read: {str(e)}")


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """
    Delete a specific notification.
    """
    db = get_database()
    
    try:
        result = await db.notifications.delete_one({"_id": ObjectId(notification_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")


@router.delete("/clear-all")
async def clear_all_notifications():
    """
    Delete all read notifications.
    """
    db = get_database()
    
    try:
        result = await db.notifications.delete_many({"read": True})
        
        return {
            "message": f"Cleared {result.deleted_count} read notifications",
            "count": result.deleted_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing notifications: {str(e)}")


@router.get("/summary")
async def get_notification_summary():
    """
    Get summary of notifications by type and priority.
    """
    db = get_database()
    
    try:
        # Count by priority
        critical_count = await db.notifications.count_documents({"priority": "critical", "read": False})
        warning_count = await db.notifications.count_documents({"priority": "warning", "read": False})
        info_count = await db.notifications.count_documents({"priority": "info", "read": False})
        
        # Count by type
        low_stock_count = await db.notifications.count_documents({"type": "low_stock", "read": False})
        out_of_stock_count = await db.notifications.count_documents({"type": "out_of_stock", "read": False})
        expiring_count = await db.notifications.count_documents({"type": "expiring_soon", "read": False})
        expired_count = await db.notifications.count_documents({"type": "expired", "read": False})
        
        return {
            "by_priority": {
                "critical": critical_count,
                "warning": warning_count,
                "info": info_count
            },
            "by_type": {
                "low_stock": low_stock_count,
                "out_of_stock": out_of_stock_count,
                "expiring_soon": expiring_count,
                "expired": expired_count
            },
            "total_unread": critical_count + warning_count + info_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notification summary: {str(e)}")
