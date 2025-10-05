# How to setup project

## With Docker

1. Install Docker + Docker Compose
2. Run (once):
   ```bash
   docker compose build 
   ```
3. Afterwards use:
    ```bash
   docker compose up
    ```
## Without Docker

### How to setup backend
```bash
- cd backend
- python -m venv venv
- source venv/Scripts/activate  # Mac/Linux or gitbash
- venv\Scripts\activate      # Windows (not gitbash)
- pip install -r requirements.txt
```
            

### How to setup frontend
```bash
- cd frontend
- npm install
- npm run dev
```


### To run backend
```bash
- cd backend
- python main.py
```

### To run frontend
```bash
- cd frontend
- npm run dev
```

