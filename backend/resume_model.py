import os
import re
import joblib
import numpy as np
import tensorflow as tf
from transformers import BertTokenizer, BertModel
from collections import Counter
import PyPDF2
import docx

class ResumeModel:
    def __init__(self):
        # Define predefined skill sets for job roles (simplified example)
        self.role_skills = {
    "Junior Data Analyst": [
        # Technical Skills
        "SQL", "Excel", "Power BI", "Tableau", "Google Sheets", "ETL Processes", "Data Cleaning", 
        "Data Integration", "Data Visualization", "Statistical Analysis", "Microsoft Access", 
        "Google Data Studio", "Data Reporting", "Data Warehousing", "Dashboards", 
        "Data Transformation", "R for Analysis", "Python (basic analytics)", 
        "Time-Series Analysis", "Pivot Tables", "Advanced Excel Functions", 
        "Spreadsheet Automation", "Data Governance",
        # Analytical Techniques
        "A/B Testing", "Regression Analysis", "Hypothesis Testing", "Trend Analysis", 
        "Market Research", "Variance Analysis", 
        # Business Intelligence
        "Business Insights", "Forecasting", "Budget Analysis", "Customer Segmentation", 
        "Profitability Analysis",
        # Soft Skills
        "Storytelling with Data", "Communication Skills", "Critical Thinking", "Teamwork", 
        "Problem Solving", "Presentation Skills",
        # Tools
        "Alteryx", "QlikView", "Looker", "Zoho Analytics", "Metabase", "Microsoft Power Query",
        "Splunk", "SAS", "SAP Analytics"
    ],
    "Junior Data Scientist": [
        # Programming and Tools
        "Python", "R", "SQL", "TensorFlow", "Keras", "PyTorch", "Scikit-learn", "NumPy", "Pandas", 
        "Matplotlib", "Seaborn", "Jupyter Notebooks", "Google Colab", "Git", "Power BI", 
        # Machine Learning and AI
        "Supervised Learning", "Unsupervised Learning", "Clustering", "Regression", 
        "Classification", "Hyperparameter Tuning", "Model Evaluation", "Neural Networks",
        "Feature Engineering", "Ensemble Methods", "Decision Trees", "Random Forest", 
        "Gradient Boosting (XGBoost, LightGBM)",
        # Statistical Analysis
        "Descriptive Statistics", "Inferential Statistics", "Hypothesis Testing", 
        "ANOVA", "Time-Series Forecasting", "Statistical Modeling", "Probability Theory",
        # Big Data Tools
        "Apache Spark", "Hadoop", "BigQuery", "Snowflake", "MongoDB", "SQL Server",
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Team Collaboration", "Data Storytelling", 
        "Presentation Skills",
        # Data Visualization
        "Tableau", "ggplot2", "Plotly", "Altair", "Dash", "Excel Analytics"
    ],
    "Junior Machine Learning Engineer": [
        # Programming and Tools
        "Python", "R", "Java", "C++", "TensorFlow", "Keras", "PyTorch", "Scikit-learn", "NumPy", 
        "Pandas", "Matplotlib", "Seaborn", "Jupyter Notebooks", "Google Colab", "Git",
        # Machine Learning and AI
        "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Neural Networks",
        "Optimization Algorithms", "Model Deployment", "Model Evaluation", "Hyperparameter Tuning",
        "Feature Engineering", "Autoencoders", "GANs", "LSTMs", "RNNs",
        # Statistical and Big Data Tools
        "Hypothesis Testing", "Probability Theory", "Time-Series Forecasting", "ETL Processes",
        "Apache Spark", "Hadoop", "BigQuery", "Kafka", "Airflow",
        # Cloud Tools
        "AWS Sagemaker", "Google Cloud AI", "Azure ML Studio",
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Team Collaboration", "Adaptability",
        # Visualization Tools
        "Tableau", "Power BI", "Matplotlib", "Seaborn"
    ],
    "Junior Python Data Scientist": [
        # Python-Specific Skills
        "Python", "Django", "Flask", "FastAPI", "NumPy", "Pandas", "Scikit-learn", "Matplotlib", 
        "Seaborn", "Plotly", "Dash", "Jupyter Notebooks", "Google Colab", "TensorFlow", "Keras", 
        "PyTorch", "NLTK", "SpaCy", "TextBlob", "OpenCV", "Streamlit", "Bokeh",
        # Machine Learning
        "Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation",
        "Regression", "Classification", "Clustering", "Neural Networks", "Hyperparameter Tuning",
        # Statistical Analysis
        "Descriptive Statistics", "Inferential Statistics", "Hypothesis Testing", 
        # Data Engineering
        "ETL Pipelines", "Data Cleaning", "Data Wrangling", "MongoDB", "SQL", "PostgreSQL", "MySQL", 
        # Cloud Tools
        "AWS Sagemaker", "Google Cloud AI", "Azure ML Studio",
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Data Storytelling", "Collaboration"
    ],
    "Junior Data Engineer": [
        # Data Engineering-Specific Skills
        "Python", "Java", "Scala", "SQL", "NoSQL", "ETL Pipelines", "Data Cleaning", 
        "Data Integration", "Data Modeling", "Data Warehousing", "Airflow", "Kafka", "Apache Spark", 
        "Hadoop", "AWS Glue", "Azure Data Factory", "Google BigQuery", "MongoDB", "PostgreSQL", "MySQL", 
        "Snowflake", "Redshift", "Data Lakes", "Docker", "Kubernetes", "Git", "Terraform",
        # Big Data Tools
        "HDFS", "Hive", "Pig", "Flume", "Presto", "Flink", "Druid", "ElasticSearch", "NiFi",
        # Cloud Tools
        "AWS Lambda", "Google Cloud Dataflow", "Azure Synapse Analytics", 
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Collaboration", "Data Pipelines Optimization",
        # Analytical Skills
        "Data Validation", "Performance Tuning", "Resource Optimization", "Scalability Design"
    ],
    "Junior AI Engineer": [
        # Programming and Tools
        "Python", "R", "Java", "C++", "TensorFlow", "Keras", "PyTorch", "Scikit-learn", 
        "NumPy", "Pandas", "OpenCV", "SpaCy", "NLTK", "TextBlob", "Transformers", "Hugging Face",
        "Google Colab", "Jupyter Notebooks", "Docker", "Kubernetes", "Git", "FastAPI", "Flask",
        # AI-Specific Skills
        "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", 
        "Deep Learning", "Computer Vision", "NLP", "Optimization Algorithms", "Model Evaluation", 
        "Model Deployment", "Feature Engineering", "Hyperparameter Tuning", "Explainable AI", 
        "GANs", "Autoencoders", "LSTMs", "RNNs", "Transformers",
        # Cloud Tools
        "AWS Sagemaker", "Google Cloud AI", "Azure AI Studio",
        # Statistical Analysis
        "Hypothesis Testing", "Probability Theory", "ANOVA", "Time-Series Forecasting",
        # Data Engineering
        "ETL Pipelines", "Data Wrangling", "Big Data Tools", "Apache Spark", "Hadoop",
        # Soft Skills
        "Critical Thinking", "Collaboration", "Problem Solving", "Data Storytelling",
        # Visualization Tools
        "Tableau", "Power BI", "Matplotlib", "Seaborn"
    ],
    # Junior NLP Engineer
    "Junior NLP Engineer": [
        # Programming and Tools
        "Python", "Java", "R", "C++", "NLTK", "SpaCy", "TextBlob", "Transformers", "BERT", 
        "GPT", "Hugging Face", "PyTorch", "TensorFlow", "Keras", "OpenNLP", "Google Colab", 
        "Jupyter Notebooks", "FastAPI", "Flask", "Git",
        # NLP-Specific Skills
        "Text Preprocessing", "Tokenization", "Stemming", "Lemmatization", "POS Tagging", 
        "Named Entity Recognition", "Sentiment Analysis", "Topic Modeling", "Text Classification", 
        "Language Modeling", "Word Embeddings (Word2Vec, GloVe, FastText)", "Sequence-to-Sequence Models",
        # Machine Learning and Deep Learning
        "Supervised Learning", "Unsupervised Learning", "LSTMs", "RNNs", "Attention Mechanisms", 
        "Autoencoders", "Text Summarization", "Machine Translation", "Question Answering Systems",
        # Cloud and Deployment Tools
        "AWS Comprehend", "Google Cloud Natural Language API", "Azure Cognitive Services", 
        "Docker", "Kubernetes", "MLOps",
        # Data Engineering
        "ETL Pipelines", "Data Cleaning", "Data Wrangling", "SQL", "NoSQL", "MongoDB", 
        "PostgreSQL", "Big Data Tools",
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Collaboration", "Data Storytelling",
        # Visualization Tools
        "Matplotlib", "Seaborn", "Plotly"
    ],
    # Computer Vision Engineer
    "Computer Vision Engineer": [
        # Programming and Tools
        "Python", "C++", "Java", "OpenCV", "TensorFlow", "Keras", "PyTorch", "NumPy", 
        "Pandas", "Matplotlib", "Seaborn", "Scikit-learn", "Jupyter Notebooks", "Google Colab",
        "Docker", "Kubernetes", "Git", "Flask", "FastAPI",
        # Computer Vision Specific Skills
        "Image Processing", "Feature Detection", "Object Detection", "YOLO", "SSD", "Faster R-CNN",
        "Image Segmentation", "U-Net", "Instance Segmentation", "Optical Flow", "3D Reconstruction",
        "Augmented Reality", "Image Augmentation", "GANs", "Autoencoders", "Pose Estimation",
        "Video Analytics", "Tracking Algorithms", "Deep Learning for Vision", "Neural Networks",
        # Cloud and Deployment Tools
        "AWS Rekognition", "Google Cloud Vision API", "Azure Cognitive Services",
        "MLOps", "Model Deployment", "Containerization",
        # Data Engineering
        "ETL Pipelines", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Big Data Tools",
        # Soft Skills
        "Critical Thinking", "Problem Solving", "Collaboration", "Data Storytelling",
        # Visualization Tools
        "Plotly", "Altair", "Dash", "Bokeh"
    ],  "AWS Admin": [
        # AWS Services
        "AWS EC2", "S3", "IAM", "VPC", "CloudFormation", "AWS Lambda", "RDS", "DynamoDB", 
        "Route 53", "CloudFront", "CloudWatch", "Elastic Beanstalk", "Redshift", "ECS", "EKS", 
        "Auto Scaling", "Elastic Load Balancing", "AWS Systems Manager", "AWS CLI",
        # Networking and Security
        "Network Security", "VPN Configuration", "Firewall Management", "SSL/TLS", "IAM Policies",
        "Identity and Access Management", "AWS Security Hub", "AWS Shield", "CloudTrail", 
        "Encryption", "Subnetting",
        # Deployment and Monitoring
        "CI/CD Pipelines", "Jenkins", "Git", "Ansible", "Terraform", "Kubernetes", 
        "Serverless Architecture", "AWS CodePipeline", "AWS CodeBuild", "AWS CodeDeploy", 
        # Database Management
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "AWS Glue", "AWS Aurora",
        # Soft Skills
        "Team Collaboration", "Problem Solving", "Critical Thinking", "Documentation",
        # Additional Tools
        "Docker", "Kubernetes", "Monitoring Tools", "Cost Optimization"
    ],
    # Junior DevOps Engineer
    "Junior DevOps Engineer": [
        # DevOps Tools and Techniques
        "CI/CD Pipelines", "Jenkins", "Git", "GitLab", "Docker", "Kubernetes", "Terraform", 
        "Ansible", "Chef", "Puppet", "Nagios", "Prometheus", "Grafana", "Splunk", "ELK Stack", 
        "Version Control", "Infrastructure as Code", "Monitoring and Logging",
        # Cloud Services
        "AWS", "Azure", "Google Cloud Platform", "AWS Lambda", "AWS CloudFormation", 
        "Azure DevOps", "Google Cloud Build", "AWS ECS", "AWS EKS", 
        # Scripting and Programming
        "Python", "Shell Scripting", "Bash", "PowerShell", "Ruby", "Go", "Groovy",
        # Networking and Security
        "Networking Basics", "Firewall Configuration", "Load Balancing", "SSL/TLS", 
        "IAM", "Role-Based Access Control", "Secrets Management",
        # Database and Storage
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Amazon RDS", "DynamoDB", 
        "S3", "Block Storage",
        # Soft Skills
        "Team Collaboration", "Problem Solving", "Critical Thinking", "Adaptability", 
        "Documentation", "Agile Methodology"
    ],
    # Cloud Engineer
    "Cloud Engineer": [
        # Cloud Platforms and Tools
        "AWS", "Azure", "Google Cloud Platform", "Terraform", "Docker", "Kubernetes", "AWS Lambda", 
        "CloudFormation", "Azure DevOps", "Google Cloud Functions", "Elastic Load Balancer", 
        "AWS ECS", "AWS EKS", "Azure Kubernetes Service", "Serverless Architecture", 
        # Networking and Security
        "VPC", "IAM", "Role-Based Access Control", "SSL/TLS", "DNS", "Firewall Management", 
        "Networking Basics", "Load Balancing", "Cloud Security", "AWS Security Hub",
        # Scripting and Programming
        "Python", "JavaScript", "Shell Scripting", "Bash", "PowerShell", "Go", "Ruby",
        # Deployment and Monitoring
        "CI/CD Pipelines", "Jenkins", "Git", "Prometheus", "Grafana", "Nagios", 
        "CloudWatch", "Azure Monitor", "Google Cloud Monitoring", "Log Aggregation",
        # Database and Storage
        "Amazon RDS", "DynamoDB", "BigQuery", "Snowflake", "PostgreSQL", "MySQL", "MongoDB", 
        "Redis", "S3", "Data Warehousing",
        # Soft Skills
        "Team Collaboration", "Critical Thinking", "Problem Solving", "Adaptability", 
        "Documentation", "Agile Methodology"
    ],
    # Cloud Developer
    "Cloud Developer": [
        # Cloud Platforms and Tools
        "AWS", "Azure", "Google Cloud Platform", "Terraform", "Docker", "Kubernetes", 
        "AWS Lambda", "CloudFormation", "Azure DevOps", "Google Cloud Functions", 
        "Elastic Load Balancer", "AWS ECS", "AWS EKS", "Serverless Framework", 
        # Programming and Development
        "Python", "JavaScript", "Node.js", "Java", "C#", "Go", "TypeScript", 
        "Flask", "FastAPI", "Django", "React", "Angular", "Vue.js", 
        # Deployment and Monitoring
        "CI/CD Pipelines", "Jenkins", "Git", "Ansible", "Nagios", "Prometheus", 
        "Grafana", "CloudWatch", "Azure Monitor", "Google Cloud Monitoring",
        # Database and Storage
        "Amazon RDS", "DynamoDB", "BigQuery", "Snowflake", "PostgreSQL", "MySQL", 
        "MongoDB", "Redis", "Firebase", "S3", "Data Warehousing",
        # Soft Skills
        "Team Collaboration", "Critical Thinking", "Problem Solving", 
        "Adaptability", "Documentation", "Agile Methodology"
    ],  "Java Full Stack Developer": [
        "Java", "Spring Boot", "Hibernate", "REST APIs", "Microservices", "JPA", "Maven", 
        "Thymeleaf", "JSP", "JDBC", "JSON", "TypeScript", "JavaScript", "Node.js", 
        "React.js", "Angular", "Vue.js", "Bootstrap", "HTML", "CSS",
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", 
        "Git", "Jenkins", "Docker", "Kubernetes", "CI/CD Pipelines", "Agile Development",
        "JUnit", "Mockito", "Oracle Database"
    ],
    # Python Full Stack Developer
    "Python Full Stack Developer": [
        "Python", "Django", "Flask", "FastAPI", "NumPy", "Pandas", "SQLAlchemy", 
        "REST APIs", "GraphQL", "TypeScript", "JavaScript", "Node.js", "React.js", 
        "Angular", "Vue.js", "Bootstrap", "HTML", "CSS", "Tailwind CSS", "PostgreSQL", 
        "MySQL", "MongoDB", "Redis", "Elasticsearch", "Git", "Jenkins", "Docker",
        "CI/CD Pipelines", "Agile Development", "BeautifulSoup", "Pytest"
    ],
    # Frontend Developer
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "TypeScript", "React.js", "Angular", "Vue.js", 
        "Bootstrap", "Tailwind CSS", "SASS", "LESS", "Material-UI", "Chakra UI", "jQuery", 
        "Webpack", "Babel", "Responsive Design", "SEO Best Practices", 
        "Jest", "Cypress", "Figma", "Adobe XD", "Sketch"
    ],
    # Backend Developer
    "Backend Developer": [
        "Python", "Java", "Node.js", "Ruby", "PHP", "Go", "Spring Boot", "Hibernate", 
        "Django", "Flask", "Express.js", "REST APIs", "GraphQL", "SQL", "PostgreSQL", 
        "MySQL", "MongoDB", "Redis", "Elasticsearch", "Git", "Jenkins", "Docker", 
        "CI/CD Pipelines", "Apache Kafka", "Spring Security", "JWT Authentication"
    ],
    # React.js Developer
    "React.js Developer": [
        "JavaScript", "TypeScript", "React.js", "Redux", "Next.js", "Node.js", "Express.js", 
        "GraphQL", "REST APIs", "HTML", "CSS", "Tailwind CSS", "Material-UI", "Chakra UI",
        "Webpack", "Babel", "Jest", "Mocha", "Cypress", "Figma", "Responsive Design"
    ],
    # MERN Stack Developer
    "MERN Stack Developer": [
        "JavaScript", "TypeScript", "React.js", "Redux", "Node.js", "Express.js", 
        "MongoDB", "REST APIs", "GraphQL", "HTML", "CSS", "Bootstrap", "Tailwind CSS", 
        "Material-UI", "Chakra UI", "Next.js", "Vue.js", "Axios", "WebSockets"
    ],
    # Cloud Developer
    "Cloud Developer": [
        "AWS", "Azure", "Google Cloud Platform", "Terraform", "Docker", "Kubernetes", 
        "AWS Lambda", "CloudFormation", "Azure DevOps", "Python", "JavaScript", "Node.js", 
        "React", "Angular", "Vue.js", "PostgreSQL", "MongoDB", "Redis", "S3", "CI/CD Pipelines"
    ],
    # Java Developer
    "Java Developer": [
        "Java", "Spring Boot", "Hibernate", "REST APIs", "Microservices", "Maven", 
        "Thymeleaf", "JDBC", "JSON", "JUnit", "Mockito", "Oracle Database", "Git", 
        "Jenkins", "Docker", "Kubernetes", "CI/CD Pipelines", "Spring Security"
    ],
    # Python Developer
    "Python Developer": [
        "Python", "Django", "Flask", "FastAPI", "NumPy", "Pandas", "SQLAlchemy", 
        "REST APIs", "TensorFlow", "PyTorch", "Scikit-learn", "BeautifulSoup", "Celery", 
        "PostgreSQL", "MongoDB", "Redis", "Docker", "CI/CD Pipelines", "Agile Development"
    ],
    # JavaScript Developer
    "JavaScript Developer": [
        "JavaScript", "TypeScript", "Node.js", "React.js", "Angular", "Vue.js", "Express.js", 
        "REST APIs", "GraphQL", "HTML", "CSS", "Bootstrap", "Tailwind CSS", "Material-UI", 
        "Webpack", "Babel", "Responsive Design", "Git", "Jest", "Mocha", "Cypress"
    ],
    }


        # Define base directory as the script's directory
        self.base_dir = os.path.dirname(os.path.abspath(__file__))

        # Load skills and education data dynamically
        self.hard_skills = self.load_skills_from_file(os.path.join(self.base_dir, "technical_skills_list.txt"))
        self.soft_skills = [
            "problem-solving", "communication", "teamwork", "leadership", "adaptability", "critical thinking",
            "time management", "creativity", "analytical skills"
        ]
        self.other_skills = [
            "Agile", "Jira", "project management", "customer service", "stakeholder management"
        ]
        self.education_keywords = self.load_skills_from_file(os.path.join(self.base_dir, "academic_degrees_list.txt"))

        # Initialize BERT model and tokenizer
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.bert_model = BertModel.from_pretrained('bert-base-uncased')

        # Load trained model, vectorizer, and label encoder
        self.model = tf.keras.models.load_model(os.path.join(self.base_dir, "update.h5"))
        self.vectorizer = joblib.load(os.path.join(self.base_dir, "vectorizer.pkl"))
        self.label_encoder = joblib.load(os.path.join(self.base_dir, "label_encoder.pkl"))

    def load_skills_from_file(self, file_path):
        """Load items from a text file into a list."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return [line.strip() for line in file.readlines() if line.strip()]
        except FileNotFoundError:
            print(f"Error: File not found at {file_path}. Please check the file path.")
            return []
        except Exception as e:
            print(f"Error reading file {file_path}: {str(e)}")
            return []

    def extract_text_from_pdf(self, file_path):
        """Extract text from a PDF file."""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                return "".join([page.extract_text() for page in reader.pages])
        except Exception as e:
            return f"Error extracting text from PDF: {str(e)}"

    def extract_text_from_docx(self, file_path):
        """Extract text from a DOCX file."""
        try:
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            return f"Error extracting text from DOCX: {str(e)}"

    def categorize_skills(self, text):
        """Categorize skills into hard, soft, and other categories."""
        skills = {"hard_skills": [], "soft_skills": [], "other_skills": []}

        for category, skills_list in [("hard_skills", self.hard_skills), 
                                      ("soft_skills", self.soft_skills), 
                                      ("other_skills", self.other_skills)]:
            for skill in skills_list:
                if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                    skills[category].append(skill)

        return skills

    def extract_education(self, text):
        """Extract education details from text."""
        return [degree for degree in self.education_keywords if re.search(r'\b' + re.escape(degree) + r'\b', text, re.IGNORECASE)]

    def extract_experience(self, text):
        """Extract total experience in years from text."""
        experience_years = re.search(r'(\d+)[\s-]?(?:years|yrs)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        experience_months = re.search(r'(\d+)[\s-]?(?:months?|mos?)[\s-]?(?:of)?[\s-]?(?:experience)?', text, re.IGNORECASE)
        years = int(experience_years.group(1)) if experience_years else 0
        months = int(experience_months.group(1)) if experience_months else 0
        return years + months / 12

    def calculate_ats_score(self, resume_text, required_skills):
        """Calculate ATS-friendly score."""
        # Section Presence Check
        essential_sections = ["Contact", "Education", "Skills", "Work Experience"]
        sections_found = [section for section in essential_sections if section.lower() in resume_text.lower()]
        section_score = len(sections_found) / len(essential_sections) * 100

        # Skill Matching
        extracted_skills = self.categorize_skills(resume_text)["hard_skills"]
        matched_skills = [skill for skill in required_skills if skill in extracted_skills]
        skill_score = len(matched_skills) / len(required_skills) * 100 if required_skills else 0

        # Formatting Check
        formatting_issues = 0
        if not re.search(r'\b\d{10}\b', resume_text):
            formatting_issues += 1
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', resume_text):
            formatting_issues += 1
        if re.search(r'[^\x00-\x7F]', resume_text):
            formatting_issues += 1
        formatting_score = (1 - (formatting_issues / 3)) * 100

        # Overall ATS Score
        ats_score = (skill_score * 0.6) + (section_score * 0.3) + (formatting_score * 0.1)
        return ats_score, skill_score, section_score, formatting_score


    def hugging_face_recommendation_bert(self, resume_text, job_description):
        """Use BERT for semantic similarity and skill recommendation."""
        resume_text_truncated = resume_text[:512]
        job_desc_text_truncated = job_description[:512]

        resume_input_ids = self.bert_tokenizer(resume_text_truncated, return_tensors='pt', truncation=True, padding=True)
        job_desc_input_ids = self.bert_tokenizer(job_desc_text_truncated, return_tensors='pt', truncation=True, padding=True)

        resume_embedding = self.bert_model(**resume_input_ids).last_hidden_state.mean(dim=1).detach().numpy()
        job_desc_embedding = self.bert_model(**job_desc_input_ids).last_hidden_state.mean(dim=1).detach().numpy()

        cosine_similarity = np.dot(resume_embedding, job_desc_embedding.T) / (
            np.linalg.norm(resume_embedding) * np.linalg.norm(job_desc_embedding))
        similarity_score = cosine_similarity.item() * 100

        resume_skills = self.categorize_skills(resume_text)
        job_skills = self.categorize_skills(job_description)

        resume_hard_skills = set(resume_skills["hard_skills"])
        job_hard_skills = set(job_skills["hard_skills"])

        missing_skills = list(job_hard_skills - resume_hard_skills)

        recommendation = "Your resume is a good match for the job description!" if similarity_score >= 50 else "Your resume does not match well with the job description."

        if missing_skills:
            recommendation += f"\nHowever, you are missing the following skills: {', '.join(missing_skills)}"

        return similarity_score, recommendation
    def predict_role(self, resume_text, input_role):
        """
        Predict the role based on the resume text and provide suggestions for improvement.
        Includes ATS-friendly score calculation.
        """
        # Transform the resume text using the vectorizer
        resume_transformed = self.vectorizer.transform([resume_text]).toarray()

        # Predict the role probabilities using the model
        role_probabilities = self.model.predict(resume_transformed)

        # Get the index and confidence for the provided role
        input_role_encoded = self.label_encoder.transform([input_role])
        input_role_index = input_role_encoded[0]
        input_role_confidence = float(role_probabilities[0][input_role_index] * 100)

        # Get the role predictions and their respective confidence
        sorted_indices = np.argsort(role_probabilities[0])[::-1]  # Sort in descending order
        suggested_roles = self.label_encoder.inverse_transform(sorted_indices)
        suggested_confidences = [float(confidence * 100) for confidence in role_probabilities[0][sorted_indices]]

        # Extract skills from the resume
        categorized_skills = self.categorize_skills(resume_text)
        resume_skills = categorized_skills["hard_skills"]

        # Get skills required for the input role
        required_skills = self.role_skills.get(input_role, [])

        # Find missing skills
        missing_skills = [skill for skill in required_skills if skill not in resume_skills]

        # Calculate ATS-friendly score
        ats_score, skill_score, section_score, formatting_score = self.calculate_ats_score(
            resume_text, required_skills
        )

        # Output the results
        results = {
            "input_role": input_role,
            "input_role_confidence": input_role_confidence,
            "ats_score": ats_score,
            "skill_score": skill_score,
            "section_score": section_score,
            "formatting_score": formatting_score,
            "suggested_roles": [
                {"role": role, "confidence": confidence}
                for role, confidence in zip(suggested_roles[:20], suggested_confidences[:20])  # Top 5 roles
            ],
            "resume_skills": resume_skills,
            "missing_skills": missing_skills,
        }

        # Print results for easier debugging or viewing
        print(f"Role Confidence for '{input_role}': {input_role_confidence:.2f}%")
        print(f"ATS-Friendly Score: {ats_score:.2f}%")
        print(f"  - Skill Match Score: {skill_score:.2f}%")
        print(f"  - Section Presence Score: {section_score:.2f}%")
        print(f"  - Formatting Score: {formatting_score:.2f}%")
        print("\nTop Suggested Roles:")
        for role in results["suggested_roles"]:
            print(f"  - {role['role']}: {role['confidence']:.2f}%")
        print(f"\nMatched Skills: {', '.join(resume_skills) if resume_skills else 'None'}")
        print(f"Missing Skills for '{input_role}':")
        if missing_skills:
            for skill in missing_skills:
                print(f"  - {skill}")
        else:
            print("  - None")

        return results
