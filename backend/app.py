from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

# Initialize the FastAPI app
app = FastAPI(title="Housing Price Predictor API")

# Load the saved pipeline (do this outside the endpoint so it only loads once)
model = joblib.load('housing_model.pkl')

# Define the expected input data format using Pydantic
# (Make sure these match the exact column names your model expects!)
class HousingData(BaseModel):
    longitude: float
    latitude: float
    housing_median_age: float
    total_rooms: float
    total_bedrooms: float
    population: float
    households: float
    median_income: float
    ocean_proximity: str

@app.post("/predict")
def predict_price(data: HousingData):
    try:
        # Convert the incoming JSON data into a Pandas DataFrame
        input_df = pd.DataFrame([data.model_dump()])
        input_df["rooms_per_household"] = input_df["total_rooms"] / input_df["households"]
        input_df["bedrooms_per_room"] = input_df["total_bedrooms"] / input_df["total_rooms"]
        input_df["population_per_household"] = input_df["population"] / input_df["households"]
        # Pass the DataFrame to the pipeline
        # The pipeline will automatically handle the scaling and encoding
        prediction = model.predict(input_df)
        
        # Return the prediction as a JSON response
        return {"predicted_price": float(prediction[0])}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Root endpoint just to check if the server is running
@app.get("/")
def read_root():
    return {"message": "Housing Predictor API is up and running!"}