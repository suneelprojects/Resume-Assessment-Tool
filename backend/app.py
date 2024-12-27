from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from resume_parser import ResumeParser
from resume_model import ResumeModel

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all origins
CORS(app, origins="*")

# Get the environment (production or local) from environment variables
FLASK_ENV = os.getenv('FLASK_ENV', 'production')  # Default to production if not set
ALLOWED_EXTENSIONS = set(['pdf', 'docx'])
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')

# Initialize resume model
resume_model = ResumeModel()

# Ensure 'uploads' folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/extract_resume", methods=["POST"])
def extract_resume():
    file = request.files.get("resume")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Extract raw text from the resume based on the file type (PDF or DOCX)
        if file.filename.endswith(".pdf"):
            extracted_text = resume_model.extract_text_from_pdf(file_path)
        elif file.filename.endswith(".docx"):
            extracted_text = resume_model.extract_text_from_docx(file_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400


        # Print the extracted text to the console for debugging
        print(f"Extracted Text from Resume:\n{extracted_text}\n")

        # Parse resume using ResumeParser
        resume_parser = ResumeParser(file_path)
        parsed_data = resume_parser.get_extracted_data()

        # Return both extracted text and parsed data as JSON
        return jsonify({
            "extractedText": extracted_text,
            "parsedData": parsed_data
        })

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        # Parse the JSON request payload
        data = request.get_json()
        resume_text = data.get("resumeText")
        job_description_text = data.get("jobDescription")
        role = data.get("role")

        # Validate input
        if not resume_text or not job_description_text or not role:
            return jsonify({"error": "Missing required fields"}), 400

        # Extract skills from the resume and job description
        resume_skills = resume_model.categorize_skills(resume_text)
        job_skills = resume_model.categorize_skills(job_description_text)

        # Calculate the ATS score
        ats_score, skill_score, section_score, formatting_score = resume_model.calculate_ats_score(
            resume_text, job_skills["hard_skills"]
        )

        # Calculate semantic similarity and recommendations using BERT
        similarity_score, recommendation = resume_model.hugging_face_recommendation_bert(
            resume_text, job_description_text
        )

        # Combine the results into a single response object
        result = {
            "ats_score": {
                "overall": ats_score,
                "skill_match": skill_score,
                "section_presence": section_score,
                "formatting": formatting_score,
            },
            "skills_extracted_from_resume": resume_skills,
            "skills_extracted_from_job_description": job_skills,
            "semantic_similarity_score": similarity_score,
            "recommendation": recommendation,
        }

        # Return the results as JSON
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route('/api/calculate_ats', methods=['POST'])
def calculate_ats():
    try:
        # Parse request JSON data
        data = request.get_json()
        resume_text = data.get('resume_text')
        input_role = data.get('input_role')

        if not resume_text or not input_role:
            return jsonify({"error": "Missing required fields: 'resume_text' or 'input_role'"}), 400

        # Call predict_role and retrieve the full dictionary
        prediction_results = resume_model.predict_role(resume_text, input_role)

        # Construct the response using the returned dictionary
        response = {
            "ats_score": prediction_results["ats_score"],
            "skill_score": prediction_results["skill_score"],
            "section_score": prediction_results["section_score"],
            "formatting_score": prediction_results["formatting_score"],
            "resume_skills": prediction_results["resume_skills"],
            "missing_skills": prediction_results["missing_skills"],
            "message": f"ATS-Friendly Score: {prediction_results['ats_score']:.2f}%, "
                       f"Skill Match Score: {prediction_results['skill_score']:.2f}%, "
                       f"Section Presence Score: {prediction_results['section_score']:.2f}%, "
                       f"Formatting Score: {prediction_results['formatting_score']:.2f}%"
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Error occurred: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        input_role = data.get("input_role")

        if not resume_text or not input_role:
            return jsonify({"error": "Missing required fields"}), 400

        # Call predict_role and retrieve the full dictionary
        prediction_results = resume_model.predict_role(resume_text, input_role)

        # Construct the response using the returned dictionary
        response = {
            "given_role": prediction_results["input_role"],
            "confidence": prediction_results["input_role_confidence"],
            "suggested_roles": prediction_results["suggested_roles"],
            "resume_skills": prediction_results["resume_skills"],
            "missing_skills": prediction_results["missing_skills"],
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500



if __name__ == "__main__":
    # Run the app on the appropriate host and port based on the environment
    if FLASK_ENV == 'production':
        # For production, bind to the host and port for deployment (e.g., devopsdost.xyz)
        app.run(debug=False, host='0.0.0.0', port=5000)  # Production server, port 80
    else:
        # For local development, use localhost and port 5000
        app.run(debug=True, host='0.0.0.0', port=5000)  # Local development
