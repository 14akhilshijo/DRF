#!/usr/bin/env python
"""
Simple API test script to verify the Asset Management System API.
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_authentication():
    """Test JWT authentication."""
    print("Testing authentication...")
    
    # Login
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Login successful")
        return data['access']
    else:
        print("✗ Login failed:", response.text)
        return None

def test_endpoints(token):
    """Test various API endpoints."""
    headers = {'Authorization': f'Bearer {token}'}
    
    endpoints = [
        '/assets/',
        '/inventory/',
        '/assignments/',
        '/tickets/',
        '/dashboard/stats/',
    ]
    
    for endpoint in endpoints:
        print(f"Testing {endpoint}...")
        response = requests.get(f'{BASE_URL}{endpoint}', headers=headers)
        
        if response.status_code == 200:
            print(f"✓ {endpoint} - OK")
        else:
            print(f"✗ {endpoint} - Failed: {response.status_code}")

def main():
    """Run API tests."""
    print("Asset Management System API Test")
    print("=" * 40)
    
    # Test authentication
    token = test_authentication()
    
    if token:
        print("\nTesting API endpoints...")
        test_endpoints(token)
    
    print("\nTest completed!")

if __name__ == '__main__':
    main()