import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import numpy as np

def predict_demand(sales_data):
    df = pd.DataFrame(sales_data)
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    
    predictions = []
    
    for medicine in df['medicine_name'].unique():
        med_sales = df[df['medicine_name'] == medicine].sort_values('sale_date')
        
        if len(med_sales) < 3:
            continue
        
        med_sales['days'] = (med_sales['sale_date'] - med_sales['sale_date'].min()).dt.days
        
        X = med_sales['days'].values.reshape(-1, 1)
        y = med_sales['quantity'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        last_day = med_sales['days'].max()
        next_7_days = np.array([last_day + i for i in range(1, 8)]).reshape(-1, 1)
        pred = model.predict(next_7_days)
        
        avg_prediction = max(0, pred.mean())
        confidence = min(0.95, model.score(X, y))
        
        predictions.append({
            "medicine_name": medicine,
            "predicted_demand": round(avg_prediction, 2),
            "confidence": round(confidence, 2),
            "recommendation": "reorder" if avg_prediction > 10 else "sufficient"
        })
    
    return sorted(predictions, key=lambda x: x['predicted_demand'], reverse=True)