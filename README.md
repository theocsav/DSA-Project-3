# DSA-Project-3

Spring 2025 - Amanpreet Kapoor

## Backend
```bash
cd app/backend
# create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Mac/Linux

# Install Python dependencies
pip install -r ../../requirements.txt
# Run Django server
python manage.py runserver
```
## Frontend
```bash
cd app/frontend/frontend_project
# Install React dependencies
npm install
# Run React server
npm run dev
```
## Structure
```bash
DSA-Project-3/
│
├── app/
│   ├── backend/                  # Django project
│   └── frontend/frontend_project # Vite + React frontend
│
├── data/                         # Datasets
├── notebooks/                    # Jupyter Notebooks
├── src/                          # Algorithms and logic
├── tests/                        # Python tests
├── requirements.txt            
└── README.md                     
```
## Frontend + Backend
```
You will need to open two terminal and run the frontend and backend command. So both are running at the same time.
If you in vs code you can click the + and do split Terminal
```