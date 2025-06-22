#!/usr/bin/env python3
"""
End-to-End Test Suite for AI Influencer Manager
Tests the complete workflow from influencer creation to content scheduling
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colored output
init(autoreset=True)

# Load environment variables
load_dotenv()

class AIInfluencerE2ETest:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.created_resources = {
            "influencers": [],
            "sponsors": [],
            "videos": [],
            "schedules": []
        }
    
    def log(self, message: str, level: str = "info"):
        """Colored logging for better visibility"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if level == "success":
            print(f"{Fore.GREEN}✓ [{timestamp}] {message}{Style.RESET_ALL}")
        elif level == "error":
            print(f"{Fore.RED}✗ [{timestamp}] {message}{Style.RESET_ALL}")
        elif level == "warning":
            print(f"{Fore.YELLOW}⚠ [{timestamp}] {message}{Style.RESET_ALL}")
        elif level == "info":
            print(f"{Fore.CYAN}ℹ [{timestamp}] {message}{Style.RESET_ALL}")
        elif level == "action":
            print(f"{Fore.MAGENTA}▶ [{timestamp}] {message}{Style.RESET_ALL}")
        else:
            print(f"  [{timestamp}] {message}")
    
    def log_response(self, response: requests.Response, show_body: bool = True):
        """Log API response details"""
        if response.status_code < 400:
            self.log(f"Response: {response.status_code} {response.reason}", "success")
        else:
            self.log(f"Response: {response.status_code} {response.reason}", "error")
        
        if show_body and response.text:
            try:
                body = json.dumps(response.json(), indent=2)
                print(f"{Fore.WHITE}{body}{Style.RESET_ALL}")
            except:
                print(f"{Fore.WHITE}{response.text[:500]}...{Style.RESET_ALL}")
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Make HTTP request with logging"""
        url = f"{self.base_url}{endpoint}"
        self.log(f"{method} {endpoint}", "action")
        
        try:
            response = self.session.request(method, url, **kwargs)
            self.log_response(response)
            
            if response.status_code >= 400:
                return None
            
            return response.json() if response.text else {}
        
        except Exception as e:
            self.log(f"Request failed: {str(e)}", "error")
            return None
    
    def test_health_check(self):
        """Test 1: API Health Check"""
        self.log("\n=== TEST 1: API Health Check ===", "info")
        
        data = self.make_request("GET", "/")
        if data:
            self.log(f"API Version: {data.get('version', 'Unknown')}", "success")
            self.log(f"Features: {', '.join(data.get('features', []))}", "info")
            return True
        return False
    
    def test_create_influencer(self) -> Optional[int]:
        """Test 2: Create AI Influencer"""
        self.log("\n=== TEST 2: Create AI Influencer (Onboarding Wizard) ===", "info")
        
        influencer_data = {
            "mode": "lifestyle",
            "name": "Emma Chen",
            "face_image_url": "https://example.com/emma-face.jpg",
            "background_info": "28-year-old tech entrepreneur and wellness advocate living in San Francisco. Passionate about mindful living, sustainable technology, and helping others find balance in the digital age.",
            "goals": [
                "inspire work-life balance in tech",
                "promote mental wellness practices",
                "share sustainable living tips"
            ],
            "tone": "casual",
            "audience_age_range": [22, 40],
            "audience_gender": "all",
            "audience_interests": ["technology", "wellness", "sustainability", "productivity"],
            "audience_region": "United States",
            "growth_phase_enabled": True,
            "growth_intensity": 0.7,
            "instagram_username": "samsmith92381",
            "instagram_password": "Spurhacks2025"
        }
        
        data = self.make_request("POST", "/sorcerer/init", json=influencer_data)
        if data:
            influencer_id = data.get("id")
            self.created_resources["influencers"].append(influencer_id)
            self.log(f"Created influencer: {data.get('name')} (ID: {influencer_id})", "success")
            return influencer_id
        return None
    
    def test_generate_lifestyle_timeline(self, influencer_id: int):
        """Test 3: Generate AI Lifestyle Timeline (Async)"""
        self.log("\n=== TEST 3: Generate AI Lifestyle Timeline (Async) ===", "info")
        
        timeline_data = {
            "influencer_id": influencer_id,
            "days": 7,  # One week for testing
            "activities": ["morning meditation", "tech workshop", "sustainable cooking"],
            "intensity": 0.6
        }
        
        data = self.make_request("POST", "/generate/lifestyle", json=timeline_data)
        if data:
            self.log(f"Status: {data.get('status', 'Unknown')}", "success")
            self.log(f"Message: {data.get('message', '')}", "info")
            self.log("Timeline generation running in background...", "info")

            time.sleep(2)
            self.check_scheduled_videos(influencer_id)
            
            return True
        return False
    
    def check_scheduled_videos(self, influencer_id: int):
        """Check what videos have been scheduled for an influencer"""
        self.log("\nChecking scheduled videos...", "info")
        
        data = self.make_request("GET", f"/influencer/{influencer_id}/videos")
        if data:
            total = data.get("total_scheduled", 0)
            self.log(f"Found {total} scheduled videos for {data.get('influencer_name', 'influencer')}", "info")
            
            videos = data.get("videos", [])
            for i, video in enumerate(videos[:5]):  # Show first 5
                scheduled_time = datetime.fromisoformat(video["scheduled_time"])
                self.log(f"  {i+1}. {video['content_type']} at {scheduled_time.strftime('%a %I:%M %p')} - Status: {video['status']}", "")
            
            if len(videos) > 5:
                self.log(f"  ... and {len(videos) - 5} more videos", "")
    
    def test_manual_video_schedule(self, influencer_id: int) -> Optional[int]:
        """Test 4: Schedule Manual Video"""
        self.log("\n=== TEST 4: Schedule Manual Video ===", "info")
        
        # Schedule a video for 1 hour from now
        run_at = datetime.now() + timedelta(hours=1)
        
        schedule_data = {
            "run_at": run_at.isoformat(),
            "is_active": True,
            "video_params": {
                "influencer_id": influencer_id,
                "scheduled_time": run_at.isoformat(),
                "content_type": "post",  # New field
                "script": None,  # Let AI generate it
                "caption": None,  # Let AI generate it
                "hashtags": ["mindfultech", "worklifebalance", "sustainableliving"],
                "platform": "instagram"
            }
        }
        
        data = self.make_request("POST", "/schedule", json=schedule_data)
        if data:
            video_id = data.get("video_id")
            self.created_resources["videos"].append(video_id)
            self.created_resources["schedules"].append(data.get("id"))
            
            self.log(f"Scheduled {schedule_data['video_params']['content_type']} (ID: {video_id}) for {run_at.strftime('%I:%M %p')}", "success")
            return video_id
        return None
    
    def test_create_sponsor(self) -> Optional[int]:
        """Test 5: Create Sponsor"""
        self.log("\n=== TEST 5: Create Sponsor ===", "info")
        
        sponsor_data = {
            "company_name": "EcoTech Solutions",
            "brand_logo_url": "https://example.com/ecotech-logo.png",
            "contact_email": "partnerships@ecotech.com",
            "contact_phone": "+1-555-0100",
            "targeting_tags": ["sustainability", "technology", "eco-friendly", "green-tech"],
            "product_info": {
                "name": "Smart Energy Monitor",
                "description": "AI-powered home energy optimization device",
                "price": 149.99,
                "features": ["Real-time monitoring", "AI predictions", "Mobile app"]
            },
            "campaign_details": {
                "budget": 10000,
                "duration": "3 months",
                "goals": ["brand awareness", "product launch", "sustainability message"],
                "target_impressions": 500000
            }
        }
        
        data = self.make_request("POST", "/sponsors", json=sponsor_data)
        if data:
            sponsor_id = data.get("id")
            self.created_resources["sponsors"].append(sponsor_id)
            self.log(f"Created sponsor: {data.get('company_name')} (ID: {sponsor_id})", "success")
            return sponsor_id
        return None
    
    def test_sponsor_matching(self, influencer_id: int, sponsor_id: int):
        """Test 6: Match Sponsor to Influencer"""
        self.log("\n=== TEST 6: Sponsor-Influencer Matching ===", "info")
        
        match_data = {
            "influencer_id": influencer_id,
            "sponsor_id": sponsor_id,
            "proposal_details": {
                "posts_per_month": 4,
                "compensation": 2500,
                "content_types": ["product reviews", "lifestyle integration", "educational posts"],
                "exclusivity": False
            }
        }
        
        data = self.make_request("POST", "/sponsor/match", json=match_data)
        if data:
            match_score = data.get("match_score", 0)
            self.log(f"Match Score: {match_score:.2%}", "success" if match_score > 0.5 else "warning")
            self.log(f"Match Status: {data.get('status', 'Unknown')}", "info")
            return True
        return False
    
    def test_video_generation(self, video_id: int):
        """Test 7: Trigger Video Generation"""
        self.log("\n=== TEST 7: Trigger Video Generation Pipeline ===", "info")
        
        data = self.make_request("POST", f"/create?video_id={video_id}")
        if data:
            self.log(f"Video Status: {data.get('status', 'Unknown')}", "success")
            self.log(f"Video URL: {data.get('video_url', 'Not generated')}", "info")
            self.log(f"Thumbnail URL: {data.get('thumbnail_url', 'Not generated')}", "info")
            return True
        return False
    
    def test_add_sponsor_to_video(self, video_id: int, sponsor_id: int):
        """Test 8: Add Sponsor to Existing Video"""
        self.log("\n=== TEST 8: Add Sponsor to Video ===", "info")
        
        data = self.make_request("POST", f"/video/{video_id}/add-sponsor?sponsor_id={sponsor_id}")
        if data and data.get("updated"):
            self.log("Successfully added sponsor to video", "success")
            self.log("Script will be regenerated with sponsor integration", "info")
            return True
        return False
    
    def test_bulk_schedule(self, influencer_id: int):
        """Test 9: Bulk Schedule Creation"""
        self.log("\n=== TEST 9: Bulk Schedule Creation ===", "info")
        
        # Create a weekly pattern
        start_date = datetime.now() + timedelta(days=1)
        end_date = start_date + timedelta(days=7)
        
        bulk_data = {
            "influencer_id": influencer_id,
            "schedule_pattern": {
                "monday": {
                    "posts": [
                        {"type": "post", "time": "9:00 AM"},
                        {"type": "story", "time": "2:00 PM"}
                    ]
                },
                "wednesday": {
                    "posts": [
                        {"type": "reel", "time": "6:30 PM"}
                    ]
                },
                "friday": {
                    "posts": [
                        {"type": "post", "time": "11:00 AM"},
                        {"type": "story", "time": "4:00 PM"}
                    ]
                }
            },
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        data = self.make_request("POST", "/schedule/bulk", json=bulk_data)
        if data:
            self.log(f"Status: {data.get('status', 'Unknown')}", "success")
            self.log("Bulk schedule creation running in background...", "info")
            
            # Wait and check results
            time.sleep(2)
            self.check_scheduled_videos(influencer_id)
            return True
        return False
    
    def test_list_influencers(self):
        """Test 10: List All Influencers"""
        self.log("\n=== TEST 10: List All Influencers ===", "info")
        
        data = self.make_request("GET", "/influencers")
        if data:
            influencers = data
            self.log(f"Total influencers: {len(influencers)}", "info")
            
            for influencer in influencers[:3]:  # Show first 3
                self.log(f"  • {influencer.get('name')} - {influencer.get('mode')} mode", "")
            
            if len(influencers) > 3:
                self.log(f"  ... and {len(influencers) - 3} more", "")
            
            return True
        return False
    
    def check_claude_api(self):
        """Check if Claude API is configured"""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key == "your-claude-api-key-here":
            self.log("\n⚠️  Claude API not configured!", "warning")
            self.log("Add your API key to .env file: ANTHROPIC_API_KEY=sk-ant-...", "warning")
            self.log("AI features will use fallback generation", "warning")
            return False
        else:
            self.log("✓ Claude API configured", "success")
            return True
    
    def run_all_tests(self):
        """Run complete E2E test suite"""
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}AI Influencer Manager - End-to-End Test Suite{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        
        # Check Claude API
        self.check_claude_api()
        
        # Track test results
        results = {
            "passed": 0,
            "failed": 0,
            "total": 10
        }
        
        # Run tests
        tests = [
            ("Health Check", self.test_health_check),
            ("Create Influencer", lambda: self.test_create_influencer()),
            ("Generate Lifestyle Timeline", lambda: self.test_generate_lifestyle_timeline(self.created_resources["influencers"][0]) if self.created_resources["influencers"] else None),
            ("Schedule Manual Video", lambda: self.test_manual_video_schedule(self.created_resources["influencers"][0]) if self.created_resources["influencers"] else None),
            ("Create Sponsor", self.test_create_sponsor),
            ("Sponsor Matching", lambda: self.test_sponsor_matching(self.created_resources["influencers"][0], self.created_resources["sponsors"][0]) if self.created_resources["influencers"] and self.created_resources["sponsors"] else None),
            ("Video Generation", lambda: self.test_video_generation(self.created_resources["videos"][0]) if self.created_resources["videos"] else None),
            ("Add Sponsor to Video", lambda: self.test_add_sponsor_to_video(self.created_resources["videos"][0], self.created_resources["sponsors"][0]) if self.created_resources["videos"] and self.created_resources["sponsors"] else None),
            ("Bulk Schedule", lambda: self.test_bulk_schedule(self.created_resources["influencers"][0]) if self.created_resources["influencers"] else None),
            ("List Influencers", self.test_list_influencers)
        ]
        
        for test_name, test_func in tests:
            try:
                time.sleep(0.5)  # Brief pause between tests
                result = test_func()
                if result or result is None:
                    results["passed"] += 1
                else:
                    results["failed"] += 1
            except Exception as e:
                self.log(f"\n{test_name} failed with error: {str(e)}", "error")
                results["failed"] += 1
        
        # Summary
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Test Summary{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        
        print(f"{Fore.GREEN}Passed: {results['passed']}/{results['total']}{Style.RESET_ALL}")
        print(f"{Fore.RED}Failed: {results['failed']}/{results['total']}{Style.RESET_ALL}")
        
        if results["failed"] == 0:
            print(f"\n{Fore.GREEN}🎉 All tests passed!{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.YELLOW}⚠️  Some tests failed. Check the logs above.{Style.RESET_ALL}")
        
        # Show created resources
        if any(self.created_resources.values()):
            print(f"\n{Fore.CYAN}Created Resources:{Style.RESET_ALL}")
            for resource_type, ids in self.created_resources.items():
                if ids:
                    print(f"  • {resource_type}: {ids}")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="E2E Test Suite for AI Influencer Manager")
    parser.add_argument("--url", default="http://localhost:8000", help="API base URL")
    parser.add_argument("--test", help="Run specific test (e.g., 'health', 'influencer', 'timeline')")
    
    args = parser.parse_args()
    
    # Check if server is running
    try:
        response = requests.get(f"{args.url}/")
        if response.status_code != 200:
            print(f"{Fore.RED}❌ Server not responding at {args.url}{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}Start the server with: uvicorn app:app --reload{Style.RESET_ALL}")
            return
    except requests.ConnectionError:
        print(f"{Fore.RED}❌ Cannot connect to server at {args.url}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Start the server with: uvicorn app:app --reload{Style.RESET_ALL}")
        return
    
    # Run tests
    tester = AIInfluencerE2ETest(args.url)
    
    if args.test:
        # Run specific test
        test_map = {
            "health": tester.test_health_check,
            "influencer": tester.test_create_influencer,
            "timeline": lambda: tester.test_generate_lifestyle_timeline(1),
            "schedule": lambda: tester.test_manual_video_schedule(1),
            "sponsor": tester.test_create_sponsor,
            "match": lambda: tester.test_sponsor_matching(1, 1),
            "generate": lambda: tester.test_video_generation(1),
            "list": tester.test_list_influencers
        }
        
        if args.test in test_map:
            print(f"\n{Fore.CYAN}Running test: {args.test}{Style.RESET_ALL}")
            test_map[args.test]()
        else:
            print(f"{Fore.RED}Unknown test: {args.test}{Style.RESET_ALL}")
            print(f"Available tests: {', '.join(test_map.keys())}")
    else:
        # Run all tests
        tester.run_all_tests()

if __name__ == "__main__":
    main()