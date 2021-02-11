from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from dataclasses import dataclass, asdict

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    wins = db.Column(db.Integer, nullable=False, default=0)
    cumulative_points = db.Column(db.Integer, nullable=False, default=0)


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User


db.create_all()


@app.route("/createUser", methods=["POST"])
def create_user():
    json_data = request.get_json(force=True)
    try:
        new_user = User(name=json_data["name"])
    except KeyError:
        return {"error": "missing required field"}, 400

    db.session.add(new_user)
    db.session.commit()

    schema = UserSchema(many=False)
    user_json = schema.dump(new_user)

    return {"user": user_json}, 200


@app.route("/getUsers")
def get_users():
    query_result = User.query.all()
    schema = UserSchema(many=True)
    users_json = schema.dump(query_result)

    return {"users": users_json}, 200


@app.route("/updateWinner", methods=["POST"])
def update_user():
    json_data = request.get_json(force=True)

    query_result = User.query.get(json_data["id"])
    query_result.wins += 1
    query_result.cumulative_points = json_data["cumulative_points"]
    db.session.commit()

    schema = UserSchema(many=False)
    data = schema.dump(query_result)
    return {"user": data}, 200


@app.route("/getLeaderboard")
def get_leaderboard():
    query_result = User.query.all()
    schema = UserSchema(many=True)
    data = schema.dump(query_result)

    @dataclass
    class UserSorter:
        id: int
        name: str
        wins: int
        cumulative_points: int

        def __lt__(self, other):
            if self.wins == other.wins:
                return self.cumulative_points > other.cumulative_points
            else:
                return self.wins < other.wins

    users = [UserSorter(**user_dict) for user_dict in data]
    users.sort()
    json_sorted_users = [asdict(u) for u in reversed(users)]

    return {"users": json_sorted_users}, 200


if __name__ == "__main__":
    app.run()
