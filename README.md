Please note:

1. If the " venv/bin/activate" command fails, you are probably missing the "." at the beginning. try ". venv/bin/activate"
2. This uses an sqlite3 database so that it can be easily run locally, but the config can be edited to use a real relational database.

To install:

From within the 'front-end' directory run the following commands:

1. $npm install

From within the 'back-end' directory run the following commands:

1. $python3 -m venv venv
2. $. venv/bin/activate
3. $pip install -r requirements.txt

To Run: First from within the 'back-end' directory run the following commands:

1. $. venv/bin/activate
2. $python3 main.py

Now from within the 'front-end' directory run the following commands:

1. $npm start

navigate to http://localhost:3000
