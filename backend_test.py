import requests
import sys
import json
from datetime import datetime

class MaintenanceLogAPITester:
    def __init__(self, base_url="https://git-push-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'logs': [],
            'config': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse response as JSON
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")

            return success, response.json() if response.text and success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_create_config_item(self, name, config_type):
        """Create a config item"""
        success, response = self.run_test(
            f"Create {config_type}",
            "POST",
            "config",
            200,
            data={"name": name, "type": config_type}
        )
        if success and 'id' in response:
            self.created_items['config'].append(response['id'])
            return response['id']
        return None

    def test_get_config(self):
        """Get all config items"""
        success, response = self.run_test(
            "Get Config Items",
            "GET",
            "config",
            200
        )
        return success, response

    def test_create_log(self, log_data):
        """Create a maintenance log"""
        success, response = self.run_test(
            "Create Maintenance Log",
            "POST",
            "logs",
            200,
            data=log_data
        )
        if success and 'id' in response:
            self.created_items['logs'].append(response['id'])
            return response['id']
        return None

    def test_get_logs(self):
        """Get all logs"""
        success, response = self.run_test(
            "Get All Logs",
            "GET",
            "logs",
            200
        )
        return success, response

    def test_get_log_by_id(self, log_id):
        """Get a specific log by ID"""
        success, response = self.run_test(
            "Get Log by ID",
            "GET",
            f"logs/{log_id}",
            200
        )
        return success, response

    def test_update_log(self, log_id, update_data):
        """Update a log"""
        success, response = self.run_test(
            "Update Log",
            "PUT",
            f"logs/{log_id}",
            200,
            data=update_data
        )
        return success, response

    def test_delete_log(self, log_id):
        """Delete a log"""
        success, response = self.run_test(
            "Delete Log",
            "DELETE",
            f"logs/{log_id}",
            200
        )
        return success

    def test_delete_config(self, config_id):
        """Delete a config item"""
        success, response = self.run_test(
            "Delete Config Item",
            "DELETE",
            f"config/{config_id}",
            200
        )
        return success

    def test_nonexistent_log(self):
        """Test 404 for non-existent log"""
        success, _ = self.run_test(
            "Get Non-existent Log (404 test)",
            "GET",
            "logs/nonexistent-id",
            404
        )
        return success

    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created logs
        for log_id in self.created_items['logs']:
            try:
                self.test_delete_log(log_id)
            except:
                pass
        
        # Delete created config items
        for config_id in self.created_items['config']:
            try:
                self.test_delete_config(config_id)
            except:
                pass

def main():
    print("🚀 Starting Maintenance Log API Testing...")
    tester = MaintenanceLogAPITester()

    # Test 1: API Root
    if not tester.test_root_endpoint():
        print("❌ API Root test failed, stopping tests")
        return 1

    # Test 2: Config Management
    print("\n📋 Testing Configuration Management...")
    
    # Create test config items
    machine_id = tester.test_create_config_item("Test Machine A", "machine")
    tech_id = tester.test_create_config_item("John Doe", "technician") 
    part_id = tester.test_create_config_item("Filter #123", "spare_part")
    
    if not all([machine_id, tech_id, part_id]):
        print("❌ Failed to create config items, stopping tests")
        tester.cleanup()
        return 1

    # Test getting config
    config_success, config_data = tester.test_get_config()
    if not config_success:
        print("❌ Failed to get config items")
        tester.cleanup()
        return 1

    # Test 3: Maintenance Logs CRUD
    print("\n📝 Testing Maintenance Logs CRUD...")
    
    # Create test log
    test_log = {
        "date": "2024-01-15",
        "machine_name": "Test Machine A",
        "location": "Factory Floor A",
        "work_description": "Routine maintenance check and filter replacement",
        "spare_parts": "Filter #123",
        "technician_name": "John Doe"
    }
    
    log_id = tester.test_create_log(test_log)
    if not log_id:
        print("❌ Failed to create log, stopping tests")
        tester.cleanup()
        return 1

    # Test getting all logs
    logs_success, logs_data = tester.test_get_logs()
    if not logs_success:
        print("❌ Failed to get logs")
        tester.cleanup()
        return 1

    # Test getting specific log
    if not tester.test_get_log_by_id(log_id)[0]:
        print("❌ Failed to get log by ID")
        tester.cleanup()
        return 1

    # Test updating log
    update_data = {"work_description": "Updated: Routine maintenance with additional checks"}
    if not tester.test_update_log(log_id, update_data)[0]:
        print("❌ Failed to update log")
        tester.cleanup()
        return 1

    # Test 4: Error Handling
    print("\n🔍 Testing Error Handling...")
    
    if not tester.test_nonexistent_log():
        print("❌ Failed 404 test for non-existent log")

    # Test duplicate config creation
    duplicate_success, _ = tester.run_test(
        "Duplicate Config (400 test)",
        "POST", 
        "config",
        400,
        data={"name": "Test Machine A", "type": "machine"}
    )

    # Clean up
    tester.cleanup()

    # Print results
    print(f"\n📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())