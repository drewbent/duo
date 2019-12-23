# From: https://stackabuse.com/deploying-a-flask-application-to-heroku/#disqus_thread

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from models import *

@app.route('/getmsg/', methods=['GET'])
def respond():
    # Retrieve the name from url parameter
    name = request.args.get("name", None)

    # For debugging
    print(f"got name {name}")

    response = {}

    # Check if user sent a name at all
    if not name:
        response["ERROR"] = "no name found, please send a name."
    # Check if the user entered a number not a name
    elif str(name).isdigit():
        response["ERROR"] = "name can't be numeric."
    # Now the user entered a valid name
    else:
        response["MESSAGE"] = f"Welcome {name} to our awesome platform!!"

    # Return the response in json format
    return jsonify(response)

@app.route('/student-mastery/post/', methods=['GET'])
def post_student_mastery():
    skill_id = request.args.get("skill_id", None)
    student_id = request.args.get("student_id", None)
    try:
        student_mastery = StudentMastery(
            skill_id = skill_id,
            student_id = student_id
        )
        db.session.add(student_mastery)
        db.session.commit()

        return jsonify({
            "MESSAGE": f"Data successfully saved to database. Student {skill_id} achieved mastery in {student_id}.",
            "METHOD" : "POST"
        })
    except:
        return jsonify({
            "ERROR": "Unable to add item to database."
        })

@app.route('/student-mastery/get/', methods=['GET'])
def get_student_mastery():
    skill_id = request.args.get("skill_id", None)
    results = StudentMastery.query.filter_by(skill_id=skill_id)
    output = ''
    for result in results:
        output += f'{result.student_id}<br>'
    return output

@app.route('/post/', methods=['POST'])
def post_something():
    param = request.form.get('name')
    print(param)
    # You can add the test cases you made in the previous function, but in our case here you are just testing the POST functionality
    if param:
        return jsonify({
            "Message": f"Welcome {name} to our awesome platform!!",
            # Add this option to distinct the POST request
            "METHOD" : "POST"
        })
    else:
        return jsonify({
            "ERROR": "no name found, please send a name."
        })

# A welcome message to test our server
@app.route('/')
def index():
    return f"<h1>Welcome to our server !!</h1><h2>{app.config['DEVELOPMENT']}</h2>"

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000, debug=app.config['DEVELOPMENT'])