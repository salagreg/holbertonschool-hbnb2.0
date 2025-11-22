from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token
from app.services import facade

api = Namespace('auth', description='Authentication operations')

# MODEL LOGIN
login_model = api.model('Login', {
    'email': fields.String(required=True),
    'password': fields.String(required=True)
})

# MODEL REGISTER
register_model = api.model('Register', {
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'first_name': fields.String(required=True),
    'last_name': fields.String(required=True)
})

@api.route('/register')
class Register(Resource):
    @api.expect(register_model)
    def post(self):
        """Create a new user"""

        data = api.payload

        # Vérifier si l'utilisateur existe
        if facade.get_user_by_email(data['email']):
            return {"error": "Email already exists"}, 400

        # Créer l'utilisateur
        user = facade.create_user(data)

        if not user:
            return {"error": "User creation failed"}, 500

        return {"message": "User created successfully"}, 201


@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return JWT"""
        credentials = api.payload

        # Récupérer user
        user = facade.get_user_by_email(credentials['email'])

        if not user or not user.verify_password(credentials['password']):
            return {"error": "Invalid credentials"}, 401

        # Créer token
        access_token = create_access_token(identity=user.id, additional_claims={
            "is_admin": user.is_admin
        })

        return {"access_token": access_token}, 200
