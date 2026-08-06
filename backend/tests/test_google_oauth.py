import sys
import unittest
from unittest.mock import patch
sys.path.insert(0, '.')

from backend.app import app
from backend.extensions import db
from backend.models.user import User

class GoogleOAuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_user_model_fields(self):
        user = User(email="test_oauth_model@example.com", name="OAuth Test", provider="google", google_id="123456789", profile_picture="https://example.com/pic.jpg")
        self.assertEqual(user.provider, "google")
        self.assertEqual(user.google_id, "123456789")
        self.assertEqual(user.profile_picture, "https://example.com/pic.jpg")
        self.assertIsNone(user.password_hash)
        self.assertFalse(user.check_password("any_password"))

    def test_unconfigured_google_auth_returns_error(self):
        res = self.client.post('/api/auth/google-signup', json={'token': 'any_token'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data.get('error'), 'Google authentication is not configured.')

    @patch('backend.routes.auth.is_google_auth_configured', return_value=True)
    @patch('backend.routes.auth.verify_google_token')
    def test_new_google_signup_success(self, mock_verify, mock_config):
        mock_verify.return_value = (True, None, {
            'sub': 'google_user_111',
            'email': 'new_google_user@example.com',
            'name': 'New Google User'
        })

        old = User.query.filter_by(email='new_google_user@example.com').first()
        if old:
            db.session.delete(old)
            db.session.commit()

        res = self.client.post('/api/auth/google-signup', json={'token': 'valid_mock_token'})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'new_google_user@example.com')
        self.assertEqual(data['user']['provider'], 'google')

    @patch('backend.routes.auth.is_google_auth_configured', return_value=True)
    @patch('backend.routes.auth.verify_google_token')
    def test_signup_existing_email_returns_error(self, mock_verify, mock_config):
        mock_verify.return_value = (True, None, {
            'sub': 'google_user_222',
            'email': 'existing_user_signup@example.com',
            'name': 'Existing User'
        })

        user = User.query.filter_by(email='existing_user_signup@example.com').first()
        if not user:
            user = User(email='existing_user_signup@example.com', name='Existing User', password_hash='hash')
            db.session.add(user)
            db.session.commit()

        res = self.client.post('/api/auth/google-signup', json={'token': 'valid_mock_token'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data.get('error'), 'This Google account is already registered. Please sign in instead.')

    @patch('backend.routes.auth.is_google_auth_configured', return_value=True)
    @patch('backend.routes.auth.verify_google_token')
    def test_login_existing_user_success(self, mock_verify, mock_config):
        mock_verify.return_value = (True, None, {
            'sub': 'google_user_333',
            'email': 'existing_login_user@example.com',
            'name': 'Login User'
        })

        user = User.query.filter_by(email='existing_login_user@example.com').first()
        if not user:
            user = User(email='existing_login_user@example.com', name='Login User', password_hash='hash')
            db.session.add(user)
            db.session.commit()

        res = self.client.post('/api/auth/google-login', json={'token': 'valid_mock_token'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertIn('token', data)

    @patch('backend.routes.auth.is_google_auth_configured', return_value=True)
    @patch('backend.routes.auth.verify_google_token')
    def test_login_non_existing_email_returns_error(self, mock_verify, mock_config):
        mock_verify.return_value = (True, None, {
            'sub': 'google_user_444',
            'email': 'non_existing_user_login@example.com',
            'name': 'Non Existing'
        })

        old = User.query.filter_by(email='non_existing_user_login@example.com').first()
        if old:
            db.session.delete(old)
            db.session.commit()

        res = self.client.post('/api/auth/google-login', json={'token': 'valid_mock_token'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertEqual(data.get('error'), 'No account exists with this Google email. Please create an account first.')

if __name__ == '__main__':
    unittest.main()
