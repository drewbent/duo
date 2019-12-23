from app import db
# from sqlalchemy.dialects.postgresql import JSON

class StudentMastery(db.Model):
    __tablename__ = 'student_mastery'

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.String())
    student_id = db.Column(db.String())

    def __init__(self, skill_id, student_id):
        self.skill_id = skill_id
        self.student_id = student_id

    def __repr__(self):
        return '<id {}>'.format(self.id)