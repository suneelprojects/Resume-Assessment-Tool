# Step 1: Use a base image for Python
FROM python:3.10-slim

# Step 2: Set a working directory
WORKDIR /app

# Step 3: Copy only requirements.txt first (to utilize Docker cache)
COPY requirements.txt .

# Step 4: Install required Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Set environment variable to disable GPU usage (if necessary)
ENV CUDA_VISIBLE_DEVICES=""

# Step 7: Expose the port your backend will run on
EXPOSE 5000

# Step 8: Run your Python application (replace with your entry point)
CMD ["python", "app.py"]

