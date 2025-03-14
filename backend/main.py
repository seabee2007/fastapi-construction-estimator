
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Construction Estimator API!"}

# Future endpoints will be added here.
