from fastapi import APIRouter, HTTPException, Query
from app.database import get_database
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId

router = APIRouter()


def parse_date(date_str: str) -> datetime:
    """Parse date string in YYYY-MM-DD format."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/sales")
async def get_sales_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    period: Optional[str] = Query("monthly", description="Period: daily, weekly, monthly, yearly")
):
    """
    Get comprehensive sales report with analytics.
    """
    db = get_database()
    
    # Set default date range (last 30 days if not provided)
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    start = parse_date(start_date)
    end = parse_date(end_date)
    
    # Ensure end date includes the entire day
    end = end.replace(hour=23, minute=59, second=59)
    
    try:
        # Get all sales in date range
        sales_cursor = db.sales.find({
            "sale_date": {
                "$gte": start.strftime("%Y-%m-%d"),
                "$lte": end.strftime("%Y-%m-%d")
            }
        })
        sales = await sales_cursor.to_list(length=10000)
        
        # Get all bills in date range
        bills_cursor = db.bills.find({
            "created_at": {
                "$gte": start.strftime("%Y-%m-%d"),
                "$lte": end.strftime("%Y-%m-%d")
            }
        })
        bills = await bills_cursor.to_list(length=10000)
        
        # Calculate total revenue from bills
        total_revenue = sum(bill["grand_total"] for bill in bills)
        total_sales_count = len(sales)
        total_bills_count = len(bills)
        
        # Calculate subtotal (before GST) from bills
        total_subtotal = sum(bill["subtotal"] for bill in bills)
        total_gst = sum(bill["gst_amount"] for bill in bills)
        
        # Category-wise sales analysis
        category_sales = {}
        for sale in sales:
            # Get medicine details to find category
            medicine = await db.medicines.find_one({"_id": ObjectId(sale["medicine_id"])})
            if medicine:
                category = medicine.get("category", "Unknown")
                if category not in category_sales:
                    category_sales[category] = {
                        "category": category,
                        "total_sales": 0,
                        "total_quantity": 0,
                        "total_revenue": 0
                    }
                category_sales[category]["total_sales"] += 1
                category_sales[category]["total_quantity"] += sale["quantity"]
                category_sales[category]["total_revenue"] += sale["total"]
        
        category_analysis = list(category_sales.values())
        category_analysis.sort(key=lambda x: x["total_revenue"], reverse=True)
        
        # Top-selling medicines
        medicine_sales = {}
        for sale in sales:
            med_id = sale["medicine_id"]
            if med_id not in medicine_sales:
                medicine_sales[med_id] = {
                    "medicine_id": med_id,
                    "medicine_name": sale["medicine_name"],
                    "total_quantity": 0,
                    "total_revenue": 0,
                    "sales_count": 0
                }
            medicine_sales[med_id]["total_quantity"] += sale["quantity"]
            medicine_sales[med_id]["total_revenue"] += sale["total"]
            medicine_sales[med_id]["sales_count"] += 1
        
        top_medicines = sorted(
            medicine_sales.values(),
            key=lambda x: x["total_revenue"],
            reverse=True
        )[:10]
        
        # Sales by payment mode (from bills)
        payment_mode_sales = {}
        for bill in bills:
            mode = bill.get("payment_mode", "Unknown")
            if mode not in payment_mode_sales:
                payment_mode_sales[mode] = {
                    "payment_mode": mode,
                    "count": 0,
                    "total_amount": 0
                }
            payment_mode_sales[mode]["count"] += 1
            payment_mode_sales[mode]["total_amount"] += bill["grand_total"]
        
        payment_analysis = list(payment_mode_sales.values())
        
        # Revenue trends based on period
        trends = []
        if period == "daily":
            # Daily trends
            current = start
            while current <= end:
                day_str = current.strftime("%Y-%m-%d")
                day_sales = [s for s in sales if s["sale_date"] == day_str]
                day_bills = [b for b in bills if b["created_at"].startswith(day_str)]
                
                trends.append({
                    "date": day_str,
                    "label": current.strftime("%b %d"),
                    "sales_count": len(day_sales),
                    "bills_count": len(day_bills),
                    "revenue": sum(b["grand_total"] for b in day_bills),
                    "quantity_sold": sum(s["quantity"] for s in day_sales)
                })
                current += timedelta(days=1)
        
        elif period == "weekly":
            # Weekly trends
            current = start
            week_num = 1
            while current <= end:
                week_end = min(current + timedelta(days=6), end)
                week_sales = [s for s in sales if 
                            start <= datetime.strptime(s["sale_date"], "%Y-%m-%d") <= week_end]
                week_bills = [b for b in bills if 
                            start <= datetime.strptime(b["created_at"][:10], "%Y-%m-%d") <= week_end]
                
                trends.append({
                    "date": current.strftime("%Y-%m-%d"),
                    "label": f"Week {week_num}",
                    "sales_count": len(week_sales),
                    "bills_count": len(week_bills),
                    "revenue": sum(b["grand_total"] for b in week_bills),
                    "quantity_sold": sum(s["quantity"] for s in week_sales)
                })
                current = week_end + timedelta(days=1)
                week_num += 1
        
        elif period == "monthly":
            # Monthly trends
            months = {}
            for sale in sales:
                sale_date = datetime.strptime(sale["sale_date"], "%Y-%m-%d")
                month_key = sale_date.strftime("%Y-%m")
                if month_key not in months:
                    months[month_key] = {
                        "date": month_key + "-01",
                        "label": sale_date.strftime("%b %Y"),
                        "sales_count": 0,
                        "bills_count": 0,
                        "revenue": 0,
                        "quantity_sold": 0
                    }
                months[month_key]["sales_count"] += 1
                months[month_key]["quantity_sold"] += sale["quantity"]
            
            for bill in bills:
                bill_date = datetime.strptime(bill["created_at"][:10], "%Y-%m-%d")
                month_key = bill_date.strftime("%Y-%m")
                if month_key in months:
                    months[month_key]["bills_count"] += 1
                    months[month_key]["revenue"] += bill["grand_total"]
            
            trends = sorted(months.values(), key=lambda x: x["date"])
        
        elif period == "yearly":
            # Yearly trends
            years = {}
            for sale in sales:
                sale_date = datetime.strptime(sale["sale_date"], "%Y-%m-%d")
                year_key = sale_date.strftime("%Y")
                if year_key not in years:
                    years[year_key] = {
                        "date": year_key + "-01-01",
                        "label": year_key,
                        "sales_count": 0,
                        "bills_count": 0,
                        "revenue": 0,
                        "quantity_sold": 0
                    }
                years[year_key]["sales_count"] += 1
                years[year_key]["quantity_sold"] += sale["quantity"]
            
            for bill in bills:
                bill_date = datetime.strptime(bill["created_at"][:10], "%Y-%m-%d")
                year_key = bill_date.strftime("%Y")
                if year_key in years:
                    years[year_key]["bills_count"] += 1
                    years[year_key]["revenue"] += bill["grand_total"]
            
            trends = sorted(years.values(), key=lambda x: x["date"])
        
        # Calculate average values
        avg_bill_value = total_revenue / total_bills_count if total_bills_count > 0 else 0
        avg_items_per_bill = total_sales_count / total_bills_count if total_bills_count > 0 else 0
        
        return {
            "summary": {
                "total_revenue": round(total_revenue, 2),
                "total_subtotal": round(total_subtotal, 2),
                "total_gst": round(total_gst, 2),
                "total_sales": total_sales_count,
                "total_bills": total_bills_count,
                "avg_bill_value": round(avg_bill_value, 2),
                "avg_items_per_bill": round(avg_items_per_bill, 2),
                "start_date": start_date,
                "end_date": end_date,
                "period": period
            },
            "category_analysis": category_analysis,
            "top_medicines": top_medicines,
            "payment_analysis": payment_analysis,
            "trends": trends
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sales report: {str(e)}")


@router.get("/inventory")
async def get_inventory_report(
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Get comprehensive inventory report with analytics.
    """
    db = get_database()
    
    try:
        # Build query
        query = {}
        if category:
            query["category"] = category
        
        # Get all medicines
        medicines_cursor = db.medicines.find(query)
        medicines = await medicines_cursor.to_list(length=10000)
        
        # Current date for expiry calculations
        today = datetime.now()
        
        # Initialize metrics
        total_value = 0
        expired_items = []
        expiring_soon = []  # Within 30 days
        low_stock_items = []
        out_of_stock = []
        slow_moving = []
        fast_moving = []
        
        for med in medicines:
            med_id = str(med["_id"])
            quantity = med.get("quantity", 0)
            price = med.get("price", 0)
            reorder_level = med.get("reorder_level", 50)
            
            # Calculate total value
            item_value = quantity * price
            total_value += item_value
            
            # Parse expiry date
            expiry_str = med.get("expiry_date", "")
            try:
                expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d")
                days_to_expiry = (expiry_date - today).days
                
                # Categorize by expiry
                if days_to_expiry < 0:
                    expired_items.append({
                        "medicine_id": med_id,
                        "name": med["name"],
                        "batch_no": med.get("batch_no", "N/A"),
                        "quantity": quantity,
                        "expiry_date": expiry_str,
                        "days_expired": abs(days_to_expiry),
                        "value_loss": round(item_value, 2)
                    })
                elif days_to_expiry <= 30:
                    expiring_soon.append({
                        "medicine_id": med_id,
                        "name": med["name"],
                        "batch_no": med.get("batch_no", "N/A"),
                        "quantity": quantity,
                        "expiry_date": expiry_str,
                        "days_to_expiry": days_to_expiry,
                        "value": round(item_value, 2)
                    })
            except ValueError:
                pass
            
            # Stock level analysis
            if quantity == 0:
                out_of_stock.append({
                    "medicine_id": med_id,
                    "name": med["name"],
                    "reorder_level": reorder_level,
                    "last_price": price
                })
            elif quantity < reorder_level:
                low_stock_items.append({
                    "medicine_id": med_id,
                    "name": med["name"],
                    "quantity": quantity,
                    "reorder_level": reorder_level,
                    "shortage": reorder_level - quantity,
                    "value": round(item_value, 2)
                })
            
            # Get sales data for this medicine (last 30 days)
            thirty_days_ago = (today - timedelta(days=30)).strftime("%Y-%m-%d")
            sales_count = await db.sales.count_documents({
                "medicine_id": med_id,
                "sale_date": {"$gte": thirty_days_ago}
            })
            
            # Get total quantity sold
            sales_cursor = db.sales.find({
                "medicine_id": med_id,
                "sale_date": {"$gte": thirty_days_ago}
            })
            sales = await sales_cursor.to_list(length=1000)
            total_sold = sum(s.get("quantity", 0) for s in sales)
            
            # Calculate turnover ratio (sales per month / current stock)
            turnover_ratio = (total_sold / quantity) if quantity > 0 else 0
            
            # Categorize as fast or slow moving
            med_data = {
                "medicine_id": med_id,
                "name": med["name"],
                "category": med.get("category", "Unknown"),
                "quantity": quantity,
                "sold_last_30_days": total_sold,
                "sales_count": sales_count,
                "turnover_ratio": round(turnover_ratio, 2),
                "value": round(item_value, 2)
            }
            
            if turnover_ratio >= 0.5:  # Sold 50% or more of stock in 30 days
                fast_moving.append(med_data)
            elif turnover_ratio < 0.1 and quantity > 0:  # Sold less than 10% in 30 days
                slow_moving.append(med_data)
        
        # Sort lists
        expired_items.sort(key=lambda x: x["value_loss"], reverse=True)
        expiring_soon.sort(key=lambda x: x["days_to_expiry"])
        low_stock_items.sort(key=lambda x: x["shortage"], reverse=True)
        fast_moving.sort(key=lambda x: x["turnover_ratio"], reverse=True)
        slow_moving.sort(key=lambda x: x["sold_last_30_days"])
        
        # Stock valuation by category
        category_valuation = {}
        for med in medicines:
            cat = med.get("category", "Unknown")
            if cat not in category_valuation:
                category_valuation[cat] = {
                    "category": cat,
                    "total_items": 0,
                    "total_quantity": 0,
                    "total_value": 0
                }
            category_valuation[cat]["total_items"] += 1
            category_valuation[cat]["total_quantity"] += med.get("quantity", 0)
            category_valuation[cat]["total_value"] += med.get("quantity", 0) * med.get("price", 0)
        
        valuation_by_category = sorted(
            category_valuation.values(),
            key=lambda x: x["total_value"],
            reverse=True
        )
        
        # Reorder suggestions (low stock + fast moving)
        reorder_suggestions = []
        for item in low_stock_items[:20]:  # Top 20 low stock items
            # Check if it's also fast moving
            is_fast_moving = any(fm["medicine_id"] == item["medicine_id"] for fm in fast_moving)
            reorder_suggestions.append({
                **item,
                "priority": "High" if is_fast_moving else "Medium",
                "suggested_quantity": item["reorder_level"] * 2  # Suggest ordering 2x reorder level
            })
        
        return {
            "summary": {
                "total_medicines": len(medicines),
                "total_stock_value": round(total_value, 2),
                "expired_count": len(expired_items),
                "expiring_soon_count": len(expiring_soon),
                "low_stock_count": len(low_stock_items),
                "out_of_stock_count": len(out_of_stock),
                "fast_moving_count": len(fast_moving),
                "slow_moving_count": len(slow_moving)
            },
            "stock_valuation": valuation_by_category,
            "expired_items": expired_items[:20],  # Top 20
            "expiring_soon": expiring_soon[:20],  # Top 20
            "low_stock_items": low_stock_items[:20],  # Top 20
            "out_of_stock": out_of_stock,
            "fast_moving": fast_moving[:20],  # Top 20
            "slow_moving": slow_moving[:20],  # Top 20
            "reorder_suggestions": reorder_suggestions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating inventory report: {str(e)}")


@router.get("/customers")
async def get_customer_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get comprehensive customer report with analytics.
    """
    db = get_database()
    
    # Set default date range (last 30 days if not provided)
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    start = parse_date(start_date)
    end = parse_date(end_date)
    
    try:
        # Get all customers
        customers_cursor = db.customers.find()
        customers = await customers_cursor.to_list(length=10000)
        
        # Get all bills in date range
        bills_cursor = db.bills.find({
            "created_at": {
                "$gte": start.strftime("%Y-%m-%d"),
                "$lte": end.strftime("%Y-%m-%d")
            }
        })
        bills = await bills_cursor.to_list(length=10000)
        
        # Calculate customer purchase patterns
        customer_purchases = {}
        for bill in bills:
            customer_name = bill.get("customer_name", "Walk-in")
            if customer_name not in customer_purchases:
                customer_purchases[customer_name] = {
                    "customer_name": customer_name,
                    "customer_phone": bill.get("customer_phone", "N/A"),
                    "total_purchases": 0,
                    "total_spent": 0,
                    "bills_count": 0,
                    "avg_bill_value": 0,
                    "last_purchase": bill.get("created_at", "")
                }
            customer_purchases[customer_name]["bills_count"] += 1
            customer_purchases[customer_name]["total_spent"] += bill["grand_total"]
            customer_purchases[customer_name]["total_purchases"] += len(bill.get("items", []))
        
        # Calculate averages and sort
        for customer in customer_purchases.values():
            if customer["bills_count"] > 0:
                customer["avg_bill_value"] = round(
                    customer["total_spent"] / customer["bills_count"], 2
                )
            customer["total_spent"] = round(customer["total_spent"], 2)
        
        # Top customers by revenue
        top_customers = sorted(
            customer_purchases.values(),
            key=lambda x: x["total_spent"],
            reverse=True
        )[:20]
        
        # New vs Returning customers (based on customer creation date)
        new_customers = []
        returning_customers = []
        
        for customer in customers:
            created_at = customer.get("created_at", "")
            try:
                created_date = datetime.strptime(created_at[:10], "%Y-%m-%d")
                if start <= created_date <= end:
                    new_customers.append(customer)
                else:
                    returning_customers.append(customer)
            except (ValueError, TypeError):
                returning_customers.append(customer)
        
        # Customer retention rate
        total_customers = len(customers)
        customers_with_purchases = len(customer_purchases)
        retention_rate = (customers_with_purchases / total_customers * 100) if total_customers > 0 else 0
        
        # Purchase frequency distribution
        frequency_distribution = {
            "1_purchase": 0,
            "2-5_purchases": 0,
            "6-10_purchases": 0,
            "11+_purchases": 0
        }
        
        for customer in customer_purchases.values():
            bills = customer["bills_count"]
            if bills == 1:
                frequency_distribution["1_purchase"] += 1
            elif bills <= 5:
                frequency_distribution["2-5_purchases"] += 1
            elif bills <= 10:
                frequency_distribution["6-10_purchases"] += 1
            else:
                frequency_distribution["11+_purchases"] += 1
        
        return {
            "summary": {
                "total_customers": total_customers,
                "new_customers": len(new_customers),
                "returning_customers": len(returning_customers),
                "customers_with_purchases": customers_with_purchases,
                "retention_rate": round(retention_rate, 2),
                "total_revenue": round(sum(c["total_spent"] for c in customer_purchases.values()), 2),
                "avg_customer_value": round(
                    sum(c["total_spent"] for c in customer_purchases.values()) / customers_with_purchases, 2
                ) if customers_with_purchases > 0 else 0,
                "start_date": start_date,
                "end_date": end_date
            },
            "top_customers": top_customers,
            "new_customers": [
                {
                    "name": c.get("name", "Unknown"),
                    "email": c.get("email", "N/A"),
                    "phone": c.get("phone", "N/A"),
                    "created_at": c.get("created_at", "")
                }
                for c in new_customers[:20]
            ],
            "purchase_frequency": frequency_distribution,
            "all_customer_purchases": sorted(
                customer_purchases.values(),
                key=lambda x: x["total_spent"],
                reverse=True
            )
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating customer report: {str(e)}")
